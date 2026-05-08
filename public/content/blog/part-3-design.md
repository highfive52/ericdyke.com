---
title: "Technical Leadership Begins Before the First Pipeline"
date: "2026-05-07"
tags: "Data Engineering, Technical Leadership, Project Management, Architecture, Delivery Management"
summary: "As data engineers progress from implementation to technical leadership, success becomes less about individual tasks and more about organizing delivery across systems, stakeholders, and business objectives. Before architecture diagrams, sprint boards, or pipelines are created, projects require alignment around ownership, goals, responsibilities, and milestones. The Define phase establishes this foundation by creating a centralized project alignment document that guides communication, decision making, and execution throughout the lifecycle of an enterprise data initiative."
series: "Technical Leadership in Data Engineering"
series_part: "3"
hidden: "true"
prev: "part-2-define"
prev_title: "Part 2: Define"
next: "part-4-execution"
next_title: "Part 4: Execution"
---

## Part 3: Design

Once project ownership, goals, milestones, and risks have been defined, the next phase focuses on translating alignment into implementation planning.

This is the purpose of the Design phase.

The Design phase bridges the gap between business objectives and technical execution. It transforms high-level project goals into concrete requirements, architecture decisions, data models, and implementation strategies that engineering teams can build against.

For me, the Design phase has two primary areas of focus: business requirements and technical requirements.

While these areas are closely connected, they serve different purposes within the project lifecycle. Business requirements define what the organization needs and why the solution matters. Technical requirements define how the system will be implemented.

Both are equally important. Strong technical architecture without clear business alignment often produces systems that are technically impressive but operationally underutilized. Conversely, strong business vision without technical planning creates delivery instability and implementation ambiguity.

The Design phase exists to align both perspectives before large-scale execution begins.

----

### Business Requirements

Business requirements focus on understanding stakeholder needs and translating business objectives into actionable engineering goals.

At an enterprise level, this process extends far beyond collecting feature requests. It requires understanding how operational workflows function, how reporting supports decision making, where pain points exist in current systems, and how data ultimately creates value for the organization.

In the ski resort analytics platform project, the corporate marketing technology organization needed more than centralized reporting. Their broader objective was to better understand customer behavior across resorts, products, and engagement channels.

The project introduced questions that shaped both the architecture and the long-term analytical strategy of the platform:

| Business Question                                                   | Organizational Goal                        |
| ------------------------------------------------------------------- | ------------------------------------------ |
| Which customer segments drive the highest seasonal revenue?         | Improve targeted marketing campaigns       |
| How do ticket purchases correlate with lodging and retail activity? | Understand cross-product customer behavior |
| Which campaigns influence repeat visitation?                        | Measure marketing effectiveness            |
| How can customer identities be matched across disconnected systems? | Create a unified customer profile          |

These business questions eventually drive technical architecture decisions, but they must first be clearly documented and understood.

One of the most effective ways to organize business requirements is through user stories.

----

#### User Stories

User stories frame requirements from the perspective of the people interacting with the system. A common structure is:

* As a [type of user], I want [an action] so that [a benefit or reason].

This format keeps discussions focused on business outcomes rather than implementation details.

For example:

#### User Story

* As a marketing analyst, I want to view customer activity across all resorts so that I can build cross-resort segmentation campaigns.
* As an executive stakeholder, I want daily revenue dashboards so that I can monitor operational performance during peak season.
* As a loyalty manager, I want matched customer profiles across retail and ticketing systems so that repeat customer behavior can be analyzed accurately.

User stories also help engineering teams prioritize work according to organizational value instead of purely technical interests.

While user stories describe intent, use cases help define how information moves through the platform.

----

#### Use Cases

Use cases document the operational flow of data through the system by defining inputs, transformations, business rules, and expected outputs.

For enterprise data engineering projects, this becomes especially important when multiple operational systems contribute to shared reporting and analytical environments.

A simplified use case for the resort analytics platform looked like this:

| Component      | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| Input          | Ticket sales, retail transactions, lodging reservations        |
| Transformation | Standardize customer identifiers and aggregate resort activity |
| Business Logic | Match customer activity across operational systems             |
| Output         | Executive reporting datasets and customer segmentation tables  |

These use cases establish clarity around how data should behave within the platform and what business outcomes the transformed datasets are expected to support.

### Technical Requirements

Once business requirements are understood, the Design phase shifts toward technical implementation planning.

Technical requirements define the structure of the solution itself, including source systems, ingestion patterns, transformation workflows, orchestration strategies, storage design, and the analytical models that support downstream reporting and analytics.

This is where architecture becomes concrete.

For enterprise data engineering initiatives, technical design often includes source-to-target mapping, architecture diagrams, logical and physical data models, transformation workflows, and reporting structures. Together, these artifacts create the technical blueprint that guides implementation.

#### Source Systems and Data Flows

One of the earliest technical design activities is mapping operational source systems and understanding how data moves through the platform.

In the ski resort analytics project, the platform integrated ticketing systems, retail transactions, food and beverage operations, loyalty platforms, customer relationship management systems, and web engagement data.

Each system introduced different schemas, update frequencies, integration constraints, and data quality challenges. Documenting these flows early helped identify ingestion dependencies, transformation sequencing, latency expectations, and operational bottlenecks before implementation work began.

This process often evolves into architecture and data flow diagrams that visually represent how information moves throughout the environment.

A simplified mapping document might look something like this:

| Source System      | Data Domain         | Update Frequency | Destination               |
| ------------------ | ------------------- | ---------------- | ------------------------- |
| Ticketing Platform | Ticket Sales        | Hourly           | Enterprise Data Warehouse |
| Retail POS         | Retail Transactions | Daily            | Customer Activity Model   |
| Loyalty Platform   | Customer Profiles   | Near Real-Time   | Match & Merge Process     |
| CRM System         | Marketing Campaigns | Daily            | Campaign Analytics Tables |

By documenting source systems and data movement early, engineering teams create a shared understanding of how the platform operates before pipelines are built.

----

#### Logical and Physical Data Models

As ingestion and transformation requirements become clearer, the Design phase also defines the structure of the analytical environment itself.

Logical data models describe business entities and their relationships at a conceptual level. Physical data models define the actual implementation details, including schemas, tables, partitioning strategies, indexing approaches, and storage optimization decisions.

These modeling decisions directly influence reporting performance, operational scalability, downstream analytics, and long-term maintainability.

For example:

| Model Type           | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| Logical Data Model   | Define customer, transaction, and resort relationships   |
| Physical Data Model  | Define warehouse tables, schemas, and storage structures |
| Dimensional Models   | Support executive dashboards and reporting               |
| Customer Match Model | Consolidate cross-system customer identities             |

Poorly designed data models often create operational friction long after the initial project is delivered. Strong design work reduces that risk before execution begins.

The Design phase is ultimately about reducing ambiguity before implementation starts. Business requirements clarify organizational value. Technical requirements establish implementation structure. Together, they create the blueprint that guides engineering delivery throughout the remainder of the project lifecycle. 

> Business requirements define what the organization needs.
> Design transforms those needs into scalable, maintainable systems.