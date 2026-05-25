# R2 Backend Migration

## Why does this document exist?

This document defines how this repository should store Terraform state in Cloudflare R2 and how to migrate from local Terraform state to that remote backend.

## What backend target is expected?

- Bucket: `terraform-backend`
- Account ID: `66bb5c1dba95ca2651ef64fdcca9a4d8`
- Endpoint: supplied only at runtime

## What state key layout should be used?

- `article/pre-development/terraform.tfstate`
- `article/development/terraform.tfstate`
- `article/production/terraform.tfstate`

## What security constraint matters most right now?

The currently available backend credential is shared too broadly across projects and operators.

That is acceptable only as a temporary transition step.

Required follow-up:

- rotate the exposed credential
- replace it with a dedicated backend credential
- scope future credentials as tightly as the Cloudflare model allows

Never commit backend credentials to Git.

## What backend declaration pattern should each Terraform root use?

Each Terraform root should declare only an empty S3 backend block and receive concrete backend settings during `terraform init`.

```hcl
terraform {
  backend "s3" {}
}
```

This keeps secrets and environment-specific key paths out of tracked source.

## What files should hold those backend declarations?

- `terraform/environments/pre-development/backend.tf`
- `terraform/environments/development/backend.tf`
- `terraform/environments/production/backend.tf`

Each file should contain only the empty backend block shown above.

## What shared backend config file should be used?

Use [backend.r2.hcl](/Users/windwingwalker/Vault/Code/my-code/article/backend.r2.hcl).

That file is intentionally non-secret and intentionally incomplete.

It should contain:

- bucket name
- region placeholder
- path-style setting for R2 compatibility
- R2 compatibility flags

It should not contain:

- access key
- secret key
- state key
- endpoint

The endpoint should stay out of tracked files and be passed during `terraform init`.

Recommended runtime variable:

- `TF_BACKEND_S3_ENDPOINT`

## What environment variables should operators and CI provide?

```bash
export TF_BACKEND_ACCESS_KEY="<access-key>"
export TF_BACKEND_SECRET_KEY="<secret-key>"
export TF_BACKEND_S3_ENDPOINT="<r2-s3-endpoint>"
```

Do not store these values in tracked files.

## What `terraform init` commands should be used?

### How should `pre-development` initialize?

```bash
cd terraform/environments/pre-development
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/pre-development/terraform.tfstate" \
  -backend-config="endpoint=${TF_BACKEND_S3_ENDPOINT}" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

### How should `development` initialize?

```bash
cd terraform/environments/development
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/development/terraform.tfstate" \
  -backend-config="endpoint=${TF_BACKEND_S3_ENDPOINT}" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

### How should `production` initialize?

```bash
cd terraform/environments/production
terraform init \
  -backend-config="../../../backend.r2.hcl" \
  -backend-config="key=article/production/terraform.tfstate" \
  -backend-config="endpoint=${TF_BACKEND_S3_ENDPOINT}" \
  -backend-config="access_key=${TF_BACKEND_ACCESS_KEY}" \
  -backend-config="secret_key=${TF_BACKEND_SECRET_KEY}"
```

## How should migration proceed?

Perform the migration one Terraform root at a time.

### What should happen before migrating a root?

- confirm the root already works with local state
- confirm the root contains `backend "s3" {}`
- back up `terraform.tfstate`
- back up `terraform.tfstate.backup` if present

### What should happen during migration?

Run `terraform init` with the backend configuration for that root.

If Terraform detects existing local state, approve copying state to the remote backend.

If needed:

```bash
terraform init -migrate-state
```

### What should happen after migration?

- run `terraform state list`
- run `terraform plan`
- confirm the plan does not propose unexpected recreation caused only by backend migration

### In what order should roots be migrated?

1. `pre-development`
2. `development`
3. `production`

Do not migrate all roots at once.

## What operational rules should apply during migration?

- do not run concurrent applies against the same root until locking behavior is verified
- prefer serialized deployments per environment in GitHub Actions
- keep local backups of state during the migration period
- do not mix state keys across environments

## What is still unknown about locking?

Cloudflare R2 is being used through Terraform's S3-compatible backend path, and locking behavior has not yet been validated for this repository.

Until that is tested:

- do not assume native locking is reliable
- serialize CI jobs per environment
- avoid overlapping local operator runs

## What GitHub Actions inputs should mirror this setup?

Secrets:

- `TF_BACKEND_ACCESS_KEY`
- `TF_BACKEND_SECRET_KEY`

Variable:

- `TF_BACKEND_S3_ENDPOINT`

## What cleanup should follow after the migration?

- stop tracking local `terraform.tfstate` files in Git
- remove any committed state files after remote migration is verified
- add a runbook section for credential rotation
- replace the current shared backend credential with a dedicated one
