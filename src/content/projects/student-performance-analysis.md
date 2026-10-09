---
title: Student Performance Analysis
role: Data Analysis
tagline: What is associated with a student’s final grade, using the UCI Student Performance dataset.
summary: An analysis of the UCI Student Performance dataset (Portuguese subject, 649 students) asking which factors are associated with the final grade G3. The write-up looks at study time, absences, previous failures, family educational support, and earlier grades, and treats the results as associations rather than causes.
technologies:
  - Python
  - Pandas
  - Jupyter
cover: schema
coverAlt: Illustrative cover for the student performance analysis.
purpose: Describe which recorded factors are associated with students’ final grades.
repoUrl: https://github.com/huynhviethung070224-beep/student-performance-analysis
order: 4
featured: false
---

## Overview

The question is: what factors are associated with a student’s final grade (`G3`)? The data is the UCI Student Performance dataset, Portuguese subject: 649 students and 33 columns. `G3` is the final grade on a 0–20 scale. Because the data is observational, the findings describe associations and are not causal.

## What I looked at

Weekly study time, school absences, previous class failures, family educational support, and the earlier grades `G1` and `G2`. The original files are kept unchanged. Charts are in the repository under `reports/figures`.

## Findings from the dataset

- `G2` has the strongest correlation with `G3` (r = 0.919), then `G1` (r = 0.826).
- Students with at least one previous failure have a lower mean `G3` (8.59) than students with none (12.51).
- Mean `G3` rises across the first three study-time categories, from 10.84 to 13.23. The highest category is slightly lower (13.06) and has only 35 students.
- Absences have a weak negative association with `G3` (Pearson −0.091, Spearman −0.159).
- Students with family educational support have a mean `G3` of 12.06, compared with 11.67 without it. Both groups have a median of 12.
