# Architecture

## How does the application process work?

The runtime flow is `Lambda Event -> index.ts -> services.ts -> storage or queue adapter`.

## What are the main architectural boundaries?

- Router and event dispatch in `src/index.ts`
- Business logic orchestration in `src/services.ts`
- Storage selection in `src/articleStore.ts`
- R2 article and catalog object access in `src/r2ArticleStore.ts`
- SQS reader-count draining in `src/readerCountQueue.ts`
- Reader-count aggregation in `src/viewCounter.ts`
- AWS SDK helper access in `src/io.ts`
- Pure utility logic in `src/functions.ts`

## How are reader counts processed?

- The frontend calls `/article-reader-count` when a user opens an article.
- The API writes one SQS message containing the article `firstPublished` value.
- The scheduled EventBridge invocation drains queued messages and materializes summed views into R2.

## How is R2 used?

- Article versions are stored under `articles/{firstPublished}/versions/{lastModified}.json`.
- Latest article pointers are stored under `articles/{firstPublished}/latest.json`.
- The catalog is stored at `catalog/latest.json`.

## How are environments separated?

Development now has its own Lambda function and API Gateway:

- Dev Lambda: `article-dev`
- Dev API Gateway: `article-gateway-dev`
- Dev raw API URL: `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev`
- Dev custom base path: `https://api.windwingwalker.xyz/article-api-dev`
- Prod Lambda: `article-prod`
- Prod API Gateway: `article-gateway-prod`
- Prod custom base path: `https://api.windwingwalker.xyz/article-api-prod`

Both environments use R2 article storage and SQS-backed reader-count draining.

See [Environment Isolation](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/environment-isolation.md).

## What are the key infrastructure questions?

- Which resources are shared versus environment-specific?
- Where does development stop and production begin?
- How much isolation exists at the API stage, alias, and artifact layers?

## Deeper Docs

- [Environment Isolation](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/environment-isolation.md)
