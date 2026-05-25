# Operations

## How is this system operated?

This repo currently documents recovery and operational risk more than day-to-day observability. The most concrete runbook is Terraform state recovery.

## What are the main operational concerns?

- Shared infrastructure increases blast radius.
- State recovery must be possible from documentation alone.
- Drift between live AWS resources and Terraform config needs explicit review.

## Deeper Docs

- [Terraform State Recovery](/Users/windwingwalker/Vault/Code/my-code/article/docs/ops/terraform-state-recovery.md)
- [Decision: Cost Over Availability](/Users/windwingwalker/Vault/Code/my-code/article/docs/ops/decision-cost-over-availability.md)
