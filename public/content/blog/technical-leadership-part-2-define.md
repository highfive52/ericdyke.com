---
title: "Technical Leadership Begins Before the First Pipeline"
date: "2026-05-07"
tags: "Data Engineering, Technical Leadership, Project Management, Architecture, Delivery Management"
summary: "As data engineers progress from implementation to technical leadership, success becomes less about individual tasks and more about organizing delivery across systems, stakeholders, and business objectives. Before architecture diagrams, sprint boards, or pipelines are created, projects require alignment around ownership, goals, responsibilities, and milestones. The Define phase establishes this foundation by creating a centralized project alignment document that guides communication, decision making, and execution throughout the lifecycle of an enterprise data initiative."
series: "Technical Leadership in Data Engineering"
series_part: "2"
hidden: "true"
prev: "technical-leadership-part-1-introdcution"
prev_title: "Part 1: Introduction"
next: "technical-leadership-part-3-design"
next_title: "Part 3: Design"
---

## Part 2: Define

Many engineering projects begin with architecture discussions, sprint planning, or implementation tickets. In practice, however, successful technical delivery usually starts much earlier with organizational alignment.

Before pipelines are built or infrastructure is provisioned, teams need a shared understanding of:

* why the project exists
* who owns decisions
* what success looks like
* and how progress will be measured

This is the purpose of the Define phase.

For me, the Define phase acts as the project’s alignment document. It is not intended to replace project management software, sprint boards, or detailed implementation tracking. Instead, it serves as the centralized summary that keeps stakeholders, architects, engineers, and leadership aligned throughout the lifecycle of the project.

A well-structured Define document creates clarity before execution begins and provides a stable reference point as the project evolves.

This becomes especially important in enterprise data engineering initiatives where multiple operational systems, business units, and technical teams all contribute to the final solution.

One project where this approach became particularly valuable involved building an enterprise analytics platform for a multi-resort ski organization.

The objective was to centralize operational and customer analytics across multiple business domains including:

* ticket sales
* retail systems
* food and beverage transactions
* lodging integrations
* loyalty platforms
* customer activity tracking

The primary stakeholder was the corporate marketing technology organization, which required a unified analytics platform capable of supporting:

* customer segmentation
* campaign analytics
* executive reporting
* product usage analysis
* customer identity resolution across resorts

Because the project touched nearly every operational area of the business, the Define phase became critical for establishing ownership, priorities, and delivery expectations before architecture and implementation work began.

At a high level, the Define document looks something like this:

----

### Example Define Document
#### Project Purpose

Create a centralized enterprise analytics platform that integrates resort operational systems into a unified reporting and customer analytics environment.

The platform will support:

* executive reporting
* customer segmentation
* campaign analytics
* cross-resort activity tracking
* operational performance analysis

#### Primary Stakeholders

| Team                 | Responsibility                              |
| -------------------- | ------------------------------------------- |
| Marketing Technology | Business ownership and reporting priorities |
| Data Engineering     | Pipeline development and data integration   |
| Infrastructure       | Warehouse hosting and platform operations   |
| Resort Operations    | Source system coordination                  |
| Analytics Team       | KPI validation and dashboard requirements   |

#### Ownership Matrix

| Area                   | Primary Owner        | Support              |
| ---------------------- | -------------------- | -------------------- |
| Customer Match & Merge | Marketing Technology | Data Engineering     |
| Data Modeling          | Data Engineering     | Analytics            |
| Data Pipelines         | Data Engineering     | DevOps, Platform Engineering |
| Infrastructure         | Platform Engineering | DevOps               |
| Executive Reporting    | Analytics            | Marketing Technology |
| Production Support     | Data Engineering     | Infrastructure       |

#### High-Level Milestones

| Milestone                              | Goal    |
| -------------------------------------- | ------- |
| Source system inventory complete       | Week 2  |
| Customer identity model finalized      | Week 4  |
| Initial warehouse ingestion pipelines  | Week 6  |
| Executive reporting datasets validated | Week 10 |
| User acceptance testing                | Week 12 |
| Production go-live                     | Week 14 |

| Risk / Dependency                                          | Impact                                      | Owner                | Status       |
| ---------------------------------------------------------- | ------------------------------------------- | -------------------- | ------------ |
| Customer loyalty system API access not finalized           | Delays customer identity integration        | Infrastructure       | In Progress  |
| Historical ticket sales data quality inconsistencies       | May impact reporting accuracy validation    | Data Engineering     | Under Review |
| Retail source system schema changes pending vendor upgrade | Potential ingestion redesign required       | Resort Operations    | Open         |
| Executive KPI definitions not finalized                    | Reporting validation timelines may shift    | Analytics Team       | In Progress  |
| Cloud infrastructure provisioning timeline uncertain       | May delay development environment readiness | Platform Engineering | Escalated    |

----

The purpose of this document is not to create a rigid delivery plan on day one. Instead, it establishes a common understanding of the project structure so teams can coordinate effectively as implementation details evolve.

One of the most important outcomes of the Define phase is ownership clarity.

As projects scale, technical issues are often easier to solve than organizational ambiguity. Delays frequently occur because teams are unclear about:

* who approves architecture
* who validates business logic
* who owns operational support
* or who has final decision authority

Some organizations formalize this process through strict RACI models, while others prefer lighter-weight ownership matrices. In practice, the exact framework matters less than ensuring responsibilities are visible and understood early in the project lifecycle.

The Define phase also establishes the initial milestone structure for the project. These milestones are intentionally broad and focus on major delivery objectives rather than detailed implementation tasks. Their purpose is to help teams:

* coordinate dependencies
* communicate progress
* identify delivery risks
* and maintain alignment across stakeholders

In many ways, the Define document becomes the anchor for the entire project. Weekly meetings often begin by reviewing milestone progress, referencing the ownership matrix, and mapping architectural decisions back to the original project goals.

As projects grow in scale and complexity, this type of organizational clarity becomes just as important as the technical implementation itself.

> Knowing where we are going determines how we get there.
> The Define phase is where delivery begins.