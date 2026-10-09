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
coverAlt: DragonGo home screen with Weekly Schedule, School Tour, and See Map.
coverFit: contain
coverFrame: browser
coverImage:
  src: /projects/dragon-go/home.webp
  alt: DragonGo home screen. The logo sits above Weekly Schedule, School Tour, and See Map.
  width: 1600
  height: 962
purpose: Help students move around campus with route planning that understands their schedule.
period: April 11–12, 2026
teamSize: 3 people
gallery:
  - src: /projects/dragon-go/schedule.webp
    alt: DragonGo schedule route planner.
    caption: Schedule route planner. Routes follow the signed-in student’s classes.
    width: 1600
    height: 962
    frame: browser
  - src: /projects/dragon-go/weekly.webp
    alt: DragonGo screen for adding a weekly schedule.
    caption: Adding a weekly schedule. Changes are stored on the signed-in account with Firebase.
    width: 1600
    height: 962
    frame: browser
  - src: /projects/dragon-go/tour.webp
    alt: DragonGo guided campus tour.
    caption: Guided campus tour for new students and visitors.
    width: 1600
    height: 962
    frame: browser
  - src: /projects/dragon-go/map.webp
    alt: DragonGo shared campus map with location markers.
    caption: Shared campus map. Markers for Drexel locations stay in sync across the app.
    width: 1600
    height: 962
    frame: browser
  - src: /projects/dragon-go/admin.webp
    alt: DragonGo admin map for editing location markers.
    caption: Admin map. Editing a marker requires a security code.
    width: 1600
    height: 962
    frame: browser
  - src: /projects/dragon-go/logo.png
    alt: DragonGo wordmark. The letter O is a map pin.
    caption: The DragonGo wordmark.
    width: 1063
    height: 309
    frame: plain
order: 1
featured: true
---

## Overview

DragonGo was built during Philly CodeFest at Drexel University’s College of Computing & Informatics. The hackathon theme was Building AI for Philly’s Future. The app is a campus navigation tool: an interactive map, routes based on a class schedule, and a guided campus tour for people who are new to campus. It was put together in the short time of the hackathon.

## Team

- Sarah Hoang, Developer / Designer
- Viet Hung Huynh, Backend / Frontend
- Khiem Truong, Backend / AI Developer

## My contribution

I worked on the backend and database layer of the application:

- Integrated **Firebase Authentication** so each student signs in with their own account.
- Modelled and synchronized users’ **personal schedules and account data** in **Cloud Firestore**, keeping per-user data consistent across sessions.
- Connected the authenticated identity to the schedule data that the route planner and the AI-assisted scheduling features read from.

## How the pieces fit together

The product relationship at the centre of DragonGo is between four things: campus routes, personal schedules, authentication, and per-user data. Authentication identifies the student; the schedule describes where and when they need to be; Firestore stores that schedule against the account; and the route planner uses it to suggest where to go next.

On the demo build, schedule changes are saved to the signed-in account with Firebase. Map markers added for Drexel locations stay in sync across the maps in the app. An admin can edit those markers only with a security code.
