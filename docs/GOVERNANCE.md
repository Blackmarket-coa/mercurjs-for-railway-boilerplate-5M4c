# Governance

## Maintainer Roles

### Core Maintainers

Core maintainers are responsible for:

- Architecture and release decisions.
- Security and stability oversight.
- Reviewing and merging significant changes.

### Area Maintainers

Area maintainers own one or more surfaces:

- `backend/`
- `storefront/`
- `admin-panel/`
- `vendor-panel/`
- `infrastructure/`
- `docs/`

They triage issues, review PRs in their area, and escalate cross-cutting concerns.

## Decision Process

1. **Proposal**: Open an issue (or ADR when architectural) with problem, options, and recommendation.
2. **Review**: Maintainers and contributors discuss tradeoffs and implementation impact.
3. **Decision**: Responsible maintainers record the outcome in the issue/ADR.
4. **Execution**: Implementation is tracked through linked PRs.
5. **Retrospective**: Major changes include follow-up notes on outcomes and next actions.

## Pull Request Governance

- At least one maintainer approval is required before merge.
- Cross-surface changes should include reviewers from each affected area.
- CI checks must pass unless explicitly waived by maintainers with rationale.

## Release Governance

- Releases should run documented validation checks.
- Critical/high regressions block release until mitigated or explicitly accepted.
- Security-sensitive fixes may be coordinated privately before public disclosure.

## Community Expectations

All participants must follow `CODE_OF_CONDUCT.md`.

Maintainers aim to provide respectful, timely feedback and clear triage outcomes.
