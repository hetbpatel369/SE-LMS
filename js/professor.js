/* ============================================
   Professor Dashboard Logic
   ============================================ */

let PROF_SUBMISSIONS = []; // Will be loaded from Firestore

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (!user || user.role !== 'professor') {
    window.location.href = 'login.html';
    return;
  }

  const profNameEl = document.getElementById('prof-name');
  if (profNameEl) profNameEl.textContent = user.name;
  
  const profAvatarEl = document.getElementById('prof-avatar');
  if (profAvatarEl) profAvatarEl.textContent = user.name.split(' ').map(n => n[0]).join('');

  const profWelcome = document.getElementById('prof-welcome');
  if (profWelcome) profWelcome.textContent = `Welcome, ${user.name}!`;

  const profDate = document.getElementById('prof-date');
  if (profDate) profDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle && window.innerWidth <= 1024) sidebarToggle.style.display = 'flex';

  renderSubmissions();
  renderStudents();
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

async function renderSubmissions() {
  const tbody = document.getElementById('submissions-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading submissions...</td></tr>';

  try {
    const snapshot = await db.collection('submissions').get();
    
    PROF_SUBMISSIONS = [];
    snapshot.forEach(doc => {
      PROF_SUBMISSIONS.push({ id: doc.id, ...doc.data() });
    });

    if (PROF_SUBMISSIONS.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No pending submissions.</td></tr>';
      return;
    }

    tbody.innerHTML = PROF_SUBMISSIONS.map((s, i) => `
      <tr id="sub-${i}" ${s.grade !== undefined ? 'style="opacity: 0.6;"' : ''}>
        <td><strong>${s.student || 'Unknown'}</strong></td>
        <td>${s.course || 'Unknown'}</td>
        <td>${s.assignment || 'N/A'}</td>
        <td>${s.submitted ? formatDate(s.submitted) : 'N/A'}</td>
        <td>
          ${s.grade !== undefined 
            ? `<div style="display:flex; align-items:center; gap:8px;">
                 <span class="badge badge-success">Graded: ${s.grade}</span>
                 <button class="btn btn-sm btn-outline" style="padding: 2px 8px; font-size: 0.75rem;" onclick="openGradeModal(${i})">Edit</button>
               </div>`
            : `<button class="btn btn-sm btn-secondary" onclick="openGradeModal(${i})">Grade</button>`
          }
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error("Error fetching submissions:", err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Error loading submissions.</td></tr>';
  }
}

async function renderStudents() {
  const tbody = document.getElementById('students-table');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading students...</td></tr>';

  try {
    const snapshot = await db.collection('users').where('role', '==', 'student').get();
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No students found.</td></tr>';
      return;
    }

    let html = '';
    snapshot.forEach(doc => {
      const s = doc.data();
      html += `
        <tr>
          <td><strong>${s.name}</strong><br><small style="color:var(--text-muted);">${s.email}</small></td>
          <td>Active</td>
          <td><strong>-</strong></td>
          <td style="width: 25%;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="progress-bar" style="flex:1;">
                <div class="progress-fill" style="width: 50%;"></div>
              </div>
              <span style="font-size:0.75rem;">50%</span>
            </div>
          </td>
          <td>
            <a href="messages.html" class="btn btn-sm btn-outline">Message</a>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  } catch (err) {
    console.error("Error fetching students:", err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Error loading students.</td></tr>';
  }
}

async function openGradeModal(index) {
  const sub = PROF_SUBMISSIONS[index];
  const currentGrade = sub.grade !== undefined ? sub.grade : '';
  const gradeStr = prompt(`Grade for ${sub.student || 'Student'} – ${sub.assignment}\nEnter score (0-100):`, currentGrade);
  
  if (gradeStr !== null) {
    if (gradeStr.trim() === '') {
      try {
        await db.collection('submissions').doc(sub.id).update({ grade: firebase.firestore.FieldValue.delete() });
        showToast(`Removed grade for ${sub.student || 'Student'}`, 'info');
        renderSubmissions();
      } catch (err) {
        showToast('Error removing grade.', 'error');
      }
      return;
    }
    
    const parsedGrade = parseInt(gradeStr);
    if (!isNaN(parsedGrade) && parsedGrade >= 0 && parsedGrade <= 100) {
      try {
        await db.collection('submissions').doc(sub.id).update({ grade: parsedGrade });
        showToast(`Graded ${sub.student || 'Student'}: ${parsedGrade}/100`, 'success');
        renderSubmissions(); 
      } catch (err) {
        showToast('Error updating grade.', 'error');
      }
    } else {
      showToast('Invalid grade. Must be a number between 0 and 100.', 'error');
    }
  }
}

function initUploadForm() {
  const form = document.getElementById('upload-form');
  if (!form) return;

  const typeSelect = document.getElementById('upload-type');
  const fileArea = document.getElementById('file-upload-area');
  const linkArea = document.getElementById('link-upload-area');
  
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      const type = e.target.value;
      if (type === 'video' || type === 'zoom') {
        if (fileArea) fileArea.style.display = 'none';
        if (linkArea) linkArea.style.display = 'block';
      } else {
        if (fileArea) fileArea.style.display = 'block';
        if (linkArea) linkArea.style.display = 'none';
        renderDropZone();
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('upload-title').value.trim();
    const type = typeSelect ? typeSelect.value : 'pdf';

    if (!title) {
      showToast('Please enter a title for the material.', 'error');
      return;
    }
    
    if (type === 'video' || type === 'zoom') {
      const linkUrl = document.getElementById('upload-link').value.trim();
      if (!linkUrl) {
        showToast('Please enter a valid link URL.', 'error');
        return;
      }
      showToast(`Successfully added link for "${title}"!`, 'success');
    } else {
      if (droppedFilesArray.length === 0) {
        showToast('Please select at least one file to upload.', 'error');
        return;
      }
      showToast(`Successfully uploaded ${droppedFilesArray.length} file(s) for "${title}"!`, 'success');
    }

    form.reset();
    resetDropZone();
    
    // Reset view
    if (fileArea) fileArea.style.display = 'block';
    if (linkArea) linkArea.style.display = 'none';
    renderDropZone();
  });
}

function initDropZone() {
  const dropZone = document.getElementById('drop-zone');
  if (!dropZone) return;

  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('button')) return; // Ignore button clicks inside
    const fileInput = document.getElementById('upload-file');
    if (fileInput) fileInput.click();
  });

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
    if (files.length > 0) handleFileSelect(files);
  });

  // Use event delegation for input since it will be overwritten
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'upload-file') {
      if (e.target.files.length > 0) handleFileSelect(e.target.files);
    }
  });
}

