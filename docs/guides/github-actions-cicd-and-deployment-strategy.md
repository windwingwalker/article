# GitHub Actions CI/CD And Deployment Strategy

## Status

Planned implementation

## Goal

Replace Jenkins with GitHub-native CI/CD while keeping production promotion explicit and low-risk.

## Design Principles

- Keep `development` deployment automatic after merge to `main`
- Keep `production` deployment explicit and approval-gated
- Authenticate GitHub to AWS with OIDC instead of long-lived access keys
- Treat infrastructure state as an external dependency, not part of the application stack
- Deploy immutable artifacts only
- Keep environment roots independent:
  - `terraform/environments/pre-development`
  - `terraform/environments/development`
  - `terraform/environments/production`

## Non-Goals

- Do not make production follow `$LATEST`
- Do not let production implicitly track development
- Do not let application Terraform create or destroy its own remote state backend

## Branching And Promotion Model

- Feature branches:
  - open pull requests into `main`
  - run validation only
- `main`:
  - source of truth for the next `development` deployment
  - merge to `main` triggers build, image publish, and `development` apply
- Production:
  - promoted from the tested `dev` alias through the `release` branch flow
  - deployment is triggered by pushes to `release`
  - protected by GitHub Environment approval

## Required GitHub Configuration

### Branch Protection

- Protect `main`
- Require pull request review
- Require required status checks to pass before merge
- Restrict direct pushes if practical

### GitHub Environments

- `development`
- `production`

Use `production` reviewers as the human approval gate for release promotion.

### Secrets And Variables

Prefer GitHub Environment variables for non-secret settings and GitHub secrets only where unavoidable.

Expected settings:

- AWS account ID
- AWS region
- ECR repository name
- Terraform backend configuration inputs if not committed in partial backend config
- Cloudflare R2 backend credentials only if Terraform backend operations require them in the workflow

## Required AWS Configuration

Use GitHub OIDC federation.

Create separate IAM roles for:

- CI validation if AWS access is needed
- `development` deployment
- `production` deployment

Role design requirements:

- trust policy limited to this GitHub repository
- branch or environment restrictions in the OIDC subject where practical
- least privilege per environment
- `production` role must be narrower than `development`

These IAM resources should be managed in a separate bootstrap Terraform repository, not in this application repository. See [`github-oidc-aws-bootstrap-requirements.md`](/Users/windwingwalker/Vault/Code/my-code/article/docs/guides/github-oidc-aws-bootstrap-requirements.md).

## Artifact Strategy

Build one immutable Docker image per commit intended for deployment.

Required tagging:

- commit SHA tag
- optional human-friendly tag for releases

Preferred deployment reference:

- image digest

Acceptable fallback:

- immutable commit SHA tag

Do not deploy from mutable tags such as `latest`.

## Workflow Set

Concrete workflow files now exist under:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-development.yml`
- `.github/workflows/promote-production.yml`

## `ci.yml`

Trigger:

- pull requests targeting `main`

Responsibilities:

- install dependencies with `npm ci`
- run `npm test`
- run `npm run build`
- run `docker build`
- run `terraform fmt -check`
- run `terraform init -backend=false`
- run `terraform validate` for affected roots

Outputs:

- failing checks block merge
- current implementation validates all three Terraform roots

## `deploy-development.yml`

Trigger:

- push to `main`

Responsibilities:

- build application
- apply `terraform/environments/pre-development` only when bootstrap-related files change
- build Docker image
- push image to ECR
- run `terraform plan` and `terraform apply tfplan` for the development roots
- apply `terraform/environments/development` with the new artifact reference
- capture deploy outputs for later promotion

Required outputs to record:

- commit SHA
- image tag
- image digest
- Lambda published version
- timestamp of deployment

These outputs should be written to workflow outputs, artifacts, or another explicit release record.

## `promote-production.yml`

Trigger:

- push to `release`
- optional manual `workflow_dispatch`

Inputs:

- current source alias:
  - `dev`
- manual override input:
  - `source_stage_name`

Responsibilities:

- require `production` environment approval
- run `terraform plan` for `terraform/environments/production`
- surface the plan for review
- apply only after approval
- create a release tag after successful promotion by incrementing the latest `v<major>.<minor>.<patch>` tag to the next minor version

Current limitation:

- the present production Terraform root promotes from a source Lambda alias, not from an explicit image digest or Lambda version
- that means the current workflow promotes whatever version the selected alias points to at promotion time
- explicit artifact promotion remains the target design, but it is not yet implemented in this repository
- the current automated release tag rule bumps minor and resets patch to zero, for example `v1.0.0` -> `v1.1.0`

## Workflow Runtime Inputs

The workflows currently expect these GitHub secrets:

- `TF_BACKEND_ACCESS_KEY`
- `TF_BACKEND_SECRET_KEY`
- `TF_BACKEND_S3_ENDPOINT`
- `AWS_DEPLOY_ROLE_ARN_DEVELOPMENT`
- `AWS_DEPLOY_ROLE_ARN_PRODUCTION`

The backend endpoint is treated as sensitive runtime configuration and is not committed in repository files.

## Terraform Strategy

## Backend

Terraform state must be remote before full GitHub-driven deployment is enabled.

Backend requirements:

- remote object storage backend
- locking strategy verified for concurrent GitHub runs
- separate state object per environment root
- credentials managed outside application Terraform

This repository should treat the backend as pre-existing infrastructure.

## Root Ownership

- `pre-development` owns shared bootstrap resources for this application domain, such as ECR
- `development` owns the dev alias and dev-facing API stage
- `production` owns only production-facing promotion targets

Keep these roots independently plannable and applicable.

## Production Promotion Rule

Production must stay explicit.

This repository intentionally accepts alias-based promotion for now. See [`0003-production-promotion-follows-dev-alias.md`](/Users/windwingwalker/Vault/Code/my-code/article/docs/decisions/0003-production-promotion-follows-dev-alias.md).

## Operational Guardrails

- no long-lived AWS access keys in GitHub Actions
- no mutable deployment references
- no production apply from pull request workflows
- no automatic production promotion on merge to `main`
- no backend bootstrap changes inside normal application deploy workflows

## Suggested Implementation Order

1. Add `ci.yml` and make it required on pull requests
2. Move Terraform state to a remote backend
3. Configure GitHub OIDC roles in AWS
4. Add `deploy-development.yml`
5. Add `promote-production.yml` with environment approvals
6. Decommission Jenkins after repeatable successful GitHub-driven deployments

## Repository Follow-Up Work

- replace the current workspace-copied Docker build flow with a reproducible image build
- remove committed local Terraform state from version control
- expand automated tests beyond markdown parsing for higher deployment confidence
