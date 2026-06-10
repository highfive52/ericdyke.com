---
title: "npm as the Repository's Control Surface"
date: "2026-06-08"
tags: "npm, orchestration, monorepo, workflow, typescript, python"
series: "When the System is the Easy Part"
summary: "How the root package.json evolves from a frontend tool into a unified interface for a multi-language repository, creating a consistent entry point for all development tasks."
series_part: "2"
hidden: "true"
prev: "full-stack-dev-workflow-part-1"
prev_title: "The Problem of Friction"
next: "full-stack-dev-workflow-part-3"
next_title: "Coordinating the Local Runtime"
---

The chess application is composed of three distinct technologies, each chosen because it is well suited to a particular responsibility.

*   **Vite and TypeScript** provide the browser-based user interface.
*   **FastAPI** hosts the game engine and validates moves.
*   **Redis** maintains the authoritative game state.

Although these components execute in different runtimes and use different toolchains, they are not separate applications. Together, they form a single, cohesive system. The challenge, therefore, is not how to manage each component individually—it’s how to define a single, consistent interface for interacting with the system as a whole.

Rather than introducing another orchestration framework, I reused a tool that already existed in the project: **npm**.

In most frontend applications, `npm` is simply a package manager and script runner. In this repository, however, the root `package.json` evolves to become the **control surface for the entire repository**. It defines the entry point not just for starting the application, but for every key development task.

```json
{
  "scripts": {
    "dev": "...",
    "test": "...",
    "lint": "...",
    "build": "..."
  }
}
```

This collection of scripts establishes a **contract** for the repository. Any developer, regardless of their familiarity with the project, can look at this file and understand how to run, test, and validate the system. The `package.json` becomes the official documentation for the repository's lifecycle.

The important idea is not that `npm` can run scripts—many tools can do that. The important idea is that the repository now exposes a **single, consistent interface** that works across different languages and runtimes.

### Why npm?

Using `npm` as the orchestration layer offers several practical advantages.

*   It already exists as part of the frontend toolchain.
*   It works consistently across operating systems.
*   It provides a familiar interface through `npm run <task>`.
*   It avoids introducing yet another task runner that contributors must learn.

Most importantly, it centralizes the operational knowledge of the project in one place. The repository itself documents how the system is intended to be executed, validated, and built.

### The Control Surface vs. The Application

This distinction becomes clearer when you compare the root `package.json` to the one inside the `frontend/` directory:

```json
// frontend/package.json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src",
    "preview": "vite preview"
  },
  // ...dependencies
}
```

The frontend's `package.json` is completely standard. Its scripts (`vite`, `tsc`, `eslint`) and dependencies are all focused on a single responsibility: building, linting, and serving a TypeScript application. Its scope is local.

In contrast, the root `package.json` operates at a higher level of abstraction. Its `dev` script doesn't know or care about Vite or TypeScript; it only knows that it needs to orchestrate three independent processes: a Docker container, a Python server, and a Node.js development server.

This separation is key. The root `package.json` has been elevated from a simple package manifest to a true **system-level control surface**.

### A Deliberate Runtime Split

One aspect of this architecture that I particularly like is that each runtime is responsible only for what it needs to do.

*   The **frontend** runs natively on Node through Vite with no containerization required.
*   The **backend** runs inside its own isolated Python virtual environment.
*   **Redis** is the only infrastructure component managed through Docker.

This creates a practical balance between native development speed and reproducible infrastructure. Developers only need Node.js, Python, and Docker installed locally; everything else is coordinated through the scripts in `package.json`.

That shift in perspective—from a frontend configuration file to the repository's primary interface—is a recurring theme. As the application evolved into a composition of specialized technologies, the development workflow evolved into a composition of specialized orchestration, with each layer coordinating a different aspect of the system while presenting a simple, consistent interface to the developer.
