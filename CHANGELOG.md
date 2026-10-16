# Changelog

Tags track the `requirements-yaml` skill version; workflow skills version
independently.

## v0.9.0

- **Looser approval.** Mechanical and requested edits to `requirements.yaml` are
  applied directly; unrequested changes to meaning are applied and called out by
  ID for review at commit. Fixed rules: never weaken or remove a requirement to
  make code pass; change `goals`/`non_goals` only when asked. AGENTS.md may
  tighten this.
- `requirements-discover` 0.6.0 writes the file directly; `[?]` marks what is
  unconfirmed. `requirements-implement` 0.6.0 follows the new change rule.
- Skills condensed: each rule stated once in the format skill; the review
  checklist replaced by the sensor table; migration notes live here.
- Sensor labels unresolved `[?]` as "unconfirmed".

## v0.8.0

- Requirements now explicitly contain only the **what** (ability) and **why**
  (value). Authoring and discovery reject technologies, protocols, components,
  data models, algorithms, UI controls, test methods, and other implementation
  choices.
- Limits, edge cases, measurable boundaries, and acceptance criteria now live
  outside the requirement instead of being compressed into its capability.
- Examples were raised from solution-specific wording to implementation-independent
  capabilities.
- `requirements-implement` and `requirements-discover` 0.5.0 preserve the
  ability/design boundary in their workflows.

Migrate by reducing each capability to the ability itself; move limits,
thresholds, edge cases, and proof to acceptance criteria, specs, or tests.

## v0.7.0

- **Breaking: dropped the `verified when` clause.** A line is now
  `<ID>: <observable capability>; so that <value>.` The capability carries its own
  limits, so it doubles as the acceptance criterion.
- Sensor: `NO-VERIFIED-WHEN` replaced by `LEGACY-VERIFIED-WHEN` (advisory) — your
  migration worklist.
- `requirements-implement` 0.4.0, `requirements-discover` 0.4.0 build the test
  from the capability.

Migrate by folding each old proof into its capability; drop whatever only
described a test method.

## v0.6.1

- Coverage sensor scans untracked files and excludes `*.md`.

## v0.6.0

- Optional `roles` map, cross-checked against `As a <role>` headings.

## v0.5.0

- Optional `goals` / `non_goals` lists; human-approval rule for the file.

## v0.4.0

- Read-only `check.mjs` sensor: integrity, grammar, and ID coverage.

## v0.3.0

- Split into three installable skills; format artifacts moved to the repo root.
