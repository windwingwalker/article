# Production Promotion Follows Dev Alias

## Status

Accepted

## Context

The repository previously considered a stricter production promotion model where CI/CD would capture a tested Lambda version from development and pass that explicit version into the production Terraform apply.

That approach provides tighter release control, but it also adds release bookkeeping and workflow complexity.

This repository now uses a branch-based release flow:

- changes are deployed to development from `develop`
- development is tested before promotion
- a push to `production` triggers production promotion

## Decision

Production promotion will not be explicitly version-pinned.

Instead, production reads the live Lambda version behind the `dev` alias at promotion time.

This is intentional.

The goal is to keep production close to development while still requiring an explicit release action through the `production` branch.

The operating assumption is:

- every change deployed to development is tested before promotion
- pushing to `production` means the current development version is considered ready for production

For this application, that tradeoff is acceptable because the system is small and the overhead of precise version capture is not justified right now.

## Consequences

- production promotion is simpler and easier to operate
- release automation stays lightweight
- production may promote a newer development version if the `dev` alias changes before the release workflow runs
- operators are relying on branch discipline and development validation instead of exact artifact pinning

## Rejected Alternative

Rejected for now:

- capture the tested Lambda version from development and pass it into the production root as an explicit promotion input

Reason:

- it adds precision, but the extra control is not currently worth the added complexity for this repository
