---
title: "Coordinating the Local Runtime"
date: "2026-06-08"
tags: "concurrently, npm, workflow, local-development, orchestration"
series: "When the System is the Easy Part"
summary: "How `concurrently` solves the practical problem of running a multi-service application locally, transforming a collection of independent processes into a single, manageable runtime."
series_part: "3"
hidden: "true"
prev: "full-stack-dev-workflow-part-2"
prev_title: "npm as the Repository's Control Surface"
next: "full-stack-dev-workflow-part-4"
next_title: "The Local Validation Boundary"
---

While the root `package.json` defines a clean interface for the repository, it doesn't solve the practical problem of execution. To work on the application, all three components need to be running at the same time:

*   The Vite development server for the frontend.
*   The Python/FastAPI backend for game logic.
*   A Redis instance for shared state.

None of these are complex to start individually, but they only become a functional system when running together. In practice, this meant working across multiple terminals: one for Redis, one for the backend (with a virtual environment activated), and one for the frontend.

Each part runs independently, but none of them are useful in isolation. This creates a subtle but constant source of friction: not complexity in any single component, but **coordination across them**. The real issue wasn’t building the system—it was repeatedly *assembling* the system just to work on it.

The `npm run dev` script, defined as the entry point in Part 2, needed a way to manage this assembly. That responsibility is handled by **`concurrently`**.

Instead of manually managing multiple terminals, `concurrently` allows all processes to be launched and monitored together from a single command in `package.json`.

```json
{
  "scripts": {
    "dev": "concurrently --kill-others -n \"redis,backend,frontend\" -c \"bgRed,bgBlue,bgGreen\" \"docker run --rm --name chess-redis -p 6379:6379 redis:alpine\" \"backend\\.venv\\Scripts\\python -m uvicorn backend.main:asgi_app --reload --port 8000\" \"npm run dev --prefix frontend\""
  }
}
```

This single line orchestrates the entire local runtime by executing three commands in parallel:

1.  **`docker run ... redis:alpine`**: Starts a Redis container using the official Alpine image, exposing it on the standard port `6379`. The `--rm` flag ensures the container is removed when stopped, preventing clutter.
2.  **`backend\\.venv\\Scripts\\python -m uvicorn ...`**: Launches the FastAPI backend using the Python executable inside the project's virtual environment (`.venv`). `uvicorn` is the ASGI server that runs the application, and `--reload` automatically restarts the server when code changes are detected.
3.  **`npm run dev --prefix frontend`**: Navigates into the `frontend` directory and runs its `dev` script, which in turn starts the Vite development server.

The `concurrently` flags tie everything together:

*   **`--kill-others`**: If one process exits or is stopped (e.g., you stop the frontend with `Ctrl+C`), `concurrently` automatically terminates the other processes. This is crucial for ensuring a clean shutdown.
*   **`-n "redis,backend,frontend"`**: Assigns clear names to the output of each process.
*   **`-c "bgRed,bgBlue,bgGreen"`**: Assigns distinct background colors to the logs from each process, making it easy to distinguish between the firehose of logs from the frontend, backend, and Redis.

The important shift is not that the system became simpler—it didn’t. The shift is that **the coordination of the system is now automated and centralized in the repository.**

From a development perspective, the workflow moves from:

> “Assemble the application before you can work on it.”

to:

> “Run the application as a single unit and focus on behavior.”

This is where the workflow begins to feel cohesive. The abstract contract defined in `package.json` is now backed by a concrete implementation that makes the entire system feel like a single, unified application.

