---
name: requirements-implement
description: Implement a codebase change from a requirements.yaml in the requirements-yaml format — turn a requirement's capability into a test, build until it passes, and cite the ID so the work is traceable. Use when writing or changing code to satisfy one or more requirements tracked as PREFIX-NN IDs.
version: 0.5.0
---

# requirements-implement

Build from a `requirements.yaml` (the **requirements-yaml** format skill defines
the file; read it if the grammar is unfamiliar). A requirement is already shaped
for this: the `capability` clause states what ability to provide, the value guides
design, and the ID is a stable handle you cite from tests and commits.

## Workflow

Work one ID at a time.

1. **Read the requirement.** Take the line for the ID and split its two clauses:
   `capability` (what ability to provide) and `so that` (the value it must serve).
   Open any `docs` the file lists whose note says to
   read it before this kind of change — the ubiquitous language and domain model
   keep your names and model honest.
   The absence of a prescribed technology, protocol, component, UI, algorithm,
   or storage model is intentional: choose those during design, outside the
   requirement.
2. **Define the check outside the requirement.** Use existing specifications and
   tests to find the applicable limits and edge cases. If acceptance criteria are
   missing or consequentially ambiguous, propose them separately for human
   agreement rather than adding them to `requirements.yaml`. Write (or identify)
   a test that fails now and passes when the ability is provided. Name or tag the
   test with the ID so `git grep <ID>` finds it later.
3. **Implement** until that test passes. Let `so that` arbitrate design choices:
   if an approach satisfies the capability as written but not the stated value,
   it is the wrong approach.
4. **Cite the ID** in the commit or PR (and in the test). Traceability lives
   outside `requirements.yaml`, which stays status-free — the ID references are
   how coverage is discoverable.

The **requirements-yaml** sensor (`scripts/check.mjs`) turns this into a
worklist: its `UNCOVERED` findings are IDs no code cites yet — pick from those,
and after implementing re-run it so the ID drops off `UNCOVERED`, proving the
test/commit citation landed. A `DEFERRED-CITED` finding means you cited something
that is out of scope.

## Rules

- **Do not expect a requirement to contain its own test case.** Resolve missing
  acceptance criteria outside `requirements.yaml`; do not invent consequential
  product behavior silently.
- **Do not push design decisions back into the requirement.** If implementation
  work reveals a necessary externally observable constraint, propose that
  ability-level constraint for approval. Keep the chosen mechanism in code,
  plans, or design documentation.
- **Non-functional IDs** (`SEC-`, `PERF-`, …) name a required quality and its
  value. Find its measurable budget or condition in the project's acceptance
  criteria or specifications, then realize it as a performance/security test or
  a documented, ID-cited check—not a vibe.
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

For each ID you took on: an ID-tagged test demonstrates its capability under the
agreed acceptance criteria, and the ID appears in the implementing commit.
Anything you could not satisfy is reported by ID with the specific blocker — not
silently dropped.
