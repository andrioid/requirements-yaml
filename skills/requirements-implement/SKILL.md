---
name: requirements-implement
description: Implement a codebase change from a requirements.yaml in the requirements-yaml format — turn a requirement's `verified when` into a test, build until it passes, and cite the ID so the work is traceable. Use when writing or changing code to satisfy one or more requirements tracked as PREFIX-NN IDs.
version: 0.3.0
---

# requirements-implement

Build from a `requirements.yaml` (the **requirements-yaml** format skill defines
the file; read it if the grammar is unfamiliar). A requirement is already shaped
for this: `verified when` is an observable outcome — an acceptance test in prose
— and the ID is a stable handle you cite from tests and commits.

## Workflow

Work one ID at a time.

1. **Read the requirement.** Take the line for the ID and split its three
   clauses: `capability` (what to build), `so that` (the value it must serve),
   `verified when` (the proof). Open any `docs` the file lists whose note says to
   read it before this kind of change — the ubiquitous language and domain model
   keep your names and model honest.
2. **Turn `verified when` into the check first.** It is an observable outcome by
   construction, so it maps to a test assertion. Write (or identify) a test that
   fails now and passes when the requirement is met. Name or tag the test with
   the ID so `git grep <ID>` finds it later.
3. **Implement the capability** until that test passes. Let `so that` arbitrate
   design choices: if an approach satisfies `verified when` but not the stated
   value, it is the wrong approach.
4. **Cite the ID** in the commit or PR (and in the test). Traceability lives
   outside `requirements.yaml`, which stays status-free — the ID references are
   how coverage is discoverable.

The **requirements-yaml** sensor (`scripts/check.mjs`) turns this into a
worklist: its `UNCOVERED` findings are IDs no code cites yet — pick from those,
and after implementing re-run it so the ID drops off `UNCOVERED`, proving the
test/commit citation landed. A `DEFERRED-CITED` finding means you cited something
that is out of scope.

## Rules

- **A vague `verified when` is a requirements bug, not a guess to paper over.**
  If the proof is not observable or testable, propose a fix to a human for
  approval (or flag it with the format's `[?]` marker) before building — do not
  invent acceptance criteria in code, and do not edit the requirement yourself.
- **Non-functional IDs** (`SEC-`, `PERF-`, …) usually name a measurable budget or
  condition; realize it as a performance/security test or a documented, ID-cited
  check, not a vibe.
- **Never implement `deferred` items** — they are explicitly out of scope.
- **Let `goals` steer and `non_goals` bound.** A project goal arbitrates design
  above a single `so that`; a `non_goal` is a hard boundary — never build toward
  one, and if a requirement contradicts a non-goal, flag it (the sensor won't).
- **Don't add status to the file.** No `done:`/`status:` keys; coverage is read
  from ID references in tests and history.
- **Never change `requirements.yaml` as a side effect.** Implementing satisfies
  requirements; it does not rewrite them. Any needed change — fixing a bug,
  resolving a `[?]`, promoting a `deferred` item — is proposed for human approval
  per the format skill's **Human approval** rule; the file changes only after.

## Done

For each ID you took on: an ID-tagged test demonstrates its `verified when`
passing, and the ID appears in the implementing commit. Anything you could not
satisfy is reported by ID with the specific blocker — not silently dropped.
