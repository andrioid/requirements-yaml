---
name: requirements-yaml
description: Author, edit, and review a project's requirements.yaml in the compact requirements-yaml format — one line per requirement, grouped into functional / non_functional / deferred plus optional goals / non_goals lists, domain sections, and a docs map of supporting references. Use when creating or maintaining a requirements.yaml, adding or revising requirements, or checking that a requirements file follows the format.
version: 0.9.1
---

# requirements-yaml

A compact requirements format: one file, one line per requirement. A convention,
not a gate — nothing enforces it; you do.

## Changing the file

- **Mechanical edits** — formatting, quoting, `roles`/`docs` sync, removing a
  legacy `; verified when ` clause: apply freely.
- **Requested changes** — the user asked for it: write it and show the diff.
- **Unrequested changes to meaning** — e.g. a requirement bug found while
  building: apply it and call it out by ID in your reply or PR; review happens
  at commit.
- **Never** weaken or remove a requirement to make code pass.
- **Never** write, infer, or reword `goals` / `non_goals` — see **Goals and
  non-goals**.

A project's AGENTS.md may tighten this.

## Line grammar

```
<ID>: <capability>; so that <value>.
```

- **capability** — what the actor or system is able to do. Under a role heading,
  start with the verb; the heading already says "I can".
- **so that** — why it matters.
- One line, ending in a period; `; ` tight, no space before the `;`.
- Quote the value only if it contains `: ` or starts with a YAML indicator
  (`- ? : , [ ] { } # & * ! | > ' " % @` or backtick).

## Ability, not implementation

The line states only **what** must be possible and **why**. No technologies,
protocols, components, endpoints, data models, algorithms, UI controls, internal
sequences, test methods, or deployment choices; no limits, thresholds, edge cases,
or acceptance criteria — those live in design docs, specs, tests, and code.

Test: could materially different implementations satisfy this line unchanged? If
not, raise the wording one level.

## Structure

```yaml
# requirements-yaml
goals:                          # optional — the distilled vision
  - <one-line goal…>
non_goals:                      # optional — boundaries, not roadmap
  - <one-line boundary…>
roles:                          # optional — actors named in role headings
  <role>: <who they are and their authority>
functional:
  <area>:                       # snake_case system area
    As a <role>, I can:
      <ID>: <verb…>; so that <value>.
non_functional:
  <quality>:                    # snake_case: security, performance, ...
    <ID>: <property…>; so that <value>.
deferred:
  <area>:
    "[deferred] <ID>": <future…>; so that <value>.
docs:                           # optional; last — filename -> when to read it
  <filename>: <what it is, and when to read it>
```

- `functional` + `non_functional` are core; the rest are optional.
- A project may add top-level **domain sections** with the `non_functional` shape
  (`group → {ID: line}`).
- Order is presentational; by convention `goals`/`non_goals` first, `docs` last.
- Keep the header comment: a one-line grammar reminder and the
  `# requirements-yaml` provenance line.

## Goals and non-goals

Plain one-line YAML list items — no IDs, roles, `so that`, or `[?]`. `goals` are
the vision the requirements serve; `non_goals` are boundaries the project will
never cross. `non_goals` is *not ever*; `deferred` is *not yet*.

Both belong to the human — they are how the human steers the project. An agent
never writes, infers, or rewords an entry. It records one only when the human
dictates it, word for word, and suggests candidates only when the human asks — in
conversation, never in the file. With none dictated, the section stays absent.

## Roles

Keys are bare role names matching `As a <role>` headings (`As an admin` →
`admin`); values are one-line descriptions, not requirements. Add the map when
roles are non-obvious or differ in authority; keep it in sync with the headings.

## Docs

Keys are repo-relative paths or URLs; values say what the document is and when to
read it (`docs/glossary.md: the ubiquitous language — read before naming
anything.`). Read listed docs before adding to an area they cover.

## IDs

`PREFIX-NN`, uppercase, zero-padded (`ACC-01`), unique across the file. Stable
forever — never renumber or reuse. Infer prefixes from existing IDs. Deferred IDs
are quoted and prefixed: `"[deferred] PAY-01"`.

## Traceability

The file is status-free — no `done:`/`status:` keys. Cite the ID in the test that
proves it and in the implementing commit or PR; `git grep <ID>` then shows
coverage.

## `[?]` — unconfirmed

`[?]` right after a clause keyword marks the clause as assumed:

```
BIL-01: charge a saved card on renewal; so that [?] subscriptions continue without re-entry.
```

Expected in discovered drafts; a settled file has none left.

## Checking (the sensor)

`scripts/check.mjs` (bundled with this skill) is read-only: it reports where the
file and the codebase disagree, never edits either.

```
node .claude/skills/requirements-yaml/scripts/check.mjs [requirements.yaml] [--json] [--no-coverage]
```

| Finding | Kind | Meaning / action |
|---|---|---|
| `DUPLICATE-ID` | integrity — exits non-zero | Two lines share an ID; YAML keeps one. Fix first. |
| grammar codes | advisory | Missing `; so that `, no final period, "I can" under a role heading, `LEGACY-VERIFIED-WHEN`. |
| `ROLE-UNDEFINED` / `ROLE-UNUSED` | advisory | `roles` map and headings disagree. |
| `UNCOVERED` | coverage | Non-deferred ID no code cites: build it or cite it. |
| `DANGLING` | coverage | ID cited in code but absent from the file. |
| `DEFERRED-CITED` | coverage | A deferred ID is cited — it should not be built. |

Coverage scans tracked and untracked files (honoring `.gitignore`), excluding
`*.md` — a prose mention proves nothing. The sensor also counts unresolved `[?]`.
It checks shape, not quality; without node or git, use `git grep <ID>`.

## Companion skills

- **requirements-implement** — build from a requirement: test, implement, cite the ID.
- **requirements-discover** — reverse-engineer a `requirements.yaml` from code.

## Scaffolding

Vendor these into the repo root from the tag matching this skill's version:

- `https://raw.githubusercontent.com/andrioid/requirements-yaml/v0.9.1/requirements.template.yaml`
  — save as `requirements.yaml`, keep its header.
- `https://raw.githubusercontent.com/andrioid/requirements-yaml/v0.9.1/requirements.schema.json`
  — optional editor aid for structure only; this skill stays authoritative.

Offline, the Structure skeleton above is enough to hand-build a starter.

### New project

1. Vendor the template, keep its header comment (through the `$schema` line), and
   delete every example entry — none of them are yours, including the example
   `goals` and `non_goals`.
2. Draft from what the user gave (pitch, README, conversation); ask only for gaps.
   Fill in this order:
   - `goals` / `non_goals` — ask the human; record only what they dictate.
   - `roles` — only if actors differ in authority.
   - `functional` areas — `snake_case`, one prefix each (`accounts` → `ACC`), from `01`.
   - Requirements per area. Rationale the user stated is settled; rationale you
     supplied gets `[?]`.
   - `non_functional` — ask about security, performance, and privacy; they are
     the easiest to miss.
   - `deferred` — whatever the user called "later".
   - `docs` — only documents that exist.
3. Run the sensor. Every ID will be `UNCOVERED`; that is the build worklist for
   **requirements-implement**.

## Versioning

The skill's frontmatter `version` is the contract; a `requirements.yaml` carries
only the provenance line. Update with `npx skills update`; if the grammar changed,
migrate in place per `CHANGELOG.md`.
