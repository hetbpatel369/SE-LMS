/* ============================================
   LMS Demo Data
   Centralized sample data for the front-end prototype.
   Used by Dashboard, Calendar, and Messages pages.
   ============================================ */

/**
 * Shared Course List
 */
const LMS_COURSES = [
  { id: 1, title: 'Mathematics 101', instructor: 'Dr. Smith', progress: 72, nextClass: 'Mon 10:00 AM' },
  { id: 2, title: 'English Literature', instructor: 'Ms. Johnson', progress: 45, nextClass: 'Tue 2:00 PM' },
  { id: 3, title: 'Biology Basics', instructor: 'Dr. Patel', progress: 88, nextClass: 'Wed 9:00 AM' },
  { id: 4, title: 'Computer Science', instructor: 'Ms. Lee', progress: 30, nextClass: 'Thu 11:00 AM' }
];

/**
 * Shared Grades List
 */
const LMS_GRADES = [
  { course: 'Mathematics 101', assignment: 'Algebra Test 2', score: 88, grade: 'A', date: '2026-03-10' },
  { course: 'English Literature', assignment: 'Essay: Shakespeare', score: 75, grade: 'B', date: '2026-03-08' },
  { course: 'Biology Basics', assignment: 'Lab Report 3', score: 92, grade: 'A', date: '2026-03-05' },
  { course: 'Computer Science', assignment: 'Coding Assignment 1', score: 68, grade: 'C', date: '2026-03-03' }
];

/**
 * Shared Events List (Keyed by YYYY-MM-DD for Calendar)
 */
const LMS_EVENTS_MAP = {
  '2026-03-18': [{ title: 'Math Assignment Due', type: 'assignment', time: '11:59 PM' }],
  '2026-03-20': [{ title: 'Biology Quiz', type: 'quiz', time: '9:00 AM' }],
  '2026-03-22': [{ title: 'English Essay Submission', type: 'assignment', time: '11:59 PM' }],
  '2026-03-25': [{ title: 'CS Live Class - Zoom', type: 'class', time: '11:00 AM' }],
  '2026-03-28': [{ title: 'Physics Midterm Exam', type: 'exam', time: '10:00 AM' }],
  '2026-04-02': [{ title: 'History Report Due', type: 'assignment', time: '5:00 PM' }],
  '2026-04-05': [{ title: 'Math Quiz', type: 'quiz', time: '10:00 AM' }],
  '2026-04-10': [{ title: 'Science Fair Deadline', type: 'assignment', time: '12:00 PM' }],
};

/**
 * Helper: Flatten LMS_EVENTS_MAP into an array (for the dashboard list)
 */
function getFlattenedEvents() {
  const flattened = [];
  const sortedDates = Object.keys(LMS_EVENTS_MAP).sort();
  sortedDates.forEach(date => {
    LMS_EVENTS_MAP[date].forEach(evt => {
      // Parse 'YYYY-MM-DD' to short month format, eg "Mar 18"
      const dateParts = date.split('-');
      const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      flattened.push({
        date: shortDate,
        fullDate: date,
        title: evt.title,
        type: evt.type,
        time: evt.time
      });
    });
  });
  return flattened;
}

const LMS_EVENTS_ARRAY = getFlattenedEvents();

/**
 * Shared Contact Book (Messages)
 */
const LMS_CONTACTS = [
  { id: 'prof-001', name: 'Dr. Smith', role: 'Professor - Mathematics 101', avatar: 'DS', lastMsg: 'Please review the homework.', online: true },
  { id: 'prof-002', name: 'Ms. Johnson', role: 'Professor - English Literature', avatar: 'MJ', lastMsg: 'Essay due next week.', online: true },
  { id: 'prof-003', name: 'Dr. Patel', role: 'Professor - Biology Basics', avatar: 'DP', lastMsg: 'Lab report feedback sent.', online: false },
  { id: 'prof-004', name: 'Ms. Lee', role: 'Professor - Computer Science', avatar: 'ML', lastMsg: 'Good work on the project!', online: true },
  { id: 'student-002', name: 'Jane Smith', role: 'Student', avatar: 'JS', lastMsg: 'Can you share your notes?', online: false },
];

/**
 * Shared Chat Histories (Messages)
 */
const LMS_MESSAGES = {
  'prof-001': [
    { sender: 'them', text: 'Hi! I wanted to remind everyone that the Algebra Test 3 is next Monday.', time: '10:30 AM' },
    { sender: 'me', text: 'Thank you Dr. Smith! Will the test include Chapter 5?', time: '10:35 AM' },
    { sender: 'them', text: 'Yes, Chapters 4 and 5. Focus on quadratic equations and factoring.', time: '10:38 AM' },
    { sender: 'me', text: 'Understood. I will practice those sections this weekend.', time: '10:40 AM' },
    { sender: 'them', text: 'Great! Feel free to email me if you have questions. Good luck!', time: '10:42 AM' },
    { sender: 'them', text: 'Also, please review the homework I posted yesterday.', time: '2:15 PM' },
  ],
  'prof-002': [
    { sender: 'them', text: 'Reminder: Shakespeare essay is due next Friday.', time: '3:00 PM' },
    { sender: 'me', text: 'Thank you! Is there a minimum word count?', time: '3:05 PM' },
    { sender: 'them', text: '1500 words minimum. MLA format please.', time: '3:10 PM' },
  ],
  'prof-003': [
    { sender: 'them', text: 'I sent feedback on your lab report in the portal. Please check.', time: '11:00 AM' },
    { sender: 'me', text: 'Will do! Thank you Dr. Patel.', time: '11:15 AM' },
  ],
  'prof-004': [
    { sender: 'them', text: 'Your web project demo was impressive! Well done.', time: '4:00 PM' },
    { sender: 'me', text: 'Thank you Ms. Lee! I enjoyed working on it.', time: '4:05 PM' },
  ],
  'student-002': [
    { sender: 'them', text: 'Hey! Can you share your Math notes from Wednesday?', time: '5:00 PM' },
    { sender: 'me', text: 'Sure! I will send them tonight.', time: '5:10 PM' },
  ],
};
