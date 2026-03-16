# LMS Feature Implementation TODOs

Based on the [IMPLEMENTATION_PLAN.txt](./IMPLEMENTATION_PLAN.txt), none of the new features have been fully implemented in the frontend. The Firebase seed and demo data will be initialized to support the schema, but the UI pages and JS logic remain to be built.

## FEATURE 1: DIGITAL LIBRARY SYSTEM

### Frontend Pages
- [ ] Create `library.html` (Main library landing page with catalog, search, filter, sort)
- [ ] Create `book-details.html` (Individual book page, borrow/buy buttons, reviews)
- [ ] Create `my-library.html` (Student dashboard for borrowed/purchased books, due dates)
- [ ] Create `book-reviews.html` (Review submission and display)
- [ ] Update `student-dash.html` (Add "Library" link in sidebar, adjust notification badges)
- [ ] Update `login.html` (Ensure demo credentials logic supports new roles if applicable)

### JavaScript Logic
- [ ] Create `js/library.js` (search, filter, sort, fetch from Firebase, list rendering)
- [ ] Create `js/book-details.js` (fetch book, borrow/buy transactions, review handling)
- [ ] Create `js/library-manager.js` (active borrows, overdue checks, penalties, transaction processing)
- [ ] Create `js/notifications-library.js` (return reminders, available notifications)
- [ ] Update `js/student.js` (Library menu routing and notification logic)
- [ ] Update `js/app.js` (Routing and module initialization)

## FEATURE 2: ZOOM CLASS INTEGRATION

### Frontend Pages
- [ ] Create `zoom-classes.html` (List of scheduled classes, calendar view, join buttons)
- [ ] Create `class-recordings.html` (Past classes list, play recordings, download)
- [ ] Update `student-dash.html` (Add "Live Classes" widget)
- [ ] Update `professor-dash.html` (Add class scheduling section)
- [ ] Update `course-dash.html` (Add Zoom class section)

### JavaScript Logic
- [ ] Create `js/zoom-integration.js` (Zoom API interactions: init, generate link, reschedule)
- [ ] Create `js/zoom-student.js` (Upcoming classes, join class, attendance, recordings retrieval)
- [ ] Create `js/zoom-professor.js` (Schedule class, edit schedule, start/end class, upload recordings)
- [ ] Create `js/attendance-tracker.js` (Track join/leave, durations, reports)

## Firebase Configuration Status
- [x] Initial collections (`books`, `zoomClasses`) and sample data added to `seed-firebase.js` & `demo-data.js`.
- [ ] Configure/Enable proper Firestore Rules for new collections.
- [ ] Set up Zoom API Backend proxy (Firebase Cloud Functions recommended) for secure Zoom token generation.

## ADDITIONAL ENHANCEMENTS
- [x] Link the messaging feature through the database (Firebase).
- [x] Add a registration page to allow users to register as a professor.
- [x] Enforce authentication: Users must be logged in to enroll in courses or borrow books.
