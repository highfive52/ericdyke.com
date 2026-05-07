---
title: "CSV to Insights: Building a Baseball Data Pipeline with Python"
date: "2026-05-01"
tags: "Data Engineering, Python, Parquet, Medallion Architecture, Pandas, Partitioning"
summary: "A practical walkthrough for building a Python pipeline on top of the Lahman Baseball Dataset. We convert raw CSV files to Parquet, join player, batting, pitching, and fielding tables into a unified Silver layer using pandas, and introduce year-based partitioning—demonstrating how the Bronze/Silver patterns that underpin modern data platforms can be explored hands-on with a familiar dataset."
---

Most real-world data projects don’t begin with clean, well-structured tables. They start with raw files—often CSVs—spread across multiple domains, loosely connected, and not optimized for analysis. The Lahman Baseball Dataset is a perfect example of this.

It contains decades of baseball data split into separate files for players, batting, pitching, and fielding. There’s a lot of value in it, but in its raw form, it’s not particularly easy to work with. To get from raw data to something analytically useful, we need to reshape it.

In this post, I’ll walk through a simple Python pipeline that takes these CSV files (Bronze), converts them into Parquet (Bronze Processed), and then combines them into a single, analytics-ready dataset (Silver). Along the way, we’ll also introduce partitioning—one of the simplest ways to make your data feel “big data ready.”

----

**Starting with Raw Data**

The first step is simply getting the data into memory. At this stage, we’re not trying to fix anything—we just want to load what’s there.

```python
import pandas as pd
from pathlib import Path

data_path = Path("lahman_csv")

people = pd.read_csv(data_path / "People.csv")
batting = pd.read_csv(data_path / "Batting.csv")
pitching = pd.read_csv(data_path / "Pitching.csv")
fielding = pd.read_csv(data_path / "Fielding.csv")
```

This gives us four independent DataFrames. Each one is useful on its own, but none of them tell a complete story. More importantly, CSV is not a great format for repeated analytical work. It’s slow to read, takes up more space than necessary, and doesn’t enforce consistent types.

----

**Converting to Parquet**

Instead of working directly with CSV files, we can convert everything into Parquet. This is a columnar format designed for analytics workloads, and the performance difference becomes obvious quickly when datasets grow.

```python
bronze_path = Path("bronze_parquet")
bronze_path.mkdir(exist_ok=True)

people.to_parquet(bronze_path / "people.parquet", index=False)
batting.to_parquet(bronze_path / "batting.parquet", index=False)
pitching.to_parquet(bronze_path / "pitching.parquet", index=False)
fielding.to_parquet(bronze_path / "fielding.parquet", index=False)
```

At this point, nothing about the data has changed logically. What has changed is how efficiently we can work with it.

----

**Cleaning Before Combining**

Before joining datasets together, it’s worth doing a bit of light cleanup. Even something as simple as enforcing consistent types can prevent subtle bugs later.

```python
batting["yearID"] = batting["yearID"].astype("int32")
pitching["yearID"] = pitching["yearID"].astype("int32")
fielding["yearID"] = fielding["yearID"].astype("int32")

batting = batting.fillna(0)
pitching = pitching.fillna(0)
fielding = fielding.fillna(0)
```

This step isn’t about perfection—it’s about making the data predictable enough to combine safely.

----

**Building a Player-Centric Dataset**

The Lahman dataset is relational by design. The playerID field links players across every table, while yearID helps align seasonal stats. Once you recognize that, the path to a unified dataset becomes straightforward.
We can start by enriching batting data with player information:

```python
batting_silver = batting.merge(
    people,
    on="playerID",
    how="left"
)
```

From there, we can build a more complete dataset that combines batting, pitching, and fielding:

```python
player_stats = (
    batting
    .merge(
        pitching,
        on=["playerID", "yearID"],
        how="outer",
        suffixes=("_bat", "_pitch")
    )
    .merge(
        fielding,
        on=["playerID", "yearID"],
        how="outer"
    )
    .merge(
        people,
        on="playerID",
        how="left"
    )
)
```

The result is a denormalized table where each row represents a player’s performance in a given year.

----

**Writing the Silver Layer**

Once the data is combined, we persist it again as Parquet. This becomes the dataset we actually analyze.

```python
silver_path = Path("silver")
silver_path.mkdir(exist_ok=True)

player_stats.to_parquet(
    silver_path / "player_stats.parquet",
    index=False
)
```

At this point, we’ve transformed fragmented raw data into something structured and analysis-ready.

----

**Introducing Partitioning by yearID**

Up to now, we’ve written Parquet as a single file. That works—but it doesn’t scale particularly well. As datasets grow, reading the entire dataset just to analyze a subset becomes inefficient.
Partitioning solves this problem by physically organizing data into directories based on a column value. In our case, yearID is a natural choice.
Here’s how we can write the same dataset, partitioned by year:

```python
player_stats.to_parquet(
    "silver/player_stats_partitioned",
    partition_cols=["yearID"],
    index=False
)
This produces a directory structure that looks something like:
silver/player_stats_partitioned/
    yearID=1990/
    yearID=1991/
    yearID=1992/
    ...
```
Each folder contains only the data for that specific year.

---

**Why Partitioning Matters**

Partitioning might feel like an implementation detail, but it has a significant impact on performance and usability.

When you query a partitioned dataset—especially with tools like pandas, DuckDB, or Spark—only the relevant partitions are scanned. If you’re analyzing data from 2001, there’s no reason to read files from 1975.

This leads to:
*	Faster query performance
*	Reduced memory usage
*	Lower IO costs (especially in cloud environments)

It also aligns nicely with how analysts think. Time-based filtering is one of the most common patterns in data analysis, and partitioning by yearID makes that pattern efficient by default.
There’s also a subtle organizational benefit. Instead of one large, opaque file, your dataset becomes a structured collection of smaller pieces. This makes incremental updates easier—new years can simply be added without rewriting everything.

----

**A Small Shift with Big Impact**

What makes this pipeline interesting isn’t its complexity—it’s the shift in how the data is shaped.

We started with disconnected CSV files that required effort just to explore. By the end, we have a dataset that’s structured around how we want to ask questions.

Partitioning takes that one step further. It doesn’t change the data itself, but it changes how efficiently we can access it—and that becomes increasingly important as data grows.

----

**Final Thoughts**

Although this example uses baseball data, the pattern itself is much broader. Converting raw files into columnar storage, combining them into curated datasets, and organizing them for efficient access is exactly how modern data platforms operate.

The tools might change—pandas today, Spark tomorrow—but the ideas remain the same.

And sometimes, the best way to understand those ideas is to build them yourself, starting with something as simple—and as rich—as baseball data.