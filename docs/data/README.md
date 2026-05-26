# Data

## What are the main entities?

- `PlainArticle`
- `ArticleMetadata`
- `Article`
- `ArticleCatalog`
- `HTTPResponse`

## Where is application state stored?

- Cloudflare R2 article objects under `articles/{firstPublished}/versions/{lastModified}.json`
- Cloudflare R2 latest-article pointers under `articles/{firstPublished}/latest.json`
- Cloudflare R2 catalog object at `catalog/latest.json`
- SQS messages for reader-count processing

## What is the current source of truth?

- Development and production read and write article/catalog state directly through R2.
- Reader-count events are buffered in each environment's SQS queue.
- The scheduled EventBridge invocation drains SQS and materializes summed view counts into R2.
- Infrastructure state is managed separately through Terraform state, not through the app itself.

## What data risks matter most?

- R2 object writes are not atomic counter increments, so reader-count updates must be aggregated before R2 becomes the counter source.
- Development and production currently use the same R2 bucket, so object key conventions remain part of the application contract.
