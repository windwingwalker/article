# R2 Backend Bootstrap

## Why does this document exist?

This document defines what a separate repository or Terraform root must provide when it owns the Cloudflare R2 backend used for this repository's Terraform state.

It is written for a different repository or bootstrap root, not for this application's normal Terraform delivery flow.

## What must stay independent from application Terraform?

The Terraform backend must be operationally independent from the application stacks that consume it.

That means:

- do not create the R2 bucket from this application's Terraform
- do not store bootstrap state in the same backend before that backend is fully established
- do not let normal application deployment workflows modify backend storage resources

## What is the bootstrap repository allowed to manage?

- Cloudflare R2 bucket for Terraform state
- scoped API token or equivalent backend credential arrangement
- optional bucket lifecycle rules
- optional access hardening and naming conventions
- documentation for downstream consumers

## What is the bootstrap repository not allowed to manage?

- application Lambda resources
- application API Gateway resources
- application ECR repositories
- application Terraform roots that consume the backend

## What deliverables must the bootstrap repository produce?

1. a provisioned R2 bucket dedicated to Terraform state
2. documented bucket name and endpoint format
3. documented credential model for CI and local operators
4. documented state key naming convention
5. documented bootstrap and recovery process

## What bucket scope is preferred?

Preferred:

- one bucket dedicated to infrastructure state for a small set of related projects

Acceptable:

- one bucket per project when stronger isolation is worth the extra management overhead

Do not mix Terraform state with unrelated application object storage.

## What state key structure must be supported?

At minimum:

- `article/pre-development/terraform.tfstate`
- `article/development/terraform.tfstate`
- `article/production/terraform.tfstate`

If the bucket serves multiple projects, namespace by repository or project name first.

## How should credentials be separated?

Use distinct credentials for:

- bootstrap administrators
- CI writers
- local operators

Application CI should receive only the permissions needed to read and write its own state prefixes.

Do not reuse a broad administrative token in GitHub Actions.

## What concurrency rule must be documented?

The bootstrap implementation must document exactly how concurrent Terraform runs are controlled.

Because R2 is being used through Terraform's S3-compatible backend path, locking behavior must be tested before rollout.

Required validation:

- run two concurrent plans or applies against the same state key
- document the observed locking behavior
- document the operational rule that prevents state corruption

If reliable locking is not verified, application CI/CD must compensate by serializing deployments per environment.

## What bootstrap strategy is acceptable?

Preferred:

- create the R2 bucket manually once, then import it into backend-management Terraform if desired

Acceptable:

- create the R2 bucket from a local-state Terraform root in the bootstrap repository

Not acceptable:

- create the bucket from a root that immediately depends on that same bucket as its remote backend

## What Terraform authoring rules should the bootstrap repository follow?

- use the Cloudflare resources needed for R2 bucket management
- keep bootstrap state local or in an already-independent backend
- do not switch the bootstrap root to the new R2 backend until the bucket exists and access is verified
- document import commands if the bucket is created manually first

## What outputs and documents must the bootstrap repository publish?

The consuming repository should receive:

- bucket name
- account identifier or endpoint format
- required environment variables for backend access
- example backend partial configuration
- example `terraform init` command
- state key naming convention
- recovery guidance for credential rotation or backend access failure

## What consumer contract should the bootstrap repository assume for this application?

It should assume this repository needs:

- a stable R2 bucket
- state isolation between `pre-development`, `development`, and `production`
- compatibility with GitHub Actions automation
- compatibility with local operator workflows

It should not assume:

- that this application repository may own or mutate backend resources
- that production promotion is automatic

## What security rules should stay in force?

- least-privilege credentials only
- separate bootstrap credentials from day-to-day CI credentials
- document credential rotation
- do not commit backend secrets or tokens to Git

## What documentation must the bootstrap repository include?

- architecture note explaining why backend storage is independent
- bootstrap instructions from zero
- import instructions if manual creation is used
- consumer setup instructions for GitHub Actions
- consumer setup instructions for local Terraform operators
- concurrency and locking note

## When is the backend bootstrap implementation acceptable?

The implementation is acceptable only when all of the following are true:

- the R2 bucket exists independently of the application repository
- this repository can initialize each environment root against the remote backend
- normal application CI cannot modify backend infrastructure definitions
- state keys are isolated by environment
- concurrent-run behavior has been tested and documented
- another operator can recover access from the documentation alone
