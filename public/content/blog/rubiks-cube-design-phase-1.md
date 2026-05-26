---
title: "Refactoring a Python Rubik’s Cube App: Phase 1"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
hidden: "true"
prev: "rubiks-cube-architecture-refactor"
prev_title: "Refactoring a Python Rubik’s Cube App: Decoupling Ursina From Game State"
next: "rubiks-cube-design-phase-2"
next_title: "Refactoring a Python Rubik’s Cube App: Phase 2"
---

# Phase 1 — Extract CubeModel (Ursina → Engine Separation)

## Goal

Introduce a **CubeModel** as a logical representation of the cube state while keeping Ursina as the renderer.

We are NOT changing gameplay yet — only duplicating state into a model layer.

---

## 🧱 Step 1 — Create `cube_model.py`

```python
class CubeModel:
    def __init__(self):
        self.cubes = self._init_solved_state()

    def _init_solved_state(self):
        cubes = {}
        for x in range(3):
            for y in range(3):
                for z in range(3):
                    cubes[(x, y, z)] = {
                        "pos": (x, y, z),
                        "rot": (0, 0, 0)
                    }
        return cubes

    def apply_move(self, move):
        # Phase 2 will implement real cube logic
        pass

    def is_solved(self):
        return all(
            data["rot"] == (0, 0, 0)
            for data in self.cubes.values()
        )
```

---

## 🔌 Step 2 — Add CubeModel to main app

```python
from cube_model import CubeModel

cube_model = CubeModel()
```

---

## 🔁 Step 3 — Add sync function (temporary bridge)

```python
def sync_model_from_entities(model, cube_entities):
    for e in cube_entities:
        model.cubes[(int(e.x), int(e.y), int(e.z))] = {
            "pos": (e.x, e.y, e.z),
            "rot": e.world_rotation
        }
```

---

## 🔗 Step 4 — Call sync after moves

At the end of `rotate_side()`:

```python
sync_model_from_entities(cube_model, cube_entities)
```

---

## 🧪 Step 5 — Replace win condition

Replace:

```python
if {e.world_rotation for e in cube_entities} == {Vec3(0, 0, 0)}:
```

With:

```python
if cube_model.is_solved():
```

---

## ⚠️ Rules for Phase 1

### DO:

- Keep Ursina logic unchanged
- Duplicate state into CubeModel
- Replace win condition only

### DO NOT:

- Remove cube_entities
- Implement real cube math yet
- Change rotation system
- Replace rendering logic

---

## 🧭 Final Architecture (Phase 1)

```
INPUT
  ↓
rotate_side()
  ↓
cube_entities (visual truth)
  ↓
sync_model_from_entities()
  ↓
CubeModel (logical mirror)
```

---

## 🎯 Success Criteria

- ✅ Cube behaves exactly the same
- ✅ CubeModel exists and mirrors state
- ✅ Win condition uses CubeModel 
- ✅ No gameplay changes
