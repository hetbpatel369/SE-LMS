/* ============================================
   Student Dashboard Logic
   Populates dashboard with demo or Firebase data
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  const user = getCurrentUser();
  if (!user || user.role !== 'student') {
    window.location.href = 'login.html';
    return;
  }

  // Populate user info safely
  const firstName = user.name.split(' ')[0];
  const welcomeMsg = document.getElementById('welcome-msg');
  if (welcomeMsg) welcomeMsg.textContent = `Welcome back, ${firstName}!`;
  
  const studentName = document.getElementById('student-name');
  if (studentName) studentName.textContent = user.name;
  
  const studentAvatar = document.getElementById('student-avatar');
  if (studentAvatar) studentAvatar.textContent = user.name.split(' ').map(n => n[0]).join('');
  
  const currentDateEl = document.getElementById('current-date');
  if (currentDateEl) {
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Show sidebar on mobile
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (window.innerWidth <= 1024) sidebarToggle.style.display = 'flex';

  // Render courses
  renderStudentCourses();
  renderUpcomingEvents();
  renderGradesTable();

  // Handle "View All" courses link
  const viewAllBtn = document.getElementById('view-all-courses-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('section-courses');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

});

function renderStudentCourses() {
  const container = document.getElementById('my-courses-list');
  if (!container) return;

  const bgImages = [
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000'
  ];

  const htmlString = LMS_COURSES.map((c, i) => `
    <a href="course-dash.html?id=${c.id}" class="course-card-masonry">
      <div class="cover-img" style="background-image: url('${bgImages[i % bgImages.length]}')"></div>
      <div class="content">
        <h4>${c.title}</h4>
        <p style="margin-bottom:var(--space-md);">${c.instructor} &bull; Next: ${c.nextClass}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="flex:1;height:6px;background:var(--border);border-radius:3px;margin-right:var(--space-md);">
            <div style="width:${c.progress}%;height:100%;background:var(--primary);border-radius:3px;box-shadow:0 0 8px var(--primary-glow);"></div>
          </div>
          <span style="font-size:0.8rem;font-weight:700;color:var(--primary);">${c.progress}%</span>
        </div>
      </div>
    </a>
  `).join('');
  container.innerHTML = htmlString;
}

function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;

  const typeColors = { assignment: 'var(--primary)', quiz: '#d97706', class: '#0891b2', exam: '#dc2626' };

  container.innerHTML = LMS_EVENTS_ARRAY.map(e => `
    <div class="event-item" style="border-left-color: ${typeColors[e.type] || 'var(--primary)'};">
      <span class="event-date">${e.date}</span>
      <span>${e.title}</span>
      <span class="badge badge-${e.type === 'exam' ? 'danger' : e.type === 'quiz' ? 'warning' : 'primary'}" style="margin-left:auto;font-size:0.65rem;">${e.type}</span>
    </div>
  `).join('');
}

function renderGradesTable() {
  const tbody = document.getElementById('grades-table');
  if (!tbody) return;

  tbody.innerHTML = LMS_GRADES.map(g => {
    const gradeClass = g.grade.startsWith('A') ? 'grade-a' : g.grade.startsWith('B') ? 'grade-b' : g.grade.startsWith('C') ? 'grade-c' : 'grade-f';
    return `
      <tr>
        <td>${g.course}</td>
        <td>${g.assignment}</td>
        <td>${g.score}/100</td>
        <td class="grade-cell ${gradeClass}">${g.grade}</td>
        <td>${formatDate(g.date)}</td>
      </tr>
    `;
  }).join('');
}

