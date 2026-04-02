# AGENTS.md

This file provides guidance to coding agents working with code in this repository.

## Documentation Rule

- Every document in this repository must be linked from `README.md`.

## Commands

- **Build:** `npm run build` (compiles TypeScript to `dist/` via `tsc`)
- **Test:** `npm test` (runs mocha + chai tests via `mocha --require ts-node/register tests/**/*.ts --exit`)
- **Dev:** `npm start` (runs `nodemon src/controller.ts` for local development)

## Architecture

This is a **serverless backend application** for a personal blog (`windwingwalker.xyz`), deployed as AWS Lambda functions behind API Gateway. It manages three resources: articles, article catalogs, and article reader counts.

### Request Flow

`Lambda Event -> controller.ts (router) -> services.ts (business logic) -> io.ts (AWS SDK calls)`

1. **controller.ts** - Single Lambda entry point (`lambdaHandler`). Routes based on event source (`api-get`, `api-put`, `api-post`, `sqs`, `cron`) and API resource path (`/article`, `/article-catalog`).
2. **functions.ts** - Pure utility functions: `pharseMarkdown` (parses custom markdown format into structured JSON), `getLambdaEventSource` (detects Lambda trigger type), `articleIsExisted`, `rewriteArticleCatalog`, `rewriteArticle`.
3. **services.ts** - Service layer orchestrating business logic for each operation (get/put article, get/put catalog, reader count tracking, scheduled catalog sync).
4. **io.ts** - Data access layer wrapping AWS SDK clients (DynamoDB, SQS, SSM). Region is hardcoded to `us-east-1`.

## Data Model

- **PlainArticle** - Raw parsed markdown output (title, subtitle, type, tags, series, body)
- **ArticleMetadata** - Base class with metadata fields (firstPublished, lastModified, title, edition, views, tags, series)
- **Article** - Extends ArticleMetadata, adds body content. Constructed from PlainArticle.
- **ArticleCatalog** - Interface holding an array of `ArticleMetadata` entries with count and `lastModified`
- **HTTPResponse** - Lambda response wrapper with `statusCode`, JSON-stringified `body`, and `Content-type` header

## Custom Markdown Format

Articles are written in a custom markdown variant parsed by `pharseMarkdown` in `functions.ts`. Format:

- Header section: `# title`, `## subtitle`, metadata lines (`- type:`, `- tags:`, `- firstPublished:`, `- series:`)
- `---` separator
- Body section: headings (`#`, `##`, `###`), paragraphs, `<poetry>...</poetry>` blocks

## Infrastructure

- **terraform/modules/** - Reusable Terraform modules for AWS resources (API Gateway, Lambda, ECR, SQS, EventBridge, etc.)
- **terraform/environments/development/** - Development Terraform root
- **terraform/environments/pre-development/** - Bootstrap/shared Terraform root
- **terraform/environments/production/** - Production Terraform root
- **Jenkinsfile** - CI/CD pipeline: build code -> build Docker image -> push to ECR
- **Dockerfile** - Based on `public.ecr.aws/lambda/nodejs:18`, copies compiled `dist/` into Lambda runtime

### Terraform Workflow Note

- If you change Terraform files, run `terraform fmt -recursive terraform` before pushing. The GitHub Actions Terraform matrix runs `terraform fmt -check`, so unformatted `.tf` files will fail all Terraform validation jobs.
- Keep Terraform module interfaces in sync with the environment roots and nested environment modules. This repo has shared modules under `terraform/modules/` and callers under `terraform/environments/`; if a shared module input changes, update all callers in the same change or CI will fail on `terraform validate` with missing or unsupported argument errors.

## Test Structure

Tests live in `tests/` using mocha + chai. Test fixtures are `.txt` (markdown input) and `.json` (expected parsed output) file pairs. Tests currently cover `pharseMarkdown` only. Tests must be run from the project root (fixtures use relative paths like `./tests/valid-article.txt`).

## DynamoDB Tables

- `articles` - Partition key: `firstPublished` (Number), uses Query with `ScanIndexForward: false`
- `article-catalog` - Partition key: `id` (Number, always `1`), single-record table
