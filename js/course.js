/* ============================================
   Course Dashboard Logic  (v2 – Firestore-first)
   Fetches course data from Firestore by URL ?id=
   Falls back to rich demo data if DB unavailable
   ============================================ */

const DEMO_COURSES = {
  'c-math': {
    code: 'MATH-101', title: 'Mathematics 101',
    instructor: 'Dr. Alan Smith',
    instructorBio: 'Office hours Mon/Wed 2-4 PM, Room 302. Email for appointments. Focus areas: Algebra, Geometry, and Trigonometry.',
    bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Midterm Exam – March 25, 2026', postedBy:'Dr. Alan Smith', postedAt:'Mar 10, 2026 3:43 PM', body:'<p><strong>Midterm Announcement</strong></p><ul><li><strong>Date:</strong> March 25, 2026</li><li><strong>Coverage:</strong> Chapters 1–4</li><li><strong>Duration:</strong> 75 min</li><li><strong>Weight:</strong> 25% of final grade</li></ul><p>Good luck!</p>' },
      { title:'Welcome to Mathematics 101', postedBy:'Dr. Alan Smith', postedAt:'Jan 6, 2026 8:41 AM', body:'<p>Welcome! All course materials and announcements will be posted here. Check regularly.' }
    ]
  },
  'c-eng': {
    code: 'ENGL-200', title: 'English Literature 11',
    instructor: 'Ms. Sarah Johnson',
    instructorBio: 'Office hours Tue 10 AM–12 PM. All essays must follow MLA format. Looking forward to exploring Shakespeare and Austen this term.',
    bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Essay: Hamlet Analysis – Due Mar 28', postedBy:'Ms. Sarah Johnson', postedAt:'Mar 12, 2026 10:00 AM', body:'<p>Your Hamlet analytical essay is due <strong>March 28 at 11:59 PM</strong>. Submit via the portal. Minimum 1500 words, MLA format.</p>' },
      { title:'Welcome to English Literature 11', postedBy:'Ms. Sarah Johnson', postedAt:'Jan 5, 2026 9:00 AM', body:'<p>Welcome! Please review the syllabus and reading list posted in Content.</p>' }
    ]
  },
  'c-bio': {
    code: 'BIO-301', title: 'Biology – Cells & Genetics',
    instructor: 'Dr. Rina Patel',
    instructorBio: 'Lab sessions every Friday. Please wear appropriate safety equipment at all times in the lab.',
    bgImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Genetics Quiz – April 1', postedBy:'Dr. Rina Patel', postedAt:'Mar 20, 2026 9:00 AM', body:'<p>Quiz on Mendelian Genetics and Punnett Squares on <strong>April 1</strong>. Covers lectures 8–12.</p>' },
      { title:'Welcome to Biology', postedBy:'Dr. Rina Patel', postedAt:'Jan 5, 2026 8:00 AM', body:'<p>Welcome! Lab manuals are available in the Resource Centre. First lab session: Jan 10.</p>' }
    ]
  },
  'c-cs': {
    code: 'CS-101', title: 'Computer Science – Intro to Python',
    instructor: 'Mr. James Chen',
    instructorBio: 'Office hours Thu 12–2 PM. All coding assignments must be submitted as .py files. Python 3.10+ required.',
    bgImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Capstone Project Milestone 1 – Due Apr 7', postedBy:'Mr. James Chen', postedAt:'Mar 20, 2026 4:00 PM', body:'<p>Submit your project proposal (1 page) by <strong>April 7 at 11:59 PM</strong>. Include: project idea, tech stack, and timeline.</p>' },
      { title:'Welcome to CS 101', postedBy:'Mr. James Chen', postedAt:'Jan 6, 2026 10:00 AM', body:'<p>Welcome! Make sure Python 3.10+ is installed. First live Google Meet session is Thursday at 11 AM.</p>' }
    ]
  },
  'c-hist': {
    code: 'HIST-202', title: 'World History – Modern Era',
    instructor: 'Ms. Sarah Johnson',
    instructorBio: 'Office hours Mon 1–3 PM. All written work must cite at least 3 primary sources.',
    bgImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Cold War Essay – Due Mar 28', postedBy:'Ms. Sarah Johnson', postedAt:'Mar 15, 2026 11:00 AM', body:'<p>Your Cold War analysis essay is due <strong>March 28</strong>. Minimum 1200 words, 3 primary sources required.</p>' }
    ]
  },
  'c-phys': {
    code: 'PHYS-300', title: 'Physics – Mechanics & Waves',
    instructor: 'Dr. Alan Smith',
    instructorBio: 'Formula sheets are allowed in all exams. Office hours Tue/Fri 12–1 PM.',
    bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Newton\'s Laws Lab Report – Due Mar 27', postedBy:'Dr. Alan Smith', postedAt:'Mar 18, 2026 2:00 PM', body:'<p>Lab Report 2 on Newton\'s Laws is due <strong>March 27 at 5 PM</strong>. Use the report template in the Content section.</p>' }
    ]
  },
  'c-chem': {
    code: 'CHEM-200', title: 'Chemistry – Reactions & Stoichiometry',
    instructor: 'Dr. Rina Patel',
    instructorBio: 'Lab safety is mandatory. Lab coats and goggles required at all times.',
    bgImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Stoichiometry Midterm – April 3', postedBy:'Dr. Rina Patel', postedAt:'Mar 20, 2026 9:00 AM', body:'<p>Midterm exam on <strong>April 3 at 3 PM</strong>. Covers balancing equations, molar mass, and stoichiometry calculations.</p>' }
    ]
  },
  'c-art': {
    code: 'ART-100', title: 'Visual Arts & Design Thinking',
    instructor: 'Ms. Sarah Johnson',
    instructorBio: 'All tools and resources available in the Figma starter kit link in Content. Bring creativity!',
    bgImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000',
    announcements: [
      { title:'Design Portfolio Due – April 16', postedBy:'Ms. Sarah Johnson', postedAt:'Mar 18, 2026 10:00 AM', body:'<p>Your final design portfolio is due <strong>April 16 at 6 PM</strong>. Include 5 design artefacts and a 300-word reflection.</p>' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  if (!courseId) {
    document.getElementById('hero-course-title').textContent = 'No course selected.';
    return;
  }

  let courseData = null;

  // Try Firestore first
  try {
    const docSnap = await db.collection('courses').doc(courseId).get();
    if (docSnap.exists) {
      const d = docSnap.data();
      const demo = DEMO_COURSES[courseId] || {};
      courseData = {
        code:          demo.code || courseId.toUpperCase(),
        title:         d.title || demo.title || 'Course',
        instructor:    d.instructorName || demo.instructor || 'Instructor',
        instructorBio: demo.instructorBio || 'Office hours available on request.',
        bgImage:       demo.bgImage || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=2000',
        announcements: demo.announcements || [],
        schedule:      d.schedule || '',
        nextClass:     d.nextClass || '',
        materials:     d.materials || [],
        category:      d.category || '',
      };
    }
  } catch(e) {
    console.warn('Firestore unavailable, using demo data:', e);
  }

  // Fallback to demo data
  if (!courseData) {
    courseData = DEMO_COURSES[courseId] || DEMO_COURSES['c-math'];
  }

  // Render hero
  const hero = document.querySelector('.course-hero');
  if (hero && courseData.bgImage) hero.style.backgroundImage = `url('${courseData.bgImage}')`;

  document.title = `${courseData.code} – ${courseData.title} | LMS`;
  const navCode = document.getElementById('nav-course-code');
  if (navCode) navCode.textContent = courseData.code;

  document.getElementById('hero-course-title').innerHTML =
    `<span style="font-size:1rem;opacity:0.7;font-family:'Lexend',sans-serif;">${courseData.code}</span><br>${courseData.title}`;

  // Render Instructor
  document.getElementById('instructor-name').textContent = courseData.instructor;
  document.getElementById('instructor-bio').textContent = courseData.instructorBio;
  document.getElementById('instructor-avatar').innerHTML =
    courseData.instructor.split(' ').map(n => n[0]).join('');

  // Render materials if present
  if (courseData.materials && courseData.materials.length > 0) {
    const annoList = document.getElementById('course-announcements-list');
    const materialsHtml = `
      <div class="announcement-item" style="background:rgba(79,70,229,0.04);border-radius:var(--radius-md);padding:var(--space-lg);margin-bottom:var(--space-lg);">
        <h4 class="announcement-title">📎 Course Materials</h4>
        <ul style="margin-top:var(--space-sm);margin-left:var(--space-xl);font-size:0.9rem;color:var(--text-secondary);">
          ${courseData.materials.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>
    `;
    annoList.insertAdjacentHTML('afterbegin', materialsHtml);
  }

  // Render Announcements
  const announcementsList = document.getElementById('course-announcements-list');
  if (courseData.announcements && courseData.announcements.length > 0) {
    announcementsList.innerHTML += courseData.announcements.map(a => `
      <div class="announcement-item">
        <h4 class="announcement-title">${a.title}</h4>
        <div class="announcement-meta">${a.postedBy} &bull; ${a.postedAt}</div>
        <div class="announcement-body">${a.body}</div>
      </div>
    `).join('');
  } else {
    announcementsList.innerHTML += `<p style="color:var(--text-muted);font-size:0.85rem;">No announcements yet.</p>`;
  }

  // Schedule widget
  if (courseData.schedule) {
    const calDate = document.getElementById('course-calendar-date');
    if (calDate) calDate.textContent = courseData.schedule;
  }

  // Logo navigation
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
