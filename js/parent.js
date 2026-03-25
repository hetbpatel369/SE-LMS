/* ============================================
   Parent Dashboard Logic
   ============================================ */

let PARENT_STUDENTS = [];

window.resetStudentPassword = function(email) {
  if (!email) return;
  auth.sendPasswordResetEmail(email)
    .then(() => showToast(`Password reset link sent to ${email}`, 'success'))
    .catch(e => {
        console.error(e);
        showToast(e.message || 'Error sending password reset link.', 'error');
    });
};

let PARENT_BILLING = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await waitForAuth();
  if (!user || user.role !== 'parent') {
    window.location.href = '/pages/public/login.html';
    return;
  }

  const nameEl = document.getElementById('parent-name');
  if (nameEl) nameEl.textContent = user.name;
  
  const avatarEl = document.getElementById('parent-avatar');
  if (avatarEl) avatarEl.textContent = user.name.split(' ').map(n => n[0]).join('');
  
  const dateEl = document.getElementById('parent-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const sbToggle = document.getElementById('sidebar-toggle');
  if (window.innerWidth <= 1024 && sbToggle) sbToggle.style.display = 'flex';

  loadParentData(user);
});

async function loadParentData(user) {
  const container = document.getElementById('student-cards');
  if (container) container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Loading student data...</p>';

  try {
    let linkedIds = user.linkedStudents || [];
    
    // In demo mode, if the user doesn't have linked students in Firestore but is a demo parent:
    if (linkedIds.length === 0 && user.email === 'robert@parent.edu') {
      linkedIds = ['student-001', 'student-002'];
    }

    if (linkedIds.length === 0) {
      if (container) container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">No linked students found.</p>';
      renderBilling();
      return;
    }

    const students = [];
    
    for (const uid of linkedIds) {
      const studentDoc = await db.collection('users').doc(uid).get();
      if (!studentDoc.exists) continue;
      
      const sData = studentDoc.data();
      
      // Fetch courses for this student
      const coursesSnap = await db.collection('courses').where('students', 'array-contains', uid).get();
      let courses = [];
      coursesSnap.forEach(cDoc => {
        const cData = cDoc.data();
        courses.push({
          title: cData.title || 'Untitled Course',
          grade: ['A','B','C'][Math.floor(Math.random()*3)], // Simulated grade
          progress: cData.progress || 50,
          price: cData.price || 50
        });
      });
      
      students.push({
        name: sData.name || 'Student',
        email: sData.email || 'student@edu.com',
        gpa: (Math.random() * (4.0 - 3.0) + 3.0).toFixed(1), // Simulated GPA
        courses: courses
      });
    }

    PARENT_BILLING = [];
    students.forEach(s => {
      s.courses.forEach(c => {
         PARENT_BILLING.push({
            student: s.name,
            course: c.title,
            amount: c.price,
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            status: Math.random() > 0.3 ? 'paid' : 'pending' // 70% paid, 30% pending
         });
      });
    });

    PARENT_STUDENTS = students;
    renderStudentCards();
    renderBilling(); 

  } catch(err) {
    console.error("Error loading parent data:", err);
    if (container) container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">Failed to load student data.</p>';
  }
}

function renderStudentCards() {
  const container = document.getElementById('student-cards');
  if (!container) return;

  if (PARENT_STUDENTS.length === 0) {
    container.innerHTML = '<p style="padding:var(--space-md);color:var(--text-muted);">No linked students found.</p>';
    return;
  }

  container.innerHTML = PARENT_STUDENTS.map(s => `
    <div class="card" style="padding:var(--space-xl); position:relative;">
      <button class="btn btn-sm btn-outline" style="position:absolute;top:var(--space-md);right:var(--space-md);" onclick="resetStudentPassword('${s.email}')">Reset Password</button>
      <div style="display:flex;align-items:center;gap:var(--space-md);margin-bottom:var(--space-lg);">
        <div class="avatar avatar-lg">${s.name.split(' ').map(n => n[0]).join('')}</div>
        <div>
          <h3 style="font-size:1.1rem;padding-right:90px;">${s.name}</h3>
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
      <td>
        ${b.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="showToast('Payment gateway coming soon', 'info')">Pay Now</button>` : `<span style="color:var(--text-muted);font-size:0.85rem;">Completed</span>`}
      </td>
    </tr>
  `).join('');
}
