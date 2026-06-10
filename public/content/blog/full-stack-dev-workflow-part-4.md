---
title: "The Local Validation Boundary"
date: "2026-06-08"
tags: "pre-commit, linting, testing, quality, workflow, automation"
series: "When the System is the Easy Part"
summary: "Establishes a local validation boundary using `pre-commit` to enforce code quality and correctness across different languages before code ever leaves the developer's machine."
series_part: "4"
hidden: "true"
prev: "full-stack-dev-workflow-part-3"
prev_title: "Coordinating the Local Runtime"
next: "full-stack-dev-workflow-part-5"
next_title: "CI as Isolated Reconstruction"
---

Once the system can be started with a single command, the next problem becomes less about execution and more about stability: how do you prevent invalid changes from entering the system in the first place?

At this point, the repository already behaves as a cohesive runtime environment. One command starts the full stack, and multiple services work together as a single application. But that also means the cost of small mistakes increases. A broken type check, a missed formatter run, or a backend linting error no longer sits in isolation—they affect a system that is expected to remain consistently runnable.

In earlier workflows, these issues would typically surface later in CI or during manual testing. The downside is latency: the feedback loop is separated from the moment the mistake is introduced.

This is where **pre-commit** becomes useful—not as a convenience layer, but as a structural boundary in the development process.

Instead of treating linting, formatting, and basic validation as a remote step, the repository enforces them at the point of commit, before code ever leaves the development environment.

The `.pre-commit-config.yaml` defines this boundary explicitly:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.9.0
    hooks:
      - id: ruff
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.1.0
    hooks:
      - id: prettier

  - repo: local
    hooks:
      - id: pytest
        entry: pytest -q
        pass_filenames: false
```

At first glance, this is just a collection of linters and formatters across Python and TypeScript. In practice, it defines a **single validation contract applied across two different ecosystems**.

That integration is where the real complexity lives. The backend uses Python tooling (Ruff and pytest) with its own conventions. The frontend uses ESLint and Prettier with a completely different model of correctness. Left separate, each ecosystem is straightforward. The challenge is ensuring they are enforced together, at the same point in the workflow.

Pre-commit solves this by becoming the shared execution boundary.

Every commit now passes through the same validation sequence:

* Python code is linted and formatted via Ruff
* Frontend code is formatted via Prettier
* TypeScript correctness is enforced via ESLint
* Backend behavior is validated through pytest

The important shift is not the tools themselves, but *when they run*. Validation is no longer something that happens “after the fact” in CI. It becomes part of the act of committing code.

This changes the development loop. Feedback is immediate, local, and tightly coupled to the change being made.

There is also a structural benefit: pre-commit aligns multiple toolchains under a single lifecycle step. Instead of Python and TypeScript each having their own separate quality gates, they now share a single enforcement point.

CI is no longer responsible for discovering basic issues—it becomes a verification layer for rules that already executed locally.

This continues the pattern established earlier in the repository:

* npm defines the interface to the system
* concurrently defines execution of the system
* pre-commit defines the local validation boundary

Each layer reduces uncertainty earlier in the lifecycle, before changes propagate further into the system.