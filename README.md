# requirements-yaml

A compact, hand-editable format for a project's requirements — one file, one line
per requirement. The format is the point; the agent skills are an addon.

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

## The format

Two files at the repo root define it:

- `requirements.template.yaml` — a ready-to-copy starter.
- `requirements.schema.json` — an optional, structure-only editor aid; the
  template's `$schema` field points at it.

## Skills

Three agent skills under `skills/` build on the format, each installable on its
own. The `@<skill>` selector picks one; omit it to install all three:

```
npx skills add andrioid/requirements-yaml@requirements-yaml
npx skills add andrioid/requirements-yaml@requirements-implement
npx skills add andrioid/requirements-yaml@requirements-discover
```

- **requirements-yaml** — the format: author, edit, and review a
  `requirements.yaml`.
- **requirements-implement** — build a change from a requirement: turn its
  `verified when` into a test, implement, and cite the ID.
- **requirements-discover** — reverse-engineer a `requirements.yaml` from an
  existing codebase.

The workflow skills depend on `requirements-yaml`. Skills carry instructions
only; they vendor the template and schema from the repo root (pinned to the
release tag) rather than bundling them.

## Start

1. Install the skills (above).
2. Copy `requirements.template.yaml` into your repo as `requirements.yaml`, then
   edit the header and examples. To vendor it straight from a release:
   ```
   curl -O https://raw.githubusercontent.com/andrioid/requirements-yaml/v0.3.0/requirements.template.yaml
   ```
3. (Optional) vendor `requirements.schema.json` beside it for editor autocomplete
   — the template's `$schema` field already points at it.
4. To review a file, ask your agent (which now has the skill) to check it against
   the format.

The full rules live in the format skill, `skills/requirements-yaml/SKILL.md`.
