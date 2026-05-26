# Development

## How do you work on this repo locally?

- Build with `npm run build`
- Test with `npm test`
- Run locally with `npm start`
- Invoke the Lambda handler locally with `npm run local -- ./tests/events/get-catalog.json`

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

Local commands load `.env` from the repository root when it exists. Fill in only the values needed for the command you are running. Real `.env` files are ignored by git.

Article/catalog storage uses R2. For local article reads and writes, set:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

## How do you call the isolated dev API?

The isolated dev API currently uses its raw execute-api URL:

- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-catalog`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-reader-count`

The custom domain base path `https://api.windwingwalker.xyz/article-api-dev` is mapped in API Gateway.

## Where is configuration documented?

Delivery-related backend and bootstrap configuration live under [Delivery](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/README.md).
