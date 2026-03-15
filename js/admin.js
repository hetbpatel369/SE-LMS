/* ============================================
   Admin Dashboard Logic
   ============================================ */

const ADMIN_PENDING = [
  { uid: 'p-new-1', name: 'Alice Chen', email: 'alice@student.edu', role: 'student' },
  { uid: 'p-new-2', name: 'Bob Wilson', email: 'bob@student.edu', role: 'student' },
  { uid: 'p-new-3', name: 'Carol Davis', email: 'carol@parent.edu', role: 'parent' },
  { uid: 'p-new-4', name: 'Dr. Emily Hart', email: 'emily@lms.edu', role: 'professor' },
  { uid: 'p-new-5', name: 'Frank Taylor', email: 'frank@student.edu', role: 'student' },
];

const ADMIN_ALL_USERS = [
  { name: 'John Doe', email: 'john@student.edu', role: 'student', status: 'approved', joined: '2025-09-01' },
  { name: 'Jane Smith', email: 'jane@student.edu', role: 'student', status: 'approved', joined: '2025-09-01' },
  { name: 'Dr. Smith', email: 'smith@lms.edu', role: 'professor', status: 'approved', joined: '2025-08-15' },
  { name: 'Ms. Johnson', email: 'johnson@lms.edu', role: 'professor', status: 'approved', joined: '2025-08-15' },
  { name: 'Robert Doe', email: 'robert@parent.edu', role: 'parent', status: 'approved', joined: '2025-09-02' },
  { name: 'Dr. Patel', email: 'patel@lms.edu', role: 'professor', status: 'approved', joined: '2025-08-20' },
  { name: 'Ms. Lee', email: 'lee@lms.edu', role: 'professor', status: 'approved', joined: '2025-08-22' },
  { name: 'Sarah Kim', email: 'sarah@student.edu', role: 'student', status: 'approved', joined: '2025-09-05' },
];

const ADMIN_ACTIVITY = [
  { text: 'New user registration: Alice Chen (student)', time: '2 hours ago' },
  { text: 'Course "Physics Advanced" updated by Dr. Garcia', time: '4 hours ago' },
  { text: 'Payment received: $50 from John Doe', time: '6 hours ago' },
  { text: 'New user registration: Bob Wilson (student)', time: '1 day ago' },
  { text: 'Grade posted: Biology Lab Report by Dr. Patel', time: '1 day ago' },
];

const ADMIN_REVENUE = [
  { id: 'TRX-101', student: 'John Doe', amount: 50.00, date: '2026-03-15', status: 'completed' },
  { id: 'TRX-102', student: 'Sarah Kim', amount: 55.00, date: '2026-03-14', status: 'completed' },
  { id: 'TRX-103', student: 'Robert Jane', amount: 40.00, date: '2026-03-13', status: 'completed' },
  { id: 'TRX-104', student: 'Alice Chen', amount: 60.00, date: '2026-03-12', status: 'completed' },
  { id: 'TRX-105', student: 'Frank Taylor', amount: 50.00, date: '2026-03-11', status: 'pending' },
];

const ADMIN_ENROLLMENTS = [
  { course: 'Mathematics 101', category: 'Sciences', professor: 'Dr. Smith', students: 45, capacity: 50 },
  { course: 'English Literature', category: 'Humanities', professor: 'Ms. Johnson', students: 38, capacity: 40 },
  { course: 'Physics Advanced', category: 'Sciences', professor: 'Dr. Garcia', students: 28, capacity: 30 },
  { course: 'Intro to Art', category: 'Electives', professor: 'Mr. Davis', students: 25, capacity: 35 },
];

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  const adminNameEl = document.getElementById('admin-name');
  if (adminNameEl) adminNameEl.textContent = user.name;

  const adminDateEl = document.getElementById('admin-date');
  if (adminDateEl) adminDateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle && window.innerWidth <= 1024) sidebarToggle.style.display = 'flex';

  renderApprovals();
  renderAdminActivity();
  renderAllUsers();
  renderRevenue();
  renderEnrollments();

  // Search & filter
  document.getElementById('user-search').addEventListener('input', renderAllUsers);
  document.getElementById('user-filter').addEventListener('change', renderAllUsers);

  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
});

function renderApprovals() {
  const tbody = document.getElementById('approvals-table');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_PENDING.map(u => `
    <tr id="approval-${u.uid}">
      <td><strong>${u.name}</strong></td>
      <td><span class="badge badge-${u.role === 'professor' ? 'warning' : u.role === 'parent' ? 'success' : 'primary'}">${u.role}</span></td>
      <td>${u.email}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="approveUser('${u.uid}')">Approve</button>
        <button class="btn btn-sm btn-danger" onclick="rejectUser('${u.uid}')" style="margin-left:4px;">Reject</button>
      </td>
    </tr>
  `).join('');
}

function approveUser(uid) {
  const row = document.getElementById(`approval-${uid}`);
  if (row) {
    row.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => row.remove(), 300);
  }
  showToast('User approved successfully!', 'success');
  // Update pending count
  const countEl = document.getElementById('stat-pending-approvals');
  const current = parseInt(countEl.textContent);
  countEl.textContent = Math.max(0, current - 1);
}

function rejectUser(uid) {
  const row = document.getElementById(`approval-${uid}`);
  if (row) {
    row.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => row.remove(), 300);
  }
  showToast('User rejected.', 'warning');
  const countEl = document.getElementById('stat-pending-approvals');
  const current = parseInt(countEl.textContent);
  countEl.textContent = Math.max(0, current - 1);
}

function renderAdminActivity() {
  const container = document.getElementById('admin-activity');
  if (!container) return;
  container.innerHTML = ADMIN_ACTIVITY.map(a => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function renderAllUsers() {
  const tbody = document.getElementById('users-table');
  if (!tbody) return;

  const search = (document.getElementById('user-search').value || '').toLowerCase();
  const filter = document.getElementById('user-filter').value;

  let filtered = ADMIN_ALL_USERS;
  if (filter !== 'all') filtered = filtered.filter(u => u.role === filter);
  if (search) filtered = filtered.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));

  tbody.innerHTML = filtered.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role === 'professor' ? 'warning' : u.role === 'parent' ? 'success' : 'primary'}">${u.role}</span></td>
      <td><span class="badge badge-success">Active</span></td>
      <td>${formatDate(u.joined)}</td>
    </tr>
  `).join('');
}

function renderRevenue() {
  const tbody = document.getElementById('revenue-table');
  if (!tbody) return;

  tbody.innerHTML = ADMIN_REVENUE.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.student}</td>
      <td><span style="color:#4ade80; font-weight:600;">$${r.amount.toFixed(2)}</span></td>
      <td>${formatDate(r.date)}</td>
      <td><span class="badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}">${r.status}</span></td>
    </tr>
  `).join('');
}

function renderEnrollments() {
  const tbody = document.getElementById('enrollments-table');
  if (!tbody) return;

  tbody.innerHTML = ADMIN_ENROLLMENTS.map(c => `
    <tr>
      <td><strong>${c.course}</strong><br><small style="color:var(--text-muted);">${c.category}</small></td>
      <td>${c.professor}</td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="progress-bar" style="flex:1;">
            <div class="progress-fill" style="width: ${(c.students / c.capacity) * 100}%;"></div>
          </div>
          <span style="font-size:0.75rem;">${c.students} / ${c.capacity}</span>
        </div>
      </td>
      <td><span class="badge ${c.students >= c.capacity ? 'badge-danger' : 'badge-success'}">${c.students >= c.capacity ? 'Full' : 'Open'}</span></td>
    </tr>
  `).join('');
}
