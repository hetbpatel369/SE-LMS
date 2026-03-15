/* ============================================
   LMS Authentication Logic
   Login, Register, Password Reset
   Works with Firebase Auth or Demo Mode
   ============================================ */

// ==========================================
// Demo Users (for testing without Firebase)
// ==========================================
const DEMO_USERS = [
  { uid: 'admin-001', name: 'Admin User', email: 'admin@lms.edu', password: 'admin123', role: 'admin', status: 'approved' },
  { uid: 'prof-001', name: 'Dr. Smith', email: 'smith@lms.edu', password: 'prof123', role: 'professor', status: 'approved' },
  { uid: 'prof-002', name: 'Ms. Johnson', email: 'johnson@lms.edu', password: 'prof123', role: 'professor', status: 'approved' },
  { uid: 'student-001', name: 'John Doe', email: 'john@student.edu', password: 'student123', role: 'student', status: 'approved', parentId: 'parent-001' },
  { uid: 'student-002', name: 'Jane Smith', email: 'jane@student.edu', password: 'student123', role: 'student', status: 'approved', parentId: 'parent-001' },
  { uid: 'parent-001', name: 'Robert Doe', email: 'robert@parent.edu', password: 'parent123', role: 'parent', status: 'approved', linkedStudents: ['student-001', 'student-002'] },
];

// ==========================================
// Initialize Auth Page
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (isLoggedIn()) {
    const user = getCurrentUser();
    redirectToDashboard(user.role);
    return;
  }

  // Tab switching
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    });
  }

  // Login form handler
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Register form handler
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Forgot password link
  const forgotLink = document.getElementById('forgot-password');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('forgot-modal');
    });
  }

  // Forgot password form
  const forgotForm = document.getElementById('forgot-form');
  if (forgotForm) {
    forgotForm.addEventListener('submit', handleForgotPassword);
  }
});

// ==========================================
// Handle Login
// ==========================================
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    if (firebaseReady) {
      // Firebase Auth
      const credential = await auth.signInWithEmailAndPassword(email, password);
      const userDoc = await db.collection('users').doc(credential.user.uid).get();
      const userData = userDoc.data();

      if (userData.status === 'pending') {
        showToast('Your account is pending admin approval.', 'warning');
        await auth.signOut();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        return;
      }

      const user = { uid: credential.user.uid, ...userData };
      localStorage.setItem('lms-user', JSON.stringify(user));
      showToast('Login successful!', 'success');
      setTimeout(() => redirectToDashboard(user.role), 500);
    } else {
      // Demo mode
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (!user) {
        showToast('Invalid email or password.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        return;
      }

      if (user.status === 'pending') {
        showToast('Your account is pending admin approval.', 'warning');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        return;
      }

      localStorage.setItem('lms-user', JSON.stringify(user));
      showToast('Login successful! (Demo Mode)', 'success');
      setTimeout(() => redirectToDashboard(user.role), 500);
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Login failed. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log In';
  }
}

// ==========================================
// Handle Register
// ==========================================
async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = document.querySelector('input[name="register-role"]:checked');

  if (!name || !email || !password || !role) {
    showToast('Please fill in all fields and select a role.', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    if (firebaseReady) {
      // Firebase Auth
      const credential = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(credential.user.uid).set({
        name,
        email,
        role: role.value,
        status: 'pending', // Admin approval required
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast('Account created! Waiting for admin approval.', 'success');
      await auth.signOut();
    } else {
      // Demo mode
      showToast('Account created! Waiting for admin approval. (Demo Mode)', 'success');
    }

    // Switch to login tab
    document.getElementById('login-tab').click();
  } catch (error) {
    console.error('Register error:', error);
    showToast(error.message || 'Registration failed.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
}

// ==========================================
// Handle Forgot Password
// ==========================================
async function handleForgotPassword(e) {
  e.preventDefault();

  const email = document.getElementById('forgot-email').value.trim();

  if (!email || !validateEmail(email)) {
    showToast('Please enter a valid email.', 'error');
    return;
  }

  try {
    if (firebaseReady) {
      await auth.sendPasswordResetEmail(email);
    }
    showToast('Password reset email sent! Check your inbox.', 'success');
    closeModal('forgot-modal');
  } catch (error) {
    showToast(error.message || 'Failed to send reset email.', 'error');
  }
}

// ==========================================
// Redirect Based on Role
// ==========================================
function redirectToDashboard(role) {
  switch (role) {
    case 'admin':
      window.location.href = 'admin-dash.html';
      break;
    case 'professor':
      window.location.href = 'professor-dash.html';
      break;
    case 'parent':
      window.location.href = 'parent-dash.html';
      break;
    case 'student':
    default:
      window.location.href = 'student-dash.html';
      break;
  }
}
