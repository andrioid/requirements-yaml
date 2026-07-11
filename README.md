# requirements-yaml

A compact, hand-editable format for a project's requirements. One file, one line
per requirement.

```yaml
functional:
  accounts:
    As a user, I can:
      ACC-01: reset my password from a signed email link | so that a lost password is recoverable without support | verified when a used or expired link is rejected and a fresh one works.
```

- **`capability | so that value | verified when observable proof.`** — the whole
  requirement on one line.
- IDs (`ACC-01`) are stable, so plans, tests, and commits can reference them.
- Grouped into `functional`, `non_functional`, optional `deferred`, plus any
  project-specific domain sections.
- Quotes are optional — add them only if a clause contains `: ` or the value
  starts with a YAML symbol.

## Start

1. Copy `requirements.template.yaml` into your repo as `requirements.yaml`; edit
   the header and examples.
2. (Optional) vendor `requirements.schema.json` for editor autocomplete — the
   template header already points at it.
3. Install the skill so your agent knows the format:
   ```
   npx skills add <owner>/requirements-yaml
   ```
4. To review a file, ask your agent (which now has the skill) to check it against
   the format.

The full rules live in the skill, `SKILL.md`.
