---
name: requirements-discover
description: Reverse-engineer a requirements.yaml in the requirements-yaml format from an existing codebase — infer observable capabilities from code and tests, mark assumed rationale with [?] as unconfirmed, and distil the project's goals and non-goals. Use when bootstrapping requirements for a codebase that has none, or reconciling a requirements file with what the code actually does.
version: 0.6.0
---

# requirements-discover

Recover a `requirements.yaml` from code, following the **requirements-yaml**
skill's grammar and its **Ability, not implementation** rule. Write the file
directly; `[?]` marks what the code cannot tell you.

## The two clauses recover unevenly

- **capability** — read from the surface (routes, public API, CLI commands, UI
  actions, jobs, event handlers) and tests. Code is evidence, not wording: state
  the resulting ability, raised to implementation independence.
- **so that** — rarely in the code. Write your best guess marked `[?]`. Never
  fabricate confident rationale.

## Method

1. **Map the surface** — enumerate every entrypoint with search, not memory. This
   is your coverage checklist.
2. **One line per behavior** — verb-first under `As a <role>, I can:`, with
   `so that [?] …`.
3. **Bootstrap structure** — `snake_case` areas from module/route grouping; one
   prefix per area (`accounts` → `ACC`) starting at `01`. Infer `non_functional`
   from cross-cutting code: auth and rate limiting → `security`; caching,
   pagination, timeouts → `performance`. Scan middleware, config, and CI — these
   are the easiest to miss.
4. **List existing docs** (glossary, domain model, API contract) in `docs`.
5. **Goals and non-goals** — synthesize 3–7 `goals` from the README and recurring
   `so that` themes, each `[?]`. Transcribe `non_goals` only from stated
   boundaries (out-of-scope notes, rejected ADRs, `wontfix`); never infer one
   from absence.

## Rules

- Ground every clause in something you read; the only sanctioned assumption is a
  `[?]` `so that` or goal.
- Implementation details go in discovery notes, not the file.
- Run the sensor: `DANGLING` IDs are likely missed requirements; the `[?]` tally
  shows how far the draft is from settled.

## Done

A file that validates against the vendored `requirements.schema.json`, covers
every entrypoint on the surface map (intentional exclusions called out), and in
which every `so that` is sourced or marked `[?]`.
