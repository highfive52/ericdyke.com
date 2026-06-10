---
title: "What Happens When Your Design is Clean, But Running the System Creates Constant Friction?"
date: "2026-06-08"
tags: "workflow, orchestration, automation, full-stack, ci-cd, python, typescript, github-actions"
series: "When the System is the Easy Part"
summary: "The journey of creating a full-stack development workflow, born from the practical need to tame a multi-service system and get back to building the actual application."
series_part: "1"
hidden: "false"
next: "full-stack-dev-workflow-part-2"
next_title: "npm as the Repository's Control Surface"
---

When developers discuss modern web applications, the conversation usually revolves around frameworks and libraries. Which frontend framework should you use? Which backend framework is fastest? Should state live in Redis or a relational database? Which build tool is the latest and greatest?

These are reasonable questions, but they often overshadow a more practical concern: how much friction exists between writing code and actually running the system.

My own path into this problem didn't start with web development. It started in data engineering, where systems tend to be batch-oriented and predictable—ETL pipelines, warehouse models, and scheduled jobs orchestrated through tools like Airflow.

Modern data platforms already decompose responsibility into distinct layers. Raw events, often originating from Kafka or operational databases, are landed into a bronze layer as Parquet or Delta Lake files. Those datasets are cleaned and deduplicated into a silver layer using tools like PySpark before being transformed into curated gold datasets for dashboards, analytics, and downstream consumers.

The elegance of that architecture lies in its separation of concerns. Each layer has a clearly defined responsibility, and data flows through the system in a controlled, predictable manner.

Eventually, however, another question emerges: **how should those curated datasets actually be consumed?**

Analysts can read Parquet files directly with DuckDB or DBeaver, but exposing storage formats, partition layouts, and file organization to consumers feels like the wrong abstraction. As systems become more interactive and more widely shared, the interface becomes just as important as the data itself.

That realization is what led me toward FastAPI—not because I wanted to build web applications, but because I wanted a cleaner way to expose Python systems to other applications.

Once that service boundary existed, the next logical step was to build an interactive client for it.

The result evolved into a multiplayer chess application consisting of a Vite/TypeScript frontend, a Python/FastAPI backend, and a Redis instance that maintains the authoritative game state for connected players.

```
               Browser
                   │
        Vite + TypeScript
                   │
      Rendering & User Input
                   │
          Socket.IO messages
                   │
              FastAPI Server
                   │
      Validation & Game Logic
                   │
             Authoritative State
                   │
                 Redis
```

The frontend is intentionally lightweight, responsible only for rendering the board and capturing user input. Every move is sent to the FastAPI backend, where the game engine validates the move, updates the game state stored in Redis, and broadcasts the result back to connected clients.

Architecturally, the responsibilities are cleanly separated. The frontend doesn't know the rules of chess, the backend doesn't care how the board is rendered, and Redis simply maintains the shared state.

From a development perspective, however, that clean architecture introduces several moving parts that must all work together. The frontend development server, the Python backend, and a Redis container all need to be running simultaneously, each with its own tooling, dependencies, and configuration.

That friction is what ultimately shaped the rest of this project.

The full source code is available here:

https://github.com/highfive52/chess-multiplayer

A live version of the application (used for testing deployments and workflow validation) is available here:

https://highfive52.github.io/chess-multiplayer/

The remainder of this article is not a tutorial on configuring any single tool. Instead, it explores how a collection of small automation decisions—using npm as a repository orchestrator, `concurrently` to launch multiple services, `pre-commit` to enforce validation contracts, and layered GitHub Actions workflows for CI and deployment—combine to create a smoother, faster, and more reliable development experience.
