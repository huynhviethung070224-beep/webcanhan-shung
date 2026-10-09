---
title: Badminton FairPlay Queue
role: Developer
tagline: A mobile-first queue for a small badminton club, with fair game assignment across three courts.
summary: A mobile-first queue and three-court management app for a small badminton club. It distributes games fairly while recommending reasonably compatible skill groups. Members use anonymous sign-in, and administrators keep a private member and payment directory.
technologies:
  - TypeScript
  - React
  - Supabase
  - PostgreSQL
cover: orbit
coverAlt: Screenshot of Badminton FairPlay Queue showing three courts at the Drexel Badminton Club.
coverFrame: browser
coverFit: contain
coverImage:
  src: /projects/badminton-fairplay-queue/court-desktop.png
  alt: Desktop screenshot of Badminton FairPlay Queue. Club night is closed and three courts are marked available.
  width: 1280
  height: 900
purpose: Run a fair waiting list and three courts for a small badminton club.
demoUrl: https://badminton.drexel-queue.workers.dev/
repoUrl: https://github.com/huynhviethung070224-beep/queue-
gallery:
  - src: /projects/badminton-fairplay-queue/court-mobile.png
    alt: Phone screenshot of Badminton FairPlay Queue with the queue closed and three courts available.
    caption: The same court view on a phone, from the project’s own interface tests.
    width: 320
    height: 900
    frame: browser
order: 3
featured: false
---

## Overview

Badminton FairPlay Queue is a club app for managing who plays next. The product is meant to spread games fairly and still suggest groups with compatible skill levels. It is deployed for members at the live demo.

## What it does

- Members join a queue from a phone-first interface.
- Three courts run at once. Skill labels on courts are guidance, not hard rules.
- Matches use a configurable seven-minute default and their own countdown.
- Anonymous Supabase Auth restores a profile in the same browser. Choosing a name does not claim that identity.
- Administrators have a separate, persistent directory for members and payments.
- The fairness logic is plain TypeScript and stays independent of payment status and court labels.

## Stack

React, TypeScript, Vite, and Supabase (PostgreSQL). The member app is at `/` and the admin dashboard is behind login.
