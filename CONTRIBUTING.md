# Contributing to MercurJS Marketplace

Thanks for helping improve MercurJS Marketplace.

## Quick Start

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the applications you need:
   ```bash
   pnpm --filter backend dev
   pnpm --filter admin-panel dev
   pnpm --filter vendor-panel dev
   pnpm --filter storefront dev
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feat/short-description
   ```

## Development Workflow

- Keep changes focused and scoped to one concern.
- Prefer small, reviewable pull requests.
- Update docs when behavior or architecture changes.
- Add or update tests for logic changes.

## Quality Checks

Run applicable checks before opening a PR:

```bash
pnpm --filter backend test
pnpm --filter storefront test
pnpm --filter admin-panel lint
pnpm --filter vendor-panel lint
```

If a check cannot run in your environment, document why in the PR.

## Commit Guidelines

- Use clear, imperative commit messages.
- Reference issue IDs when applicable.
- Keep unrelated changes out of the same commit.

## Pull Request Expectations

A good PR includes:

- Summary of what changed and why.
- Screenshots/videos for UI changes.
- Test evidence (commands + result).
- Migration or rollout notes if needed.

Use `.github/PULL_REQUEST_TEMPLATE.md` when opening your PR.

## Reporting Bugs and Requesting Features

Please use:

- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`

Include reproduction details, expected behavior, and environment info.

## Security Reporting

Do **not** open public issues for sensitive vulnerabilities.

Please report security concerns privately to the maintainers via your repository security contact channel.

## Code of Conduct

Participation in this project is governed by `CODE_OF_CONDUCT.md`.
