# GitHub Actions CI/CD

## Why does this document exist?

This document defines the target GitHub-native delivery flow for this repository.

The goal is to replace Jenkins with GitHub Actions while keeping production promotion explicit, low-risk, and consistent with the current Terraform environment split.

## What delivery model does this repository want?

- Pull requests into `develop` should validate only.
- Pushes to `develop` should run CI, then deploy development automatically after CI succeeds.
- Production promotion should stay explicit and approval-gated.
- AWS access should use GitHub OIDC instead of long-lived access keys.
- Deployment artifacts should be immutable.
- Terraform backend state should be treated as an external dependency.

## What does this repository explicitly not want?

- Production tracking `$LATEST`
- Production implicitly following development
- Mutable deployment references such as `latest`
- Normal application workflows creating or mutating backend bootstrap resources
- Production applies from pull request workflows

## What branch and promotion flow is intended?

- Feature branches open pull requests into `develop`.
- Pull requests run validation only.
- `develop` is the source of truth for development deployment.
- Pushes to `develop` trigger CI; a successful CI run triggers image publish and development apply.
- Pushes to `production`, or an approved manual production workflow, promote production.

This repository currently accepts alias-based production promotion. Production reads the version currently behind the selected source alias instead of promoting a version-pinned artifact. See [decision-production-follows-dev-alias.md](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/decision-production-follows-dev-alias.md).

## What GitHub configuration is required?

### What branch protection is expected?

- Protect `develop`.
- Protect `production`.
- Require pull request review.
- Require required status checks before merge.
- Restrict direct pushes when practical.

### What environments are expected?

- `development`
- `production`

Use `production` environment reviewers as the approval gate for release promotion.

### What secrets and variables are expected?

Prefer GitHub Environment variables for non-secret settings and GitHub secrets only where unavoidable.

Expected inputs:

- AWS account ID
- AWS region
- ECR repository name
- Terraform backend configuration inputs if they are not committed as partial backend config
- Cloudflare R2 backend credentials if backend initialization requires them

## What AWS-side prerequisites are required?

GitHub Actions should authenticate through OIDC federation.

Create separate IAM roles for:

- validation if AWS access is required
- development deployment
- production deployment

Role requirements:

- trust policy limited to this repository
- OIDC subject scoped by branch or environment where practical
- least privilege per environment
- production role narrower than development

Those IAM resources must be managed outside this repository. See [github-oidc-bootstrap.md](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/github-oidc-bootstrap.md).

## What artifact strategy should be used?

Build one immutable Docker image per deployable commit.

Required identifiers:

- commit SHA tag
- optional human-friendly release tag

Preferred deployment reference:

- image digest

Acceptable fallback:

- immutable commit SHA tag

## What workflows should exist?

The intended workflow set is:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-development.yml`
- `.github/workflows/promote-production.yml`

## What should `ci.yml` do?

Trigger:

- pushes and pull requests targeting `develop`
- pushes and pull requests targeting `production`
- manual `workflow_dispatch`

Responsibilities:

- `npm ci`
- `npm test`
- `npm run build`
- `docker build`
- `terraform fmt -check`
- `terraform init -backend=false`
- `terraform validate` for affected roots

Expected outcome:

- failing checks block merge

## What should `deploy-development.yml` do?

Trigger:

- successful `CI` workflow completion on `develop`
- manual `workflow_dispatch`

Responsibilities:

- build the application
- apply `terraform/environments/pre-development` only when bootstrap-related files changed
- build and push the Docker image
- plan and apply `terraform/environments/development`
- deploy development with the new artifact reference
- capture deployment metadata for later promotion

Deployment metadata should include:

- commit SHA
- image tag
- image digest
- Lambda published version
- deployment timestamp

## What should `promote-production.yml` do?

Trigger:

- push to `production`
- optional `workflow_dispatch`

Responsibilities:

- require `production` environment approval
- plan `terraform/environments/production`
- surface the plan for review
- apply only after approval
- create a release tag after successful promotion

## What limitation still exists in the current promotion model?

The production root still promotes from a source Lambda alias, not from an explicit image digest or exact Lambda version.

That means:

- production promotes whatever version the selected alias points to at promotion time
- exact artifact promotion is still a target design, not the current implementation

## What runtime inputs do the workflows expect today?

- `TF_BACKEND_ACCESS_KEY`
- `TF_BACKEND_SECRET_KEY`
- `TF_BACKEND_S3_ENDPOINT`
- `AWS_DEPLOY_ROLE_ARN_DEVELOPMENT`
- `AWS_DEPLOY_ROLE_ARN_PRODUCTION`

The backend endpoint is treated as sensitive runtime configuration and is not committed in repository files.

## What Terraform delivery rules matter most?

### Why must backend state exist before GitHub-driven deployment?

GitHub-driven deployment assumes Terraform state is already remote and treated as pre-existing infrastructure.

Backend requirements:

- remote object storage backend
- concurrency behavior understood well enough to avoid corruption
- separate state object per environment root
- credentials managed outside application Terraform

### How should root ownership stay divided?

- `pre-development` owns shared bootstrap resources such as ECR
- `development` owns the development alias and dev-facing API stage
- `production` owns production-facing promotion targets only

Keep each root independently plannable and applicable.

## What guardrails should remain non-negotiable?

- no long-lived AWS access keys in GitHub Actions
- no mutable deployment references
- no production apply from pull request workflows
- no automatic production promotion on merge to `develop`
- no backend bootstrap changes inside normal application deploy workflows

## In what order should this be implemented?

1. Add `ci.yml` and make it required for pull requests.
2. Move Terraform state to a remote backend.
3. Configure GitHub OIDC roles in AWS.
4. Add `deploy-development.yml`.
5. Add `promote-production.yml` with environment approvals.
6. Remove Jenkins after GitHub-driven deployments are repeatable.

## What follow-up work is still likely?

- replace the current workspace-copied Docker build flow with a reproducible image build
- remove committed local Terraform state from version control
- expand automated tests beyond markdown parsing
- move from alias-based production promotion to explicit artifact promotion if the added control becomes worth the extra complexity
