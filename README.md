# Article

## Background

- This **repository** stores everything of an application.
- The **application** is one of the back-end application of [my blog](https://windwingwalker.xyz/).
- The application consists of **microservices**.
- Each microservice represents an **resource** related to articles.
- Each resource
  - provide **operations** (e.g. CRUD) to it.  
  - has <= 1 database.
  - has one computation unit (Lambda) and one API gateway.

## Architecture

[!Architecture](architecture.drawio.png)

## Tech stack

- Infrastructure: AWS
- Infrastructure as Code (IaC): Terraform
- Programming Language: TypeScript
- Back-end runtime environment: Node.js
- CI/CD Pipeline: Jenkins
- Container Image: Docker

## Repository strusture

- `microservices/`: Store source code of each microservices.
- `iac/`: Store the infrastructure as code templates that can be used across microservices.
- `model/`: Store the data model shared across microservices.
- `docs/`: Store design decisions, guides, runbooks, and future improvements.

## Documents

- [Infrastructure Cost Over Availability](docs/decisions/0001-infrastructure-cost-over-availability.md)
- [Terraform Remote State And Workflow-Only Execution](docs/decisions/0002-terraform-local-state.md)
- [Production Promotion Follows Dev Alias](docs/decisions/0003-production-promotion-follows-dev-alias.md)
- [GitHub Actions CI/CD And Deployment Strategy](docs/guides/github-actions-cicd-and-deployment-strategy.md)
- [GitHub OIDC AWS Bootstrap Requirements](docs/guides/github-oidc-aws-bootstrap-requirements.md)
- [R2 Backend Configuration And Migration](docs/guides/r2-backend-configuration-and-migration.md)
- [R2 Terraform Backend Bootstrap Requirements](docs/guides/r2-terraform-backend-bootstrap-requirements.md)
- [Terraform State Recovery Runbook](docs/runbooks/terraform-state-recovery.md)
- [CI/CD-Driven Production Promotion](docs/future-improvements/0001-cicd-driven-production-promotion.md)
- [Datastore Migration For Safer Write Testing](docs/future-improvements/0002-datastore-migration-for-safer-write-testing.md)

## List of microservices

- article: An article is just an article
- article-catalog: A article catalog stores the metadata of all articles
- article-reader-count: Click stream from end user

## List of applied AWS services

- ECR
- Lambda
- API Gateway
- EventBridge
- SQS
- AWS Backup
- CloudWatch
- DynamoDB
- Cognito User Pool
