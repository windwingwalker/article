# Design Decision: Prefer Cost Savings Over High Availability

## Status

Accepted

## Context

This repository is a small personal project with low traffic.

The API is not expected to be called frequently because frontend edge caching absorbs most reads. As a result, occasional API downtime is acceptable, and temporary infrastructure loss is tolerable for this project.

Because the operational risk is low, the system does not need to optimize for high availability, fast disaster recovery, or strict environment isolation at all times.

## Decision

The infrastructure should prioritize cost savings and operational simplicity over high availability.

In practice, this means:

- reuse existing resources when reasonable instead of creating fully isolated duplicates
- accept longer maintenance windows and occasional API downtime during infrastructure changes
- avoid paying for redundant infrastructure that is not justified by the traffic profile
- prefer simpler deployment and promotion models when they reduce cost and management overhead

## Consequences

Positive consequences:

- lower AWS cost
- simpler infrastructure to operate as a single-maintainer project
- less duplication across environments and migrations

Negative consequences:

- migrations may require longer downtime
- failures may have a larger blast radius because more resources are shared
- recovery may be slower than in a fully isolated, production-grade setup

## Notes

This decision is appropriate for the current scale and usage pattern of the project. If traffic, criticality, or reliability requirements increase in the future, this decision should be revisited.
