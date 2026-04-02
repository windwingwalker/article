# Datastore Migration For Safer Write Testing

## Status

Future improvement

## Context

The current application stores article data in shared DynamoDB tables that are used by both development-style environments and the production path.

This makes write testing awkward during infrastructure migration:

- the temporary stack can safely exercise read paths
- write-path testing risks mutating shared production data
- adding environment-specific behavior that silently skips writes would reduce test fidelity

## Current Decision

Do not add special application logic that makes write APIs pretend to succeed while skipping DynamoDB writes in development or temporary environments.

That would make write behavior diverge from production and weaken confidence in testing.

## Future Direction

Consider migrating from the current shared DynamoDB design to a datastore strategy that supports safer isolated testing.

Possible directions include:

- separate datastore instances or tables for temporary and non-production environments
- a different datastore that is cheaper or easier to isolate for personal-project testing
- a broader data-layer redesign that separates production data from temporary migration environments

## Reasoning

The current migration should continue with the existing shared DynamoDB setup because the immediate goal is infrastructure migration, not data-layer redesign.

Datastore migration should be handled later as a deliberate architecture change rather than mixed into the current Terraform cutover work.
