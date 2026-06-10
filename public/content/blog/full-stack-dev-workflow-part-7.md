---
title: "Deployment as Artifact Publication"
date: "2026-06-08"
tags: "deployment, github-pages, ci-cd, automation, workflow"
series: "When the System is the Easy Part"
summary: "Frames deployment as the final, simple act of publishing a pre-validated, static build artifact, separating the concern of *publishing* from the concern of *validation*."
series_part: "7"
hidden: "true"
prev: "full-stack-dev-workflow-part-6"
prev_title: "CI as an Execution Graph"
next: "full-stack-dev-workflow-part-8"
next_title: "A Single, Coordinated Workflow"
---

Once validation is consistently enforced across local development and continuous integration, deployment becomes a simpler problem than it initially appears.

The key shift is conceptual: deployment is not another layer of validation. It is the point where validation is no longer relevant.

At this stage, correctness has already been established through local checks and CI. What remains is not execution, but publication.

In this project, deployment is intentionally separated from CI. CI is responsible for determining whether the system is valid. Deployment is responsible only for publishing a build that has already been validated.

This separation is what keeps the system predictable.

---

### The frontend build as the final artifact

The only output required for deployment is the frontend build directory:

```text
frontend/dist
```

This directory represents the final compiled form of the Vite + TypeScript application. It is no longer part of the development system—it is the static result of that system having executed successfully.

It exists only because all previous layers have already succeeded:

* code has passed linting and formatting checks
* backend behavior has been validated through tests
* frontend code has been type-checked and built successfully
* CI has confirmed the system executes consistently in isolation

At this point, the output is not evolving code. It is a frozen artifact.

---

### GitHub Pages as a publishing mechanism

The deployment workflow reflects this shift in responsibility. It does not re-validate or re-run CI. It does not reason about correctness. It only publishes an already-produced artifact.

Its responsibilities are deliberately narrow:

* check out the repository
* build the frontend application
* upload the `dist/` directory
* publish it to GitHub Pages

```yaml
- name: Install and Build Frontend
  working-directory: ./frontend
  run: |
    npm ci
    npm run build
```

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: './frontend/dist'
```

There is no branching logic, no testing, and no cross-runtime coordination. Deployment assumes correctness has already been resolved earlier in the system.

---

### Why deployment must remain separate

Merging deployment with CI often appears convenient, but it blends two fundamentally different concerns:

* CI determines whether the system is valid
* deployment publishes the result of that decision

Keeping them separate ensures that:

* validation remains focused on correctness
* deployment remains deterministic and repeatable
* failures in one stage do not affect the responsibilities of the other

In this architecture, CI is a gate. Deployment is what happens only after that gate has been passed.

---

### The system in its final form

At this point, the architecture is no longer a set of tools—it is a progression of reduction steps:

* npm defines how the system is accessed
* concurrently defines how the system is executed locally
* pre-commit enforces correctness at the moment of change
* CI verifies the system in isolation
* deployment publishes only the final artifact

Each stage removes a class of uncertainty until only one thing remains: a build that can be safely published.

---

### Closing the loop

The result is not a complex deployment system, but the opposite. Complexity is gradually eliminated as the system moves forward.

By the time deployment occurs, there is no decision left to make—only a validated artifact left to publish.