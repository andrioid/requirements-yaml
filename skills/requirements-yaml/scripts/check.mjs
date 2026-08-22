#!/usr/bin/env node
// requirements-yaml sensor — read-only. Surfaces where requirements.yaml and the
// codebase disagree so an AI can reconcile them; it never edits either side.
//
// Usage:  node check.mjs [path-to-requirements.yaml] [--json] [--no-coverage]
//   default path: requirements.yaml (in the current directory)
//
// Exit code: 1 only when the source of truth is corrupt (an INTEGRITY finding —
// a duplicate ID that a YAML parser would silently collapse). Everything else is
// advisory and exits 0, so the sensor steers without gating.

import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, relative, resolve, basename } from "node:path";

const ID = "[A-Z][A-Z0-9]*-[0-9]{2,}";
const ID_RE = new RegExp(`^${ID}$`);
const ID_TOKEN_RE = new RegExp(ID, "g");
// A requirement line: optional quote, optional [deferred] prefix, an ID, ": ", value.
const REQ_LINE_RE = new RegExp(
  `^(\\s*)("?)(?:\\[deferred\\]\\s+)?(${ID})\\2:\\s?(.*)$`,
);
const TOPLEVEL_RE = /^([a-z][a-z0-9_]*):\s*$/;
const NESTED_KEY_RE = /^(\s+)([a-z][a-z0-9_]*):\s*$/;
// A role heading `As a <role>, I can:` — group 2 is the role token.
const ROLE_RE = /^(\s+)As (.+), I can:\s*$/;
// A `roles:` map entry — group 2 is the (optionally quoted) role name.
const ROLE_DEF_RE = /^\s+("?)(.+?)\1:\s?.+$/;

// The bare role name from a heading token: drop a leading article.
function roleToken(s) {
  return s.replace(/^(?:an?|the)\s+/i, "").trim();
}

function parseArgs(argv) {
  const opts = { path: null, json: false, coverage: true };
  for (const a of argv) {
    if (a === "--json") opts.json = true;
    else if (a === "--no-coverage") opts.coverage = false;
    else if (!a.startsWith("-") && opts.path === null) opts.path = a;
  }
  if (opts.path === null) opts.path = "requirements.yaml";
  return opts;
}

// --- file scan (raw text, so duplicate keys are visible before YAML collapses them) ---
function scan(text) {
  const lines = text.split(/\r?\n/);
  const reqs = [];
  const statements = [];
  const roleDefs = []; // { name, line } from a `roles:` map
  const usedRoles = new Map(); // role name -> first heading line
  const LIST_ITEM_RE = /^\s*-\s+(.*)$/;
  let section = null; // top-level section key
  let role = null; // { indent }

  lines.forEach((raw, i) => {
    const lineNo = i + 1;
    if (raw.trim() === "" || raw.trimStart().startsWith("#")) return;

    const top = raw.match(TOPLEVEL_RE);
    if (top) {
      section = top[1];
      role = null;
      return;
    }
    const roleM = raw.match(ROLE_RE);
    if (roleM) {
      role = { indent: roleM[1].length };
      const name = roleToken(roleM[2]);
      if (name && !usedRoles.has(name)) usedRoles.set(name, lineNo);
      return;
    }
    const req = raw.match(REQ_LINE_RE);
    if (req) {
      const indent = req[1].length;
      let value = req[4] ?? "";
      // strip one layer of surrounding double quotes for grammar analysis
      if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
        value = value.slice(1, -1);
      }
      const underRole = role !== null && indent > role.indent;
      reqs.push({
        id: req[3],
        deferred: section === "deferred",
        line: lineNo,
        text: value,
        underRole,
      });
      return;
    }
    // roles: map entries — collected to cross-check against the headings above.
    if (section === "roles") {
      const rd = raw.match(ROLE_DEF_RE);
      if (rd) {
        roleDefs.push({ name: rd[2], line: lineNo });
        return;
      }
    }
    // goals / non_goals: bare list statements — invisible to grammar/coverage,
    // but their [?] still counts toward "settled".
    if (section === "goals" || section === "non_goals") {
      const li = raw.match(LIST_ITEM_RE);
      if (li) {
        let v = li[1];
        if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) v = v.slice(1, -1);
        statements.push({ section, line: lineNo, text: v });
        return;
      }
    }
    // a nested mapping key that is not an ID ends the current role scope
    const nested = raw.match(NESTED_KEY_RE);
    if (nested && !ID_RE.test(nested[2])) role = null;
  });

  return { reqs, statements, roleDefs, usedRoles };
}

