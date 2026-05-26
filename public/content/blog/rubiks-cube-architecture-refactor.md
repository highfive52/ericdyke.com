---
title: "Refactoring a Python Rubik’s Cube App: Decoupling Ursina From Game State"
date: "2026-05-26"
tags: "Python, Rubiks Cube, Ursina, Software Architecture, Refactor, Game Development"
series: "Rubik’s Cube with Ursina"
summary: "A follow-up to my original Ursina Rubik’s Cube project, covering the architectural refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible design."
---

<a id="top"></a>

This article is a follow-up to my original Rubik’s Cube Ursina project write-up:

[Building a Rubik’s Cube App in Python with Ursina](/blog/rubiks-cube-ursina-part-1)

The first article focused primarily on building the initial application, implementing cube rotations, camera-relative controls, rendering, and interaction systems using the Ursina game engine.

This follow-up focuses on the architectural evolution of the project — specifically the refactor that separated rendering, input handling, move logic, and cube state into a cleaner and more extensible engine-style design.

# Decoupling Game Logic From Rendering

I recently completed a multi-phase architectural refactor of my Python Rubik’s Cube application built with the Ursina game engine.

The original implementation tightly coupled rendering, input handling, and cube state together inside the visual layer. While this worked well for rapid prototyping, it became increasingly difficult to extend, test, and reason about as the project evolved.

This refactor introduced a dedicated cube model, centralized move engine, input queue system, and renderer abstraction layer — transforming the project from a tightly coupled prototype into a much cleaner engine-style architecture.

# Table of Contents

