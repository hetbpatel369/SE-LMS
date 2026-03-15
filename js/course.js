/* ============================================
   Course Dashboard Logic
   Fetches course details and renders announcements using the Algoma-inspired layout
   ============================================ */

const COURSE_DATABASE = {
  1: {
    code: 'MATH-101-W04',
    title: 'Mathematics 101',
    instructor: 'Dr. Smith',
    instructorBio: 'I am available for office hours on Mondays and Wednesdays from 2:00 PM to 4:00 PM in Room 302. Please email me to schedule an appointment outside these hours.',
    announcements: [
      {
        title: 'Midterm Exam on Wednesday, March 25, 2026',
        postedBy: 'Dr. Smith',
        postedAt: 'Mar 10, 2026 3:43 PM',
        body: `
          <p><strong>Midterm Exam Announcement – MATH 101</strong></p>
          <ul>
            <li><strong>Date:</strong> Wednesday, March 25, 2026</li>
            <li><strong>Time:</strong> During regular class time</li>
            <li><strong>Coverage:</strong> Chapters 1-4</li>
            <li><strong>Duration:</strong> 1 hour 15 minutes</li>
            <li><strong>Weight:</strong> 25% of the final course grade</li>
          </ul>
          <p>Please prepare accordingly.<br>Good luck!</p>
        `
      },
      {
        title: 'Welcome to MATH-101-W04: Mathematics 101',
        postedBy: 'Dr. Smith',
        postedAt: 'Jan 6, 2026 8:41 PM',
        body: `
          <p>Hello Everyone,</p>
          <p>Welcome to <strong>MATH-101-W04</strong>. My name is Dr. Smith, and I will be your instructor for the Winter 2026 term.</p>
          <p>The course website is now active. All announcements, updates, and course-related information will be posted here, so please make sure to check it regularly.</p>
          <p>See you in class tomorrow.</p>
        `
      }
    ]
  },
  2: {
    code: 'ENGL-200-W01',
    title: 'English Literature',
    instructor: 'Ms. Johnson',
    instructorBio: 'Office hours: Tuesdays 10:00 AM - 12:00 PM. I look forward to exploring classic literature with you this term.',
    announcements: [
      {
        title: 'Welcome to English Literature',
        postedBy: 'Ms. Johnson',
        postedAt: 'Jan 5, 2026 9:00 AM',
        body: '<p>Welcome to the course! Please review the syllabus posted in the Content section.</p>'
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Access Control
  if (!requireAuth()) return;

  // Get Course ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  
  const courseData = COURSE_DATABASE[courseId] || COURSE_DATABASE[1]; // fallback to course 1 for demo purposes

  // Render Page Content
  document.title = `${courseData.code} - ${courseData.title}`;
  document.getElementById('nav-course-code').textContent = courseData.code;
  document.getElementById('hero-course-title').innerHTML = `${courseData.code} - <br>${courseData.title}`;
  
  // Render Instructor
  document.getElementById('instructor-name').textContent = courseData.instructor;
  document.getElementById('instructor-bio').textContent = courseData.instructorBio;
  document.getElementById('instructor-avatar').innerHTML = 
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

  // Render Current Date for Calendar Widget
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('course-calendar-date').textContent = todayDate;

  // Render Announcements
  const announcementsList = document.getElementById('course-announcements-list');
  if (courseData.announcements && courseData.announcements.length > 0) {
    announcementsList.innerHTML = courseData.announcements.map(a => `
      <div class="announcement-item">
        <h4 class="announcement-title">${a.title}</h4>
        <div class="announcement-meta">${a.postedBy} posted on ${a.postedAt}</div>
        <div class="announcement-body">
          ${a.body}
        </div>
      </div>
    `).join('');
  } else {
    announcementsList.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">There are no announcements to display.</p>`;
  }

  // Handle Logo Navigation Contextual Redirection
  const courseHubLogo = document.getElementById('course-hub-logo');
  if (courseHubLogo) {
    const user = getCurrentUser();
    let dashLink = 'student-dash.html';
    if (user && user.role === 'admin') dashLink = 'admin-dash.html';
    else if (user && user.role === 'professor') dashLink = 'professor-dash.html';
    else if (user && user.role === 'parent') dashLink = 'parent-dash.html';
    courseHubLogo.href = dashLink;
  }
});
