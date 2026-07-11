---
name: requirements-yaml
description: Author, edit, and review a project's requirements.yaml in the compact requirements-yaml format — one line per requirement, grouped into functional / non_functional / deferred plus optional goals / non_goals lists, domain sections, and a docs map of supporting references. Use when creating or maintaining a requirements.yaml, adding or revising requirements, or checking that a requirements file follows the format.
version: 0.5.0
---

# requirements-yaml

A compact requirements format: one file, one line per requirement, terse enough
to hand-edit and regular enough to review. A convention, not a gate — nothing
enforces it; you do.

## Human approval

`requirements.yaml` is **human-owned**. It is the source of truth, and a human
decides what it says. Any change to it — adding, editing, removing, or reordering
a requirement, goal, or non_goal — **must be proposed to a human and explicitly
approved before it is written**. The agent drafts and proposes the exact change
and says why; it never edits the file unilaterally, and never as a side effect of
implementing or discovering.

- **Propose, don't apply.** Show the precise addition / edit / removal (the lines,
  or a diff) and wait for an explicit yes before writing the file.
- Resolving a `[?]`, promoting a `deferred` item, and fixing a requirement bug
  found while building are all changes — each needs approval.
- This is the authoring counterpart to the read-only sensor: the agent reports
  and proposes, the human decides and approves.

## Line grammar

```
<ID>: <capability>; so that <value>; verified when <observable proof>.
```

- `;` separates the three clauses — no space before it, a single space after, as
  in ordinary prose (`capability; so that …`). A parser or reviewer may tolerate
  stray whitespace around the separator, but author it tight.
- **capability** — what the actor or system does. Under a role heading, start
  with the verb; the heading already says "I can".
- **so that** — why it matters.
- **verified when** — an observable condition; outcomes, not implementation
  tasks.
- One line, ending in a period.
- **Quotes are optional.** Add double quotes around the value only if a clause
  contains `: ` (colon-space) or the value starts with a YAML indicator
  (`- ? : , [ ] { } # & * ! | > ' " % @` or backtick). Otherwise leave it bare.

## Structure

```yaml
# requirements-yaml
goals:                          # optional list, kept first — the distilled vision
  - <one-line goal…>
non_goals:                      # optional list — boundaries, not roadmap
  - <one-line boundary…>
functional:
  <area>:                       # snake_case system area
    As a <role>, I can:
      <ID>: <verb…>; so that <value>; verified when <proof>.
non_functional:
  <quality>:                    # snake_case: security, performance, ...
    <ID>: <property…>; so that <value>; verified when <proof>.
deferred:
  <area>:
    "[deferred] <ID>": <future…>; so that <value>; verified when <proof>.
docs:                           # optional; kept last — filename -> when to read it
  <filename>: <what it is, and when to read it>
```

- `functional` + `non_functional` are core; `deferred` and `docs` are optional.
- A project may add top-level **domain sections** — same `group → {ID: line}`
  shape as `non_functional` (e.g. a public/private data boundary).
- Order is presentational; by convention `goals`/`non_goals` come first and the
  optional `docs` block comes last.

## Goals and non-goals

Two optional lists at the **top** of the file set direction where the requirement
grammar is too strict — distilled statements, not testable behaviors:

```yaml
goals:
  - account recovery never depends on human support.
non_goals:
  - never a payments processor that holds customer balances.
```

- **Plain one-line statements, not requirements** — no IDs, no roles, no
  `so that` / `verified when`; a bare YAML list, order free.
- **`goals`** are the vision the requirements serve; **`non_goals`** are
  boundaries the project deliberately will not cross.
- **`non_goals` is not `deferred`.** `deferred` is *not yet* — a paused
  requirement you intend to build; a non-goal is *not ever* — identity, not
  roadmap.
- **`[?]`** may mark a statement you cannot yet stand behind (typically a goal
  inferred during discovery). Quote the value when `[?]` leads it — `- "[?] …"` —
  because `[` is a YAML indicator. A settled file has none left.

## Supporting documents

The optional `docs` map is a reading list — each supporting document (glossary,
domain model, ADR log, API contract) mapped to what it is and, crucially, *when
to read it*, so a reader or agent knows which file to open before a given change:

```yaml
docs:
  docs/glossary.md: the ubiquitous language — read before naming anything in a requirement.
  docs/domain-model.md: aggregates, entities, and invariants — read before adding or changing a functional area.
```

Keys are filenames (a repo-relative path or URL); values are pointers, not
requirements — no IDs, no clauses.

## IDs

`PREFIX-NN`, uppercase and zero-padded (`ACC-01`). Stable forever — never
renumber or reuse. Prefixes are per-project; infer them from the IDs already in
the file. Deferred IDs are quoted and prefixed: `"[deferred] PAY-01"`.

## Traceability

IDs are the join key between a requirement and everything that satisfies it, and
those links live **outside** this file — `requirements.yaml` stays status-free.

- Cite the ID in the test that proves the `verified when`, and in the commit or
  PR that implements the capability.
