# AGENTS.md

This file provides guidance to coding agents working with code in this repository.

## Documentation Methodology

- Use a question-based documentation structure under `docs/`.
- Treat the root `README.md` as the primary documentation map for the repository.
- Keep the root `README.md` lightweight; it should route readers to section indexes rather than hold all details itself.
- Treat each top-level section in `docs/` as a knowledge domain with its own `README.md`.
- Use section `README.md` files as Q&A indexes that direct readers to leaf documents.
- In documentation, make every heading question-oriented by default. `#` may be a title when needed, but section headings should be written as questions.
- Do not create `docs/README.md`; the root `README.md` is the only top-level documentation map.
- Do not create `docs/decisions/`; put decision files in the section folder they actually govern.
- Keep leaf markdown files small, single-purpose, and self-contained.
- Prefer short, distinct folder and file names.
- When a topic grows too broad, split it into multiple leaf documents instead of expanding one long file.
- Link new leaf docs from the relevant section `README.md`, and keep the root `README.md` updated with the top-level section map.
- When a document captures a durable tradeoff or ADR, colocate it with the owning domain and use a clear name such as `decision-<topic>.md`.
- For cross-repository reuse, prefer the global skill `question-docs-pattern` instead of adding a repo-local copy.
- When summarizing work to the user, prefer question-led sections as well. Lead with questions such as `What changed?`, `What remains?`, and `What did not run?` instead of neutral labels.
- When creating docs in other repositories, reuse the same pattern unless that repository has a stronger local convention.

### Recommended Section Pattern

- `docs/overview/`: purpose, scope, users, critical workflows
- `docs/architecture/`: runtime flow, dependencies, boundaries
- `docs/data/`: entities, storage, schemas, source of truth
- `docs/interfaces/`: APIs, events, inputs, outputs
- `docs/dev/`: local workflow, testing, configuration, quality
- `docs/delivery/`: build, CI/CD, environments, promotion
- `docs/ops/`: runbooks, recovery, incidents, failure modes, operating tradeoffs
- `docs/roadmap/`: deferred improvements and planned changes

### Concise Example

Example shape for a new repository:

- `docs/architecture/README.md`
  - Q: How does request processing work?
  - A: Short summary plus links to `request-flow.md` and `system-boundaries.md`
- `docs/delivery/README.md`
  - Q: How is production deployed?
  - A: Short summary plus links to `deployment-flow.md` and `rollback.md`

## Commands

- **Build:** `npm run build` (compiles TypeScript to `dist/` via `tsc`)
- **Test:** `npm test` (runs mocha + chai tests via `mocha --require ts-node/register tests/**/*.ts --exit`)
- **Dev:** `npm start` (runs `nodemon src/index.ts` for local development)
- **Local Node Version:** `.nvmrc` targets Node.js `24`

## Architecture

This is a **serverless backend application** for a personal blog (`windwingwalker.xyz`), deployed as AWS Lambda functions behind API Gateway. It manages three resources: articles, article catalogs, and article reader counts.

### Request Flow

`Lambda Event -> index.ts (router) -> services.ts (business logic) -> io.ts (AWS SDK calls)`

1. **index.ts** - Single Lambda entry point (`lambdaHandler`). Routes based on event source (`api-get`, `api-put`, `api-post`, `sqs`, `cron`) and API resource path (`/article`, `/article-catalog`).
2. **functions.ts** - Pure utility functions: `pharseMarkdown` (parses custom markdown format into structured JSON), `getLambdaEventSource` (detects Lambda trigger type), `articleIsExisted`, `rewriteArticleCatalog`, `rewriteArticle`.
3. **services.ts** - Service layer orchestrating business logic for each operation (get/put article, get/put catalog, reader count tracking, scheduled catalog sync).
4. **io.ts** - Data access layer wrapping AWS SDK clients (SQS, SSM). Region is hardcoded to `us-east-1`.

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
- **Dockerfile** - Based on `public.ecr.aws/lambda/nodejs:24`, copies compiled `dist/` into Lambda runtime

### Environment Ownership

- **pre-development** - Owns shared foundation resources for this application, currently the resource group and ECR repository
- **development** - Owns the mutable application stack, including the REST API, Lambda function, `dev` alias, API routes, EventBridge schedule, and SQS reader-count processing
- **production** - Owns production-facing promotion targets only, primarily the `prod` API stage and `prod` Lambda alias

### Isolation Model

- Development and production are separated at the API Gateway stage layer and the Lambda alias layer
- Both environments share the same Lambda function lineage and image source, so artifact isolation is partial rather than absolute
- Production promotion currently reads the live Lambda version behind the `dev` alias and points the `prod` alias at that version
- See `docs/architecture/environment-isolation.md` for the current architecture diagram and boundary explanation

### Terraform Workflow Note

- If you change Terraform files, run `terraform fmt -recursive terraform` before pushing. The GitHub Actions Terraform matrix runs `terraform fmt -check`, so unformatted `.tf` files will fail all Terraform validation jobs.
- Keep Terraform module interfaces in sync with the environment roots and nested environment modules. This repo has shared modules under `terraform/modules/` and callers under `terraform/environments/`; if a shared module input changes, update all callers in the same change or CI will fail on `terraform validate` with missing or unsupported argument errors.

## Test Structure

Tests live in `tests/` using mocha + chai. Test fixtures are `.txt` (markdown input) and `.json` (expected parsed output) file pairs. Tests currently cover `pharseMarkdown` only. Tests must be run from the project root (fixtures use relative paths like `./tests/valid-article.txt`).

## R2 Object Layout

- Article versions: `articles/{firstPublished}/versions/{lastModified}.json`
- Latest article pointer: `articles/{firstPublished}/latest.json`
- Catalog: `catalog/latest.json`
