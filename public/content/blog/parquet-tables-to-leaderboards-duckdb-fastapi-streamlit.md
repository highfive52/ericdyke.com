---
title: "Building Career Leaderboards with DuckDB, FastAPI, and Streamlit"
date: "2026-05-04"
tags: "Data Engineering, Python, DuckDB, FastAPI, Streamlit, Parquet, Lakehouse"
summary: "Building on a partitioned Silver layer of Lahman baseball data, this article walks through connecting DuckDB, FastAPI, and Streamlit into a lightweight analytics stack. DuckDB queries Parquet files directly without a database server, FastAPI exposes the results as a REST API, and Streamlit renders an interactive career batting leaderboard—demonstrating how modern lakehouse patterns can be applied at small scale with minimal infrastructure."
---

In the previous article, we transformed the raw Lahman baseball CSV files into a silver analytics layer by combining player batting statistics with people metadata and storing the results as partitioned Parquet files by yearID.

That silver layer becomes much more valuable once it powers an actual application.

In this follow-up project, we will use those partitioned Parquet datasets to build a career batting leaderboard application powered by three lightweight technologies:
*	DuckDB for analytical querying 
*	FastAPI for serving results 
*	Streamlit for the frontend experience 

What makes this stack interesting is how little infrastructure is required. There is no traditional database server, no warehouse cluster, and no complicated orchestration layer. The Parquet files themselves become the analytical foundation, while DuckDB provides the compute layer directly on top of the data lake.

The result feels surprisingly modern for such a small amount of code.

----

**Starting with the Silver Layer**

The silver dataset already contains the pieces we need:
*	player batting statistics, 
*	player demographic information, 
*	and partitioned Parquet storage organized by season. 

The partitioning strategy from the earlier article ends up being particularly important here.

```python
df.write.partitionBy("yearID").parquet("/silver/baseball")
This creates a structure similar to:
/silver/baseball/
    yearID=1985/
    yearID=1986/
    yearID=1987/
```

At first glance, partitioning may seem like a simple organizational choice, but it becomes extremely valuable once analytical queries start running against the dataset.
When DuckDB executes a query filtered on a range of years, it can skip entire directories that do not match the predicate. Instead of scanning every file, it performs partition pruning and reads only the relevant data.

That optimization becomes more important as datasets grow larger. Even on a laptop, queries across decades of baseball history remain fast because the query engine avoids unnecessary reads.

----

**Using DuckDB as the Analytical Engine**

DuckDB is what makes this architecture work so well.

Instead of importing data into a separate database, DuckDB queries the Parquet files directly. The storage layer and compute layer remain loosely coupled, which dramatically simplifies the stack.

A career leaderboard query can be written almost exactly like standard SQL:

```python
import duckdb

query = """
SELECT
    playerID,
    nameFirst,
    nameLast,
    SUM(H) AS hits,
    SUM(HR) AS home_runs,
    SUM(RBI) AS rbis,
    SUM(AB) AS at_bats,
    ROUND(SUM(H)::DOUBLE / NULLIF(SUM(AB), 0), 3) AS batting_avg
FROM read_parquet('data/silver/baseball/*.parquet')
GROUP BY playerID, nameFirst, nameLast
HAVING SUM(AB) > 3000
ORDER BY home_runs DESC
LIMIT 25
"""

df = duckdb.query(query).to_df()

print(df.head())
```

This query aggregates player careers directly from the Parquet files without requiring any ingestion step.

That is one of the most compelling aspects of DuckDB. The analytical engine simply attaches itself to the data lake. There is no separate warehouse to maintain, no database migrations, and no synchronization process between storage and serving layers.

DuckDB also performs several optimizations automatically. It reads only the columns required for the query, pushes filters down into the Parquet scan, and uses vectorized execution internally. Those optimizations make even fairly complex analytical workloads feel responsive.

For projects like this, DuckDB behaves almost like a miniature local data warehouse.

----

**Building the API Layer with FastAPI**

Once the leaderboard query exists, the next step is exposing it through an API.

FastAPI is a natural fit here because it is lightweight, fast, and easy to integrate with analytical Python workflows. The API layer simply becomes a thin wrapper around DuckDB queries.

```python
from fastapi import FastAPI
import duckdb

app = FastAPI()

@app.get("/career-leaders")
def career_leaders(limit: int = 25):

    query = f"""
    SELECT
        playerID,
        nameFirst,
        nameLast,
        SUM(H) AS hits,
        SUM(HR) AS home_runs,
        SUM(RBI) AS rbis,
        ROUND(SUM(H)::DOUBLE / NULLIF(SUM(AB), 0), 3) AS batting_avg
    FROM read_parquet('data/silver/baseball/*.parquet')
    GROUP BY playerID, nameFirst, nameLast
    HAVING SUM(AB) > 3000
    ORDER BY home_runs DESC
    LIMIT {limit}
    """

    df = duckdb.query(query).to_df()

    return df.to_dict(orient="records")
```

