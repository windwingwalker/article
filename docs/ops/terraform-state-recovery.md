# Terraform State Recovery Runbook

## Purpose

This runbook reconstructs local Terraform state for the environment-first layout under:

- `terraform/environments/pre-development/`
- `terraform/environments/development/`
- `terraform/environments/production/`

It assumes the project uses local Terraform state only.

## Local State Rules

- Commit `.terraform.lock.hcl`
- Do not commit `terraform.tfstate`
- Keep the state files local
- Back up local state outside Git before changing laptops

## Current Live AWS Inventory

Observed in AWS account `730917489165`:

- REST API: `article-gateway` with ID `vimbgyucw9`
- API authorizer: `x2cre3`
- API stages:
  - `dev` with deployment `vciyyw`
  - `prod` with deployment `ok98lj`
- API resources:
  - `/article` -> `gvg88u`
  - `/article-catalog` -> `fqearc`
  - `/article-reader-count` -> `ct1st8`
- Lambda function: `article`
- Lambda aliases:
  - `dev`
  - `prod`
- ECR repository: `article`
- Resource group: `article`
- EventBridge rule: `article-catalog`
- EventBridge target ID: `bvsq83o70mbjehyskn4`
- SQS queues:
  - `article-reader-count`
  - `article-reader-count-DLQ`
- Base path mappings:
  - `dev-article`
  - `article`

## Important Drift Before Import

The current Terraform config does not exactly match the live AWS state:

- live EventBridge currently targets `article:prod`
- current development config targets the `dev` alias
- live SQS event source mapping for `article-reader-count` is absent

Because of that:

- import what already exists
- expect the first `terraform plan` to show drift
- do not apply until the drift is reviewed intentionally

## General Workflow

For each root:

1. Run `terraform init`
2. Import existing resources
3. Run `terraform plan`
4. Review drift before any apply

## Pre-Development Root

Working directory:

```bash
cd terraform/environments/pre-development
terraform init
```

Imports:

```bash
terraform import module.resource_group.aws_resourcegroups_group.default article
terraform import module.ecr.aws_ecr_repository.default article
```

## Development Root

Working directory:

```bash
cd terraform/environments/development
terraform init
```

Imports:

