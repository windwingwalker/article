# Data

## What are the main entities?

- `PlainArticle`
- `ArticleMetadata`
- `Article`
- `ArticleCatalog`
- `HTTPResponse`

## Where is application state stored?

- DynamoDB table `articles`
- DynamoDB table `article-catalog`
- Cloudflare R2 article objects under `articles/{firstPublished}/versions/{lastModified}.json`
- Cloudflare R2 latest-article pointers under `articles/{firstPublished}/latest.json`
- Cloudflare R2 catalog object at `catalog/latest.json`
- Queue messages for reader-count processing

## What is the current source of truth?

- Development now reads and writes article/catalog state directly through R2 with `ARTICLE_READ_STORE=r2`.
- Production remains on DynamoDB while the legacy Lambda/API Gateway path is preserved.
- Development reader-count events are buffered in the dev SQS queue and materialized by the scheduled drain with `READER_COUNT_MODE=daily-drain`.
- Production reader-count events still flow through the existing SQS immediate Lambda trigger.
- Infrastructure state is managed separately through Terraform state, not through the app itself.

## What data risks matter most?

- R2 object writes are not atomic counter increments, so reader-count updates must be aggregated before R2 becomes the counter source.
- Direct R2 testing should happen in development before production cutover because writes no longer update DynamoDB when `ARTICLE_READ_STORE=r2`.
- Development-style write testing can still touch shared production-facing data paths if it points at the same DynamoDB tables or R2 bucket.

## Deeper Docs

- [Datastore Isolation For Write Testing](/Users/windwingwalker/Vault/Code/my-code/article/docs/roadmap/0001-datastore-isolation-for-write-testing.md)
