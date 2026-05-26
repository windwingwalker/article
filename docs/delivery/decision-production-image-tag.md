# Production Promotion Uses Commit Image Tag

## What is the status?

Accepted.

## What problem does this decision solve?

Production should deploy only an artifact that was already built and tested through the development path.

The repository now uses a branch-based flow:

- changes are built and tested from `develop`
- development deploys the image tagged `sha-<commit-sha>`
- pushing the tested commit to `production` triggers production deployment

## What did we decide?

Production deploys the ECR image tagged with the exact production branch commit:

- `sha-<production-branch-commit-sha>`

The production workflow verifies that image tag exists in ECR before Terraform runs. If the image does not exist, production fails instead of rebuilding.

## Why use the commit image tag?

The commit SHA gives production a deterministic artifact contract:

- production does not depend on the newest ECR push time
- production does not use mutable tags such as `latest`
- production cannot accidentally deploy a different development image
- the deployed Lambda image can be traced back to a specific commit

## What does this require operationally?

When promoting to production, the production branch should point to a commit that has already passed the `develop` build and development deployment flow.

Use a fast-forward promotion or otherwise make sure the production branch commit is the same commit that produced the ECR image.

## What tradeoff remains?

The workflow is simple and deterministic, but it depends on branch discipline. If `production` receives a new merge commit that was never built on `develop`, the production workflow will fail because `sha-<merge-commit>` does not exist in ECR.
