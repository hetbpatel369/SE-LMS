/* ============================================
   Professor Dashboard Logic
   ============================================ */

const PROF_SUBMISSIONS = [
  { student: 'John Doe', course: 'Mathematics 101', assignment: 'Algebra Test 3', submitted: '2026-03-14', fileUrl: '#' },
  { student: 'Jane Smith', course: 'Mathematics 101', assignment: 'Calculus HW 5', submitted: '2026-03-13', fileUrl: '#' },
  { student: 'Sarah Kim', course: 'Mathematics 101', assignment: 'Algebra Test 3', submitted: '2026-03-14', fileUrl: '#' },
  { student: 'John Doe', course: 'English Literature', assignment: 'Shakespeare Essay', submitted: '2026-03-12', fileUrl: '#' },
  { student: 'Jane Smith', course: 'English Literature', assignment: 'Poetry Analysis', submitted: '2026-03-11', fileUrl: '#' },
];

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'professor') {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('prof-name').textContent = user.name;
  document.getElementById('prof-avatar').textContent = user.name.split(' ').map(n => n[0]).join('');
  document.getElementById('prof-welcome').textContent = `Welcome, ${user.name}!`;
  document.getElementById('prof-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (window.innerWidth <= 1024) document.getElementById('sidebar-toggle').style.display = 'flex';

  renderSubmissions();
  initUploadForm();
  initDropZone();

  // Sidebar nav
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

function renderSubmissions() {
  const tbody = document.getElementById('submissions-table');
  if (!tbody) return;

  tbody.innerHTML = PROF_SUBMISSIONS.map((s, i) => `
    <tr id="sub-${i}">
      <td><strong>${s.student}</strong></td>
      <td>${s.course}</td>
      <td>${s.assignment}</td>
      <td>${formatDate(s.submitted)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="openGradeModal(${i})">Grade</button>
      </td>
    </tr>
  `).join('');
}

function openGradeModal(index) {
  const sub = PROF_SUBMISSIONS[index];
  const grade = prompt(`Grade for ${sub.student} – ${sub.assignment}\nEnter score (0-100):`);
  if (grade !== null && !isNaN(grade) && grade >= 0 && grade <= 100) {
    showToast(`Graded ${sub.student}: ${grade}/100`, 'success');
    const row = document.getElementById(`sub-${index}`);
    if (row) {
      row.style.opacity = '0.5';
      const actionCell = row.querySelector('td:last-child');
      actionCell.innerHTML = `<span class="badge badge-success">Graded: ${grade}</span>`;
    }
  }
}

function initUploadForm() {
  const form = document.getElementById('upload-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('upload-title').value.trim();
    if (!title) {
      showToast('Please enter a title for the material.', 'error');
      return;
    }
    showToast(`Material "${title}" uploaded successfully!`, 'success');
    form.reset();
  });
}

function initDropZone() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('upload-file');
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
  });
}

function handleFileSelect(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showToast('File too large! Maximum size is 10MB.', 'error');
    return;
  }

  const dropZone = document.getElementById('drop-zone');
  dropZone.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #16a34a;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <p><strong>${file.name}</strong></p>
    <p class="file-limit">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
  `;
  showToast(`File "${file.name}" selected.`, 'info');
}
