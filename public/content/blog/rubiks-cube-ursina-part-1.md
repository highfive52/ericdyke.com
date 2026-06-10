---
title: "Building a 3D Rubik’s Cube App in Python with Ursina"
date: "2026-05-20"
tags: "Python, Ursina, 3D, Rubiks Cube, Packaging, Project Structure"
summary: "A personal and technical introduction to building a 3D Rubik’s Cube simulator in Python using the Ursina game engine. Covers the inspiration, project overview, core features, and project structure."
series: "Building a 3D Rubik’s Cube App in Python with Ursina"
hidden: "false"
series_part: "1"
next: "rubiks-cube-ursina-part-2"
next_title: "Project Setup: Modern Python Tooling with uv"

---

## Why I Learned to Solve a Rubik’s Cube

My journey with the Rubik’s Cube started in a pretty unexpected way. Back in 2017, I watched an interview with actor Chris Pratt as he promoted "Guardians of the Galaxy Vol. 2." During the interview (<a href="https://www.youtube.com/watch?v=x9RdCwptv-8" target="_blank" rel="noopener noreferrer">watch here</a>), the host discovered that Chris could solve a Rubik’s Cube and challenged him to do it live—while answering questions about filming in London and life on set. Chris Pratt solved the 3x3 cube in just 3 minutes and 40 seconds, all while chatting and only half-focused on the puzzle.

Watching that, I thought: if Chris Pratt could do it in under four minutes while distracted, maybe solving a Rubik’s Cube isn’t as impossible as it looks. It seemed like a fun challenge and a great way to exercise some problem-solving skills. That moment kicked off my own journey into learning the cube—and, eventually, building a 3D Rubik’s Cube simulator in Python.

---

One of the best ways to learn software engineering concepts is to build something interactive.

For this project, I built a 3D Rubik’s Cube simulator in Python using the Ursina game engine, a lightweight engine built on top of Panda3D. While the application itself is relatively compact, the project became an excellent opportunity to explore several important engineering topics:

* Modern Python project management with uv
* Entity lifecycle management in Ursina
* Real-time camera orientation tracking
* Input and update handling in game engines
* Packaging Python applications as standalone executables
* Building distributable Python wheels

Many of these concepts appear in larger production systems as well, especially around state management, lifecycle orchestration, packaging, and reproducible environments.

This article focuses less on the Rubik’s Cube logic itself and more on the surrounding engineering practices that make a Python project easier to develop, distribute, and maintain.

---

## Application Overview

The application combines interactive 3D rendering, camera-relative controls, and real-time telemetry into a lightweight desktop application built with Python and Ursina.


Key technical features include:

- Camera-relative cube interaction
- Animated rotational transforms
- Input queueing for safe state transitions
- Real-time camera telemetry overlays
- Mouse and keyboard interaction systems
- Packaging support through PyInstaller and Python wheels

**Source Code:** <a href="https://github.com/highfive52/rubiks-cube-ursina-3d" target="_blank" rel="noopener noreferrer">github.com/highfive52/rubiks-cube-ursina-3d</a> — Explore the full project or try the code

---

## Application Preview

<img src="/images/rubiks_cube_1.jpg" alt="3D Rubik's Cube Simulator Screenshot" style="max-width: 100%; margin-top: 1.5em; margin-bottom: 1.5em;" />

---

## Project Structure

```text
pyproject.toml
README.md
src/
  rubiks_cube/
    main.py
tests/
  test_main.py
```

## What This Series Covers

This series walks through the project from initial setup to final distribution:

1. Project overview and architecture
2. Modern Python tooling with uv
3. Building a camera tracking system with Ursina entities
4. Packaging and distributing the application

---

Before building the application itself, the first step was setting up a clean and reproducible Python development environment. In Part 2, we’ll explore how `uv` streamlines modern Python project management and why it’s become an essential tool for Python developers.