---
title: "CameraTracker, Entity Design, and Controls"
tags: "Python, Ursina, 3D, Rubiks Cube, Controls, State Management"
summary: "How camera tracking, entity lifecycle, camera-relative controls, and move queueing work in a 3D Rubik’s Cube app built with Ursina. Learn why entity scope matters, how controls adapt to camera orientation, and how to keep state transitions safe."
series: "Building a 3D Rubik’s Cube App in Python with Ursina"
series_part: "3"
hidden: "true"
prev: "rubiks-cube-ursina-part-2"
prev_title: "Project Setup: Modern Python Tooling with uv"
next: "rubiks-cube-ursina-part-4"
next_title: "Packaging and Distributing the Rubik’s Cube App"
---

## Camera Tracking and Entity Design

A key challenge in the Rubik’s Cube Ursina app is making the camera an active part of the interaction model. The custom CameraTracker entity continuously determines which face of the cube the camera is currently viewing, enabling camera-relative controls and real-time overlays.

This information is used for:

* Debug overlays
* Relative camera-based controls
* Real-time telemetry
* Spatial orientation tracking

The core logic uses vector math and dot products. Each frame:

1. The tracker reads the camera’s forward vector
2. It compares that vector against the cube face normals
3. The face with the highest similarity score is considered the active face

A simplified version of the logic looks like this:

```python
cam_forward = Vec3(self.cam.forward.x, self.cam.forward.y, self.cam.forward.z)

for face_vector in FACE_MAPPINGS.keys():
    similarity = cam_forward.dot(-face_vector)
```

A dot product close to 1 means two vectors are pointing in the same direction. Values closer to 0 indicate perpendicular orientation, while negative values represent opposing directions. This comparison allows the system to treat camera orientation as a first-class input signal, not just a visual property.

---

## Why CameraTracker Must Be at Module Scope

One important lesson: Ursina manages entity lifecycles by searching for update() and input() methods at the module level. Defining helper classes like CameraTracker inside main() (as a nested class) causes problems:

```python
def main():
    class CameraTracker(Entity):
        def update(self):
            pass
```

When entity classes are defined inside functions, they exist only in a local scope. Ursina can’t reliably discover and register their update() and input() methods. As a result:

* update() may not execute correctly
* input() handling may become unreliable
* Entity lifecycle management can break unexpectedly

The correct approach is to define Ursina entity subclasses at module scope so they can be reliably registered by the engine. For example:

```python
class CameraTracker(Entity):
    def update(self):
        pass
```

Then instantiate the tracker inside main():

```python
editor_camera = EditorCamera()
CameraTracker(camera_to_track=editor_camera)
```

This allows Ursina to properly register the entity and invoke lifecycle methods every frame.

---

## Camera-Relative Controls

Instead of mapping keys to fixed cube faces, the app uses camera-relative movement:

* W rotates the face currently above the camera
* A rotates the face to the left of the current camera view
* D rotates the face to the right
* S rotates the face currently below the camera
* E rotates the face directly facing the camera

This keeps controls consistent regardless of camera rotation. The CameraTracker system makes this possible by continuously determining which face is currently aligned with the camera. Without this spatial reference, controls would collapse back into fixed-direction inputs and lose consistency.

---

## Move Queueing and State Safety

Another key engineering detail: move queueing. If multiple rotations are triggered while animations are running, the cube can enter invalid or overlapping states. To avoid this, moves are queued:

1. Input is captured immediately
2. Moves are placed into a queue
3. Each move executes only after the previous animation completes

This ensures:

* Predictable cube state transitions
* Clean animation sequencing
* Stable input handling
* Prevention of overlapping transforms

Rotations are fully serialized rather than competing for shared state. This avoids timing conflicts between input events and animation updates, which is where most visual desynchronization issues originate. The result: consistent visual state even under rapid input.

---

With camera tracking, entity design, and state management in place, the next step is packaging and distributing the application. In Part 4, we’ll cover how to turn the project into a standalone executable and a distributable Python wheel.