---
title: "Packaging and Distributing the Rubik’s Cube App"
date: "2026-05-20"
tags: "Python, Ursina, 3D, Rubiks-Cube, Packaging, PyInstaller, Wheel"
summary: "How to package and distribute a 3D Rubik’s Cube app built with Ursina. Covers PyInstaller for executables, wheel building for Python ecosystems, and why multi-format distribution matters."
series: "Building a 3D Rubik’s Cube App in Python with Ursina"
series_part: "4"
hidden: "true"
prev: "rubiks-cube-ursina-part-3"
prev_title: "CameraTracker, Entity Design, and Controls"
---

## Packaging and Distribution Overview

With the application working locally, the next step is making it distributable for both end users and developers. Python applications are typically shipped as either a standalone executable or a Python wheel—each format solves a different problem.

* Executable: Focuses on usability for end users (no Python install required)
* Wheel: Focuses on integration and reuse for developers and tooling

---

## Packaging the Application as an Executable with PyInstaller

The first distribution target was a standalone desktop executable. Many users do not want to install Python, manage environments, or run applications through a terminal. PyInstaller solves this by bundling everything required to run the application into a single package, including:

* The Python interpreter
* Project dependencies
* Compiled extensions
* Application source code
* Runtime assets

---

## Why Ursina Applications Require Extra Packaging Work

Packaging a game engine application is more complex than packaging a typical script. Ursina (built on Panda3D) relies on native binaries and external assets such as rendering DLLs, fonts, textures, models, and engine configuration files. PyInstaller does not automatically detect all of these dependencies, so they must be explicitly included in the build configuration.

---

## PyInstaller Build Configuration

The build command used for this project explicitly includes both Ursina and Panda3D runtime dependencies:

```shell
pyinstaller --add-data=".venv/Lib/site-packages/panda3d/etc;panda3d/etc" \
            --add-binary=".venv/Lib/site-packages/panda3d/libpandagl.dll;panda3d" \
            --add-binary=".venv/Lib/site-packages/panda3d/libp3windisplay.dll;panda3d" \
            --add-data=".venv/Lib/site-packages/ursina/models_compressed;ursina/models_compressed" \
            --add-data=".venv/Lib/site-packages/ursina/fonts;ursina/fonts" \
            --add-data=".venv/Lib/site-packages/ursina/textures;ursina/textures" \
            --add-data="src/rubiks_cube;rubiks_cube" \
            src/rubiks_cube/main.py
```

Each category of asset plays a specific role in runtime execution:

| Component             | Purpose                       |
| --------------------- | ----------------------------- |
| Panda3D configuration | Engine runtime setup          |
| Panda3D DLLs          | Rendering and display backend |
| Ursina models         | Built-in geometry assets      |
| Ursina fonts          | UI text rendering             |
| Ursina textures       | Material and surface assets   |
| Project source code   | Application logic             |

Without these additions, the executable may fail at startup or render incorrectly.

---

## Why Executable Distribution Matters

Building an executable significantly changes how the application is consumed. It enables:

* Running without installing Python
* Eliminating dependency setup
* Easier sharing for non-developers
* More professional portfolio presentation
* Simple double-click execution on desktop systems

This format is primarily about accessibility and user experience.

---

## Packaging the Application as a Python Wheel

The second distribution format is a Python wheel. Unlike an executable, a wheel is designed for Python ecosystems. It allows the application to be installed, imported, and executed like any other Python package. This is the format used for:

* Internal tooling
* Reusable libraries
* PyPI distribution
* Dependency-managed environments

---

## Building the Wheel

The package can be built using:

```shell
python -m build
```

This produces a source distribution (.tar.gz) and a wheel (.whl) inside the dist/ directory.

---

## Installing the Wheel Locally

Once built, the wheel can be installed in a fresh environment:

```shell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install rubiks_cube-0.1.0-py3-none-any.whl
```

After installation, the application behaves like a standard Python package and can be executed through its defined entry points.

---

## Why Wheel Packaging Matters

Wheel packaging turns the project from an application into a distributable software artifact. It enables:

* Clean installation via pip
* Internal distribution across teams
* Future PyPI publishing
* Dependency-managed reproducibility
* Integration into larger Python systems

This is the format that aligns the project with professional Python packaging standards.

---

## Publishing to PyPI

Once a wheel is built, it can be published using Twine:

```shell
python -m twine upload dist/*
```

After publishing, users can install the application directly:

```shell
pip install rubiks-cube
```

This removes all local setup friction and turns the project into a globally installable tool.

---

## Closing Perspective

This project started as a simple 3D Rubik’s Cube simulation, but it naturally expanded into a full exploration of Python engineering practices. Along the way, it covered:

* Modern dependency and environment management with uv
* Entity lifecycle behavior in Ursina
* Real-time input and camera tracking systems
* State management for animated 3D systems
* Multi-format packaging strategies using PyInstaller and wheels

The focus of this series is less about the puzzle itself and more about the engineering systems that surround it—patterns that appear in production Python applications, just expressed at a smaller and more visual scale.