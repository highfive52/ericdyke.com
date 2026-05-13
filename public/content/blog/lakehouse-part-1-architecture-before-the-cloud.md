---
title: "Building a Production-Style Lakehouse Locally Before the Cloud"
date: "2026-05-12"
tags: "Data Engineering, Lakehouse Architecture, Local Development, Delta Lake, Data Platform Design"
summary: "Before cloud infrastructure, pipelines, or dashboards exist, architectural decisions still have to be made. This article introduces a local lakehouse project designed to explore those decisions one layer at a time."
series: "Building a Production-Style Lakehouse Locally Before the Cloud"
series_part: "1"
next: "lakehouse-part-2-streaming-kafka-spark-bronze-layer"
next_title: "Bringing the System to Life: Streaming Data Into the Lakehouse"
---

At some point, most data engineers encounter the same problem: someone hands you a dataset, a set of vague requirements, and asks for “a scalable analytics platform.”

The requirements are usually broad:

* “We want dashboards.”
* “We need near real-time reporting.”
* “The platform should scale.”
* “It should support future machine learning use cases.”
* “We may eventually move this into the cloud.”

What is often missing is the part that matters most early on: architectural direction.

Before cloud infrastructure, orchestration frameworks, CI/CD pipelines, and production SLAs exist, there is usually a much simpler starting point:

* a laptop
* a local development environment
* a need to understand the shape of the data and the systems that will eventually process it

That early phase is where many important design decisions are made.

The challenge is that modern cloud platforms abstract away so much infrastructure that it can become difficult to understand the responsibilities of the underlying architectural components. Services like managed Kafka clusters, cloud warehouses, serverless APIs, and orchestration frameworks make production deployment easier, but they can also hide why those systems exist in the first place.

A modern data platform is not defined by AWS, Azure, Databricks, or Snowflake. Those platforms provide implementations of architectural concepts:

* event ingestion
* durable storage
* streaming transformations
* analytical serving layers
* and scalable compute

The architectural thinking still has to happen before any cloud resources are provisioned.

That raises an important question:

> How do you design a modern data platform when all you have is a dataset, a laptop, and a set of requirements?

For this project, I wanted to explore that question by building a production-style lakehouse architecture entirely in a local development environment using Docker, Kafka, PySpark Structured Streaming, Delta Lake, DuckDB, FastAPI, and Streamlit. The goal was not to recreate a cloud provider locally. The goal was to better understand the responsibilities of each architectural layer before managed services abstract them away.

The project simulates a real-time e-commerce platform generating user activity events such as page views, searches, cart activity, checkout flows, and purchases. Those events move through a streaming pipeline that separates ingestion, storage, transformation, aggregation, and analytical serving into distinct layers.

At a high level, the architecture looks like this:

```
Event Generator
      ↓
    Kafka
      ↓
PySpark Streaming
      ↓
 Bronze / Silver / Gold
      ↓
 DuckDB + FastAPI
      ↓
   Dashboard Layer
```

The resulting architecture looks similar to many modern cloud-native data platforms, but every component runs locally and can be developed incrementally without production infrastructure or cloud cost concerns.

More importantly, building the platform locally forces architectural decisions to become explicit:

* Where should raw data land first?
* How should streaming ingestion be separated from transformation logic?
* What data should remain immutable?
* Where should schema enforcement happen?
* Which queries should be pre-aggregated?
* What responsibilities belong to storage layers versus serving layers?

Those are architectural questions long before they become infrastructure questions.

One of the most important lessons in data engineering is that cloud platforms are not architecture. They are managed implementations of architectural patterns.

A streaming ingestion layer built locally with Kafka may eventually become Amazon MSK or Azure EventHub. Local Delta Lake storage may eventually move into S3 or ADLS. DuckDB queries may eventually become Snowflake or Databricks SQL workloads. The implementation details change, but the architectural responsibilities remain surprisingly consistent.

That portability is one of the reasons local development environments can be so valuable for learning data platform design. Building systems locally forces engineers to think explicitly about where data enters the platform, how it moves between layers, and which systems are responsible for storage, transformation, aggregation, and serving.

Instead of immediately provisioning cloud infrastructure, a local environment encourages experimentation:

* What happens when duplicate events arrive?
* How should raw data be partitioned?
* Which transformations belong in streaming jobs versus batch jobs?
* Should analytical queries scan raw data directly or rely on pre-aggregated tables?
* How should APIs interact with analytical storage?

That visibility helps reinforce an important idea:

> The goal is not to recreate enterprise infrastructure on a laptop. The goal is to understand the responsibilities of each architectural layer before managed cloud services abstract them away.

The following parts will explore:

* event-driven ingestion with Kafka and Spark Structured Streaming
* Bronze, Silver, and Gold lakehouse design patterns
* analytical serving with DuckDB and FastAPI
* how local architectures can evolve into production cloud-native systems

The full project is available on <a href="https://github.com/highfive52/ecommerce-data-platform" target="_blank" rel="noopener noreferrer">GitHub</a>.