// Array to hold files for multi-upload
let droppedFilesArray = [];

window.resetDropZone = function() {
  droppedFilesArray = [];
  renderDropZone();
};

function renderDropZone() {
  const dropZone = document.getElementById('drop-zone');
  if (!dropZone) return;

  const typeValue = document.getElementById('upload-type') ? document.getElementById('upload-type').value : 'pdf';
  let acceptStr = '.pdf';
  let limitStr = 'Max 10MB per file · PDF';
  if (typeValue === 'assignment' || typeValue === '') {
    acceptStr = '.pdf,.docx,.doc,.xlsx,.xls,.csv,.pptx,.ppt,.zip';
    limitStr = 'Max 10MB per file · PDF, Word, Excel, PPT, ZIP';
  }

  if (droppedFilesArray.length === 0) {
    dropZone.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <p>Drag & drop or click to upload</p>
      <p class="file-limit">${limitStr}</p>
      <input type="file" id="upload-file" accept="${acceptStr}" style="display:none;" multiple>
    `;
    return;
  }

  // Render the list of files if there are any
  const filesListHtml = droppedFilesArray.map((file, index) => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); margin-bottom:8px; text-align:left;">
        <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#16a34a; width:20px; height:20px; flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            <p style="font-size:0.85rem; font-weight:600; margin:0;">${file.name}</p>
            <p style="font-size:0.7rem; color:var(--text-muted); margin:0;">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button type="button" class="btn btn-icon" style="color:#ef4444; padding:4px;" onclick="removeFile(${index})" aria-label="Remove ${file.name}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
  }).join('');

  dropZone.innerHTML = `
    <div style="text-align:left;">
      <div style="margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.85rem; font-weight:600;">${droppedFilesArray.length} file(s) ready</span>
        <button type="button" class="btn btn-sm btn-secondary" onclick="document.getElementById('upload-file').click();">+ Add More</button>
      </div>
      <div style="max-height:180px; overflow-y:auto; padding-right:8px;">
        ${filesListHtml}
      </div>
    </div>
    <input type="file" id="upload-file" accept="${acceptStr}" style="display:none;" multiple>
  `;
}

// Ensure the form gets handled properly when files are dropped or selected
function handleFileSelect(files) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  let addedCount = 0;

  Array.from(files).forEach(file => {
    if (file.size > maxSize) {
      showToast(`File "${file.name}" is too large! Max is 10MB.`, 'error');
      return; // Skip this file
    }
    
    // Check if file already exists in our array
    const exists = droppedFilesArray.some(f => f.name === file.name && f.size === file.size);
    if (!exists) {
      droppedFilesArray.push(file);
      addedCount++;
    }
  });

  if (addedCount > 0) {
    if (addedCount === 1) showToast(`Added 1 file`, 'info');
    else showToast(`Added ${addedCount} files`, 'info');
    renderDropZone();
  }
}

window.removeFile = function(index) {
  // Prevent event bubbling if clicking near edges
  event.stopPropagation();
  const removed = droppedFilesArray.splice(index, 1);
  if (removed.length > 0) {
     renderDropZone();
  }
};
