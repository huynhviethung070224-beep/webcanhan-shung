---
title: Library Management System
role: SQL Database Developer
tagline: A normalized PostgreSQL schema with SQL reports for a multi-branch library.
summary: A PostgreSQL project for managing books, members, branches, and borrowing records. I designed a normalized database with six relational tables and developed SQL reports covering overdue books, rental income, borrowing activity, and branch performance.
technologies:
  - PostgreSQL
  - SQL
cover: schema
coverAlt: Illustrative cover for the Library Management System showing six connected table blocks.
purpose: Manage books, members, branches, and borrowing records for a library with several branches.
order: 2
featured: true
---

## Overview

The Library Management System is a PostgreSQL project for managing books, members, branches, and borrowing records. The focus of the work was relational design first, then SQL analysis on top of that design.

## Relational design

I designed a **normalized database with six relational tables** covering the core entities of a multi-branch library: the books held in the catalogue, the members who borrow them, the branches that hold stock, and the borrowing records that connect them over time.

## SQL reports

On top of the schema I developed SQL reports that answer the questions a library actually asks:

- **Overdue books** — which loans have passed their due date.
- **Rental income** — how much the library earns from borrowing.
- **Borrowing activity** — how members use the collection over time.
- **Branch performance** — how individual branches compare.

## My contribution

Database design and all SQL development on the project: table design and normalization, relationships between the six tables, and the reporting queries listed above.
