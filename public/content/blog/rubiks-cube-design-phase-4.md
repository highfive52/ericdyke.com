---
title: "Refactoring a Python Rubik’s Cube App: Phase 4"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
hidden: "true"
prev: "rubiks-cube-design-phase-3"
prev_title: "Refactoring a Python Rubik’s Cube App: Phase 3"
---

# 🧪 Phase 4 — Input System Decoupling

## Branch

`refactor/input-controller-separation`

---

## 🎯 Goal

Phase 4 separates all input logic from Ursina-specific systems and formalizes a platform-agnostic input pipeline.

After this phase:

- Ursina no longer owns input logic
- Input becomes an abstract action system
- Camera-relative movement logic becomes reusable
- The same input architecture can later support:
  - Ursina desktop app
  - Three.js browser frontend
  - AI / solver agents
  - replay systems
  - automated testing

---

## 🧠 Core Architectural Principle

Input should describe:

> "what the player intends to do"

NOT:

> "how Ursina should manipulate entities"

---

## 🔄 Target Architecture

### BEFORE (Current Hybrid State)

```
Keyboard / Mouse
    ↓
Ursina callbacks
    ↓
Renderer / entity logic
    ↓
MoveEngine
```

---

### AFTER (Phase 4 Target)

```
Keyboard / Mouse
    ↓
InputController
    ↓
MoveAction
    ↓
MoveEngine
    ↓
CubeModel
    ↓
Renderer
```

---

## 🧱 New Responsibilities

### 1. InputController (NEW)

Responsible for:

- Reading raw input
- Mapping camera-relative directions
- Translating input into abstract actions
- Managing move queues
- Emitting MoveActions

It should NOT:

- Modify CubeModel directly
- Access renderer internals
- Manipulate entities
- Perform rendering logic

---

### 2. MoveAction Layer

Introduce a formal action representation.

Example:

```python
MoveAction(face="R", direction=1)
```

This becomes the transport format between:

- InputController
- MoveEngine
- future browser frontend
- future replay systems

---

### 3. MoveEngine

MoveEngine remains authoritative for:

- move execution
- move validation
- scramble logic
- inverse move handling

InputController does NOT execute moves itself.

---

### 4. Renderer

Renderer remains passive.

It:

- observes CubeModel changes
- animates transitions
- never interprets input

---

## 🧭 Camera-Relative Input System

One of the major goals of Phase 4 is extracting the existing camera-relative mapping logic into a reusable system.

This includes:

- WASD directional mapping
- screen-space projection
- active face determination
- camera orientation interpretation

The logic should become independent of Ursina entity systems wherever possible.

---

## 🔁 Input Flow (Final Form)

```
Raw Input
    ↓
InputController
    ↓
MoveAction queue
    ↓
MoveEngine.apply()
    ↓
CubeModel updated
    ↓
Renderer animates changes
```

---

## 📁 Target File Structure

```
src/
  rubiks_cube/

    model/
      cube_model.py

    engine/
      move_engine.py
      move_definitions.py

    input/
      input_controller.py
      move_actions.py
      camera_mapping.py

    renderer/
      ursina_renderer.py
      base.py (optional)

    app/
      main.py
```

---

## 🧩 File Responsibility Breakdown

### `input/input_controller.py`

Owns:

- keyboard input handling
- mouse input handling
- move queue management
- dispatching MoveActions

---

### `input/move_actions.py`

Defines:

- MoveAction
- input event structures
- future replay-compatible action formats

---

### `input/camera_mapping.py`

Extracts:

- camera-relative axis mapping
- screen-space directional interpretation
- face projection logic

This is one of the most reusable systems for future browser support.

---

## 🚫 What MUST be removed from Ursina layer

By the end of Phase 4:

- No input interpretation inside renderer
- No move queue ownership inside renderer
- No direct keyboard logic in Ursina entities
- No camera-relative move logic in rendering classes
- No direct calls from input systems to visual entities

---

## 🎯 Success Criteria

### ✔ Functional

- Desktop app still launches with:

```bash
uv run rubiks-cube
```

- Keyboard controls still work
- Mouse interaction still works
- Camera-relative controls still behave correctly
- Cube animations still function

---

### ✔ Architectural

- InputController becomes sole input authority
- Renderer becomes input-agnostic
- MoveEngine receives abstract actions only
- Camera-relative mapping becomes reusable
- Input system becomes portable to browser frontend

---

## 🧠 Mental Model

Think of Phase 4 as:

> "Input becomes a language the engine understands."

Instead of:

> "Input directly manipulating the renderer."

---

## 🚀 Long-Term Benefit

Phase 4 is the bridge between:

- desktop-specific interaction
and
- cross-platform frontend architecture

Once complete:

- Ursina input can be replaced
- browser input can be added
- replay systems become possible
- AI/solver control becomes possible
- automated testing becomes easier

without changing engine or renderer logic.

