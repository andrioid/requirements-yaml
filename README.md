# requirements-yaml

A compact, hand-editable format for a project's requirements — one file, one line
per requirement — plus the workflow skills that use it.

```yaml
functional:
  accounts:
    As a user, I can:
      ACC-01: reset my password from a signed email link; so that a lost password is recoverable without support; verified when a used or expired link is rejected and a fresh one works.
```

- **`capability; so that value; verified when observable proof.`** — the whole
  requirement on one line.
- IDs (`ACC-01`) are stable, so plans, tests, and commits can reference them.
- Grouped into `functional`, `non_functional`, optional `deferred`, plus any
  project-specific domain sections.
- An optional top-level `docs` map lists supporting material by filename
  (ubiquitous language, domain model, ADRs), each with a note on what it is and
  when to read it.
- Quotes are optional — add them only if a clause contains `: ` or the value
  starts with a YAML symbol.

## Skills

This repo hosts three skills under `skills/`, each installable on its own:

- **requirements-yaml** — the format: author, edit, and review a
  `requirements.yaml`. Ships `requirements.template.yaml` and
  `requirements.schema.json`.
- **requirements-implement** — build a change from a requirement: turn its
  `verified when` into a test, implement, and cite the ID.
- **requirements-discover** — reverse-engineer a `requirements.yaml` from an
  existing codebase.

The workflow skills depend on the format skill.

## Start

1. Install the skills. The `@<skill>` selector picks one; omit it to install all
   three:
   ```
   npx skills add <owner>/requirements-yaml@requirements-yaml
   npx skills add <owner>/requirements-yaml@requirements-implement
   npx skills add <owner>/requirements-yaml@requirements-discover
   ```
2. Copy `skills/requirements-yaml/requirements.template.yaml` into your repo as
   `requirements.yaml`; edit the header and examples.
3. (Optional) vendor `skills/requirements-yaml/requirements.schema.json` for
   editor autocomplete — the template header points at it.
4. To review a file, ask your agent (which now has the skill) to check it against
   the format.

The full rules live in the format skill, `skills/requirements-yaml/SKILL.md`.
