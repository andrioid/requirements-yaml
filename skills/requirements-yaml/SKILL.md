---
name: requirements-yaml
description: Author, edit, and review a project's requirements.yaml in the compact requirements-yaml format — one line per requirement, grouped into functional / non_functional / deferred plus optional domain sections and a docs map of supporting references. Use when creating or maintaining a requirements.yaml, adding or revising requirements, or checking that a requirements file follows the format.
version: 0.3.0
---

# requirements-yaml

A compact requirements format: one file, one line per requirement, terse enough
to hand-edit and regular enough to review. A convention, not a gate — nothing
enforces it; you do.

## Line grammar

```
<ID>: <capability>; so that <value>; verified when <observable proof>.
```

- `;` separates the three clauses — no space before it, a single space after, as
  in ordinary prose (`capability; so that …`). A parser or reviewer may tolerate
  stray whitespace around the separator, but author it tight.
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
      <ID>: <verb…>; so that <value>; verified when <proof>.
non_functional:
  <quality>:                    # snake_case: security, performance, ...
    <ID>: <property…>; so that <value>; verified when <proof>.
deferred:
  <area>:
    "[deferred] <ID>": <future…>; so that <value>; verified when <proof>.
docs:                           # optional; kept last — filename -> when to read it
  <filename>: <what it is, and when to read it>
```

- `functional` + `non_functional` are core; `deferred` and `docs` are optional.
- A project may add top-level **domain sections** — same `group → {ID: line}`
  shape as `non_functional` (e.g. a public/private data boundary).
- Order is presentational; by convention the optional `docs` block comes last.

## Supporting documents

The optional `docs` map is a reading list — each supporting document (glossary,
domain model, ADR log, API contract) mapped to what it is and, crucially, *when
to read it*, so a reader or agent knows which file to open before a given change:

```yaml
docs:
  docs/glossary.md: the ubiquitous language — read before naming anything in a requirement.
  docs/domain-model.md: aggregates, entities, and invariants — read before adding or changing a functional area.
```

Keys are filenames (a repo-relative path or URL); values are pointers, not
requirements — no IDs, no clauses.

## IDs

`PREFIX-NN`, uppercase and zero-padded (`ACC-01`). Stable forever — never
renumber or reuse. Prefixes are per-project; infer them from the IDs already in
the file. Deferred IDs are quoted and prefixed: `"[deferred] PAY-01"`.

## Traceability

IDs are the join key between a requirement and everything that satisfies it, and
those links live **outside** this file — `requirements.yaml` stays status-free.

- Cite the ID in the test that proves the `verified when`, and in the commit or
  PR that implements the capability.
- `git grep <ID>` (or a search across tests) then shows what covers a
  requirement; an ID with no hits is unimplemented or unverified.

## Provisional clauses

A clause you cannot yet stand behind — most often `so that`, whose rationale is
rarely recoverable from code — is marked `[?]` right after the clause keyword and
left for a human to confirm:

```
BIL-01: charge a saved card on renewal; so that [?] subscriptions continue without re-entry; verified when a due invoice captures against the stored token.
```

- `[?]` reads as "assumed — confirm with a human"; it sits inside the value, so
  no quoting is triggered.
- Expected while **discovering** requirements from an existing codebase; a
  settled, hand-authored file has none left.

## Per-project vocabulary

A `requirements.yaml` opens with a short comment header: a one-line grammar
reminder and a `# requirements-yaml` provenance line. Project specifics
(prefixes, roles, domain-section meaning, domain rules) are documented by the
requirements themselves and by the documents `docs` points to — read the existing
IDs, sections, and docs before adding one.

## Authoring = review checklist

Authoring rules and review are one list. To review, check each and report
`ID: problem`. Advisory, not a build gate.

- One requirement per line, ending in a period, with `; so that ` and
  `; verified when `.
- Under a role heading, lines start with a verb, not "I can".
- `verified when` states an observable outcome, not an implementation task.
- IDs are `PREFIX-NN`, stable, and unique across the file.
- Group keys are `snake_case`; top-level sections are `functional`,
  `non_functional`, `deferred`, `docs`, plus any domain sections already in the
  file.
- `deferred` keys are quoted and start with `[deferred] `.
- `docs` is optional; when present it is the last section, and each entry is
  `<filename>: <description>` whose description says what the document is and when
  to read it — not a requirement.
- `[?]` marks an assumed clause pending confirmation; a settled file has none
  left.
- A value is quoted only when it contains `: ` or starts with a YAML indicator.

## Companion skills

Build on this format; each depends on it:

- **requirements-implement** — build a change from a requirement: turn its
  `verified when` into a test, implement, and cite the ID.
- **requirements-discover** — reverse-engineer a `requirements.yaml` from an
  existing codebase.

## Scaffolding

- `requirements.template.yaml` — a ready-to-copy starter; keep its header.
- `requirements.schema.json` — optional editor aid (autocomplete + hover). It
  mirrors the structural shape (key and ID patterns, nesting); this skill stays
  authoritative for grammar and conventions.

## Versioning

This skill is the living contract, versioned by its frontmatter `version` and
distributed via `npx skills`. A `requirements.yaml` carries no version — only the
`# requirements-yaml` provenance line. To adopt a format change, update the skill
(`npx skills update`); if the grammar changed, migrate the file in place.
