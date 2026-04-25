# Release Process

This document describes the release process for this monorepo, which contains several independently versioned npm packages managed with [Nx](https://nx.dev).

---

## Overview

Packages live under `packages/*` and are released **independently** — only packages with detected changes since the last release are versioned and published. Releases are triggered **manually** from the `main` branch by running `nx release`.

The release pipeline covers:

1. Detecting which packages have changed
2. Determining the next version for each changed package based on commit history
3. Updating `package.json` versions and generating per-package `CHANGELOG.md` files
4. Creating a GitHub Release from the workspace changelog
5. Publishing changed packages to the public npm registry

---

## Prerequisites

Before running a release, make sure:

- You are on the `main` branch with a clean working tree
- You have pull / push access to the repository
- You are authenticated with npm (`npm whoami` should return your username)
- You have a `GITHUB_TOKEN` environment variable set with permission to create releases (required for the GitHub Release step)

---

## Commit Convention

This project uses **Conventional Commits** to drive automatic version bumping. Every commit message must follow the format:

```
<type>(<optional scope>): <description>
```

| Type | Version bump |
|------|-------------|
| `feat` | Minor (`1.0.0` → `1.1.0`) |
| `fix` | Patch (`1.0.0` → `1.0.1`) |
| `chore`, `docs`, `refactor`, `test`, `style`, `ci` | Patch (`1.0.0` → `1.0.1`) |
| `feat!` or `BREAKING CHANGE` footer | Major (`1.0.0` → `2.0.0`) |

> Commits that do not affect any package under `packages/*` are ignored during version calculation.

---

## Step-by-Step Release

### 1. Switch to `main` and pull latest changes

```bash
git checkout main
git pull origin main
```

### 2. Dry run — preview what will be released

Always run a dry run first to review which packages will be bumped, what the new versions will be, and what changelog entries will be generated — without making any actual changes.

```bash
nx release --dry-run
```

Review the output carefully:

- Which packages were detected as changed
- The proposed version bump for each package (patch / minor / major)
- The changelog entries that will be written
- The git tag(s) that will be created

If anything looks unexpected, stop here and investigate the commit history before proceeding.

### 3. Run the release

Once you are satisfied with the dry run output, run the release for real:

```bash
nx release
```

This single command executes the full release pipeline in order:

1. **Version** — bumps the `version` field in `package.json` for each changed package according to the conventional commit history
2. **Changelog** — generates or updates `CHANGELOG.md` inside each changed package, and creates a GitHub Release from the aggregated workspace changelog
3. **Publish** — publishes each changed package to the public npm registry

Nx will commit the version bumps and changelog updates, create a git tag per package (e.g. `my-package@1.2.0`), and push everything to `origin/main`.

---

## Configuration Reference

The release behaviour is defined in `nx.json`:

```json
"release": {
  "projects": ["packages/*"],
  "projectsRelationship": "independent",
  "changelog": {
    "projectChangelogs": true,
    "workspaceChangelog": {
      "createRelease": "github"
    }
  }
}
```

| Option | Value | Effect |
|--------|-------|--------|
| `projects` | `packages/*` | Only packages under this glob are considered for release |
| `projectsRelationship` | `independent` | Each package is versioned separately |
| `projectChangelogs` | `true` | A `CHANGELOG.md` is generated inside each package |
| `workspaceChangelog.createRelease` | `github` | A GitHub Release is created from the aggregated workspace changelog |

---

## Outputs per Release

For every package that has detected changes, the following are produced:

- An updated `package.json` with the new version
- An updated `CHANGELOG.md` inside the package directory
- A git tag in the format `<package-name>@<version>` (e.g. `ui-kit@2.1.0`)
- A published version on the public npm registry

In addition, a single **GitHub Release** is created at the workspace level, aggregating all changes across packages.

---

## Troubleshooting

**No packages detected as changed**
Nx computes changes based on git history since the last release tag. Make sure your commits follow the Conventional Commits format and that they touch files inside `packages/*`.

**Unexpected version bump**
Check the commit log for any unintended `feat` or breaking change commits. Use `--dry-run` to inspect before every release.

**npm publish fails**
Verify you are logged in with `npm whoami`. If you are using a token, check it has `publish` permissions for the relevant packages.

**GitHub Release not created**
Ensure the `GITHUB_TOKEN` environment variable is set and the token has `contents: write` permission on the repository.