# Development

## How do you work on this repo locally?

- Build with `npm run build`
- Test with `npm test`
- Run locally with `npm start`
- Invoke the Lambda handler locally with `npm run local -- ./tests/events/get-catalog.json`
- Preview DynamoDB to R2 migration with `npm run migrate:r2 -- --dry-run`
- Upload DynamoDB data to R2 with `npm run migrate:r2`
- Compare DynamoDB and R2 latest objects with `npm run compare:r2`

## What runtime and tools matter?

- Node.js `24`
- TypeScript
- Mocha and Chai
- Terraform for infrastructure definitions

## What parts of local work are fragile?

- Tests assume execution from the repository root.
- Terraform module and environment interfaces must stay in sync.
- Terraform changes should be formatted with `terraform fmt -recursive terraform`.

## How is local Lambda invocation configured?

`npm run local` reads a Lambda-style event from a JSON file argument. If no file is passed, it reads JSON from stdin.

Local and migration commands load `.env` from the repository root when it exists. Fill in only the values needed for the command you are running. Real `.env` files are ignored by git.

R2 is optional during migration. DynamoDB is used by default. To read and write article/catalog objects directly from R2, set `ARTICLE_READ_STORE=r2` plus:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

## How do you call the isolated dev API?

The isolated dev API currently uses its raw execute-api URL:

- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-catalog`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-reader-count`

The custom domain base path `https://api.windwingwalker.xyz/dev-article-dev` is mapped in API Gateway, but the raw execute-api URL is the verified smoke-test path.

## How do you migrate DynamoDB data to R2?

Run `npm run migrate:r2 -- --dry-run` first. It scans DynamoDB, builds the target R2 object list, and prints object counts without writing to R2.

After reviewing the dry-run summary, run `npm run migrate:r2` with R2 environment variables set. The command writes every article version, each latest pointer, and `catalog/latest.json`.

Run `npm run compare:r2` after migration. It compares DynamoDB latest articles and catalog state against the R2 objects and exits with a non-zero status when drift is found.

## Where is configuration documented?

Delivery-related backend and bootstrap configuration live under [Delivery](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/README.md).
