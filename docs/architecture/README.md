# Architecture

## How does the application process work?

The runtime flow is `Lambda Event -> index.ts -> services.ts -> storage or queue adapter`.

## What are the main architectural boundaries?

- Router and event dispatch in `src/index.ts`
- Business logic orchestration in `src/services.ts`
- Storage selection in `src/articleStore.ts`
- DynamoDB-backed article and catalog access in `src/dynamoArticleStore.ts`
- R2 article and catalog object access in `src/r2ArticleStore.ts`
- SQS reader-count draining in `src/readerCountQueue.ts`
- Reader-count aggregation in `src/viewCounter.ts`
- AWS SDK helper access in `src/io.ts`
- Pure utility logic in `src/functions.ts`

## How are reader counts processed?

- The frontend calls `/article-reader-count` when a user opens an article.
- The API writes one SQS message containing the article `firstPublished` value.
- During migration, the existing SQS event source invokes Lambda immediately and updates DynamoDB.
- Later, `READER_COUNT_MODE=daily-drain` can switch processing to the daily SQS drain that materializes summed views through the configured article store.

## How is R2 enabled during migration?

- Default reads and writes use DynamoDB.
- `ARTICLE_READ_STORE=r2` switches article/catalog reads and writes to R2 after migration validation.

## How are environments separated?

Development now has its own Lambda function and API Gateway:

- Dev Lambda: `article-dev`
- Dev API Gateway: `article-dev-gateway`
- Dev raw API URL: `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev`
- Dev custom base path: `https://api.windwingwalker.xyz/dev-article-dev`
- Dev storage mode: `ARTICLE_READ_STORE=r2`
- Dev reader-count mode: `READER_COUNT_MODE=daily-drain`

The current `article` Lambda and `article-gateway` API Gateway remain in place for production traffic during the migration. Production still uses the existing alias/stage path until the legacy promotion model is removed.

See [Environment Isolation](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/environment-isolation.md).

## What are the key infrastructure questions?

- Which resources are shared versus environment-specific?
- Where does development stop and production begin?
- How much isolation exists at the API stage, alias, and artifact layers?

## Deeper Docs

- [Environment Isolation](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/environment-isolation.md)
