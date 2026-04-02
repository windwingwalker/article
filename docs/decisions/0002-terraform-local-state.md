# Terraform Remote State And Workflow-Only Execution

## Status

Accepted

## Context

The repository previously used local Terraform state and tolerated local operator-driven Terraform workflows.

That approach was simpler at first, but it made state handling more fragile and made CI/CD behavior less reliable.

The project now relies on GitHub workflows to validate and apply Terraform changes. State is stored remotely in Cloudflare R2 instead of the local environment.

## Decision

Terraform state will be stored remotely in Cloudflare R2.

Terraform changes should not be applied locally as part of normal development workflow.

Instead:

- Terraform validation and deployment should go through GitHub workflows
- remote state is the source of truth
- local Terraform state should not be treated as the operational system of record

## Consequences

Positive consequences:

- more reliable and consistent Terraform execution
- shared state for CI/CD instead of machine-local state
- reduced risk of drift between local operator actions and automated workflows
- easier promotion and deployment through GitHub Actions

Negative consequences:

- slower iteration compared with unrestricted local Terraform workflows
- more setup and operational dependency on GitHub Actions and remote backend availability
- more friction for quick local experimentation

## Notes

This is an intentional tradeoff.

The project is sacrificing some development speed in exchange for more reliable infrastructure delivery and more consistent release behavior.