// --- integrity + grammar findings from the file alone ---
function fileFindings(reqs) {
  const findings = [];

  // duplicate IDs (the silent-data-loss case)
  const byId = new Map();
  for (const r of reqs) {
    if (!byId.has(r.id)) byId.set(r.id, []);
    byId.get(r.id).push(r.line);
  }
  for (const [id, at] of byId) {
    if (at.length > 1) {
      findings.push({
        severity: "integrity",
        kind: "DUPLICATE-ID",
        id,
        line: at[0],
        detail: `declared ${at.length}x (lines ${at.join(", ")}); a YAML parser keeps only the last`,
      });
    }
  }

  // grammar (advisory)
  for (const r of reqs) {
    if (!r.text.includes("; so that "))
      findings.push({ severity: "grammar", kind: "NO-SO-THAT", id: r.id, line: r.line, detail: 'missing "; so that "' });
    if (r.text.includes("; verified when "))
      findings.push({ severity: "grammar", kind: "LEGACY-VERIFIED-WHEN", id: r.id, line: r.line, detail: 'carries a legacy "; verified when " clause — fold its outcome into the capability' });
    if (!r.text.trimEnd().endsWith("."))
      findings.push({ severity: "grammar", kind: "NO-PERIOD", id: r.id, line: r.line, detail: "does not end in a period" });
    if (r.underRole && /^i can\b/i.test(r.text.trim()))
      findings.push({ severity: "grammar", kind: "I-CAN-PREFIX", id: r.id, line: r.line, detail: 'starts with "I can" under a role heading — start with the verb' });
  }

  return findings;
}

// --- roles: cross-check the roles map against the As-a-<role> headings ---
// Runs only when a `roles` map exists; otherwise headings need no definitions.
function roleFindings(roleDefs, usedRoles) {
  if (roleDefs.length === 0) return [];
  const defined = new Map();
  for (const d of roleDefs) if (!defined.has(d.name)) defined.set(d.name, d.line);
  const findings = [];
  for (const [name, line] of usedRoles)
    if (!defined.has(name))
      findings.push({ severity: "grammar", kind: "ROLE-UNDEFINED", id: name, line, detail: 'used in an "As a <role>" heading but not defined in roles' });
  for (const [name, line] of defined)
    if (!usedRoles.has(name))
      findings.push({ severity: "grammar", kind: "ROLE-UNUSED", id: name, line, detail: "defined in roles but no heading uses it" });
  return findings;
}

