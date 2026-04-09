---
title: "The Problem Hasn’t Changed—Only the Tools Have"
date: "2026-03-26"
tags: "Data Pipelines, Medallion Architecture"
summary: "As data engineers, we’ve been solving the same fundamental problem for decades. We ingest messy, high-volume data that must be preserved in its raw form—not because it’s immediately useful, but because it serves as a system of record for replayability, auditing, and future, unforeseen questions. From there, the data is incrementally refined: deduplicated, cleansed, and structured into models that are both performant and understandable."
---

**The Core Problem Hasn’t Changed**

As data engineers, we’ve been solving the same fundamental problem for decades. We ingest messy, high-volume data that must be preserved in its raw form—not because it’s immediately useful, but because it serves as a system of record for replayability, auditing, and future, unforeseen questions. From there, the data is incrementally refined: deduplicated, cleansed, and structured into models that are both performant and understandable. Finally, it’s curated into domain-specific datasets that enable analysts, managers, and executives to make informed decisions based on current performance and historical trends.

Despite major advances in tooling and infrastructure, this underlying lifecycle—raw data to trusted data to decision-ready insights—remains largely the same. The technologies have evolved, but the shape of the problem has not.

**Medallion Architecture Are Rebranded Patterns**

The medallion architecture is often presented as a modern best practice, but in reality, it’s a repackaging of patterns data engineers have relied on for decades. What we now call bronze, silver, and gold layers map directly to staging tables, operational data stores, and dimensional data marts that existed long before cloud data platforms.

Earlier in my career, working for Xerox on the Colorado Medicaid program, I ran into a classic example of this: a critical monthly report depended on a query that took hours to run against transactional data. The solution wasn’t new technology—it was precomputing and organizing the data into a dedicated claims data mart, allowing analysts to query interactively.

Years later at Vail Resorts, I applied the same principles at a larger scale. I rebuilt the resort sales pipeline by incrementally ingesting raw transactions, then deduplicating and modeling them into a structured warehouse. From there, I curated domain-specific marts for executive reporting and analytics.

These implementations would look very familiar today as “medallion architecture,” even though they were built using traditional ETL patterns, partitioning strategies, and dimensional modeling. The real shift over time hasn’t been in what we build, but in how we operate it—modern systems emphasize elasticity, scale, separation of storage and compute, and improved developer ergonomics, but the underlying discipline remains the same.

**What Has Actually Changed**

While the core architecture has remained consistent, the way we build and operate data systems has evolved significantly. Modern platforms like Snowflake have fundamentally changed the operational model by decoupling storage and compute, enabling teams to scale workloads independently without the same level of capacity planning or infrastructure management required in the past. At the same time, columnar file formats such as Apache Parquet have made data lakes far more viable by supporting efficient compression and predicate pushdown, effectively blurring the line between traditional warehouses and object storage. Orchestration tools like Apache Airflow and Azure Data Factory have also elevated scheduling from a collection of scripts and cron jobs into explicit, observable dependency graphs with built-in retry logic and lineage. Even data modeling practices have matured, with a stronger emphasis on version control, modular SQL transformations, and testing.

In practice, this means spending less time managing infrastructure and more time focusing on data modeling and business logic. These advancements haven’t changed the fundamental shape of the pipeline—they’ve changed how efficiently and reliably we can execute it.

**Why the Pattern Persists**

The reason these patterns continue to reappear isn’t tied to any specific technology—it’s driven by the underlying constraints of working with data. Data is inherently messy: it arrives late, incomplete, and often incorrect. Systems must account for replayability and auditing, which requires preserving raw inputs even when they’re not immediately useful. Different consumers—from analysts to executives—need different levels of abstraction, which naturally leads to layered representations of the same data. Performance considerations further reinforce this structure, as precomputing and organizing data is often the only way to deliver reliable, low-latency access at scale. Most importantly, trust in data is not binary—it’s built incrementally over time. The separation between raw, refined, and curated data isn’t an arbitrary architectural choice; it’s a direct reflection of how confidence in data evolves. Any system that ignores these constraints inevitably recreates the same layers, whether they’re explicitly defined or hidden behind another abstraction.

The technologies have evolved, but the shape of the problem has not—and that’s why the same architectural patterns keep reappearing under different names.

**Conclusion**

Across decades of evolution in data tooling—from on-premises relational systems to modern cloud warehouses and data platforms—the core responsibilities of data engineering have remained remarkably consistent. We still ingest raw, imperfect data, refine it through structured transformations, and curate it into trusted datasets that support analysis and decision-making. The tools have become more scalable, more automated, and easier to operate, but they continue to support the same underlying workflow.

What has changed is not the nature of the problem, but the efficiency with which we can address it. Decoupled storage and compute, columnar file formats, orchestration frameworks, and modern modeling practices have all reduced friction and improved reliability, but they have not eliminated the need for layered data systems. Instead, they have made it easier to implement patterns that have long been necessary.

The medallion architecture is often framed as a modern innovation, but it is better understood as a formalization of enduring principles—principles that existed before terminology and will likely persist long after it evolves. In that sense, architectures will continue to change, but the underlying patterns endure because they are shaped by the constraints of the problem itself, not the tools we use to solve it.