# Changelog

Tags track the `requirements-yaml` skill version; workflow skills version
independently.

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
