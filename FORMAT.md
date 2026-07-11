# The compact requirements format

A single file, `requirements.yaml`, that describes a project's requirements
compactly enough for a human to edit and grasp at a glance, and regularly
enough for an LLM to loosely verify.

Nothing enforces this format at build time. It is a shared convention plus this
guide. The optional [`requirements.schema.json`](./requirements.schema.json)
gives editors autocomplete and hover help; it does not gate anything.

## Why this shape

- **One line per requirement** — greppable, diffable, quick to scan and review.
- **Capability + value + proof on the same line** — a reader sees *what*, *why*,
  and *how you'd know it's done* without chasing links.
- **Stable IDs** — plans, tests, commits, and discussions reference a
  requirement without re-quoting it.

## File shape

```yaml
# yaml-language-server: $schema=./requirements.schema.json
functional:
  <system_area>:
    As a <role>, I can:
      <ID>: "<capability> — so that <value> — acceptance: <observable proof>."

non_functional:
  <quality>:
    <ID>: "<property> — so that <value> — acceptance: <observable proof>."

deferred:
  <area>:
    "[deferred] <ID>": "<future capability> — so that <value> — acceptance: <observable proof>."
```

`functional` and `non_functional` are the core sections; `deferred` is optional.
A project may add its own top-level **domain sections** (see below). All group
keys are `lower_snake_case`.

## The requirement line

Every requirement value is one sentence with three parts joined by em dashes
(`—`, U+2014):

```
<capability> — so that <value> — acceptance: <observable proof>.
```

- **capability** — what the system or actor can do.
- **— so that `<value>`** — the user or business reason it matters.
- **— acceptance: `<observable proof>`** — how you would observe it is
  satisfied. Prefer observable outcomes over implementation tasks.
- End with a period. Keep it to a single line.

## `functional`: group by area, then role

Under `functional`, group by `snake_case` system area, then by a role heading
written `As a <role>, I can:`. Because the heading already says "I can",
requirement lines start directly with the verb — do **not** repeat "I can":

```yaml
functional:
  accounts:
    As a user, I can:
      ACC-01: "reset my password from a signed email link — so that a lost password is recoverable without support — acceptance: a used or expired link is rejected and a fresh link succeeds."
```

Roles are the recommended grouping. A project that does not need roles may put
an `ID → text` map directly under the area.

## `non_functional`: group by quality

Group by `snake_case` quality attribute (`security`, `performance`,
`reliability`, `accessibility`, …). These are system properties, so lines read
as statements rather than "I can …":

```yaml
non_functional:
  security:
    SEC-01: "public endpoints are rate-limited — so that credential-stuffing and abuse are constrained — acceptance: repeated abusive requests receive throttled responses."
```

## `deferred`: out of scope, on the record

Future scope lives under `deferred`, grouped by area, with the ID prefixed
`[deferred] ` and the whole key quoted:

```yaml
deferred:
  payments:
    "[deferred] PAY-01": "customers can pay online — so that prepayment is possible — acceptance: funds settle without the platform holding them."
```

## Domain sections

The three sections above are not always enough. A project may add extra
top-level sections for its own domain — for example a public/private data
boundary, a compliance section, or a rollout-gates section. A domain section is
a `snake_case` group whose subgroups hold `ID → text` maps, exactly like
`non_functional`:

```yaml
data_policy:
  public_data:
    DATA-01: "only customer-visible data is published — so that records are safe to crawl — acceptance: public records contain no internal fields."
```

Declare every domain section your project uses in `requirements.vocab.md` so a
reader (human or LLM) knows it is intentional.

## IDs

- Uppercase area prefix + `-` + zero-padded number: `ACC-01`, `SEC-03`.
- **Stable.** Never renumber, reuse, or recycle an existing ID — requirements
  are referenced from plans, tests, and commits.
- Choose the prefix from the nearest area or quality. Add a new prefix only when
  nothing fits.
- Each project defines its own prefixes in `requirements.vocab.md`.

## Authoring rules

1. One requirement per YAML scalar line.
2. Under a role heading, start with a verb (`create`, `view`, `export`,
   `configure`), not "I can".
3. Use `— so that` for value and `— acceptance:` for observable proof.
4. End every requirement with a period.
5. Keep IDs stable; never renumber.
6. Prefer observable acceptance language over implementation tasks.
7. Put future scope under `deferred`, never deleted or hidden.

## Per-project vocabulary

The format is domain-neutral; the vocabulary is not. Keep a short
`requirements.vocab.md` next to `requirements.yaml` (start from
[`requirements.vocab.template.md`](./requirements.vocab.template.md)) listing:

- **ID prefixes** and what each one covers.
- **Roles** in use.
- **Domain sections** beyond `functional` / `non_functional` / `deferred`, and
  what belongs in each.
- **Domain rules** — invariants a reviewer should check (e.g. what must never
  appear in a public section).

## Loose verification (for an LLM)

Given `FORMAT.md` + a project's `requirements.vocab.md` + its
`requirements.yaml`, check and report `ID: problem` for each miss. This is
advisory review, not a build gate:

- [ ] Top-level sections are `functional`, `non_functional`, optional
  `deferred`, plus only the domain sections declared in `requirements.vocab.md`.
- [ ] Group keys are `lower_snake_case`.
- [ ] Under `functional`, role headings read `As a <role>, I can:` and lines
  start with a verb, not "I can".
- [ ] Every requirement line contains `— so that` and `— acceptance:` and ends
  with a period.
- [ ] Every ID uses a prefix declared in `requirements.vocab.md`, and every ID
  is unique across the file.
- [ ] `deferred` keys are quoted and start with `[deferred] `.
- [ ] Every domain rule in `requirements.vocab.md` holds.
