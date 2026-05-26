# GitHub Actions CI/CD

## Why does this document exist?

This document defines the target GitHub-native delivery flow for this repository.

The goal is to replace Jenkins with GitHub Actions while keeping production promotion explicit, low-risk, and consistent with the current Terraform environment split.

## What delivery model does this repository want?

- Pushes to `develop` should build, test, publish the Docker image, then deploy development automatically after the build succeeds.
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

- `develop` is the source of truth for development deployment.
- Pushes to `develop` trigger the build workflow; a successful build triggers development apply.
- Pushes to `production`, or an approved manual production workflow, promote production.

Production deploys the image tagged with the exact production branch commit. See [decision-production-image-tag.md](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/decision-production-image-tag.md).

## What GitHub configuration is required?

### What branch protection is expected?

- Protect `develop`.
- Protect `production`.
- Require required status checks when practical.
- Restrict direct pushes to `production` when practical.

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

- `.github/workflows/build.yml`
- `.github/workflows/deploy-development.yml`
- `.github/workflows/promote-production.yml`

## What should `build.yml` do?

Trigger:

- push to `develop`

Responsibilities:

- `npm ci`
- `npm test`
- `npm run build`
- `docker build`
- push the image as `sha-<commit-sha>`
- push the same image with the human-readable numeric workflow run tag
- `terraform fmt -check`
- `terraform init -backend=false`
- `terraform validate` for affected roots

Expected outcome:

- failing checks block development deployment

## What should `deploy-development.yml` do?

Trigger:

- successful `Build` workflow completion on `develop`
- manual `workflow_dispatch`

Responsibilities:

- apply `terraform/environments/pre-development` only when bootstrap-related files changed
- plan and apply `terraform/environments/development`
- deploy development with `image_tag=sha-<commit-sha>`
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
- verify the `sha-<commit-sha>` image exists in ECR
- plan `terraform/environments/production`
- surface the plan for review
- apply only after approval
- create a release tag after successful promotion

## How does production choose an image?

Production deploys the image tagged with the exact production branch commit:

- `sha-<production-branch-commit-sha>`

If that image does not exist in ECR, the production workflow fails instead of rebuilding an unverified artifact.

## What runtime inputs do the workflows expect today?

- `AWS_DEPLOY_ROLE_ARN_DEVELOPMENT`
- `AWS_DEPLOY_ROLE_ARN_PRODUCTION`

Terraform backend and article R2 credentials are read from AWS Systems Manager Parameter Store.

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

1. Add `build.yml` and make it produce immutable ECR images.
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
