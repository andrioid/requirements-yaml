# requirements.vocab.md — &lt;project&gt; vocabulary

Project-specific vocabulary for this project's `requirements.yaml`. The format
itself is domain-neutral; this file supplies the words. Format spec: `FORMAT.md`.

## ID prefixes

| Prefix | Covers |
| ------ | ------ |
| ACC    | user accounts and identity |
| SEC    | security |
| PERF   | performance |
| PAY    | payments (deferred) |

Add rows as areas appear. Keep prefixes short and uppercase. Never renumber an
ID once assigned.

## Roles

Roles used under `functional`:

- `As a user, I can`
- `As an admin, I can`

## Domain sections

Top-level sections beyond `functional` / `non_functional` / `deferred`:

- _(none)_ — or, for example, `data_policy`: a public/private data boundary,
  with a one-line note on what belongs in each subgroup.

## Domain rules

Invariants a reviewer (human or LLM) should check, beyond the generic format
rules in `FORMAT.md`:

- _(none yet)_ — e.g. "no personal data may appear under a `public_*` group."
