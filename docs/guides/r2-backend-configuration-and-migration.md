# R2 Backend Configuration And Migration

## Status

Draft implementation guide

## Purpose

Define the exact Terraform backend pattern for storing this repository's state in the existing Cloudflare R2 bucket and describe the migration steps from local state.

## Backend Target

- Bucket: `terraform-backend`
- Account ID: `66bb5c1dba95ca2651ef64fdcca9a4d8`
- Endpoint: provided at runtime only

## State Keys

- `article/pre-development/terraform.tfstate`
- `article/development/terraform.tfstate`
- `article/production/terraform.tfstate`

## Security Note

The currently available backend credential is shared globally across projects and operators.

This is acceptable only as a temporary implementation step.

Required follow-up:

- rotate the exposed credential
- replace it with a dedicated Terraform backend credential
- scope future credentials as tightly as the Cloudflare access model allows

Do not commit backend credentials to Git.

## Backend Configuration Pattern

Each Terraform root should declare an empty S3 backend block and receive concrete settings during `terraform init`.

Example:

```hcl
terraform {
  backend "s3" {}
}
```

This keeps secrets and environment-specific key paths outside committed source.

## Suggested Backend Declaration Files

Add one file per Terraform root:

- `terraform/environments/pre-development/backend.tf`
- `terraform/environments/development/backend.tf`
- `terraform/environments/production/backend.tf`

Each file should contain only:

```hcl
terraform {
  backend "s3" {}
}
```

## Shared Backend Config File

Use the committed shared backend config file at [`backend.r2.hcl`](/Users/windwingwalker/Vault/Code/my-code/article/backend.r2.hcl).

This file is intentionally non-secret and intentionally incomplete.

It contains:

- bucket name
- region placeholder
- R2 compatibility flags

It does not contain:

- access key
- secret key
- state key
- endpoint

The endpoint is kept out of the file on purpose and must be passed during `terraform init`.

Recommended runtime variable name:

- `TF_BACKEND_S3_ENDPOINT`

## Environment Variables

Local operators and CI should provide:

```bash
export TF_BACKEND_ACCESS_KEY="<access-key>"
export TF_BACKEND_SECRET_KEY="<secret-key>"
export TF_BACKEND_S3_ENDPOINT="<r2-s3-endpoint>"
export AWS_ENDPOINT_URL_S3="${TF_BACKEND_S3_ENDPOINT}"
```

Do not store these values in tracked files.

## Init Commands

## Pre-Development

```bash
cd terraform/environments/pre-development
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/pre-development/terraform.tfstate" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

## Development

```bash
cd terraform/environments/development
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/development/terraform.tfstate" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

## Production

```bash
cd terraform/environments/production
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/production/terraform.tfstate" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

## Migration Steps

Perform the migration one root at a time.

## 1. Prepare The Root

- ensure the root already works with local state
- ensure the root contains `backend "s3" {}`
- back up the current local `terraform.tfstate`
- back up `terraform.tfstate.backup` if present

## 2. Initialize With Migration

Run `terraform init` with the backend configuration for that root.

If Terraform detects existing local state, approve copying state to the remote backend.

If needed, use:

```bash
terraform init -migrate-state
```

## 3. Validate The Result

After migration:

- run `terraform state list`
- run `terraform plan`
- confirm no unexpected recreation is proposed solely because of backend migration

## 4. Repeat Per Root

Run the same process for:

- `pre-development`
- `development`
- `production`

Do not migrate all roots at once.

## Operational Rules

- never run concurrent applies against the same root until locking behavior is verified
- prefer serialized deployments per environment in GitHub Actions
- keep local backups of state during initial migration
- do not mix state keys between environments

## Locking Risk

Cloudflare R2 is being used through Terraform's S3-compatible backend path.

Locking behavior has not yet been verified for this repository.

Until it is tested:

- do not assume native locking is reliable
- serialize CI jobs per environment
- avoid overlapping local operator runs

## Suggested GitHub Actions Secret Names

- `TF_BACKEND_ACCESS_KEY`
- `TF_BACKEND_SECRET_KEY`

These can live at the repository level or environment level depending on how strictly deployments are separated.

## Suggested GitHub Actions Variable

- `TF_BACKEND_S3_ENDPOINT`

The workflow can pass this value to `terraform init` instead of hardcoding the endpoint in workflow YAML.

## Recommended Follow-Up Cleanup

- stop tracking local `terraform.tfstate` files in Git
- remove any committed state files after verifying remote migration
- add a runbook section for credential rotation
- replace the current global backend credential with a dedicated one
