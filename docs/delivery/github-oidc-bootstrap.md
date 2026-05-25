# GitHub OIDC Bootstrap

## Why does this document exist?

This document defines what a separate bootstrap repository must create so GitHub Actions can deploy this application to AWS without storing long-lived AWS credentials in GitHub.

It is intentionally written for a different repository or Terraform root that owns IAM bootstrap concerns.

## What must stay outside this repository?

The GitHub OIDC provider and GitHub deployment IAM roles must be managed outside this application repository.

That means:

- do not create the OIDC IAM provider from application Terraform
- do not create deployment IAM roles from application Terraform
- do not let normal application deployment workflows mutate bootstrap IAM resources

## What is the bootstrap repository allowed to manage?

- IAM OIDC provider for GitHub Actions
- IAM roles for GitHub Actions deployments
- IAM policies attached to those roles
- documentation for consuming repositories

## What is the bootstrap repository not allowed to manage?

- application Lambda resources
- application API Gateway resources
- application ECR repositories
- application Terraform roots that consume the roles

## What AWS resources are required for this repository?

The bootstrap implementation should create:

1. an IAM OIDC provider for `https://token.actions.githubusercontent.com`
2. a development deploy role for this repository
3. a production deploy role for this repository

## What repository-specific inputs should the bootstrap implementation assume?

- AWS account ID: `730917489165`
- GitHub owner: `windwingwalker`
- GitHub repository: `article`
- GitHub environments:
  - `development`
  - `production`

## How should the trust policy be constrained?

Use the GitHub OIDC provider as the federated principal.

Each role should require:

- `token.actions.githubusercontent.com:aud` equals `sts.amazonaws.com`
- `token.actions.githubusercontent.com:sub` restricted to this repository and environment

Expected subject values:

- `repo:windwingwalker/article:environment:development`
- `repo:windwingwalker/article:environment:production`

## Why should development and production use separate roles?

Development and production have different blast-radius expectations.

Use separate roles so that:

- development permissions can stay broad enough for normal iteration
- production permissions can stay narrower
- approval and audit boundaries remain clearer

Do not use one shared deployment role for both environments.

## What Terraform shape is expected in the bootstrap repository?

The bootstrap repository should contain resources equivalent to:

- `aws_iam_openid_connect_provider`
- `aws_iam_role` for development
- `aws_iam_role` for production
- `aws_iam_role_policy_attachment` or custom `aws_iam_policy` attachments

## What outputs must the bootstrap repository publish?

- development role ARN
- production role ARN
- OIDC provider ARN

Those outputs become consumer inputs for GitHub Actions secrets.

## What permission model should be used?

Temporary rollout may start broader to prove the workflow end to end, but the target state must be least privilege.

Development role scope should be limited to the resources needed for:

- ECR image push
- Lambda updates
- API Gateway updates
- EventBridge and SQS changes when those roots own them
- Terraform reads of AWS-managed resources

Production role scope should be narrower than development.

Do not keep `AdministratorAccess` as a steady-state permission model.

## What is the consumer contract for this repository?

Once the bootstrap repository provisions the IAM resources, this repository expects:

- `AWS_DEPLOY_ROLE_ARN_DEVELOPMENT`
- `AWS_DEPLOY_ROLE_ARN_PRODUCTION`

This repository only needs the resulting ARNs. It does not need to own the IAM definitions.

## What authoring rules should the bootstrap repository follow?

- keep IAM bootstrap state independent from application repos
- document how to import existing manually created roles if they already exist
- parameterize GitHub owner, repository, and environment names where practical
- expose the role ARNs clearly for downstream consumers

## When is the bootstrap implementation acceptable?

The implementation is acceptable only when all of the following are true:

- the IAM OIDC provider exists independently of this application repository
- the development deploy role can be assumed only by `windwingwalker/article` in the `development` environment
- the production deploy role can be assumed only by `windwingwalker/article` in the `production` environment
- both role ARNs are published as outputs
- this repository can deploy using those ARNs without owning the IAM definitions
