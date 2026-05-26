---
title: "Refactoring a Python Rubik’s Cube App: Phase 2"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
hidden: "true"
prev: "rubiks-cube-design-phase-1"
prev_title: "Refactoring a Python Rubik’s Cube App: Phase 1"
next: "rubiks-cube-design-phase-3"
next_title: "Refactoring a Python Rubik’s Cube App: Phase 3"
---

# 🔁 Phase 2 — Move Engine Layer

## Branch

`refactor/move-engine-separation`

---

## 🎯 Goal

Phase 2 centralizes all cube manipulation logic into a single, authoritative layer: the **Move Engine**.

This phase is about removing scattered movement logic from input and renderer code and consolidating it into a dedicated system.

---

## 🧱 What is being centralized

The Move Engine becomes the single source of truth for:

* Move definitions (U, D, L, R, F, B)
* Face rotations (clockwise / counter-clockwise)
* Inverse moves
* Move parsing / resolution
* Scramble logic
* Move queue execution (if present in current system)

---

## 📁 Phase 2 — Target File Structure
```
src/
  rubiks_cube/

    model/
      cube_model.py          # authoritative cube state (no logic changes)

    engine/
      move_engine.py         # NEW: all move logic centralized here
      move_definitions.py    # NEW: U/D/L/R/F/B definitions, inverses, etc.
      face_selector.py       # optional (only if already partially introduced)

    renderer/
      (UNCHANGED)
      # Ursina rendering still owns visuals in main or existing files

    app/
      main.py                # still wires input → engine → model → renderer
```

---

## 🔄 Target Architecture

### Phase 2 output flow:

```
Input → MoveEngine → CubeModel
```

---

## 🚫 Important Constraint

> No rendering logic is involved in MoveEngine.

The MoveEngine must be:

* Pure logic
* Deterministic
* Independent of Ursina or any visual system

It must NOT:

* Modify or reference entities
* Handle animation
* Handle camera or input state

---

## 🧠 Responsibilities by Layer

### 1. Input Layer

* Captures user intent (keyboard, mouse, etc.)
* Converts input into abstract move requests

Example:

```
"W key" → Move(U)
"R key" → Move(R')
```

---

### 2. MoveEngine (NEW CORE LAYER)

Responsible for:

* Validating moves
* Applying rotations to CubeModel
* Resolving inverse moves
* Handling scramble generation
* Managing move queues (if applicable)

Example:

```python
move_engine.apply(Move("U"))
```

---

### 3. CubeModel

* Stores authoritative cube state
* Receives updates from MoveEngine
* Contains no logic for rendering or input

---

### 4. Renderer (unchanged in Phase 2)

* Reads CubeModel state
* Updates visuals accordingly
* Does NOT receive direct move commands

---

## 🔁 Correct Flow (End of Phase 2)

```
Input
  ↓
MoveEngine
  ↓
CubeModel
  ↓
Renderer (existing system)
```

---

## ❌ What Phase 2 removes

* Move logic inside input handlers
* Move logic inside renderer code
* Direct CubeModel mutations from UI code
* Scattered rotation functions

---

## ✅ What Phase 2 enforces

* One centralized move system (MoveEngine)
* CubeModel becomes passive state storage
* Input becomes declarative (requests moves, not executes them)
* Renderer remains untouched during this phase

---

## 🧩 Success Criteria

At the end of Phase 2:

* All cube moves go through MoveEngine
* CubeModel is only modified by MoveEngine
* Scramble logic is centralized
* Move definitions are unified
* The app still runs exactly as before visually

---

## 🎮 Key Principle

> Phase 2 is about unifying logic — not changing behavior.

The user experience must remain identical, but internally all movement logic is now centralized.

---

## 🚀 Outcome

A clean separation is achieved:

* Input defines intent
* MoveEngine executes logic
* CubeModel stores state
* Renderer displays state

---

## 🧭 Mental Model

Think of Phase 2 as:

> "We are cleaning up how moves happen — not changing what the app does."


## 🧭 Coordinate system

The codebase uses a simple 3×3×3 integer coordinate grid for the model and renderer.

- Coordinate range: each axis uses values -1, 0, 1 (3 positions per axis).
- Axis → face mapping (as used by the renderer in `app/main.py`):

  - `(+1,  0,  0)` → Right
  - `(-1,  0,  0)` → Left
  - `( 0, +1,  0)` → Top
  - `( 0, -1,  0)` → Bottom
  - `( 0,  0, +1)` → Back
  - `( 0,  0, -1)` → Front

This mapping is defined in `app/main.py` as `FACE_MAPPINGS` and should be considered canonical for Phase 2. All `affected` coordinate lists returned by `MoveEngine.apply()` must use these model coordinates.

Example: a clockwise `R` move (right face) should return `affected` coordinates where `x == 1` (i.e. all `(1, y, z)` for y,z in -1..1).

