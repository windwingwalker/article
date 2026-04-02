# GitHub OIDC AWS Bootstrap Requirements

## Status

Implementation guide

## Purpose

Define the requirements for a separate Terraform repository or bootstrap root that creates and manages the AWS IAM resources needed for GitHub Actions deployment.

This guide is intentionally written for export to another repository.

## Core Rule

The GitHub OIDC provider and deploy roles must be managed outside this application repository.

That means:

- do not create the GitHub OIDC IAM provider from `article` application Terraform
- do not create deployment IAM roles from `article` application Terraform
- do not let normal application deployment workflows mutate IAM bootstrap resources

## Scope Of The Separate Bootstrap Repo

The separate repo or root may manage:

- IAM OIDC provider for GitHub Actions
- IAM roles for GitHub Actions deployments
- IAM policies attached to those roles
- documentation for consumers

The separate repo or root must not manage:

- application Lambda resources
- application API Gateway resources
- application ECR repositories
- application Terraform roots that consume these roles

## Required AWS Resources

The separate repo should create:

1. An IAM OIDC provider for `https://token.actions.githubusercontent.com`
2. A development deploy role for this repository
3. A production deploy role for this repository

## Repository-Specific Inputs

The bootstrap Terraform for this repository should assume:

- AWS account ID: `730917489165`
- GitHub owner: `windwingwalker`
- GitHub repository: `article`
- GitHub environments:
  - `development`
  - `production`

## Trust Policy Requirements

Use the GitHub OIDC provider as the federated principal.

Each role must require:

- `token.actions.githubusercontent.com:aud` equals `sts.amazonaws.com`
- `token.actions.githubusercontent.com:sub` restricted to this repository and environment

Expected subject values:

- `repo:windwingwalker/article:environment:development`
- `repo:windwingwalker/article:environment:production`

## Role Separation

Create separate roles for:

- development deployment
- production deployment

Do not use one shared deploy role for both environments.

## Terraform Shape

The separate repo should contain Terraform resources equivalent to:

- `aws_iam_openid_connect_provider`
- `aws_iam_role` for development
- `aws_iam_role` for production
- `aws_iam_role_policy_attachment` or custom `aws_iam_policy` attachments

## Minimum Terraform Outputs

The separate repo must output:

- development role ARN
- production role ARN
- OIDC provider ARN

These outputs become consumer inputs for GitHub Actions secrets.

## Example Trust Policy Logic

The development role trust policy should allow:

- principal:
  - the GitHub OIDC provider
- action:
  - `sts:AssumeRoleWithWebIdentity`
- conditions:
  - audience equals `sts.amazonaws.com`
  - subject equals `repo:windwingwalker/article:environment:development`

The production role trust policy should be the same except for:

- subject equals `repo:windwingwalker/article:environment:production`

## Permission Model

Temporary rollout option:

- attach broad permissions first to prove the workflow end to end

Target state:

- least privilege
- development role limited to resources needed by:
  - ECR image push
  - Lambda updates
  - API Gateway updates
  - EventBridge and SQS changes if those roots own them
  - Terraform state reads of AWS-managed resources
- production role narrower than development

Do not keep `AdministratorAccess` as the final state.

## Consumer Contract For This Repository

Once the separate repo provisions these resources, this repository expects these GitHub secrets:

- `AWS_DEPLOY_ROLE_ARN_DEVELOPMENT`
- `AWS_DEPLOY_ROLE_ARN_PRODUCTION`

This repository does not need to know how the roles are created, only their final ARNs.

## Terraform Authoring Requirements For The Separate Repo

- manage IAM bootstrap state independently from application repos
- document how to import existing manually created roles if needed
- use variable inputs for GitHub owner, repository, and environment names where practical
- output role ARNs clearly for downstream use

## Acceptance Criteria

The bootstrap implementation is acceptable only when all of the following are true:

- the IAM OIDC provider exists independently of this application repo
- the development deploy role can be assumed only by `windwingwalker/article` in the `development` environment
- the production deploy role can be assumed only by `windwingwalker/article` in the `production` environment
- the separate repo outputs both role ARNs
- this repository can use those ARNs as GitHub Actions secrets without owning the IAM definitions
