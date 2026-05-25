# Environment Isolation Architecture

## Purpose

This diagram explains how this repository separates `pre-development`, `development`, and `production`, and which infrastructure elements are intentionally shared.

## Mermaid Diagram

```mermaid
flowchart TB
    repo["Terraform roots in this repository"]
    repo --> pre["pre-development"]
    repo --> dev["development"]
    repo --> prod["production"]

    subgraph shared["Shared resources across environments"]
        rg["Resource Group"]
        ecr["ECR repository"]
        restapi["API Gateway REST API"]
        lambda["Lambda function\nsame function name across aliases"]
    end

    subgraph devscope["Development-owned resources and behavior"]
        devstage["API stage: dev"]
        devalias["Lambda alias: dev"]
        devroutes["API resources and methods"]
        devschedule["EventBridge rule"]
        devqueue["SQS queue + event source mapping"]
        devlogs["Dev API access logs"]
    end

    subgraph prodscope["Production-owned resources and behavior"]
        prodstage["API stage: prod"]
        prodalias["Lambda alias: prod"]
        prodlogs["Prod API access logs"]
    end

    pre --> rg
    pre --> ecr

    dev --> restapi
    dev --> lambda
    dev --> devstage
    dev --> devalias
    dev --> devroutes
    dev --> devschedule
    dev --> devqueue
    dev --> devlogs

    prod --> prodstage
    prod --> prodalias
    prod --> prodlogs

    ecr --> lambda
    restapi --> devroutes
    devroutes --> lambda

    devstage -. stageVariables.alias=dev .-> devalias
    prodstage -. stageVariables.alias=prod .-> prodalias
    devschedule --> devalias
    devqueue --> devalias

    devalias -. promotion copies current dev version .-> prodalias

    classDef shared fill:#E8F3EC,stroke:#2F6B45,color:#111;
    classDef dev fill:#EAF2FF,stroke:#2F5AA8,color:#111;
    classDef prod fill:#FFF0E6,stroke:#B85C1E,color:#111;
    class rg,ecr,restapi,lambda shared;
    class devstage,devalias,devroutes,devschedule,devqueue,devlogs dev;
    class prodstage,prodalias,prodlogs prod;
```

## Shared

- `pre-development` owns the shared resource group and the shared ECR repository.
- `development` creates the shared API Gateway REST API and the shared Lambda function.
- Both `dev` and `prod` stages invoke the same Lambda function name through different aliases.
- The container image source is shared because all published Lambda versions are built from the same ECR repository.

## Isolated

- The `dev` and `prod` API stages are separate.
- The `dev` and `prod` Lambda aliases are separate.
- The base path mapping is separate:
  - development uses `/dev-article`
  - production uses `/article`
- API access logs are separate per stage.
- EventBridge scheduling and SQS-driven reader-count processing exist only in the development root today.

## Interception Model

- API Gateway integrations resolve the target alias from a stage variable.
- Requests entering the `dev` stage are routed to the `dev` alias.
- Requests entering the `prod` stage are routed to the `prod` alias.
- Production promotion does not build a second application stack.
- Instead, the production root reads the Lambda version currently behind the `dev` alias and creates or updates the `prod` alias to that version.

## Consequences

- Development and production traffic are separated at the API stage and Lambda alias layers.
- The compute artifact is shared, but the live entry points are distinct.
- Promotion is lightweight because production re-points an alias instead of rebuilding infrastructure.
- Production is not fully isolated from development artifacts because both environments depend on the same Lambda function lineage and shared API definition.
