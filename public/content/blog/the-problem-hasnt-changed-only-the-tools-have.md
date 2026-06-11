---
title: "The Problem Hasn’t Changed—Only the Tools Have"
date: "2026-03-26"
updated: "2026-06-11"
tags: "Data Engineering, Medallion Architecture, Lakehouse, Data Platform, ETL"
summary: "As data engineers, we’ve been solving the same fundamental problem for decades. We ingest messy, high-volume data that must be preserved in its raw form—not because it’s immediately useful, but because it serves as a system of record for replayability, auditing, and future, unforeseen questions. From there, the data is incrementally refined: deduplicated, cleansed, and structured into models that are both performant and understandable."
---

## The Core Problem Hasn’t Changed

As data engineers, we’ve been solving the same fundamental problem for decades. We ingest messy, high-volume data that must be preserved in its raw form—not because it’s immediately useful, but because it serves as a system of record for replayability, auditing, and future, unforeseen questions. From there, the data is incrementally refined: deduplicated, cleansed, and structured into models that are both performant and understandable. Finally, it’s curated into domain-specific datasets that enable analysts, managers, and executives to make informed decisions based on current performance and historical trends.

Despite major advances in tooling and infrastructure, this underlying lifecycle—raw data to trusted data to decision-ready insights—remains largely the same. The technologies have evolved, but the shape of the problem has not.

## Medallion Architecture Is a Rebranding of Familiar Patterns

The medallion architecture is often presented as a modern best practice, but it is better understood as a formalization of patterns that successful data warehouses have relied on for decades. Long before the terms *bronze*, *silver*, and *gold* entered the data engineering vocabulary, teams were already preserving raw data, incrementally increasing trust through refinement, and exposing curated models optimized for reporting and analytics. The labels changed from staging tables, warehouses, and data marts, but the progression remains remarkably familiar.

Earlier in my career, working for Xerox on the Colorado Medicaid program, I encountered a classic example of this pattern. A critical monthly report depended on a query that took hours to execute against transactional data. The solution was not new technology or a more powerful database server—it was precomputing and organizing the data into a dedicated claims data mart, allowing analysts to explore the information interactively rather than waiting for complex transactional queries to complete.

Years later at Vail Resorts, I applied the same principles at a larger scale. Raw sales transactions were incrementally ingested into landing tables, deduplicated and validated through transformation pipelines, and ultimately modeled into dimensional structures optimized for executive reporting and analytics. The architecture emphasized preserving the original data while progressively increasing confidence and usability through each stage of refinement.

Viewed through today's terminology, these implementations would look remarkably similar to a modern medallion architecture. The underlying objective was identical: preserve raw data for replayability and auditing, create a trusted refinement layer for standardization and quality, and expose business-friendly models designed for analytical consumption.

The medallion architecture did not replace the traditional data warehouse—it standardized a vocabulary for describing a data lifecycle that practitioners had already been implementing for years. The real evolution has been operational rather than architectural. SQL Server warehouses using partitioned fact tables and columnstore indexes could solve the same logical problems for terabytes of data that modern platforms solve today. Snowflake, Delta Lake, and similar technologies extend those same patterns to petabyte-scale workloads while adding elastic compute, object storage economics, concurrent processing, and software engineering practices such as version-controlled transformations and automated testing. The innovation was not a new architecture, but making a familiar architecture practical at cloud scale.

## Different Names, Familiar Patterns

Looking at the evolution of data platforms over the past two decades, it's striking how much of the underlying architecture remains recognizable. What has changed most dramatically is the tooling and operational model surrounding it. Many of the concepts promoted by modern lakehouse platforms have direct analogues in traditional enterprise data warehouses.

| **Logical Layer**     | **Traditional Warehouse** | **Modern Lakehouse** |
| --------------------- | ------------------------- | -------------------- |
| Raw ingestion         | Landing tables            | Bronze               |
| First-touch cleansing | Staging/ODS               | Silver               |
| Business modeling     | Star schema warehouse     | Gold                 |
| Consumption           | Data marts                | Gold (semantic models) |

