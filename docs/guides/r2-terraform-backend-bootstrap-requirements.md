# R2 Terraform Backend Bootstrap Requirements

## Status

Implementation guide

## Purpose

Define the requirements for a separate repository or Terraform root that creates and manages the Cloudflare R2 backend used for Terraform state in this project.

This guide is intentionally written for use by another Codex session working in a different repository.

## Core Rule

The Terraform backend must be operationally independent from the application stacks that use it.

That means:

- do not create the R2 bucket from `article` application Terraform
- do not store the bootstrap stack state in the same backend it is creating unless that bootstrap process is already complete and stable
- do not allow normal application deployment workflows to modify backend storage resources

## Scope Of The Separate Backend Repo

The separate repo or root may manage:

- Cloudflare R2 bucket for Terraform state
- scoped API token or equivalent credential arrangement for backend access
- optional bucket lifecycle rules
- optional bucket access hardening and naming conventions
- documentation for consumers

The separate repo or root must not manage:

- application Lambda resources
- application API Gateway resources
- application ECR repositories
- application Terraform roots that consume the backend

## Required Deliverables

The other repo should produce:

1. A provisioned Cloudflare R2 bucket dedicated to Terraform state
2. A documented bucket name and endpoint format for Terraform consumers
3. A documented credential model for CI and local operators
4. A documented state key naming convention
5. A documented bootstrap and recovery process

## Backend Design Requirements

## Bucket Scope

Use a bucket dedicated to Terraform state.

Preferred:

- one bucket dedicated to infrastructure state for a small set of related projects

Acceptable:

- one bucket per project if isolation is preferred over simplicity

Do not mix Terraform state with unrelated application object storage.

## State Key Structure

At minimum support distinct keys for:

- `article/pre-development/terraform.tfstate`
- `article/development/terraform.tfstate`
- `article/production/terraform.tfstate`

If the bucket is shared by more than one project, namespace by repository or project name first.

## Credential Separation

Define distinct credentials for:

- bootstrap administrators
- CI writers
- local operators

Requirement:

- application CI should receive only the permissions needed to read and write state objects for its own prefixes

Do not reuse a broad administrative token in GitHub Actions.

## Locking And Concurrency

The implementation must explicitly document how concurrent Terraform runs are controlled.

Because Cloudflare R2 is being used through Terraform's S3-compatible backend path, locking behavior must be validated before rollout.

Required validation:

- two concurrent plans or applies against the same state key must be tested
- the repo must document the observed locking behavior and the operational rule for avoiding corruption

If reliable locking is not verified, the application CI/CD design must compensate with serialized deployments per environment.

## Bootstrap Strategy

Preferred bootstrap model:

- create the R2 bucket manually once, then import it into the backend-management Terraform if desired

Acceptable bootstrap model:

- create the R2 bucket with a local-state Terraform root in the separate repo

Disallowed bootstrap model:

- create the bucket from the same Terraform root that immediately depends on that bucket as its remote backend

## Terraform Requirements For The Separate Repo

- use the Cloudflare provider resources needed for R2 bucket management
- keep bootstrap state local or in an already-established independent backend
- do not switch the bootstrap root to the new R2 backend until the bucket exists and access has been verified
- document import commands if the bucket is created manually first

## Outputs The Separate Repo Must Publish

The other Codex session should leave a document that gives consumers:

- bucket name
- account identifier or endpoint format
- required environment variables for Terraform backend access
- example backend partial configuration
- example `terraform init` command using backend config inputs
- state key naming convention
- recovery guidance if credentials rotate or state access fails

## Consumer Contract For This Repository

The backend-management repo must assume this repository needs:

- a stable R2 bucket
- state isolation between `pre-development`, `development`, and `production`
- compatibility with GitHub Actions automation
- compatibility with local operator workflows

The backend-management repo must not assume:

- that this application repo is allowed to own or mutate backend resources
- that production promotion is automatic

## Security Requirements

- least-privilege credentials only
- separate bootstrap/admin credentials from day-to-day CI credentials
- document credential rotation procedure
- avoid committing backend secrets or tokens to Git

## Documentation Requirements

The separate repo must include:

- architecture note describing why backend storage is independent
- bootstrap instructions from zero
- import instructions if manual creation is used
- consumer setup instructions for GitHub Actions
- consumer setup instructions for local Terraform operators
- concurrency and locking note

## Acceptance Criteria

The backend setup is acceptable only when all of the following are true:

- the R2 bucket exists independently of the application repo
- the application repo can initialize each environment root against the remote backend
- normal application CI cannot modify backend infrastructure definitions
- state keys are isolated by environment
- concurrent-run behavior has been tested and documented
- another operator can recover access from the documentation alone
