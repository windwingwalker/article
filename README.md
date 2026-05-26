# Article

Serverless backend for article publishing on `windwingwalker.xyz`.

## What This Repo Contains

- Application code for article APIs and background processing
- Terraform for shared, development, and production infrastructure
- Question-oriented documentation under `docs/`

## Documentation

This repository uses a question-based documentation structure.

The root `README.md` is the primary documentation map. Each section folder in `docs/` owns a small set of related questions. Each section `README.md` is an index. Leaf documents stay narrow and self-contained. Do not add `docs/README.md`.

## Sections

- [Overview](/Users/windwingwalker/Vault/Code/my-code/article/docs/overview/README.md): What the application is for, who it serves, and where it fits.
- [Architecture](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/README.md): Runtime flow, boundaries, dependencies, and infrastructure shape.
- [Data](/Users/windwingwalker/Vault/Code/my-code/article/docs/data/README.md): Core entities, storage, and source-of-truth rules.
- [Interfaces](/Users/windwingwalker/Vault/Code/my-code/article/docs/interfaces/README.md): API resources, triggers, and input/output boundaries.
- [Development](/Users/windwingwalker/Vault/Code/my-code/article/docs/dev/README.md): Local work, testing, configuration, and repo workflow.
- [Delivery](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/README.md): Build, CI/CD, promotion, and backend bootstrap dependencies.
- [Operations](/Users/windwingwalker/Vault/Code/my-code/article/docs/ops/README.md): Runbooks, recovery, and operational risks.
- [Roadmap](/Users/windwingwalker/Vault/Code/my-code/article/docs/roadmap/README.md): Deferred improvements and future architecture work.

## Commands

- Build: `npm run build`
- Test: `npm test`
- Dev: `npm start`
- Local Lambda invocation: `npm run local -- <event.json>`

## Runtime

- Node target: `24`
- Lambda model: one entrypoint in `src/index.ts`
- Request flow: Lambda event -> router -> services -> storage or queue adapter


- Where does this app run? 
  - AWS and Local
- How to trigger this app?
  -
- What environment we have? What are the differences?
- How to run this app?
  - In AWS
- How to build this app?
- What to test?
  - Database connection
  - Article write
  - Article read
  - Catalog write
  - Catalog read
