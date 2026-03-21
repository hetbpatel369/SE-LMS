# LMS AI Contributor Guide

This file tells AI assistants how to work in this repository safely and correctly.

## 1) Project Type and Stack
- Frontend-only web app (no build step, no framework)
- Tech: HTML, CSS, vanilla JavaScript, Firebase (Auth + Firestore + Storage)
- Hosting: Firebase Hosting (public root is project root)           lmsforlibary.web.app 


## 2) Core Architecture
- Shared JS utilities: `js/app.js`
- Auth flow: `js/auth.js`
- Firebase setup: `js/firebase-config.js`
- Role dashboards:
  - Admin: `pages/admin/admin-dash.html` + `js/admin.js`
  - Professor: `pages/professor/professor-dash.html` + `js/professor.js`
  - Parent: `pages/parent/parent-dash.html` + `js/parent.js`
  - Student: `pages/student/student-dash.html` + `js/student.js`
- Public pages: `pages/public/*`
- Shared pages: `pages/shared/*`

## 3) Routing and Access Rules
- Login page: `pages/public/login.html`
- Each dashboard script validates role and redirects unauthorized users to login.
- Preserve role guards whenever changing dashboard scripts.

## 4) Firebase Data Model (Important)
`js/seed-firebase.js` is the source of truth for seeded structure.

Collections used:
- `users` (doc id = Firebase Auth uid)
- `courses`
- `events`
- `grades`
- `meetClasses`
- `books`
- `contacts`
- `submissions` (used by professor grading UI)

Critical relationship rules:
- User profiles are keyed by real Auth uid in `users/{uid}`.
- `courses.students` contains student Auth UIDs.
- Student course query depends on:
  - `db.collection('courses').where('students', 'array-contains', currentUser.uid)`
- Events shown to students are filtered by enrolled course IDs (`event.courseId`).
- Do not change these UID-based relationships unless all dependent queries are updated.

## 5) Coding Conventions
- Keep implementation in vanilla JS style used in current files.
- Do not introduce frameworks or bundlers.
- Use existing utility patterns (`showToast`, modal helpers, role redirects).
- Keep new code defensive: null-check DOM elements before use.
- Prefer small, focused edits over large rewrites.
- Preserve existing URL structure and page paths.

## 6) Safe Change Workflow for AI
1. Read related HTML page and matching JS file before editing.
2. Verify Firestore field names already used by existing queries.
3. Make minimal changes in-place.
4. Re-check role redirect logic is still intact.
5. Re-check student enrollment/event filtering still uses UIDs and `courseId`.

## 7) Manual Verification Checklist
After changes, validate:
- Login works for admin/professor/parent/student test accounts.
- Each role lands on correct dashboard.
- Student dashboard loads enrolled courses, upcoming events, and grades.
- Professor dashboard can load submissions and grade records.
- No broken links in navbar/sidebar navigation.

## 8) Seed and Demo Notes
- Seed/reset flow is in `pages/public/seed.html` with `js/seed-firebase.js`.
- Demo credentials are documented in `CREDENTIALS.md`.
- Current seeded password convention is `Demo@1234`.

## 9) Deploy/Hosting Notes
- Hosting config: `firebase.json`
- Root redirect points `/` -> `/pages/public/index.html`
- Files ignored from hosting include `CREDENTIALS.md` and `TODO.md`.

## 10) What Not to Do
- Do not migrate to React/Vue/TypeScript in this repo.
- Do not rename core Firestore collections/fields without full cross-file updates.
- Do not remove role checks in dashboard pages.
- Do not replace UID-based relationships with email/name based joins.