- `git grep <ID>` (or a search across tests) then shows what covers a
  requirement; an ID with no hits is unimplemented or unverified.

## Provisional clauses

A clause you cannot yet stand behind — most often `so that`, whose rationale is
rarely recoverable from code — is marked `[?]` right after the clause keyword and
left for a human to confirm:

```
BIL-01: charge a saved card on renewal; so that [?] subscriptions continue without re-entry; verified when a due invoice captures against the stored token.
```

- `[?]` reads as "assumed — confirm with a human"; it sits inside the value, so
  no quoting is triggered.
- Expected while **discovering** requirements from an existing codebase; a
  settled, hand-authored file has none left.

## Per-project vocabulary

A `requirements.yaml` opens with a short comment header: a one-line grammar
reminder and a `# requirements-yaml` provenance line. Project specifics
(prefixes, roles, domain-section meaning, domain rules) are documented by the
requirements themselves and by the documents `docs` points to — read the existing
IDs, sections, and docs before adding one.

## Authoring = review checklist

Authoring rules and review are one list. To review, check each and report
`ID: problem`. Advisory, not a build gate.

- One requirement per line, ending in a period, with `; so that ` and
  `; verified when `.
- Under a role heading, lines start with a verb, not "I can".
- `verified when` states an observable outcome, not an implementation task.
- IDs are `PREFIX-NN`, stable, and unique across the file.
- Group keys are `snake_case`; top-level sections are `functional`,
  `non_functional`, `deferred`, `docs`, plus any domain sections already in the
  file.
- `deferred` keys are quoted and start with `[deferred] `.
- `docs` is optional; when present it is the last section, and each entry is
  `<filename>: <description>` whose description says what the document is and when
  to read it — not a requirement.
- `[?]` marks an assumed clause pending confirmation; a settled file has none
  left.
- A value is quoted only when it contains `: ` or starts with a YAML indicator.

## Checking (the sensor)

`scripts/check.mjs` (bundled with this skill) is this checklist compiled into a
read-only script, plus the coverage join `git grep` would otherwise do by hand.
It reports where the file and the codebase disagree; it never edits either side —
you reconcile.

```
node .claude/skills/requirements-yaml/scripts/check.mjs [requirements.yaml] [--json] [--no-coverage]
```

- **INTEGRITY is the only loud finding.** `DUPLICATE-ID` means two lines share an
  ID and a YAML parser silently keeps just one — the source of truth is corrupt.
  That is the one thing worth stopping for; the script exits non-zero only here.
- **GRAMMAR** (advisory) — a line missing `; so that ` / `; verified when `, not
  ending in a period, or starting with "I can" under a role heading.
- **COVERAGE** (advisory, needs git) — the ID join outside the file:
  - `UNCOVERED` — a non-deferred ID no code cites: build it, or add the ID to the
    test/commit that already covers it.
  - `DANGLING` — an ID cited in code but absent from the file: a renamed or
    mistyped reference to reconcile.
  - `DEFERRED-CITED` — a `deferred` ID cited in code, which should not be built.
- It also counts unresolved `[?]` — including on `goals`/`non_goals`, which are
  otherwise exempt from grammar and coverage — marking the file as not yet settled.

The sensor sharpens attention; it does not judge quality — whether a
`verified when` is a genuine observable outcome stays your call. With no node or
git it degrades to this checklist plus `git grep <ID>`, so it is an enhancement,
not a dependency.

## Companion skills

Build on this format; each depends on it:

- **requirements-implement** — build a change from a requirement: turn its
  `verified when` into a test, implement, and cite the ID.
- **requirements-discover** — reverse-engineer a `requirements.yaml` from an
  existing codebase.

## Scaffolding

The format's two files live at the **repo root**, not inside this skill — a skill
carries instructions, and these are vendored into your project. Fetch them from
the release tag matching this skill's version:

- `requirements.template.yaml` — a ready-to-copy starter; save it as your
  project's `requirements.yaml` and keep its header.
  `https://raw.githubusercontent.com/andrioid/requirements-yaml/v0.5.0/requirements.template.yaml`
- `requirements.schema.json` — optional editor aid (autocomplete + hover). It
  mirrors the structural shape (key and ID patterns, nesting); this skill stays
  authoritative for grammar and conventions. The template's `$schema` field
  points at it once both sit in your repo.
  `https://raw.githubusercontent.com/andrioid/requirements-yaml/v0.5.0/requirements.schema.json`
- `scripts/check.mjs` — the read-only sensor (see **Checking**); it ships inside
  this skill, so it needs no vendoring — run it with node.

Offline, the grammar and the `Structure` skeleton above are enough to hand-build
a starter — the template is just that, populated.

## Versioning

This skill is the living contract, versioned by its frontmatter `version` and
distributed via `npx skills`. A `requirements.yaml` carries no version — only the
`# requirements-yaml` provenance line. To adopt a format change, update the skill
(`npx skills update`); if the grammar changed, migrate the file in place.
