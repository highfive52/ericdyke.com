---
title: "Refactoring a Python Rubik’s Cube App: Phase 3"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
hidden: "true"
prev: "rubiks-cube-design-phase-2"
prev_title: "Refactoring a Python Rubik’s Cube App: Phase 2"
next: "rubiks-cube-design-phase-4"
next_title: "Refactoring a Python Rubik’s Cube App: Phase 4"
---

# 🎨 Phase 3 — Ursina Becomes a Renderer ONLY

## Branch

`refactor/ursina-renderer-decoupling`

---

## 🎯 Goal

Ursina no longer owns or mutates game state.

Instead, it becomes a **pure rendering layer** that:

- Reads `CubeModel` (authoritative state)
- Animates transitions between states
- Never directly modifies game logic or state

---

## 🔁 Core Architectural Shift

### ❌ BEFORE (Coupled System)

```
rotate_side()
  → mutates CubeModel
  → mutates Ursina entities
  → handles animation + logic together
```

---

### ✅ AFTER (Phase 3 Target)

```
model.apply_move(move)
  → updates CubeModel (authoritative state)

renderer.animate_from_model_change()
  → reads state changes
  → updates Ursina visuals only
```

---

## 🧠 Key Principle

> The model changes first. The renderer reacts second.

Ursina is no longer a source of truth — only a visualization system.

---

## 🧱 Responsibility Breakdown

### 1. CubeModel (Authoritative State)

- Stores cube state
- Applies moves
- Has no knowledge of Ursina

```python
model.apply_move(move)
```

---

### 2. MoveEngine (Pure Logic)

- Defines how moves transform state
- No rendering or entity awareness

```python
new_state = move_engine.apply(model, move)
```

---

### 3. Renderer (Ursina Layer)

- Reads CubeModel state
- Computes diffs or snapshots
- Animates visual transitions

```python
renderer.animate_from_model_change(old_state, new_state)
```

---

### 4. app/main.py (Composition Root)

- Wires systems together
- Runs update loop
- Does NOT contain game logic

```python
actions → model → renderer
```

---

## 🔄 Target Data Flow

```
Input (future phase)
    ↓
Action / Move
    ↓
CubeModel.apply_move()
    ↓
Renderer reads updated state
    ↓
Ursina animates visuals
```

---

## 📁 Target File Structure

```
src/
  rubiks_cube/

    model/
      cube_model.py          # authoritative state

    engine/
      move_engine.py         # pure transformation logic
      move_definitions.py

    renderer/
      ursina_renderer.py     # visual-only system
      base.py (optional)

    app/
      main.py                # wiring + update loop
```

---

## 🚫 What MUST NOT exist in renderer layer

- No CubeModel mutation
- No move logic
- No input handling
- No state ownership
- No rotate_side() acting as a god function

---

## 🔄 Required Refactor Transition

### Replace this pattern

```python
rotate_side(mouse.normal, direction)
```

---

### With this pattern

```python
model.apply_move(move)
renderer.sync_or_animate(model)
```

or

```python
model.apply_move(move)
renderer.animate_from_model_change(old_model, new_model)
```

---

## 🎯 Phase 3 Success Criteria

### ✔ Functional
- App still runs via `uv run rubiks-cube`
- Cube still renders correctly
- Moves still animate visually
- Mouse orbit camera still works

### ✔ Architectural
- CubeModel is fully authoritative
- MoveEngine is pure logic only
- Ursina is rendering-only
- No state mutation inside renderer

---

## 🧭 Mental Model

Ursina is now:

> 🎥 A visualization layer watching a simulation

NOT:

> 🎮 The simulation itself

---

## 🧩 Core Outcome

Phase 3 completes when:

- State lives entirely in CubeModel
- Rendering is reactive, not authoritative
- Ursina becomes replaceable without touching game logic

---

## 🚀 End State

You still have a fully working desktop app —
just with clean separation between:

- State (Model)
- Logic (Engine)
- Visualization (Renderer)