| **Implementation** | **2008**         | **2026**               |
| ------------------ | ---------------- | ---------------------- |
| Scheduler          | SQL Agent        | Airflow                |
| ETL                | SSIS / SQL       | dbt + Spark            |
| Storage            | SAN / SQL Server | Object storage + Delta |
| Partitioning       | SQL partitions   | Delta partitions       |
| Analytics engine   | SQL Server       | Snowflake / Databricks |
| CDC                | SQL CDC          | Kafka / Event streams  |

Looking across both the logical architecture and the implementation details, a consistent pattern emerges: the responsibilities remain largely unchanged while the infrastructure has evolved dramatically. Modern data platforms did not reinvent analytical processing—they removed many of the operational constraints that limited traditional data warehouses.

The point isn't that today's platforms are simply old technologies with new names. The point is that they continue to implement the same logical progression: preserve raw data, incrementally improve its quality and consistency, and expose curated datasets optimized for analytical consumption. The abstractions evolved because the scale of modern data systems demanded new infrastructure, not because the underlying lifecycle fundamentally changed.

**Traditional Warehouse**
```
OLTP Systems
      │
      ▼
Landing / Raw
      │
      ▼
Validation / Cleansing
      │
      ▼
Analytical Warehouse
      │
      ▼
Data Marts
      │
      ▼
BI Reports
```

**Modern Lakehouse**
```
Operational Sources
        │
        ▼
Bronze (Raw)
        │
        ▼
Silver (Validated)
        │
        ▼
Gold (Business Models)
        │
        ▼
BI / ML / APIs
 ```

 Viewed this way, the medallion architecture looks less like a new invention and more like a standardized vocabulary for a refinement process that data warehouses have followed for decades.


## What Has Actually Changed

While the core architecture has remained consistent, the way we build and operate data systems has evolved significantly. Modern platforms like Snowflake have fundamentally changed the operational model by decoupling storage and compute, enabling teams to scale workloads independently without the same level of capacity planning or infrastructure management required in the past. At the same time, columnar file formats such as Apache Parquet have made data lakes far more viable by supporting efficient compression and predicate pushdown, effectively blurring the line between traditional warehouses and object storage. Orchestration tools like Apache Airflow and Azure Data Factory have elevated scheduling from collections of scripts and cron jobs into explicit dependency graphs with built-in retry logic, observability, and lineage.

Data transformation has undergone a similar evolution. Rather than embedding business logic inside stored procedures and monolithic ETL packages, modern teams increasingly express transformations as modular SQL models managed through version control. Tools like dbt apply software engineering practices—dependency management, documentation, automated testing, lineage, and CI/CD—to analytical SQL. The transformations themselves are familiar; what has changed is the engineering discipline surrounding them.

A Slowly Changing Dimension (SCD Type 2) provides a useful example. Fifteen years ago, a customer dimension might have been implemented using SQL Server stored procedures that generated surrogate keys, maintained effective dates, and preserved historical versions of each customer record. Modern dbt projects implement the same logical design using snapshots and incremental models, but the dimensional model itself remains virtually unchanged.

**Customer History**

Traditional Warehouse (2008)

```text
CustomerID   Valid From   Valid To
---------------------------------
123          2022-01-01   2024-05-10
123          2024-05-10   NULL
```

Modern dbt Dimension (2026)

```text
customer_version_sk   customer_id   valid_from   valid_to      is_current
-------------------------------------------------------------------------
e8f3...               123           2022-01-01   2024-05-10    false
a91b...               123           2024-05-10   9999-12-31    true
```

The business rules are identical: preserve history, maintain effective dates, expose a single current record, and allow analysts to reconstruct the state of a customer at any point in time. What has changed is that those assumptions can now be encoded directly into the project through model documentation, automated tests, lineage graphs, and CI/CD pipelines that validate every deployment. The model itself is immediately recognizable to anyone who built dimensional warehouses years ago; what has changed is that the surrounding engineering workflow is now versioned, testable, and continuously validated.

