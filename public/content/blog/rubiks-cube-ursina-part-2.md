---
title: "Project Setup: Modern Python Tooling with uv"
date: "2026-05-20"
tags: "Python, Ursina, 3D, Rubiks-Cube, uv, Project Setup, Packaging"
summary: "How to set up a modern Python project for a 3D Rubik’s Cube simulator using uv. Covers environment management, project scaffolding, dependency installation, and why uv is a game-changer for Python development."
series: "Building a 3D Rubik’s Cube App in Python with Ursina"
series_part: "2"
hidden: "true"
prev: "rubiks-cube-ursina-part-1"
prev_title: "Building a 3D Rubik’s Cube App in Python with Ursina"
next: "rubiks-cube-ursina-part-3"
next_title: "CameraTracker, Entity Design, and Controls"
---

## Project Setup with uv

Setting up a Python project used to be tedious, but modern tools like uv make it fast and reproducible. Here’s how uv simplifies environment management, dependency installation, project scaffolding, and development workflows for the Rubik’s Cube Ursina app.

---

## Installing uv

uv can be installed several different ways.

### PowerShell Installation (Recommended on Windows)

```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Alternative pip Installation

```shell
pip install uv
```

## uv Overview

| Command                  | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `uv init <project-name>` | Creates a new boilerplate Python project.               |
| `uv add <package>`       | Installs a package and adds it to `pyproject.toml`.     |
| `uv remove <package>`    | Uninstalls a package.                                   |
| `uv run <script.py>`     | Runs a script inside the project's virtual environment. |
| `uv sync`                | Syncs the virtual environment with the `uv.lock` file.  |

---

## Why Choose uv?

Python development has traditionally involved several separate tools:

* `python -m venv` for virtual environments
* `pip` for dependency installation
* `requirements.txt` for dependency management
* Additional tools for locking dependencies and package building

Recently, tools like uv have dramatically simplified this workflow. uv is a fast Python package manager and environment tool written in Rust by Astral. It combines several common Python development workflows into a single streamlined tool.

---

## Creating the Project

The initial project structure was created using uv and a standard Python package layout.

First, I initialized the project:

```shell
uv init --package --python 3.12 rubiks-cube-ursina-3d
```

This command includes two important flags:

* `--package` tells uv to scaffold the project as an installable Python package (using a proper src/ layout and packaging metadata rather than a loose script-based structure)
* `--python 3.12` pins the project to Python 3.12, ensuring a consistent interpreter version across environments and making the project more reproducible

uv automatically generated the initial project structure:

```text
rubiks-cube-ursina-3d/
├── src/
│   └── rubiks_cube/
│       └── __init__.py
├── .git/
├── .gitignore
├── .python-version
├── pyproject.toml
├── README.md
```

This provided several important pieces immediately:

* `pyproject.toml` for package metadata and dependency management
* A modern `src/`-based package layout
* Python version management through `.python-version`
* A Git repository initialized automatically (`.git/`), making the project version-control ready from the start
* A clean starting point for packaging and distribution

## Creating a Main Entry Point

After initializing the project, the next step is to create a simple entry point for the application.

Create:

```text
src/rubiks_cube/main.py
```

define a basic function:

```python
def main():
    print("Hello from the Rubik's Cube app!")
```

This follows the standard Python packaging pattern of defining execution through functions rather than top-level script execution.

You may also optionally include a direct execution guard for local testing:

```python
if __name__ == "__main__":
    main()
```

### Defining How uv Runs the Application

One of the most powerful features of modern Python packaging is defining entry points directly in pyproject.toml.

At the bottom of your pyproject.toml, uv creates or supports a [project.scripts] section. You can map a command-line name directly to your Python function:

```toml
[project.scripts]
rubiks-cube = "rubiks_cube.main:main"
```

---

### What This Does

This configuration tells uv (and Python packaging tools):

* `rubiks-cube` becomes a command-line command
* It executes the `main()` function inside rubiks_cube/main.py
* The project can now be run like a real installed application

Instead of manually running:

```shell
python src/rubiks_cube/main.py
```

or managing environment activation, you can simply run the application through uv without activating the environment manually:

```shell
uv run rubiks-cube
```

---

### Why This Matters

This step is where the project stops being “a script in a folder” and becomes a real installable application. It enables:

* Clean command-line execution
* Proper package-based structure
* Future PyPI distribution
* Consistent behavior across environments

---

## Adding Packages

After creating the project, I added the primary dependencies:

```shell
uv add ursina
uv add pytest --dev
```

Using uv keeps dependency installation, environment management, and project configuration centralized in a single workflow.

---

## Understanding pyproject.toml

Modern Python tooling increasingly centers around pyproject.toml as the standard configuration file for Python projects. Rather than relying on manually maintained `requirements.txt` files, dependencies and project metadata can be centralized into a single modern configuration file.

This allows tools like uv to manage:

* Runtime dependencies
* Development dependencies
* Build system configuration
* Project metadata
* Package entry points

A simplified example looks like this:

```toml
[project]
name = "rubiks-cube"
version = "0.1.0"
description = "3D Rubik's Cube simulator built with Ursina"

dependencies = [
    "ursina"
]

[dependency-groups]
dev = [
    "pytest"
]
```

Using pyproject.toml creates a cleaner and more standardized workflow that aligns well with modern Python packaging and distribution practices. This becomes especially useful later when building wheels and distributing the application.

---

## Benefits of uv

### Extremely Fast Dependency Resolution

One of the biggest advantages of uv is speed. Dependency installation and environment setup are significantly faster than traditional pip workflows because uv uses a high-performance dependency resolver and parallelized operations. For larger projects, this difference becomes very noticeable.

---

### Simplified Environment Management

Instead of manually creating and activating environments:

```shell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

I can simply run:

```shell
uv sync
```

or:

```shell
uv pip install .
```

This reduces setup friction considerably. One subtle but powerful benefit of uv is that commands run in the correct environment automatically, without requiring manual virtual environment activation. Over time, this removes a surprising amount of workflow friction during development.

---

### Better Project Reproducibility

uv works cleanly with modern Python packaging standards using pyproject.toml. This helps make projects:

* Easier to reproduce
* Easier to distribute
* Easier to onboard contributors into
* More aligned with modern Python tooling

---

### Running the Application

Once dependencies are installed, the application can be launched directly through uv:

```shell
uv run rubiks-cube
```

This automatically uses the project environment without manually activating a virtual environment first. That small quality-of-life improvement becomes surprisingly useful during active development.

---

With the project environment configured and dependencies managed through uv, the next step was building the application architecture itself.

In Part 3, we’ll look at how Ursina’s entity lifecycle works and why the CameraTracker class needed to exist at the global module level for update() and input() handling to function correctly.