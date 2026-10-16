---
name: requirements-implement
description: Implement a codebase change from a requirements.yaml in the requirements-yaml format — turn a requirement's capability into a test, build until it passes, and cite the ID so the work is traceable. Use when writing or changing code to satisfy one or more requirements tracked as PREFIX-NN IDs.
version: 0.6.0
---

# requirements-implement

Build from a `requirements.yaml`. The **requirements-yaml** skill defines the
file, its traceability, and the rules for changing it.

## Workflow

One ID at a time:

1. **Read the line** — `capability` is the ability to provide, `so that` the
   value it must serve. Open any `docs` entries whose note covers this change.
   The requirement names no mechanism on purpose; design is yours.
2. **Define the check** — find limits and edge cases in existing specs and tests.
   If acceptance criteria are missing or ambiguous in a way that matters, propose
   them outside `requirements.yaml`. Write a test that fails now and names the ID.
3. **Implement** until it passes. Let `so that` arbitrate: an approach that meets
   the capability but not the value is wrong.
4. **Cite the ID** in the test and the commit or PR.

Use the sensor's `UNCOVERED` list as a worklist; re-run it afterward so the ID
drops off.

## Rules

- **Non-functional IDs** need a measurable budget from the project's specs,
  realized as an ID-cited test or check — not a vibe.
- **Never implement `deferred` items.**
- **`goals` steer, `non_goals` bound** — never build toward a non-goal; flag a
  requirement that contradicts one.
- **Keep design out of the requirement.** If the work reveals a missing
  ability-level constraint or a requirement bug, change the line per the format
  skill's **Changing the file** rule; the mechanism stays in code.

## Done

Each ID has an ID-tagged test passing under the agreed criteria and appears in the
implementing commit. Anything unsatisfied is reported by ID with its blocker.
