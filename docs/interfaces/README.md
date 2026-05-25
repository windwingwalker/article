# Interfaces

## What interfaces enter the system?

- API Gateway routes
- EventBridge scheduled invocations
- SQS event-source messages for reader-count updates
- SQS messages drained by the scheduled reader-count job after the daily-drain cutover

## What resources does the API expose?

- `/article`
- `/article-catalog`
- `/article-reader-count`

## How does `/article-reader-count` work?

The frontend calls `POST /article-reader-count?firstPublished=...`. The API writes one SQS message immediately. During migration, the existing SQS event source invokes Lambda and updates DynamoDB. After the daily-drain cutover, the scheduled invocation can drain the queue and materialize summed views through the configured article store.

## Where is interface routing defined?

- Runtime routing starts in `src/controller.ts`
- Event source classification is handled by `getLambdaEventSource` in `src/functions.ts`

## What should be read next?

- [Development](/Users/windwingwalker/Vault/Code/my-code/article/docs/dev/README.md)
- [Architecture](/Users/windwingwalker/Vault/Code/my-code/article/docs/architecture/README.md)
