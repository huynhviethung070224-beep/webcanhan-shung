---
title: DragonGo
role: Backend & Database Developer
tagline: Campus navigation with schedule-aware routes and AI-assisted scheduling.
summary: A campus navigation app combining schedule-aware route planning with AI-assisted scheduling. I contributed to the backend and database, integrating Firebase Authentication and synchronizing users’ personal schedules and account data.
technologies:
  - JavaScript
  - Firebase Authentication
  - Cloud Firestore
cover: orbit
coverAlt: DragonGo logo, with a map pin in place of the letter O.
coverFit: contain
coverImage:
  src: /projects/dragon-go/logo.png
  alt: DragonGo wordmark. The letter O is a map pin.
  width: 1063
  height: 309
purpose: Help students move around campus with route planning that understands their schedule.
order: 1
featured: true
---

## Overview

DragonGo is a campus navigation app built in a hackathon context. It combines schedule-aware route planning with AI-assisted scheduling, so the routes a student sees are tied to where they actually need to be next.

## My contribution

I worked on the backend and database layer of the application:

- Integrated **Firebase Authentication** so each student signs in with their own account.
- Modelled and synchronized users’ **personal schedules and account data** in **Cloud Firestore**, keeping per-user data consistent across sessions.
- Connected the authenticated identity to the schedule data that the route planner and the AI-assisted scheduling features read from.

## How the pieces fit together

The product relationship at the centre of DragonGo is between four things: campus routes, personal schedules, authentication, and per-user data. Authentication identifies the student; the schedule describes where and when they need to be; Firestore stores that schedule against the account; and the route planner uses it to suggest where to go next.
