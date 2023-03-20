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
