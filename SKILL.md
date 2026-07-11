---
name: requirements-yaml
description: Author, edit, and review a project's requirements.yaml in the compact requirements-yaml format — one line per requirement, grouped into functional / non_functional / deferred plus optional domain sections. Use when creating or maintaining a requirements.yaml, adding or revising requirements, or checking that a requirements file follows the format.
version: 0.1.0
---

# requirements-yaml

A compact requirements format: one file, one line per requirement, terse enough
to hand-edit and regular enough to review. A convention, not a gate — nothing
enforces it; you do.

## Line grammar

```
<ID>: <capability> | so that <value> | verified when <observable proof>.
```

- `|` (space-pipe-space) separates the three clauses.
- **capability** — what the actor or system does. Under a role heading, start
  with the verb; the heading already says "I can".
- **so that** — why it matters.
- **verified when** — an observable condition; outcomes, not implementation
  tasks.
- One line, ending in a period.
- **Quotes are optional.** Add double quotes around the value only if a clause
  contains `: ` (colon-space) or the value starts with a YAML indicator
  (`- ? : , [ ] { } # & * ! | > ' " % @` or backtick). Otherwise leave it bare.

## Structure

```yaml
# requirements-yaml
functional:
  <area>:                       # snake_case system area
    As a <role>, I can:
      <ID>: <verb…> | so that <value> | verified when <proof>.
non_functional:
  <quality>:                    # snake_case: security, performance, ...
    <ID>: <property…> | so that <value> | verified when <proof>.
deferred:
  <area>:
    "[deferred] <ID>": <future…> | so that <value> | verified when <proof>.
```

- `functional` + `non_functional` are core; `deferred` is optional.
- A project may add top-level **domain sections** — same `group → {ID: line}`
  shape as `non_functional` (e.g. a public/private data boundary).
- Group keys are `snake_case`. Under `functional`, group by area, then by a role
  heading `As a <role>, I can:`.

## IDs

`PREFIX-NN`, uppercase and zero-padded (`ACC-01`). Stable forever — never
renumber or reuse. Prefixes are per-project; infer them from the IDs already in
the file. Deferred IDs are quoted and prefixed: `"[deferred] PAY-01"`.

## Per-project vocabulary

A `requirements.yaml` opens with a short comment header: a one-line grammar
reminder and a `# requirements-yaml` provenance line. Project specifics
(prefixes, roles, domain-section meaning, domain rules) are documented by the
requirements themselves — read the existing IDs and sections before adding one.

## Authoring = review checklist

Authoring rules and review are one list. To review, check each and report
`ID: problem`. Advisory, not a build gate.

- One requirement per line, ending in a period, with `| so that ` and
  `| verified when `.
- Under a role heading, lines start with a verb, not "I can".
- `verified when` states an observable outcome, not an implementation task.
- IDs are `PREFIX-NN`, stable, and unique across the file.
- Group keys are `snake_case`; top-level sections are `functional`,
  `non_functional`, `deferred`, plus any domain sections already in the file.
- `deferred` keys are quoted and start with `[deferred] `.
- A value is quoted only when it contains `: ` or starts with a YAML indicator.

## Scaffolding

- `requirements.template.yaml` — a ready-to-copy starter; keep its header.
- `requirements.schema.json` — optional editor aid (autocomplete + hover).
  Structural only; it enforces no grammar.

## Versioning

This skill is the living contract, versioned by its frontmatter `version` and
distributed via `npx skills`. A `requirements.yaml` carries no version — only the
`# requirements-yaml` provenance line. To adopt a format change, update the skill
(`npx skills update`); if the grammar changed, migrate the file in place.