---

## 🛠️ API (recommended)

Define a small, well-documented surface for the engine so callers know exactly
what to expect. Example recommendations:

```python
from dataclasses import dataclass
from typing import Tuple, List

@dataclass(frozen=True)
class Move:
    notation: str           # e.g. "R", "R'", "U2"
    axis: str               # 'x' | 'y' | 'z'
    layer: int              # -1 | 0 | 1 (or 0..2 depending on coord scheme)
    direction: int          # 1 or -1

class MoveEngine:
    def apply(self, move: Move) -> dict:
        """Apply a move to the authoritative CubeModel.

        Side effects:
          - Mutates the provided CubeModel in-place.

        Returns a dict containing metadata useful for renderers/animation:
          {
            'move': Move,                      # canonicalized move object
            'affected': List[Tuple[int,int,int]],
            'meta': {'duration_hint': float}
          }
        """

```

Notes:
- `apply()` should be deterministic and raise a clear exception for invalid input.
- Keep return values minimal: only what the renderer needs to animate.


## ⚙️ `apply()` semantics (atomicity, sync, errors)

The engine's `apply()` method is the canonical way to mutate `CubeModel`. The
following semantics should be documented and implemented consistently:

- Synchronous & blocking: `apply()` performs all necessary computation and
  mutates `CubeModel` before returning. Callers can rely on `CubeModel` being
  updated once `apply()` returns.
- Atomic: `apply()` must be all-or-nothing. If an error occurs during
  computation, the `CubeModel` must remain unchanged. Implement this by
  computing the new state or list of cubie updates first, validating them,
  and applying them in a single step.
- Return value: a minimal metadata dict documenting the canonicalized move and
  affected coordinates:

  ```py
  {
    'move': Move,
    'affected': List[Tuple[int,int,int]],  # model coordinates
    'meta': {'duration_hint': float}
  }
  ```

- Exceptions and error types:
  - `InvalidMoveError(ValueError)`: malformed notation or unsupported move.
  - `MoveConflictError(RuntimeError)`: concurrent/conflicting requests (if
    concurrency is supported later).
  - `MoveApplicationError(RuntimeError)`: unexpected failures during
    application.

  Callers should treat `InvalidMoveError` as a recoverable/no-op (e.g. UI can
  ignore it). Other exceptions should be surfaced to higher-level error
  handlers or logged for diagnostics.

- Concurrency: assume single-threaded operation initially. If multi-threading
  is introduced, protect `apply()` with a lock and define `MoveConflictError`
  semantics for conflicting updates.

- Side effects: `apply()` must not touch rendering entities, animation, or
  input state. Sequencing and animation locking are the renderer/controller's
  responsibility.

Example test cases to validate semantics:

- `test_apply_R_affects_right_face()` — applying `R` on a solved cube returns
  `affected` coords where `x == 1` and updates `CubeModel` accordingly.
- `test_invalid_move_raises_InvalidMoveError()` — malformed notation raises.
- `test_apply_is_atomic_on_error()` — inject a failure during compute and
  assert the model remains unchanged.


## 🧭 Migration checklist (practical steps)

1. Add `move_definitions.py` and `move_engine.py` in `src/rubiks_cube/engine/`.
2. Replace inline rotation logic in renderer/input code with calls to `move_engine.apply()`.
   - Example: `move_engine.apply(Move('R'))` instead of `rotate_side(normal)`.
3. Make `CubeModel` authoritative: ensure only `MoveEngine` calls `CubeModel.apply_move()`.
4. Add an `InputHandler` that maps raw inputs to `(Move, direction, tracker)` actions.
5. Centralize update loop in `app/main.py`:

```python
# per-frame (Ursina) update
actions = input_handler.poll()
controller.process_actions(actions)
# renderer reads CubeModel state and updates visuals
apply_model_to_entities(cube_model, entities, ...)
```

6. Keep animation/visual locking in the renderer only; the engine must not perform any animation.


## ✅ Tests to add

- Unit tests for `move_definitions`: parsing, canonicalization, inverses.
- Unit tests for `MoveEngine.apply()`:
  - Idempotence where applicable
  - Correct `affected` list for canonical moves
  - Proper mutation of `CubeModel`
- Integration test verifying the input→engine→model→renderer pipeline remains functional


## 🔗 References

- Engine code: `src/rubiks_cube/engine/move_engine.py`
- Move defs: `src/rubiks_cube/engine/move_definitions.py`
- Model: `src/rubiks_cube/model/cube_model.py`
- Main wiring: `src/rubiks_cube/app/main.py`


## ✅ Outcome (clarified)

When Phase 2 is complete:

- All movement logic will be centralized in `MoveEngine`.
- Callers will treat movement as a pure request; rendering will be passive.
- Visual behavior will remain identical; internal structure will be cleaner and testable.

