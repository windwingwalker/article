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

Article/catalog storage uses R2 credentials from AWS Systems Manager Parameter Store. For local article reads and writes, use AWS SDK credentials that can read `/article/article-data-store/*`.

## How do you call the isolated dev API?

The isolated dev API currently uses its raw execute-api URL:

- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-catalog`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article`
- `https://nlhzn9g6n8.execute-api.us-east-1.amazonaws.com/dev/article-reader-count`

The custom domain base path `https://api.windwingwalker.xyz/article-api-dev` is mapped in API Gateway.

## Where is configuration documented?

Delivery-related backend and bootstrap configuration live under [Delivery](/Users/windwingwalker/Vault/Code/my-code/article/docs/delivery/README.md).
