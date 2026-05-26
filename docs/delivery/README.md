# Delivery

## How is this repo built and shipped?

Application code is built with TypeScript and packaged into a Lambda-compatible Docker image. Infrastructure is defined in Terraform across `pre-development`, `development`, and `production` roots.

## What deployment questions matter most here?

- How are environments separated?
- How is CI/CD expected to work?
- How does production promotion happen?
- What external bootstrap stacks are required?
- How is Terraform backend state configured?

## Deeper Docs

- [GitHub Actions CI/CD](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/github-actions-cicd.md)
- [GitHub OIDC Bootstrap](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/github-oidc-bootstrap.md)
- [R2 Backend Migration](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/r2-backend-migration.md)
- [R2 Backend Bootstrap](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/r2-backend-bootstrap.md)
- [Decision: Remote State And Workflow-Only Execution](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/decision-remote-state-and-workflow-only.md)
- [Decision: Production Promotion Uses Commit Image Tag](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/decision-production-image-tag.md)
