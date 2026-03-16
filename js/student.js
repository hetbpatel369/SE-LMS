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
  renderStudentCourses(user.uid);
  renderUpcomingEvents();
  renderGradesTable(user.uid);

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

async function renderStudentCourses(uid) {
  const container = document.getElementById('my-courses-list');
  if (!container) return;
  container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Loading courses...</p>';

  try {
    const snapshot = await db.collection('courses').where('students', 'array-contains', uid).get();
    
    const enrolStat = document.getElementById('stat-enrolled');
    if (enrolStat) enrolStat.textContent = snapshot.size;

    if (snapshot.empty) {
      container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">No courses found.</p>';
      return;
    }

    const bgImages = [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000'
    ];

    let htmlString = '';
    let i = 0;
    snapshot.forEach(doc => {
      const c = doc.data();
      htmlString += `
        <a href="course-dash.html?id=${doc.id}" class="course-card-masonry">
          <div class="cover-img" style="background-image: url('${bgImages[i % bgImages.length]}')"></div>
          <div class="content">
            <h4>${c.title}</h4>
            <p style="margin-bottom:var(--space-md);">${c.instructorName} &bull; Next: ${c.nextClass}</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="flex:1;height:6px;background:var(--border);border-radius:3px;margin-right:var(--space-md);">
                <div style="width:${c.progress}%;height:100%;background:var(--primary);border-radius:3px;box-shadow:0 0 8px var(--primary-glow);"></div>
              </div>
              <span style="font-size:0.8rem;font-weight:700;color:var(--primary);">${c.progress}%</span>
            </div>
          </div>
        </a>
      `;
      i++;
    });
    container.innerHTML = htmlString;
  } catch (err) {
    console.error("Error fetching courses:", err);
    container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Failed to load courses.</p>';
  }
}

async function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Loading events...</p>';

  try {
    const snapshot = await db.collection('events').orderBy('date').limit(10).get();
    if (snapshot.empty) {
      container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">No upcoming events.</p>';
      return;
    }

    const typeColors = { assignment: 'var(--primary)', quiz: '#d97706', class: '#0891b2', exam: '#dc2626' };
    
    let html = '';
    snapshot.forEach(doc => {
      const e = doc.data();
      const dateParts = e.date.split('-');
      const d = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      html += `
        <div class="event-item" style="border-left-color: ${typeColors[e.type] || 'var(--primary)'};">
          <span class="event-date">${shortDate}</span>
          <span>${e.title}</span>
          <span class="badge badge-${e.type === 'exam' ? 'danger' : e.type === 'quiz' ? 'warning' : 'primary'}" style="margin-left:auto;font-size:0.65rem;">${e.type}</span>
        </div>
      `;
    });
    container.innerHTML = html;
  } catch (err) {
    console.error("Error fetching events:", err);
    container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Failed to load events.</p>';
  }
}

async function renderGradesTable(uid) {
  const tbody = document.getElementById('grades-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading grades...</td></tr>';

  try {
    const snapshot = await db.collection('grades').where('studentId', '==', uid).get();
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No grades found.</td></tr>';
      return;
    }

    let html = '';
    let totalScore = 0;
    snapshot.forEach(doc => {
      const g = doc.data();
      const gradeClass = g.grade.startsWith('A') ? 'grade-a' : g.grade.startsWith('B') ? 'grade-b' : g.grade.startsWith('C') ? 'grade-c' : 'grade-f';
      totalScore += g.score;
      html += `
        <tr>
          <td>${g.courseTitle}</td>
          <td>${g.assignment}</td>
          <td>${g.score}/100</td>
          <td class="grade-cell ${gradeClass}">${g.grade}</td>
          <td>${formatDate(g.date)}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
    
    // Update GPA Stat
    const gpaStat = document.getElementById('stat-gpa');
    if (gpaStat && snapshot.size > 0) {
      const avg = totalScore / snapshot.size;
      const gpa = (avg / 100) * 4;
      gpaStat.textContent = gpa.toFixed(1);
    }
  } catch(err) {
    console.error("Error fetching grades:", err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Failed to load grades.</td></tr>';
  }
}

