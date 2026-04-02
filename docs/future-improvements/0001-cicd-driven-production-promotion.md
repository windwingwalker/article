# CI/CD-Driven Production Promotion

## Status

Future improvement

## Context

Production is currently pinned to an explicit Lambda function version through Terraform input rather than automatically following the latest development deployment.

This is intentional for safety. It prevents the production alias from accidentally following `$LATEST` or inheriting an untested version from the development alias.

However, the current release workflow is still manual. The repository does not yet have a strong enough CI/CD pipeline to make version promotion easy and reliable. In practice, this means operators must manually choose the published Lambda version to promote to production when running Terraform for the production root.

## Current Approach

- `development` may move independently as new Lambda versions are published.
- `production` must be given an explicit Lambda version during promotion.
- The production version should be supplied at deploy time, not hardcoded as a permanent default in Terraform.

## Future Direction

Introduce a stronger CI/CD release flow so production promotion can be explicit without being manually tedious.

Possible implementations include:

- a pipeline step that captures the tested Lambda version from development and passes it into the production Terraform apply
- a release manifest or local artifact that records the approved version for promotion
- an external promotion marker such as SSM Parameter Store if the workflow later justifies that added complexity

## Decision

Keep production version pinning explicit for now, and treat automation of version promotion as a future improvement to be implemented when the CI/CD pipeline is mature enough to support it safely.