// --- coverage: join the file against the codebase via git ---
function coverage(reqs, filePath) {
  const abs = resolve(filePath);
  const cwd = dirname(abs);
  let top;
  try {
    top = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return { ran: false, reason: "not a git repository (skipped coverage)", findings: [] };
  }

  const relFile = relative(top, abs) || basename(abs);
  let out = "";
  // --untracked so a just-written (unstaged) test counts under TDD — still honors
  // .gitignore, so dist/ and node_modules/ stay out. Exclude *.md so coverage means a
  // test or code citation, not a prose/plan/doc mention (which proves nothing).
  try {
    out = execFileSync(
      "git",
      ["grep", "-I", "--untracked", "--no-color", "-hoE", ID, "--", ".", `:(exclude)${relFile}`, ":(exclude)*.md"],
      { cwd: top, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch (e) {
    // git grep exits 1 when there are no matches — that is a clean empty result
    if (e.status === 1 && !e.stdout) out = "";
    else if (typeof e.stdout === "string") out = e.stdout;
    else return { ran: false, reason: `git grep failed: ${e.message}`, findings: [] };
  }

  const cited = new Set();
  for (const m of out.matchAll(ID_TOKEN_RE)) cited.add(m[0]);

  const declared = new Set(reqs.map((r) => r.id));
  const deferred = new Set(reqs.filter((r) => r.deferred).map((r) => r.id));
  const prefixes = new Set([...declared].map((id) => id.split("-")[0]));

  const findings = [];
  for (const r of reqs) {
    if (r.deferred) continue;
    if (!cited.has(r.id))
      findings.push({ severity: "coverage", kind: "UNCOVERED", id: r.id, line: r.line, detail: "no citation outside requirements.yaml — build it, or add the missing ID to its test/commit" });
  }
  for (const tok of cited) {
    if (declared.has(tok)) {
      if (deferred.has(tok))
        findings.push({ severity: "coverage", kind: "DEFERRED-CITED", id: tok, line: null, detail: "cited in code but marked deferred — should not be implemented" });
      continue;
    }
    if (prefixes.has(tok.split("-")[0]))
      findings.push({ severity: "coverage", kind: "DANGLING", id: tok, line: null, detail: "cited in code but not declared — a renamed or mistyped ID" });
  }

  return { ran: true, findings };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  let text;
  try {
    text = readFileSync(opts.path, "utf8");
  } catch (e) {
    console.error(`cannot read ${opts.path}: ${e.message}`);
    process.exit(2);
  }

  const { reqs, statements, roleDefs, usedRoles } = scan(text);
  const findings = fileFindings(reqs);
  findings.push(...roleFindings(roleDefs, usedRoles));
  const cov = opts.coverage ? coverage(reqs, opts.path) : { ran: false, reason: "coverage disabled", findings: [] };
  findings.push(...cov.findings);

  const unresolvedReqs = reqs.filter((r) => r.text.includes("[?]"));
  const unresolvedStmts = statements.filter((s) => s.text.includes("[?]"));
  const unresolvedLabels = [...unresolvedReqs.map((r) => r.id), ...unresolvedStmts.map((s) => `${s.section}:${s.line}`)];
  const counts = {
    requirements: reqs.length,
    deferred: reqs.filter((r) => r.deferred).length,
    unresolved: unresolvedLabels.length,
    integrity: findings.filter((f) => f.severity === "integrity").length,
    grammar: findings.filter((f) => f.severity === "grammar").length,
    coverage: findings.filter((f) => f.severity === "coverage").length,
  };
  const exit = counts.integrity > 0 ? 1 : 0;

  if (opts.json) {
    console.log(JSON.stringify({ file: opts.path, counts, coverageRan: cov.ran, coverageReason: cov.reason ?? null, unresolved: unresolvedLabels, findings }, null, 2));
    process.exit(exit);
  }

  console.log(`${opts.path}: ${counts.requirements} requirements, ${counts.deferred} deferred, ${counts.unresolved} unresolved [?]`);
  if (!cov.ran) console.log(`coverage: ${cov.reason}`);

  const order = ["integrity", "grammar", "coverage"];
  const label = { integrity: "INTEGRITY", grammar: "GRAMMAR", coverage: "COVERAGE" };
  for (const sev of order) {
    const group = findings.filter((f) => f.severity === sev);
    if (group.length === 0) continue;
    console.log(`\n${label[sev]}`);
    for (const f of group) {
      const at = f.line ? `:${f.line}` : "";
      console.log(`  ${f.id}${at}  ${f.kind} — ${f.detail}`);
    }
  }
  if (unresolvedLabels.length)
    console.log(`\nunresolved [?] (confirm with a human): ${unresolvedLabels.join(", ")}`);

  console.log(`\nsummary: ${counts.integrity} integrity, ${counts.grammar} grammar, ${counts.coverage} coverage`);
  process.exit(exit);
}

main();