Running the service is straightforward:

```shell
uvicorn app:app --reload
```

The endpoint now returns live leaderboard results from the Parquet-backed analytical layer.

```
http://localhost:8000/career-leaders
```

FastAPI also generates interactive documentation automatically. You can explore a working example of this API—backed by a real DuckDB query against the Lahman dataset—at the live docs endpoint:

<a href="https://baseball-data-api-private.onrender.com/docs" target="_blank" rel="noopener noreferrer">baseball-data-api-private.onrender.com/docs</a>

<img src="/images/api_lehmans.jpg" alt="FastAPI interactive docs for the Lahman baseball API" style="width:100%;height:auto;border-radius:8px;margin:1rem 0;" />

One of the advantages of separating the API layer from the frontend is flexibility. Once the API exists, multiple applications can consume the same analytical service. A Streamlit app can use it, but so could a React frontend, another internal service, or even a mobile application.

The API layer also becomes the ideal place to introduce parameterized analytics.

For example, filters can easily be added for:
*	minimum at-bats, 
*	specific year ranges, 
*	player searches, 
*	or different leaderboard metrics. 

The application begins to evolve from a static report into a reusable analytics platform.

----

**Creating the Frontend with Streamlit**

With the API running, the final piece is presenting the data interactively.
Streamlit works especially well for analytics applications because it minimizes frontend complexity. Instead of building a traditional web application with JavaScript frameworks, we can focus entirely on the data experience.

A basic leaderboard application requires very little code:

```python
import streamlit as st
import pandas as pd
import requests

st.title("MLB Career Batting Leaders")

limit = st.slider("Number of Players", 10, 100, 25)

response = requests.get(
    f"http://localhost:8000/career-leaders?limit={limit}"
)

df = pd.DataFrame(response.json())

st.dataframe(df)
```

Launching the application:

```shell
streamlit run app.py
```

At this point, the architecture is fully connected.

The Streamlit application requests leaderboard data from FastAPI. FastAPI executes analytical queries through DuckDB. DuckDB reads directly from partitioned Parquet datasets in the silver layer.

Despite the simplicity of the stack, the experience already feels similar to a lightweight analytical platform.

A working version of this application is deployed and available to explore:

<a href="https://baseball-data-explorer-app-6hgszysmyracswcarvw3w6.streamlit.app/" target="_blank" rel="noopener noreferrer">baseball-data-explorer-app on Streamlit</a>

<img src="/images/streamlit_lehmans.png" alt="Streamlit baseball data explorer app" style="width:100%;height:auto;border-radius:8px;margin:1rem 0;" />

It includes three tabs that each demonstrate a different aspect of the architecture:

- **Player Search** — search by first or last name and return player details from the API
- **Client-Side Leaderboard** — builds a top 10 career stats table by reading all batting Parquet files directly in the browser; intentionally slower to illustrate why server-side aggregation matters
- **DuckDB Leaderboard** — top 20 career leaderboard powered by a DuckDB query against the Parquet files, with a selector to switch between stats (home runs, hits, stolen bases, and more)

The contrast between the second and third tab is the most instructive part. The same data, the same results—but the difference in how the work is done becomes obvious at scale.

----

**Why This Architecture Feels So Modern**

What makes this project interesting is that it mirrors many modern lakehouse design patterns, just at a much smaller scale.

Traditional analytical systems often followed a path like this:

```
CSV → Database → API → Dashboard
```

Increasingly, modern systems are moving toward:

```
Raw Files → Parquet → Query Engine → API → Frontend
```

The Parquet files themselves become the durable analytical storage layer. Query engines like DuckDB provide compute directly against that storage without requiring data movement into a separate serving database.

That separation between storage and compute is one of the defining characteristics of modern analytics architecture.

Even though this project runs locally, the design resembles patterns used in much larger cloud analytics systems.

----

**Final Thoughts**

One of the most satisfying aspects of this project is how naturally the pieces fit together.

The silver layer created in the previous article is no longer just a cleaned dataset sitting in storage. It becomes the foundation for interactive analytical applications.
DuckDB provides a remarkably powerful analytical engine without operational complexity. FastAPI exposes that analytical layer cleanly through REST endpoints. Streamlit makes it easy to turn the results into an interactive user experience.

Together, the stack demonstrates how modern data tooling allows relatively small projects to adopt architectural patterns that once required enormous infrastructure investments.

With only partitioned Parquet files and a few lightweight Python frameworks, we now have a fully functioning baseball analytics application capable of serving interactive career batting leaderboards directly from a data lake.