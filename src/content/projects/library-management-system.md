---
title: Library Management System
role: SQL Database Developer
tagline: A normalized PostgreSQL schema with SQL reports for a multi-branch library.
summary: A PostgreSQL project for managing books, members, branches, and borrowing records. I designed a normalized database with six relational tables and developed SQL reports covering overdue books, rental income, borrowing activity, and branch performance.
technologies:
  - PostgreSQL
  - SQL
cover: schema
coverAlt: Entity diagram of the six library tables and their relationships.
coverFit: contain
coverImage:
  src: /projects/library-management-system/erd.png
  alt: Entity diagram showing branch, employees, members, books, issued_status, and return_status.
  width: 2254
  height: 1716
purpose: Manage books, members, branches, and borrowing records for a library with several branches.
repoUrl: https://github.com/huynhviethung070224-beep/SQL_Library_Management_P2
gallery:
  - src: /projects/library-management-system/erd.png
    alt: Entity diagram showing branch, employees, members, books, issued_status, and return_status.
    caption: The six tables and how they connect. Branch employs staff, members and books meet in issued_status, and returns point back to an issue.
    width: 2254
    height: 1716
order: 2
featured: true
---

## Overview

The Library Management System is a PostgreSQL project for managing books, members, branches, and borrowing records. The focus of the work was relational design first, then SQL analysis on top of that design.

## Relational design

I designed a **normalized database with six relational tables**: `branch`, `employees`, `members`, `books`, `issued_status`, and `return_status`. Branches employ staff, members borrow books, and issue and return records connect a member, a book, and the employee who processed the loan.

## SQL reports

On top of the schema I developed SQL reports that answer the questions a library actually asks:

- **Overdue books** — which loans have passed their due date.
- **Rental income** — how much the library earns from borrowing.
- **Borrowing activity** — how members use the collection over time.
- **Branch performance** — how individual branches compare.

The overdue report treats a loan as overdue when it has not been returned and the issue date is more than 30 days ago:

```sql
SELECT
    ist.issued_member_id,
    m.member_name,
    bk.book_title,
    ist.issued_date,
    CURRENT_DATE - ist.issued_date AS over_dues_days
FROM issued_status AS ist
JOIN members AS m ON m.member_id = ist.issued_member_id
JOIN books AS bk ON bk.isbn = ist.issued_book_isbn
LEFT JOIN return_status AS rs ON rs.issued_id = ist.issued_id
WHERE rs.return_date IS NULL
  AND (CURRENT_DATE - ist.issued_date) > 30
ORDER BY 1;
```

Branch performance is a `CREATE TABLE AS` report: books issued, books returned, and rental revenue per branch, joined through the employee who issued the book. Query results from a live database are not included here.

## My contribution

Database design and all SQL development on the project: table design and normalization, relationships between the six tables, and the reporting queries listed above.
