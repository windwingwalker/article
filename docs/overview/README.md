# Overview

## What does this application do?

It is a serverless backend for article publishing on `windwingwalker.xyz`. It serves article content, article catalog metadata, and article reader-count ingestion.

## Who or what uses it?

- Blog readers hit the public API paths indirectly through the site.
- Internal maintenance workflows update article and catalog content.
- Scheduled and queue-driven flows keep catalog and reader-count behavior moving.

## What are the main workflows?

- Read one article
- Read the article catalog
- Write article content or catalog content
- Record article-reader-count events
- Run scheduled catalog sync work

## What should a new engineer read first?

- [Architecture](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/README.md)
- [Interfaces](/Users/windwingwalker/Vault/Code/my-code/article/docs/interfaces/README.md)
- [Development](/Users/windwingwalker/Vault/Code/my-code/article/docs/dev/README.md)

## What is out of scope for this repo?

- Frontend rendering of the blog
- IAM bootstrap ownership for GitHub OIDC
- Terraform backend infrastructure ownership for Cloudflare R2
