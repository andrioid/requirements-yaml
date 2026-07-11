# requirements-yaml

A compact, human-editable, LLM-verifiable format for describing a project's
requirements in a single `requirements.yaml`.

It is a **convention, not a tool.** Nothing enforces it at build time. The point
is a shape that a person can edit and grasp at a glance, and that an LLM can
loosely verify against a short project vocabulary.

## What a requirement looks like

```yaml
functional:
  accounts:
    As a user, I can:
      ACC-01: "reset my password from a signed email link — so that a lost password is recoverable without support — acceptance: a used or expired link is rejected and a fresh link succeeds."
```

Each requirement is one line: **capability — so that value — acceptance:
observable proof.** IDs are stable (`ACC-01`) so plans, tests, and commits can
reference them.

## Files here

| File | Purpose |
| ---- | ------- |
| [`FORMAT.md`](./FORMAT.md) | The canonical, domain-neutral spec. Read once as a human; load it for LLM verification. |
| [`requirements.schema.json`](./requirements.schema.json) | Optional loose JSON Schema for editor autocomplete and hover. Structural only, not a gate. |
| [`requirements.template.yaml`](./requirements.template.yaml) | Empty skeleton with one example per section. |
| [`requirements.vocab.template.md`](./requirements.vocab.template.md) | Template for a project's own ID prefixes, roles, domain sections, and rules. |

## Using it in a project

1. Copy `requirements.template.yaml` to your repo as `requirements.yaml`.
2. Copy `requirements.vocab.template.md` to `requirements.vocab.md` and fill in
   your prefixes, roles, domain sections, and domain rules.
3. Point editors at the schema with the header line the template already has:
   `# yaml-language-server: $schema=./requirements.schema.json` (vendor a copy of
   `requirements.schema.json`, or reference it by URL).
4. To verify, hand an LLM `FORMAT.md` + your `requirements.vocab.md` + your
   `requirements.yaml` and ask it to run the checklist at the end of `FORMAT.md`.
