---
title: "Refactoring a Python Rubik’s Cube App: Overall Design"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
hidden: "true"
prev: "rubiks-cube-architecture-refactor#appendix"
prev_title: "Refactoring a Python Rubik’s Cube App: Decoupling Ursina From Game State"
next: "rubiks-cube-design-phase-1"
next_title: "Refactoring a Python Rubik’s Cube App: Phase 1"
---

# Rubiks Cube Next steps

## Option 2 — Rewrite Rendering Layer for Browser (Best Long-Term)

This is probably the best engineering path if you truly want:

* browser deployment
* mobile support
* shareable URL
* smoother performance
* future extensibility

Keep:

* cube state logic
* move queue
* camera-relative mapping
* scramble logic
* solver logic (future)
* turn definitions

Replace:

* Ursina rendering/input layer

with:

* Three.js
* or Babylon.js

This becomes:

* Python backend logic (optional)
* JS/WebGL frontend
* MUCH easier browser deployment

Your architecture is actually already halfway there because your cube behavior is mostly separated from rendering.

That separation is extremely valuable.

You could evolve toward:

```
cube_model.py          <- pure cube logic
move_engine.py         <- turns / queue
renderer_browser.js    <- Three.js visuals
input_mapper.js        <- camera-relative controls
```

That’s the cleanest future-proof architecture.

----

## Future Steps and Work Effort

| Phase                                     | Difficulty  | Estimated Effort |
| ----------------------------------------- | ----------- | ---------------- |
| Extract cube model from Ursina            | Medium      | 1–3 days         |
| Build proper move engine                  | Medium      | 2–5 days         |
| Refactor Ursina renderer to consume model | Medium      | 2–4 days         |
| Port renderer to Three.js                 | Hard        | 1–3 weeks        |
| Browser polish/mobile/input               | Medium-Hard | 1–2 weeks        |


----

### What Phase 1 Looks Like

#### CURRENT

Right now your code does this:

```Python
e.x > 0
rotation_helper.animate(...)
```

The cube pieces themselves ARE the source of truth.

#### TARGET ARCHITECTURE

You want:

```
cube_model.py
    Pure logical cube state

move_engine.py
    Applies turns to model

renderer_ursina.py
    Reads model state and animates visuals

input_controller.py
    Keyboard/mouse mapping

app.py
    Wires everything together
```
 
### Phase 1 — Build Pure Cube State

This is the single most important step.

Example

Instead of:

```
Entity(position=(x,y,z))
```

You maintain:

```
Cubie(
    position=(1,0,-1),
    faces={
        UP: WHITE,
        FRONT: GREEN,
    }
)
```

Then moves manipulate:

* cubie coordinates
* face orientations

NOT visual entities.

---

#### This Is The Hardest Conceptual Part

Once this exists:

Everything becomes easier.

Because:

* renderer can change
* UI can change
* platform can change
* multiplayer becomes possible
* solvers become possible
* undo/redo becomes trivial

---

### Phase 2 — Ursina Becomes “Dumb Renderer”

Instead of:

```
rotate_side(...)
```

changing entity transforms directly…

you do:

```
cube_model.apply_move("R")
renderer.animate_move("R")
```

Renderer simply visualizes model transitions.

This is a MASSIVE architectural improvement.

---

#### The Important Intermediate Stage

This stage is critical:

Keep Ursina

BUT

Stop Using Ursina As State Storage

This gives you:

* working app the entire time
* no giant rewrite
* incremental progress

That’s the professional way to migrate systems.

---

### Then Phase 3 — Introduce Renderer Abstraction

Something like:

```
class CubeRenderer(Protocol):
    def render(self, cube_state): ...
    def animate_move(self, move): ...
```

Then:

```
class UrsinaRenderer(CubeRenderer):
```

Later:

```
class ThreeJSRenderer(CubeRenderer):
```

At this point your engine becomes portable.

---

## Phase 4 — Browser Renderer

This is where the work changes from:

* architecture
to:
* frontend engineering

---

#### What Gets Easier In Three.js

Three.js is MUCH better for browser deployment than Ursina.

You gain:

* WebGL-native rendering
* mobile support
* browser GPU optimization
* touch events
* deployment simplicity
* no Python runtime in browser

You also gain access to:

* modern UI
* React integration
* multiplayer/websocket support
* persistence
* animations/shaders/postprocessing

---

#### What Gets Harder

You now need frontend skills:

You’ll Need To Learn

Core JS/TS
* modules
* async
* npm ecosystem

Three.js Concepts
* scene
* camera
* meshes
* groups
* quaternions
* raycasting
* animation loop

Browser Input
* pointer events
* touch gestures
* resizing
* mobile responsiveness

---

#### The GOOD News

Your Rubik’s cube logic is the hard part.

Not the rendering.

And you already solved:

* move queueing
* relative controls
* animation sequencing
* rotation grouping
* face selection

Those are the genuinely difficult parts conceptually.

---

## Recommended Migration Path
### Step 1 (Very Important)

Extract:
```
cube_model.py
```
Pure logic only.

No Ursina imports.

---

### Step 2

Create:

`move_engine.py`

Responsible for:

* move notation
* rotations
* scramble
* inverse moves
* history

---

### Step 3

Refactor Ursina renderer to:

* consume model state
* stop owning state

At this point your desktop app still works.

Huge win.

---

### Step 4

Add notation support:

`R U R' U'`

This will massively help future portability.

---

### Step 5

Build minimal Three.js proof-of-concept:

* single cubie
* then full cube
* then animations

Do NOT try to port everything at once.

---

### Final Thought

You’re actually approaching a very real software engineering boundary here:

```
Prototype Game Code
        ->
Reusable Engine Architecture
```

That transition is exactly the kind of thing senior engineers do professionally.

And your current codebase is already sophisticated enough that the refactor makes sense.