> **Concrete Expression of a Persistent Pattern**
>
> The following files from a dbt-based lakehouse implementation provide a concrete implementation of the same long-standing dimensional modeling patterns using modern tooling:
>
> * <a href="https://github.com/highfive52/dbt-scd2-analytics-pipeline/blob/main/snapshots/customer_scd2_snapshot.sql" target="_blank" rel="noopener noreferrer"><code>customer_scd2_snapshot.sql</code></a> – captures historical changes to customer records using SCD Type 2 logic
> * <a href="https://github.com/highfive52/dbt-scd2-analytics-pipeline/blob/main/snapshots/snapshots.yml" target="_blank" rel="noopener noreferrer"><code>snapshots.yml</code></a> – defines snapshot configuration and validation rules for customer history tracking
> * <a href="https://github.com/highfive52/dbt-scd2-analytics-pipeline/blob/main/models/dimensions/dim_customer.sql" target="_blank" rel="noopener noreferrer"><code>dim_customer.sql</code></a> – implements a versioned customer dimension using SCD Type 2 modeling
> * <a href="https://github.com/highfive52/dbt-scd2-analytics-pipeline/blob/main/models/dimensions/dims.yml" target="_blank" rel="noopener noreferrer"><code>dims.yml</code></a> – documents dimensional model structure and defines data quality expectations
> * <a href="https://github.com/highfive52/dbt-scd2-analytics-pipeline/blob/main/tests/test_dim_customer_scd2_integrity.sql" target="_blank" rel="noopener noreferrer"><code>test_dim_customer_scd2_integrity.sql</code></a> – validates that only one active customer record exists per business key
>
> The implementation uses modern dbt workflows, but the underlying dimensional modeling techniques would be immediately recognizable to anyone who has built enterprise data warehouses.

This implementation is not presented as a modern innovation, but as a contemporary expression of a well-established dimensional modeling pattern.

In practice, this means spending less time managing infrastructure and validating deployments, and more time focusing on data modeling and business logic. Modern platforms have not changed the fundamental shape of the pipeline—they have changed how efficiently, safely, and repeatably we can implement it.

## Why the Pattern Persists

The reason these patterns continue to reappear isn’t tied to any specific technology—it’s driven by the underlying constraints of working with data. Data is inherently messy: it arrives late, incomplete, and often incorrect. Systems must account for replayability and auditing, which requires preserving raw inputs even when they’re not immediately useful. Different consumers—from analysts to executives—need different levels of abstraction, which naturally leads to layered representations of the same data. Performance considerations further reinforce this structure, as precomputing and organizing data is often the only way to deliver reliable, low-latency access at scale. Most importantly, trust in data is not binary—it’s built incrementally over time. The separation between raw, refined, and curated data isn’t an arbitrary architectural choice; it’s a direct reflection of how confidence in data evolves. Any system that ignores these constraints inevitably recreates the same layers, whether they’re explicitly defined or hidden behind another abstraction.

The technologies have evolved, but the shape of the problem has not—and that’s why the same architectural patterns keep reappearing under different names.

## Conclusion

Across decades of evolution in data tooling—from on-premises relational systems to modern cloud warehouses and data platforms—the core responsibilities of data engineering have remained remarkably consistent. We still ingest raw, imperfect data, refine it through structured transformations, and curate it into trusted datasets that support analysis and decision-making. The tools have become more scalable, more automated, and easier to operate, but they continue to support the same underlying workflow.

What has changed is not the nature of the problem, but the efficiency with which we can address it. Decoupled storage and compute, columnar file formats, orchestration frameworks, and modern modeling practices have all reduced friction and improved reliability, but they have not eliminated the need for layered data systems. Instead, they have made it easier to implement patterns that have long been necessary.

The medallion architecture is often presented as a modern innovation, but it is more accurately viewed as a standardized vocabulary for a refinement process that has existed for decades. The technologies will continue to evolve—from SQL Server to Snowflake, from SSIS to dbt, from SAN storage to object storage—but the underlying lifecycle remains remarkably stable. We preserve raw data, incrementally increase trust through refinement, and expose curated models optimized for consumption. The tools change because scale changes. The architecture persists because the problem itself has not.