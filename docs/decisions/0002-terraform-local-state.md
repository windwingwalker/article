# Design Decision: Use Local Terraform State

## Status

Accepted

## Context

This project is a small personal project with low traffic and a strong preference for minimizing cost and operational overhead.

Remote Terraform state storage, such as S3-based backends or Terraform Cloud, adds infrastructure cost and complexity that is not justified for the current scale of the project.

## Decision

Terraform state will be stored locally only.

In practice, this means:

- commit `.terraform.lock.hcl`
- do not commit `terraform.tfstate`
- do not use remote backend storage
- keep Terraform state files only on the local machine

## Consequences

Positive consequences:

- no additional cost for remote state storage
- simpler Terraform workflow
- fewer AWS resources to manage

Negative consequences:

- state is more fragile during laptop migration or disk loss
- no remote locking
- recovery may require manual import if local state is lost

## Notes

This decision matches the current priorities of the project: low cost, low operational complexity, and tolerance for downtime and recovery work.
