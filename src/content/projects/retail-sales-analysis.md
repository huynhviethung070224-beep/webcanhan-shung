---
title: Retail Sales Analysis
role: SQL Developer
tagline: A beginner PostgreSQL project that cleans a retail sales table and answers business questions with SQL.
summary: A PostgreSQL project on a retail sales dataset. I created the database, removed rows with missing values, and used SQL to look at customers, categories, and sales over time.
technologies:
  - PostgreSQL
  - SQL
cover: schema
coverAlt: Illustrative cover for the retail sales analysis.
purpose: Practice cleaning a sales table and answering straightforward business questions in SQL.
repoUrl: https://github.com/huynhviethung070224-beep/sql_retail_sales_p1
order: 5
featured: false
earlier: true
---

## Overview

This is a beginner PostgreSQL project on one `retail_sales` table: transaction id, sale date and time, customer, gender, age, category, quantity, price, cost, and total sale.

## What I did

- Created the database and the sales table, then loaded the dataset.
- Counted records, distinct customers, and categories, and deleted rows with nulls in the sales columns.
- Wrote queries for a single sale date, clothing sales of at least four units in November 2022, total sales and order counts by category, and the average age of customers who bought from Beauty.

The queries use filtering, `GROUP BY`, and date formatting. They are in the repository; this page does not reprint sample output from a live database.
