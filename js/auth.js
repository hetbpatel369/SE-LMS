/* ============================================
   LMS Authentication Logic
   Login, Register, Password Reset
   Works with Firebase Auth or Demo Mode
   ============================================ */

// Demo users have been removed in favor of Firebase Auth.

// ==========================================
// Initialize Auth Page
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Redirect if already logged in (wait for Firebase to restore session)
  const existingUser = await waitForAuth();
  if (existingUser) {
    redirectToDashboard(existingUser.role);
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

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  async function completeLogin(credential) {
    let userDoc = await db.collection('users').doc(credential.user.uid).get();

    // If admin auth exists but users doc is missing, bootstrap the profile document.
    if (!userDoc.exists && email === 'admin@lms.edu') {
      await db.collection('users').doc(credential.user.uid).set({
        name: 'Dr. Margaret Osei',
        email: 'admin@lms.edu',
        role: 'admin',
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      userDoc = await db.collection('users').doc(credential.user.uid).get();
    }

    if (!userDoc.exists) {
      showToast('User record not found. Please contact admin.', 'error');
      await auth.signOut();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
      return;
    }

    const userData = userDoc.data();

    if (userData.status === 'pending') {
      showToast('Your account is pending admin approval.', 'warning');
      await auth.signOut();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
      return;
    }

    const user = { uid: credential.user.uid, ...userData };

    // Cache the user globally so dashboard auth checks see the user
    // immediately on page load (before onAuthStateChanged fires).
    lmsCurrentUser = user;

    showToast('Login successful!', 'success');
    setTimeout(() => redirectToDashboard(user.role), 500);
  }

  try {
    const credential = await auth.signInWithEmailAndPassword(email, password);
    await completeLogin(credential);
  } catch (error) {
    console.error('Login error:', error);

    // Backward-compatibility: older docs used password123, seeded accounts now use Demo@1234.
    const legacyEmails = new Set([
      'admin@lms.edu',
      'a.smith@lms.edu',
      's.johnson@lms.edu',
      'r.patel@lms.edu',
      'j.chen@lms.edu'
    ]);

    if ((error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password')
      && password === 'password123'
      && legacyEmails.has(email.toLowerCase())) {
      try {
        const credential = await auth.signInWithEmailAndPassword(email, 'Demo@1234');
        showToast('Password format updated. Signed in with your seeded account.', 'info');
        await completeLogin(credential);
        return;
      } catch (fallbackError) {
        console.error('Legacy login fallback failed:', fallbackError);
      }
    }

    // Note: removed runtime fallback/auto-create behavior — authentication uses Firebase only.

    if (error.code === 'auth/invalid-credential') {
      showToast('Invalid email or password.', 'error');
    } else {
      showToast(error.message || 'Login failed. Please try again.', 'error');
    }
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
    await auth.sendPasswordResetEmail(email);
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
      window.location.href = '/pages/admin/admin-dash.html';
      break;
    case 'professor':
      window.location.href = '/pages/professor/professor-dash.html';
      break;
    case 'parent':
      window.location.href = '/pages/parent/parent-dash.html';
      break;
    case 'student':
    default:
      window.location.href = '/pages/student/student-dash.html';
      break;
  }
}
