# Compact requirements format

`requirements.yaml`: one requirement per line, terse enough to hand-edit and
regular enough for an LLM to review. A convention, not a gate — the optional
`requirements.schema.json` only adds editor autocomplete. Worked example:
`requirements.template.yaml`.

## Shape

```yaml
# yaml-language-server: $schema=./requirements.schema.json
functional:
  <area>:                       # snake_case system area
    As a <role>, I can:
      <ID>: "<capability> — so that <value> — acceptance: <observable proof>."
non_functional:
  <quality>:                    # snake_case: security, performance, ...
    <ID>: "<property> — so that <value> — acceptance: <observable proof>."
deferred:
  <area>:
    "[deferred] <ID>": "<future capability> — so that <value> — acceptance: <proof>."
```

`functional` + `non_functional` are core; `deferred` is optional. A project may
add top-level **domain sections** (same `area → {ID: text}` shape as
`non_functional`; e.g. a public/private data boundary). Declare them, and their
rules, in `requirements.vocab.md`. All group keys are `snake_case`.

## The requirement line

`<capability> — so that <value> — acceptance: <observable proof>.`

- **capability** — what the actor or system can do. Under a role heading, start
  with the verb; the heading already says "I can".
- **so that** — why it matters.
- **acceptance** — observable proof; outcomes, not implementation tasks.
- Separators are ` — ` (em dash, U+2014). One line, ending in a period.

## IDs

`PREFIX-NN`, uppercase and zero-padded (`ACC-01`). Stable forever — never
renumber or reuse. Prefixes are per-project, listed in `requirements.vocab.md`.

## Rules = review checklist

Authoring rules and LLM review are one list. To verify, check each holds and
report `ID: problem`; this is advisory, not a build gate.

- One requirement per line, ending in a period, with both `— so that` and
  `— acceptance:`.
- Under a role heading, lines start with a verb, not "I can".
- Acceptance is observable outcome, not implementation task.
- IDs are stable, unique across the file, and use a prefix from
  `requirements.vocab.md`.
- Group keys are `snake_case`; top-level sections are `functional`,
  `non_functional`, `deferred`, plus only the domain sections declared in
  `requirements.vocab.md`.
- `deferred` keys are quoted and start with `[deferred] `.
- Every domain rule in `requirements.vocab.md` holds.
