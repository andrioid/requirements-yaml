---
name: requirements-discover
description: Reverse-engineer a requirements.yaml in the requirements-yaml format from an existing codebase — infer capabilities from code, verified-when from tests, and mark assumed rationale with [?] for human confirmation. Use when bootstrapping requirements for a codebase that has none, or reconciling a requirements file with what the code actually does.
version: 0.1.0
---

# requirements-discover

Recover a `requirements.yaml` from code (the **requirements-yaml** format skill
defines the file; follow its grammar and review checklist). The job is to read
what the system *does* and write it back as requirements — honestly flagging what
the code cannot tell you.

## The three clauses recover unevenly

- **capability — in the code.** Read it from the surface: HTTP routes, public
  API, CLI commands, UI actions, scheduled jobs, event handlers.
- **verified when — in the tests.** Lift the observable outcome from an existing
  test's assertions. No test for a behavior? State the outcome the code visibly
  produces, and note the coverage gap.
- **so that — usually NOT in the code.** Rationale and business value are rarely
  recoverable. Infer your best guess and mark it `[?]` (the format's provisional
  marker) for a human to confirm. **Never fabricate confident rationale.**

## Method

1. **Map the surface first** — enumerate every entrypoint (routes, exported API,
   commands, jobs, UI actions) with search/grep, not memory. This list is your
   coverage checklist: an entrypoint with no resulting requirement is a gap.
2. **Turn each behavior into a line** — verb-first `capability` under an
   `As a <role>, I can:` heading, `verified when` lifted from its test (or the
   observed behavior), and a `so that [?]` best-guess value.
3. **Bootstrap the structure** (empty file, no IDs to infer from):
   - Derive `snake_case` areas from module/package/route grouping.
   - Mint an uppercase prefix per area (`accounts` → `ACC`, `billing` → `BIL`);
     zero-pad and start at `01`.
   - Infer `non_functional` from cross-cutting code — auth/rate-limiting →
     `security`; caching/pagination/timeouts/budgets → `performance`. Scan
     middleware, config, and CI; these are the easiest requirements to miss.
4. **Point at docs that exist** — if the repo has a glossary, domain model, or
   API contract, list them in the bottom `docs` map with a when-to-read note.

## Rules

- **Ground every clause in something you read** — a route, a test, a config —
  not in assumption. The one sanctioned assumption is `so that`, and it must wear
  a `[?]`.
- **Review against the format checklist** before handing off, and resolve every
  `[?]` with a human; a file still carrying `[?]` is a draft, not settled.
- **Completeness is the hard part.** Walk the surface map and confirm each live
  entrypoint produced at least one requirement; call out anything intentionally
  excluded.

## Done

A `requirements.yaml` that validates against `requirements.schema.json`, covers
the enumerated surface, and in which every `so that` is either sourced from the
code/docs or marked `[?]` for confirmation.
