---
title: "AI Doesn’t Eliminate The Hard Parts Of Engineering—It Exposes Them"
date: "2026-03-27"
tags: "Agentic AI, VSCode, PyData"
summary: "I saw two excellent AI agent presentations at a PyData meetup in Cambridge, MA a few weeks ago. What stuck with me afterward wasn’t just what the AI could do, but what it revealed: AI agents aren’t replacing developers—they’re exposing how much of software and data engineering was always about context, not code."
---

I saw two excellent AI agent presentations at a PyData meetup<sup>1</sup> in Cambridge, MA a few weeks ago. What stuck with me afterward wasn’t just what the AI could do, but what it revealed: AI agents aren’t replacing developers—they’re exposing how much of software and data engineering was always about context, not code.

The first presentation focused on speed—an AI agent quickly built a working solution end-to-end. The second focused on everything you didn’t see: the setup, constraints, and human input required to make that outcome possible.


The first presentation focused on using a Cursor AI agent to build a real-time replica of the MBTA subway map. The goal was simple: generate a web page that displayed subway stations across metro Boston, color-coded lines, and live train status using the MBTA API<sup>2</sup>.

The result was impressive. Within 30 minutes, the agent produced a working—if rudimentary—web application that satisfied all of the requirements.

But the most important part of the demo wasn’t what happened during those 30 minutes. It was everything that had been done beforehand.

The agent didn’t inherently understand the MBTA system, its subway lines, or how to interact with the API. It had been given that context in advance. Without it, the task wouldn’t have been slower—it wouldn’t have been solvable.

To produce a meaningful result, the agent needed structured context about:

- Routes and their associated colors 
- Station locations and coordinates 
- Which data represented active subway trains 

It also required guidance on how to work within the environment:

- Which tools and languages to use 
- Access to custom assets (such as a Boston map and the MBTA API) 
- How to call the API and interpret its responses 
- What the returned data actually meant in a business context 

This is the part most live demos skip. The speed of the output is real—but it’s built on a foundation of human-defined context, constraints, and structure. The AI didn’t just generate a solution; it executed within a problem that had already been carefully shaped.


The second presentation focused on the part the first one largely skipped: the human work required to create the context in which an AI agent can succeed.

Instead of showcasing output, it broke down the “harness” that guides an AI toward consistent, usable results. The presenter described three core components:

- **Rules** — persistent instructions included with every prompt to enforce expected behavior 
- **Skills** — situational context that helps the agent use specific resources, like APIs 
- **Commands** — predefined prompts that can be reused to produce consistent outcomes 

These aren’t just implementation details—they’re how human intent gets translated into something the AI can reliably execute. Together, they form a structured way of injecting context into the system.

Rules ensure the agent behaves correctly by default. Skills give it access to knowledge it doesn’t inherently have. Commands make that knowledge reusable and repeatable.

What this presentation made clear is that AI agents don’t operate in a vacuum. They perform well only when they’re embedded in an environment shaped by human decisions: what tools are available, how data is defined, what constraints matter, and what “correct” looks like.

In that sense, the second talk explained the first. The agent didn’t magically produce a working MBTA map—it succeeded because the problem had already been carefully structured. The context, not the code, made the result possible.


AI agents are powerful tools, and they can dramatically accelerate development. But they don’t remove the need for human engineering—they make it more visible.

Successful projects still depend on clearly defined business requirements, thoughtful technical design, and a deep understanding of the data and systems involved. Without that foundation, an AI agent won’t just be less effective—it will produce results that miss the mark entirely.

The difference now is that the code can be generated quickly. The thinking behind it still has to be done—and it’s what determines whether the result is useful or not.

AI doesn’t eliminate the hard parts of engineering—it exposes them.

---
<sup>1</sup> <font size="2">[PyData Boston - February Meetup: Use Cursor to Build Data Apps](https://www.meetup.com/pydata-boston-cambridge/events/313310567/)</font><br>
<sup>2</sup> <font size="2">[MBTA API V3 API](https://www.mbta.com/developers/v3-api)</font>