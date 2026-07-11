---
name: requirements-implement
description: Implement a codebase change from a requirements.yaml in the requirements-yaml format — turn a requirement's `verified when` into a test, build until it passes, and cite the ID so the work is traceable. Use when writing or changing code to satisfy one or more requirements tracked as PREFIX-NN IDs.
version: 0.1.0
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

## Rules

- **A vague `verified when` is a requirements bug, not a guess to paper over.**
  If the proof is not observable or testable, fix the requirement (or flag it
  with the format's `[?]` marker) before building — do not invent acceptance
  criteria in code.
- **Non-functional IDs** (`SEC-`, `PERF-`, …) usually name a measurable budget or
  condition; realize it as a performance/security test or a documented, ID-cited
  check, not a vibe.
- **Never implement `deferred` items** — they are explicitly out of scope.
- **Don't add status to the file.** No `done:`/`status:` keys; coverage is read
  from ID references in tests and history.

## Done

For each ID you took on: an ID-tagged test demonstrates its `verified when`
passing, and the ID appears in the implementing commit. Anything you could not
satisfy is reported by ID with the specific blocker — not silently dropped.