```bash
terraform import module.api-gateway.aws_api_gateway_rest_api.default vimbgyucw9
terraform import module.api-gateway.aws_api_gateway_authorizer.default vimbgyucw9/x2cre3

terraform import module.lambda.aws_cloudwatch_log_group.default /aws/lambda/article
terraform import module.lambda.aws_lambda_function.default article

terraform import module.lambda-alias.aws_lambda_alias.default article:dev

terraform import module.article.api-resource.aws_api_gateway_resource.default vimbgyucw9/gvg88u
terraform import module.article.api-get.aws_api_gateway_method.default vimbgyucw9/gvg88u/GET
terraform import module.article.api-get.aws_api_gateway_integration.default vimbgyucw9/gvg88u/GET
terraform import module.article.api-get.aws_api_gateway_method_response.default vimbgyucw9/gvg88u/GET/200
terraform import module.article.api-put.aws_api_gateway_method.default vimbgyucw9/gvg88u/PUT
terraform import module.article.api-put.aws_api_gateway_integration.default vimbgyucw9/gvg88u/PUT
terraform import module.article.api-put.aws_api_gateway_method_response.default vimbgyucw9/gvg88u/PUT/200

terraform import module.article-catalog.api-resource.aws_api_gateway_resource.default vimbgyucw9/fqearc
terraform import module.article-catalog.api-get.aws_api_gateway_method.default vimbgyucw9/fqearc/GET
terraform import module.article-catalog.api-get.aws_api_gateway_integration.default vimbgyucw9/fqearc/GET
terraform import module.article-catalog.api-get.aws_api_gateway_method_response.default vimbgyucw9/fqearc/GET/200
terraform import module.article-catalog.api-put.aws_api_gateway_method.default vimbgyucw9/fqearc/PUT
terraform import module.article-catalog.api-put.aws_api_gateway_integration.default vimbgyucw9/fqearc/PUT
terraform import module.article-catalog.api-put.aws_api_gateway_method_response.default vimbgyucw9/fqearc/PUT/200

terraform import module.article-reader-count.api-resource.aws_api_gateway_resource.default vimbgyucw9/ct1st8
terraform import module.article-reader-count.api-post.aws_api_gateway_method.default vimbgyucw9/ct1st8/POST
terraform import module.article-reader-count.api-post.aws_api_gateway_integration.default vimbgyucw9/ct1st8/POST
terraform import module.article-reader-count.api-post.aws_api_gateway_method_response.default vimbgyucw9/ct1st8/POST/200

terraform import module.article-reader-count.sqs.aws_sqs_queue.default https://sqs.us-east-1.amazonaws.com/730917489165/article-reader-count
terraform import module.article-reader-count.sqs.aws_sqs_queue.dlq https://sqs.us-east-1.amazonaws.com/730917489165/article-reader-count-DLQ
terraform import module.article-reader-count.sqs.aws_sqs_queue_policy.default https://sqs.us-east-1.amazonaws.com/730917489165/article-reader-count

terraform import module.article-catalog.eventbridge.aws_cloudwatch_event_rule.default article-catalog
terraform import module.article-catalog.eventbridge.aws_cloudwatch_event_target.default article-catalog/bvsq83o70mbjehyskn4

terraform import module.api-gateway-stage.aws_cloudwatch_log_group.default API-Gateway-Execution-Logs_vimbgyucw9/dev
terraform import module.api-gateway-stage.aws_api_gateway_stage.default vimbgyucw9/dev
terraform import module.api-gateway-stage.aws_api_gateway_method_settings.default vimbgyucw9/dev/*/*
terraform import module.api-gateway-stage.aws_api_gateway_base_path_mapping.default api.windwingwalker.xyz/dev-article
```

Optional import for the current deployment snapshot:

```bash
terraform import module.api-gateway-stage.aws_api_gateway_deployment.default vimbgyucw9/vciyyw
```

Resources intentionally not imported first:

- `module.article-reader-count.aws_lambda_event_source_mapping.default`
  Reason: no live mapping currently exists
- Lambda permission resources
  Reason: import IDs are fragile and the first plan should confirm whether to import or recreate them

After importing, run:

```bash
terraform plan
```

Expected first-plan drift:

- EventBridge target will likely want to move from `article:prod` to the `dev` alias
- Lambda permission resources may need import or recreation
- API deployment may want replacement if not imported

## Production Root

Working directory:

```bash
cd terraform/environments/production
terraform init
```

Imports:

```bash
terraform import module.lambda-alias.aws_lambda_alias.default article:prod

terraform import module.api-gateway-stage.aws_cloudwatch_log_group.default API-Gateway-Execution-Logs_vimbgyucw9/prod
terraform import module.api-gateway-stage.aws_api_gateway_stage.default vimbgyucw9/prod
terraform import module.api-gateway-stage.aws_api_gateway_method_settings.default vimbgyucw9/prod/*/*
terraform import module.api-gateway-stage.aws_api_gateway_base_path_mapping.default api.windwingwalker.xyz/article
```

Optional import for the current deployment snapshot:

```bash
terraform import module.api-gateway-stage.aws_api_gateway_deployment.default vimbgyucw9/ok98lj
```

After importing, run:

```bash
terraform plan
```

## Permission Notes

Current live Lambda policies show:

- `article:dev` already has `AllowExecutionFromAPIGateway`
- `article:prod` already has:
  - `AllowExecutionFromAPIGateway`
  - an EventBridge statement with a generated SID

If `terraform plan` or `apply` later fails on duplicate Lambda permission statements, handle permissions explicitly at that point. Do not guess on permission import IDs during the first recovery pass.

## Backup Recommendation

After each root is imported and reviewed:

- back up `terraform.tfstate`
- back up `terraform.tfstate.backup` if present

Keep those backups outside Git.