* [Why Refactor?](#why-refactor)
* [New Project Structure](#new-project-structure)
* [Runtime Flow](#runtime-flow)
* [Face Mappings](#face-mappings)
* [CubeModel: The Source of Truth](#cubemodel-the-source-of-truth)
* [CameraTracker: Interpreting Camera-Relative Input](#cameratracker-interpreting-camera-relative-input)
* [InputController: Queueing Player Intent](#inputcontroller-queueing-player-intent)
* [CubeController: Coordinating State and Rendering](#cubecontroller-coordinating-state-and-rendering)
* [MoveEngine: Centralized Move Logic](#moveengine-centralized-move-logic)
* [Renderer: Visuals Only](#renderer-visuals-only)
* [Why This Architecture Is Better](#why-this-architecture-is-better)
* [Future Features](#future-features)
* [Final Thoughts](#final-thoughts)
* [Appendix: Architecture Design Artifacts](#appendix)

---

<a id="why-refactor"></a>
# Why Refactor?

One of the more interesting architectural problems I ran into while building my Rubik’s Cube application in Python was that the rendering engine eventually became the game state.

Originally, the project relied heavily on the Ursina game engine for both:

* rendering the cube
* storing and mutating cube state

At first this worked well. It allowed me to rapidly prototype cube rotations, camera-relative controls, animation sequencing, and face selection.

But as the project evolved, the architecture started showing limitations.

The visual entities themselves had effectively become the source of truth:

```python
entity.x > 0
rotation_helper.animate(...)
```

This meant:

* move logic depended on visual transforms
* testing required the renderer
* state mutations were difficult to reason about
* browser portability would eventually become difficult
* adding features like solvers or move history would be awkward

So I started a multi-phase refactor focused on separating:

* cube state
* move logic
* input handling
* rendering

The goal was to move toward a cleaner engine-style architecture where the renderer becomes a visualization layer instead of the owner of game state.

The biggest architectural change was decoupling Ursina rendering from the authoritative cube state.

Instead of visual entities determining the logical state of the cube, the application now maintains a dedicated cube model that owns all board state independently from rendering.

That separation immediately improved several things:

* deterministic move logic
* testability
* portability
* maintainability
* future extensibility

This also creates a much cleaner path toward:

* browser rendering
* solver algorithms
* replay systems
* move history
* undo/redo
* alternative renderers

The renderer is now effectively “read-only” with respect to game state.

## Before vs After

The refactor reorganized the project into clearer architectural boundaries.

| Before Refactor                                       | After Refactor                            |
|-------------------------------------------------------|-------------------------------------------|
| Ursina entities owned cube state                      | `CubeModel` owns authoritative state      |
| Input directly mutated visuals                        | `InputController` queues actions          |
| Rendering and logic tightly coupled                   | Renderer only visualizes state            |
| Move logic scattered across entity transforms         | `MoveEngine` centralizes move logic       |
| Hard to test without Ursina                           | Engine logic testable independently       |
| Difficult to support alternative renderers            | Renderer abstraction now possible         |
| Camera/input logic intertwined with state mutation    | `CameraTracker` translates intent only    |
| Solver support would be difficult                     | Deterministic state enables solvers       |


[Back to top](#top)

---

<a id="new-project-structure"></a>
# New Project Structure

```text
src/
└── rubiks_cube/
    ├── cube_controller.py
    ├── model/
    │   └── cube_model.py          # authoritative cube state
    ├── engine/
    │   ├── move_engine.py         # move parsing + application
    │   └── move_definitions.py    # move notation + mappings
    ├── input/
    │   ├── camera_mapping.py
    │   ├── input_controller.py
    │   └── move_actions.py
    ├── renderer/
    │   └── ursina_renderer.py     # Ursina visuals only
    └── app/
        └── main.py                # wiring layer
```

The responsibilities are now much more explicit:

| Component         | Responsibility                |
| ----------------- | ----------------------------- |
| `CubeModel`       | Authoritative cube state      |
| `MoveEngine`      | Applies moves to the model    |
| `InputController` | Queues and normalizes input   |
| `CubeController`  | Coordinates engine + renderer |
| `Renderer`        | Visualizes state changes      |
| `main.py`         | Wires everything together     |

[Back to top](#top)

---

<a id="runtime-flow"></a>
# Runtime Flow

The application now follows a much cleaner execution pipeline:

```text
Input
  -> Intent Queue
  -> CubeController
  -> MoveEngine
  -> CubeModel
  -> Renderer Animation
  -> Completion Callback
  -> Next Queued Move
```

The renderer no longer owns state.

It only visualizes state transitions produced by the engine.

## Mermaid Flow Diagram

The new architecture separates interaction, state mutation, and rendering into independent stages.

<img src="/images/rubiks-cube-flow-tb.png" alt="Rubik's Cube flow diagram" style="max-width:100%;height:auto;display:block;margin:0 auto;" />

[Back to top](#top)

---

<a id="face-mappings"></a>
# Face Mappings

One of the early cleanup improvements was centralizing face metadata into explicit mappings.

```python
FACE_MAPPINGS = {
    Vec3(1, 0, 0): {"name": "Right (Pink)", "color": color.pink},
    Vec3(-1, 0, 0): {"name": "Left (Orange)", "color": color.orange},
    Vec3(0, 1, 0): {"name": "Top (White)", "color": color.white},
    Vec3(0, -1, 0): {"name": "Bottom (Yellow)", "color": color.yellow},
    Vec3(0, 0, 1): {"name": "Back (Azure)", "color": color.azure},
    Vec3(0, 0, -1): {"name": "Front (Green)", "color": color.green},
}
```

This made camera-relative controls, input normalization, and move translation significantly easier to reason about.

Instead of relying on implicit renderer assumptions, face metadata became a formal part of the application structure.

[Back to top](#top)

---

<a id="cubemodel-the-source-of-truth"></a>
# CubeModel: The Source of Truth

The most important architectural change was introducing a dedicated `CubeModel`.

The cube model now owns the authoritative logical state of the cube.

No renderer state is required.

No Ursina entities are consulted.

The model tracks the cube as a dictionary of cubies keyed by board coordinate.

```python
class CubeModel:
```

Each key represents a physical board coordinate:

```python
(x, y, z)
```

The value stores metadata about the cubie occupying that position:

```python
{
    'pos': (x, y, z),
    'rot': (0, 0, 0),
    'id': (x, y, z)
}
```

## Example State

```python
{
 (0, 0, 0): {'pos': (0, 0, 0), 'rot': (0, 0, 0), 'id': (0, 0, 0)},
 (0, 0, 1): {'pos': (0, 0, 1), 'rot': (0, 0, 0), 'id': (0, 0, 1)},
 (0, 0, 2): {'pos': (0, 0, 2), 'rot': (0, 0, 0), 'id': (0, 0, 2)},
 ...
}
```

Because the cube state now exists independently from rendering, the model can also generate deterministic snapshots of the entire cube state at any point in time.

```python
before = self.model.snapshot()
after = self.model.snapshot()
```

The important detail is the stable `id`.

The `id` represents the cubie’s original solved position.

That makes solved-state detection extremely simple:

```python
def is_solved(self):
    return all(key == data.get("id") for key, data in self.cubes.items())
```

This is much cleaner than attempting to infer solved state from visual rotations or renderer transforms.

[Back to top](#top)

---

<a id="cameratracker-interpreting-camera-relative-input"></a>
# CameraTracker: Interpreting Camera-Relative Input

One subtle but important part of the refactor was separating raw user interaction from actual cube mutation.

The `CameraTracker` still plays a central role in the application.

But its responsibility changed significantly.

Originally, camera logic, move routing, input handling, queue management, and cube mutation were all heavily intertwined.

After the refactor, the tracker became more of an adapter layer between:

* Ursina input events
* camera-relative controls
* user intent
* the platform-agnostic `InputController`

Importantly, the tracker still acts as the primary interpreter of camera-relative interaction.

It is responsible for:

* tracking camera orientation
* determining the currently viewed face
* translating keyboard directions into cube-relative moves
* forwarding move intents into the input queue
* polling queued actions and forwarding them to the controller
* updating telemetry/UI state

However, it no longer owns cube state mutations.

That responsibility now belongs to the `CubeController` and `MoveEngine`.

## Camera-Relative Controls

The tracker continuously evaluates which cube face the camera is currently facing.

```python
cam_forward = Vec3(self.cam.forward.x, self.cam.forward.y, self.cam.forward.z)
```

It compares the camera vector against the known cube face vectors:

```python
for face_vector in FACE_MAPPINGS.keys():
    similarity = cam_forward.dot(-face_vector)
```

The best matching face becomes the active face:

```python
self.current_face = best_match_vector
```

This allows keyboard controls to remain camera-relative.

For example:

* pressing `W` rotates the visually upward face
* pressing `A` rotates the visually left face
* pressing `S` rotates the visually downward face
* pressing `D` rotates the visually right face
* pressing `E` rotates the currently viewed face

regardless of the actual world orientation of the cube.

That abstraction makes the controls feel much more natural.

## Translating Input Into Actions

The tracker converts keyboard and mouse interaction into normalized move intents.

Example:

```python
def add_move_to_queue(self, normal, direction=1):
    norm = self._to_tuple(normal)
    if norm is None:
        return

    self.rotate_side_callback(norm, direction, tracker=self)
```

The important detail here is that the tracker does not directly rotate the cube.

Instead it forwards:

```python
(normal, direction)
```

into the input system.

The callback itself is injected during application wiring:

```python
tracker = CameraTracker(
    camera_to_track=editor_camera,
    rotate_side_callback=input_handler.enqueue_action,
)
```

This is a major architectural improvement because the tracker no longer needs to understand:

* cube state
* move application
* renderer animation
* cubie transforms

It only translates user intent.

## Mouse Input

Mouse interaction follows the same pattern.

A single invisible collider captures cube clicks:

```python
collider = Entity(model="cube", scale=3, collider="box", visible=False)
```

The click normal becomes the move intent:

```python
def collider_input(key):
    if mouse.hovered_entity == collider:
        if key == "left mouse down":
            input_handler.enqueue_action(mouse.normal, 1, tracker=None)
        elif key == "right mouse down":
            input_handler.enqueue_action(mouse.normal, -1, tracker=None)
```

Again, no cube mutation occurs here.

The interaction only produces queued actions.

## Polling the Queue

The tracker also acts as the bridge between queued input and controller processing.

During each update cycle:

```python
def update(self):
    if input_handler is not None and controller is not None:
        actions = input_handler.poll()
        if actions:
            controller.process_actions(actions)
```

This creates a clean execution pipeline:

```text
User Input
    -> CameraTracker
    -> InputController Queue
    -> CubeController
    -> MoveEngine
    -> CubeModel
    -> Renderer Animation
```

## Why This Matters

One of the key improvements from the refactor is that Ursina callbacks no longer directly mutate cube state.

The tracker still participates heavily in interaction and camera behavior.

But logical cube mutations are now centralized inside the engine/model pipeline.

That separation dramatically improves:

* maintainability
* testability
* portability
* replay support
* deterministic processing
* future browser compatibility

The camera tracker still drives interaction.

It just no longer owns the cube.

[Back to top](#top)

---

<a id="inputcontroller-queueing-player-intent"></a>
# InputController: Queueing Player Intent

Another major improvement was introducing an explicit input queue that separates *user interaction* from *game state mutation*.

Previously, input handling, camera interpretation, and cube mutation were tightly coupled. Mouse clicks and key presses effectively triggered state changes directly through engine-facing logic.

Now, the input layer only records **intent**, and all inputs are normalized into a single canonical event shape before being consumed by the game controller.

```
Camera orientation
        ↓
current_face updated every frame
        ↓
Key press occurs
        ↓
screen_right_axis / screen_up_axis resolved
        ↓
match-case selects intended movement
        ↓
canonical cube-space face vector chosen
        ↓
enqueue_action(...)
        ↓
InputController queue
```

## Input data model

All user interactions are converted into canonical cube rotation events before entering the input queue.

Each queued event follows the structure:

```python
(axis_vector, direction, tracker)
````

Where:

* `axis_vector: tuple[int, int, int]` identifies which cube face/layer should rotate using the cube’s canonical face mapping.
* `direction: int` determines whether the move is standard (`+1`) or inverse/prime (`-1`).
* `tracker: Any` preserves the origin of the input event (camera tracker, mouse interaction, UI system, etc.)

For example:

```python
((1, 0, 0), -1, tracker)
```

represents:

> Rotate the Right (Pink) face counter-clockwise (prime move)

The canonical face mappings are established when the cube is instantiated:

```python
FACE_MAPPINGS = {
    Vec3(1, 0, 0): {"name": "Right (Pink)"},
    Vec3(-1, 0, 0): {"name": "Left (Orange)"},
    Vec3(0, 1, 0): {"name": "Top (White)"},
    Vec3(0, -1, 0): {"name": "Bottom (Yellow)"},
    Vec3(0, 0, 1): {"name": "Back (Azure)"},
    Vec3(0, 0, -1): {"name": "Front (Green)"},
}
```

`CameraTracker` continuously evaluates camera orientation and resolves keyboard input into one of these canonical cube-space face vectors before enqueueing the move.

### Example events

Mouse click input:

```python
((1, 0, 0), 1, None)
```

Keyboard-driven input (via camera interpretation):

```python
((0, 1, 0), -1, CameraTracker)
```

This normalization happens inside the `InputController`, which accepts multiple upstream formats (`MoveAction`, canonical `Move`, or raw Vec3-like inputs) and converts them into a consistent internal representation.

---

## InputController responsibilities

```python
class InputController:
```

The controller:

* normalizes heterogeneous input formats into a canonical event shape
* queues input events for deterministic processing
* supports both pull-based (`poll`) and push-based handler consumption
* remains fully renderer- and engine-agnostic
* preserves event provenance via the `tracker` field

Internally, events are stored as:

```python
Deque[Tuple[axis_vector, direction, tracker]]
```

This queue becomes the single source of truth for pending player intent.

---

## Consumption model

The application processes input explicitly rather than reacting directly inside input callbacks:

```python
actions = controller.poll()
controller.process_actions(actions)
```

This introduces a clear boundary:

* **Input system** → captures and normalizes intent
* **Controller layer** → interprets and executes intent
* **Engine/renderer** → performs state mutation and animation

---

## Why this matters

This decoupling provides several benefits:

* replay support (events are fully captured and ordered)
* macro recording and deterministic re-execution
* predictable sequencing of animations
* clear separation between input timing and game state updates
* future extensibility for networking or multiplayer synchronization

Most importantly, the system no longer mutates cube state directly from input callbacks. Instead, it treats all user interaction as a stream of **structured, replayable intent events**.
[Back to top](#top)

---

<a id="cubecontroller-coordinating-state-and-rendering"></a>
# CubeController: Coordinating State and Rendering

The `CubeController` evolved into the orchestration layer between:

* `InputController`
* `MoveEngine`
* `CubeModel`
* renderer callbacks

While the `InputController` is only responsible for recording normalized player intent, the `CubeController` owns deterministic execution sequencing and animation lifecycle coordination.

## Responsibilities

The controller is responsible for:

* accepting normalized input actions
* queueing moves sequentially
* applying moves through the `MoveEngine`
* committing state changes to the `CubeModel`
* triggering renderer animations
* waiting for animation completion before processing the next action

Internally, the controller maintains its own execution queue:

```python
self._queue = []
self._is_processing = False
````

This ensures that moves are processed strictly in order, independent of renderer timing or animation duration.

---

## Processing pipeline

Input actions enter the controller as normalized queue events:

```python
(normal_or_move, direction, tracker)
```

These actions are then transformed into concrete model mutations through a multi-stage pipeline:

```text
InputController
    ↓
CubeController
    ↓
MoveEngine.apply()
    ↓
CubeModel.apply_move()
    ↓
Renderer animation callback
    ↓
_on_action_complete()
    ↓
Process next queued move
```

The `MoveEngine` computes the structural cube changes, while the `CubeModel` commits those mutations to persistent state.

Before mutation, the controller snapshots the model state:

```python
before = self.model.snapshot()
```

After applying the move, the resulting state is captured again:

```python
after = result.get("after")
```

These snapshots are then passed to the renderer so animation becomes a visualization of a known state transition rather than the source of truth itself.

---

## Animation lifecycle coordination

One of the most important architectural changes was removing renderer ownership over game flow progression.

Previously, animation timing implicitly controlled move sequencing.

Importantly, move progression is now controller-driven rather than renderer-driven.

Now, the controller explicitly coordinates animation lifecycle completion through callbacks:

```python
on_complete=_on_complete
```

When a renderer finishes animating a move, it signals completion back to the controller, which then processes the next queued action.

This creates a clean separation of concerns:

* the controller owns sequencing and state progression
* the engine computes deterministic cube transformations
* the model owns persistent cube state
* the renderer only visualizes transitions between states

The renderer no longer drives gameplay logic — it simply reflects it asynchronously.

This separation significantly improves maintainability, replayability, and future extensibility for alternative renderers or networking support.

[Back to top](#top)

---

<a id="moveengine-centralized-move-logic"></a>
# MoveEngine: Pure Cube Transformation Logic

The `MoveEngine` became the deterministic transformation layer responsible for computing cube state changes independently of rendering, animation, or input handling.

Its responsibility is intentionally narrow:

* parse move intent into canonical cube operations
* determine affected cubies
* compute transformed coordinates
* generate immutable change descriptions

Unlike the original implementation, the engine no longer mutates renderer entities directly.

Instead, it computes a complete cube transformation and returns a structured change-set for the controller and model layers to consume.

---

## Canonical move parsing

The engine accepts multiple move representations:

* Rubik’s notation (`R`, `U'`, `F`, etc.)
* cube-space axis vectors
* `Vec3`-style normals
* canonical `Move` objects

All inputs are normalized into a canonical `Move` structure before execution.

```python
move = self.parse(move_name)
````

This allows the input layer to remain flexible while ensuring the transformation logic operates on a single deterministic representation internally.

### Canonical move representation

Before execution, all move inputs are converted into a renderer-independent `Move` object:

```python
@dataclass(frozen=True)
class Move:
    notation: str
    axis: str
    layer: int
    direction: int
```

This structure encodes a specific slice of the cube (axis + layer) and the direction of rotation applied to that slice. It acts as the semantic bridge between raw input geometry and deterministic cube transformations.

For example:

```python
Move(
    notation="R",
    axis="x",
    layer=1,
    direction=-1
)
```

represents:

> Rotate the Right face counter-clockwise (`R'`)

The conversion from geometric input into semantic cube operations occurs through:

```python
normal_to_axis_layer_direction(normal, direction)
```

For example:

```python
(1, 0, 0)
```

becomes:

```python
Move(
    notation="R",
    axis="x",
    layer=1,
    direction=1
)
```

Here the axis vector encodes both the rotation axis and the selected face slice in cube space. This normalization layer allows camera-relative input, mouse normals, and renderer-specific vectors to be converted into a canonical cube operation before reaching the transformation engine.

---

## Coordinate transformation

After resolving the affected layer, the engine performs pure coordinate-space rotation math:

```python
rotate_centered(x, y, z, axis, direction)
```

This transformation logic is completely renderer-agnostic:

* no Ursina dependencies
* no animation callbacks
* no entity mutation
* no rendering concerns

The engine only computes new cube coordinates.

---

## Change-set generation

Rather than mutating renderer entities directly, the engine produces a complete declarative change-set describing the cube transformation:

```python
{
    "move": Move(
        notation="U",
        axis="y",
        layer=2,
        direction=1
    ),

    "affected": [
        (0, 2, 0), (1, 2, 0), (2, 2, 0),
        (0, 2, 1), (1, 2, 1), (2, 2, 1),
        (0, 2, 2), (1, 2, 2), (2, 2, 2)
    ],

    "meta": {
        "duration_hint": 0.15
    },

    "new_cubes": {
        (0, 0, 0): {
            "pos": (0, 0, 0),
            "rot": (0, 0, 0),
            "id": (0, 0, 0)
        },

        ...

        (0, 2, 0): {
            "pos": (0, 2, 2),
            "rot": (0, 0, 0),
            "id": (0, 2, 0)
        },

        (1, 2, 0): {
            "pos": (0, 2, 1),
            "rot": (0, 0, 0),
            "id": (1, 2, 0)
        }
    }
}
```

Where:

* `move` contains the canonical semantic cube operation
* `affected` identifies the cubies touched by the move
* `meta` exposes optional execution hints (e.g. animation duration) that influence downstream rendering without coupling the engine to any specific renderer implementation
* `new_cubes` contains the fully materialized next cube-state mapping that will become the model’s new authoritative state

This change-set is a full declarative description of the next cube state rather than a sequence of imperative mutations.

The `CubeController` passes this change-set into `CubeModel.apply_move()`, which commits the new state and returns before/after snapshots for renderer synchronization.

This was one of the most important architectural changes in the refactor.

The engine is responsible only for deterministic transformation computation. It does not persist state, sequence execution, or perform rendering.

That responsibility is delegated downstream:

* `CubeController` orchestrates execution sequencing
* `CubeModel` commits persistent state mutations
* the renderer visualizes transitions asynchronously

This separation allows the cube logic to remain deterministic, testable, and fully independent of the rendering engine.

---

<a id="renderer-visuals-only"></a>
# Renderer: Visuals Only

The Ursina renderer still exists.

But after the refactor, it became a pure visualization layer rather than the owner of cube state.

Before the refactor:

* Ursina entities effectively *were* the game state
* entity transforms directly mutated logical state
* animation timing implicitly controlled execution flow
* rendering and cube logic were tightly coupled

After the refactor:

* the renderer consumes deterministic model snapshots
* animations visualize known state transitions
* rendering no longer controls gameplay sequencing
* the renderer never owns authoritative state
* the rendering layer can theoretically be replaced entirely

The renderer is now effectively a visualization adapter sitting downstream from the engine and model pipeline.

---

## Snapshot-driven rendering

Instead of mutating entities directly during input handling, the renderer now receives explicit before/after cube states from the controller:

```python
renderer_callback(
    before,
    after,
    meta,
    move=change.get("move"),
    affected=change.get("affected"),
    speed=speed,
    on_complete=_on_complete,
)
```

This is a major architectural distinction.

The renderer no longer determines *what* the cube state becomes.

It only visualizes a transition between two already-computed deterministic states.

The animation layer therefore becomes fully downstream from:

```text
Input
    -> CubeController
    -> MoveEngine
    -> CubeModel
    -> Renderer
```

rather than participating directly in cube mutation itself.

---

## Animation as visualization

The renderer now operates more like a playback system:

```python
animate_from_model_change(before, after, move)
```

Its responsibilities are intentionally narrow:

* animate cubie transitions
* interpolate transforms
* manage visual timing
* synchronize completion callbacks
* reflect model state visually

It no longer:

* computes cube logic
* determines valid moves
* owns sequencing
* stores authoritative cube state

That separation dramatically improves portability and long-term maintainability.

---

## Renderer abstraction

Because the renderer now consumes declarative model state instead of owning game logic, the visual layer can theoretically be replaced without rewriting the cube engine itself.

Possible future rendering targets include:

* Three.js
* Babylon.js
* OpenGL
* headless simulation
* automated testing environments
* browser-based WebGL renderers

The cube logic is now effectively platform-independent.

Ursina became one possible renderer instead of the architectural foundation of the entire application.

[Back to top](#top)

---

<a id="why-this-architecture-is-better"></a>
# Why This Architecture Is Better

This refactor substantially improved the structure of the project.

The application now behaves much more like a reusable engine instead of a tightly coupled prototype.

The biggest benefits are:

* **Separation of Concerns** - Each layer now has a clear responsibility.
* **Deterministic State** - The cube state no longer depends on rendering side effects.
* **Testability** - Move logic can be tested without launching Ursina.
* **Portability** - The renderer can eventually be replaced.
* **Extensibility** - New features become dramatically easier to add.

[Back to top](#top)

---

<a id="future-features"></a>
# Future Features

This architecture creates a much cleaner foundation for future work.

Some possible next steps:

* **Solver Support** - Since cube state is now independent from rendering, implementing solving algorithms becomes much easier.
* **Move History / Replay** - The input queue and deterministic move engine naturally support replay systems.
* **Browser Rendering** - The current architecture is already moving toward renderer abstraction.
* **Undo / Redo** - Atomic state transitions make reversible move history straightforward.

A future browser renderer could reuse the following, while replacing only the visual layer.:

* cube model
* move engine
* move notation
* input mapping
* scramble logic

Possible future rendering targets:

* Three.js
* Babylon.js
* React + WebGL

[Back to top](#top)

---

<a id="final-thoughts"></a>
# Final Thoughts

One of the interesting aspects of this refactor is that it represents a transition many software projects eventually face:

```text
Prototype Code
      ->
Reusable Architecture
```

Originally, the application prioritized rapid iteration and tight feedback loops.

That was the correct decision early on.

But once the cube logic, controls, and animation systems became more sophisticated, the coupling between rendering and game state started becoming a liability.

Separating the model, engine, controller, input layer, and renderer dramatically improved the maintainability of the project while preserving the existing Ursina visuals.

The end result is a fully deterministic pipeline where each layer has a single responsibility:

* authoritative state
* transformation logic
* input intent
* execution sequencing
* rendering

The renderer is now purely a visualization layer over state transitions.

That distinction is what turns the system from a prototype into an engine.

[Back to top](#top)

---

<a id="appendix"></a>
# Appendix: Architecture Design Artifacts

These design documents were used as phase-by-phase implementation guides during the refactor. Each phase represents a constrained migration step intended to keep the system runnable at all times.

- [Rubik’s Cube Architecture Design - Overall](/blog/rubiks-cube-design-overall)
- [Rubik’s Cube Architecture Design - Phase 1](/blog/rubiks-cube-design-phase-1)
- [Rubik’s Cube Architecture Design - Phase 2](/blog/rubiks-cube-design-phase-2)
- [Rubik’s Cube Architecture Design - Phase 3](/blog/rubiks-cube-design-phase-3)
- [Rubik’s Cube Architecture Design - Phase 4](/blog/rubiks-cube-design-phase-4)


[Back to top](#top)