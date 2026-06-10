---
title: "CI as an Execution Graph"
date: "2026-06-08"
tags: "ci, github-actions, architecture, workflow, performance"
series: "When the System is the Easy Part"
summary: "How to structure a CI pipeline as an execution graph with parallel, independent jobs that mirror the system's actual runtime boundaries, rather than a simple linear script."
series_part: "6"
hidden: "true"
prev: "full-stack-dev-workflow-part-5"
prev_title: "CI as Isolated Reconstruction"
next: "full-stack-dev-workflow-part-7"
next_title: "Deployment as Artifact Publication"
---

Once CI is treated as a reproducible execution of the repository’s validation rules, the next question becomes how those executions should be structured when moved into a real pipeline.

At this point, the system is no longer a single codebase being checked. It is a multi-runtime repository composed of distinct execution environments: a Python backend, a Node-based frontend, and a shared set of tooling that spans both.

This immediately introduces a constraint that does not exist in local development: CI is not a single process. It is a collection of independent execution units, each with different setup requirements, runtimes, and failure modes.

### Why CI is split into jobs

A naïve CI pipeline often collapses all validation into a single sequence of steps:

* install dependencies
* run linting
* execute tests
* build artifacts
* deploy

While simple, this structure hides system boundaries. Failures become harder to interpret because unrelated responsibilities share the same execution context.

In this repository, CI is instead structured around *separation of execution domains*:

* Python validation runs in its own environment
* frontend validation and build steps run in a Node environment
* quality checks are executed independently of test execution

Each job maps to a distinct runtime boundary rather than a stage in a generic pipeline.

This distinction matters because the repository itself is not uniform. The frontend and backend are not variations of a single application—they are fundamentally different execution models with different tooling, dependency graphs, and lifecycle expectations.

### The impact of repository structure

One subtle but important constraint is that the frontend exists as a fully isolated subdirectory with its own `package.json` and dependency tree.

This has concrete implications for CI design:

* dependency installation is scoped to a nested directory
* build and lint steps must execute within a specific working context
* caching must respect separate lockfiles and dependency graphs
* frontend failures must be attributable without leaking into backend execution

Rather than flattening the project structure, CI is designed to respect it. The pipeline does not try to unify execution—it reflects the actual boundaries present in the repository.

### CI as execution graph, not sequence

At this stage, CI stops behaving like a linear checklist and instead becomes an execution graph composed of independent nodes.

Each job is responsible for a bounded unit of execution:

* backend correctness (Python runtime)
* frontend correctness (Node runtime)
* shared tooling validation (formatting and linting rules)

These jobs do not exist in a shared runtime context. They execute independently, fail independently, and report independently.

This structure is what allows CI to scale with the system. As the repository grows, new responsibilities are added as new execution units rather than increasing the complexity of a single pipeline.

### The important shift

The key idea is not that CI runs more checks, but that it reflects the *actual runtime topology of the system*.

Instead of forcing a single execution model, it preserves separation where it already exists:

* different languages
* different runtimes
* different dependency graphs
* different build processes

Each is validated in isolation, then aggregated at the level of pipeline outcome.

This preserves clarity under scale. Failures remain attributable, execution remains predictable, and the structure of CI continues to mirror the structure of the system itself.