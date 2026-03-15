/* ============================================
   Parent Dashboard Logic
   ============================================ */

const PARENT_STUDENTS = [
  {
    name: 'John Doe',
    email: 'john@student.edu',
    gpa: 3.5,
    courses: [
      { title: 'Mathematics 101', grade: 'A', progress: 72 },
      { title: 'English Literature', grade: 'B', progress: 45 },
      { title: 'Biology Basics', grade: 'A', progress: 88 },
      { title: 'Computer Science', grade: 'C', progress: 30 },
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane@student.edu',
    gpa: 3.8,
    courses: [
      { title: 'Mathematics 101', grade: 'A', progress: 85 },
      { title: 'World History', grade: 'A', progress: 70 },
      { title: 'Biology Basics', grade: 'B', progress: 60 },
    ]
  }
];

const PARENT_BILLING = [
  { student: 'John Doe', course: 'Mathematics 101', amount: 50, date: '2025-09-01', status: 'paid' },
  { student: 'John Doe', course: 'English Literature', amount: 40, date: '2025-09-01', status: 'paid' },
  { student: 'Jane Smith', course: 'Mathematics 101', amount: 50, date: '2025-09-01', status: 'paid' },
  { student: 'John Doe', course: 'Computer Science', amount: 60, date: '2026-01-10', status: 'paid' },
  { student: 'Jane Smith', course: 'Biology Basics', amount: 55, date: '2026-01-10', status: 'pending' },
];

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'parent') {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('parent-name').textContent = user.name;
  document.getElementById('parent-avatar').textContent = user.name.split(' ').map(n => n[0]).join('');
  document.getElementById('parent-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (window.innerWidth <= 1024) document.getElementById('sidebar-toggle').style.display = 'flex';

  renderStudentCards();
  renderBilling();
});

function renderStudentCards() {
  const container = document.getElementById('student-cards');
  if (!container) return;

  container.innerHTML = PARENT_STUDENTS.map(s => `
    <div class="card" style="padding:var(--space-xl);">
      <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg);">
        <div class="avatar avatar-lg">${s.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h3 style="font-size:1.1rem;">${s.name}</h3>
          <p style="font-size:0.85rem;">${s.email}</p>
          <span class="badge badge-primary" style="margin-top:4px;">GPA: ${s.gpa}</span>
        </div>
      </div>
      <h4 style="font-size:0.9rem;margin-bottom:var(--space-sm);">Enrolled Courses</h4>
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
        ${s.courses.map(c => {
          const gradeClass = c.grade === 'A' ? 'grade-a' : c.grade === 'B' ? 'grade-b' : 'grade-c';
          return `
          <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-sm);background:var(--bg-input);border-radius:var(--radius-sm);">
            <span style="flex:1;font-size:0.85rem;">${c.title}</span>
            <span class="grade-cell ${gradeClass}" style="font-weight:700;font-size:0.85rem;">${c.grade}</span>
            <div class="progress-bar" style="width:60px;">
              <div class="progress-fill" style="width:${c.progress}%"></div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function renderBilling() {
  const tbody = document.getElementById('billing-table');
  if (!tbody) return;

  tbody.innerHTML = PARENT_BILLING.map(b => `
    <tr>
      <td>${b.student}</td>
      <td>${b.course}</td>
      <td><strong>$${b.amount}.00</strong></td>
      <td>${formatDate(b.date)}</td>
      <td><span class="badge badge-${b.status === 'paid' ? 'success' : 'warning'}">${b.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
    </tr>
  `).join('');
}
