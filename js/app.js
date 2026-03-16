/* ============================================
   LMS Shared Application Logic
   Dark mode, navigation, toasts, utilities
   ============================================ */

// ==========================================
// Dark Mode Toggle
// ==========================================
function initTheme() {
  const saved = localStorage.getItem('lms-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lms-theme', next);
}

// Run immediately so there's no flash
initTheme();

// ==========================================
// Mobile Navigation Toggle
// ==========================================
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    // Close nav when clicking a link (mobile)
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }
}

// ==========================================
// Set Active Nav Link
// ==========================================
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span style="font-size:1.1rem">${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// Modal Helpers
// ==========================================
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ==========================================
// Tab System
// ==========================================
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        const parent = tabGroup.parentElement;

        // Update active tab button
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show correct tab content
        parent.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const targetContent = parent.querySelector(`#${target}`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  });
}

// ==========================================
// Sidebar Toggle & Navigation (Dashboard pages)
// ==========================================
function initSidebar() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Set active sidebar link by URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.course-nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      document.querySelectorAll('.course-nav-links a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });

  // Handle internal section links
  document.querySelectorAll('.course-nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
        
        // Update active class immediately
        document.querySelectorAll('.course-nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Scroll to section if it exists
        const sectionId = link.getAttribute('data-section');
        if (sectionId) {
          const target = document.getElementById('section-' + sectionId) || document.getElementById(sectionId);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        
        // If no section found, show toast
        showToast('This section is still under development.', 'info');
      }
    });
  });
}

// ==========================================
// Form Validation Helpers
// ==========================================
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateRequired(value) {
  return value.trim().length > 0;
}

function showFieldError(input, message) {
  clearFieldError(input);
  const err = document.createElement('div');
  err.className = 'form-error';
  err.textContent = message;
  input.parentElement.appendChild(err);
  input.style.borderColor = '#ef4444';
}

function clearFieldError(input) {
  const existing = input.parentElement.querySelector('.form-error');
  if (existing) existing.remove();
  input.style.borderColor = '';
}

// ==========================================
// Date Formatting
// ==========================================
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==========================================
// Auth State Helper (checks localStorage for demo, or Firebase later)
// ==========================================
function getCurrentUser() {
  const user = localStorage.getItem('lms-user');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function requireAuth(redirectTo = 'login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function logout() {
  if (typeof auth !== 'undefined') {
    auth.signOut().then(() => {
      localStorage.removeItem('lms-user');
      window.location.href = 'index.html';
    });
  } else {
    localStorage.removeItem('lms-user');
    window.location.href = 'index.html';
  }
}

// Global Auth State Listener
if (typeof auth !== 'undefined') {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = { uid: user.uid, ...userDoc.data() };
          localStorage.setItem('lms-user', JSON.stringify(userData));
          // Re-render nav if elements exist
          if (document.getElementById('nav-auth')) {
            updateNavAuth();
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    } else {
      localStorage.removeItem('lms-user');
      if (document.getElementById('nav-auth')) {
        updateNavAuth();
      }
    }
  });
}

// ==========================================
// Initialize Everything on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveNav();
  initTabs();
  initSidebar();

  // Bind theme toggle button
  const themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Update nav for logged-in users
  updateNavAuth();
});

// ==========================================
// Update Nav for Auth State
// ==========================================
function updateNavAuth() {
  const user = getCurrentUser();
  let dashLink = 'student-dash.html';

  if (user) {
    if (user.role === 'admin') dashLink = 'admin-dash.html';
    else if (user.role === 'professor') dashLink = 'professor-dash.html';
    else if (user.role === 'parent') dashLink = 'parent-dash.html';

    // Make the logo go to the dashboard instead of the public homepage
    const logos = document.querySelectorAll('.nav-logo');
    logos.forEach(logo => {
      logo.href = dashLink;
    });
  }

  const authArea = document.getElementById('nav-auth');
  if (!authArea) return;

  if (user) {
    authArea.innerHTML = `
      <a href="${dashLink}" class="btn btn-sm btn-secondary">Dashboard</a>
      <button onclick="logout()" class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #ef4444;">Logout</button>
    `;
  } else {
    authArea.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-secondary">Log In</a>
      <a href="login.html" class="btn btn-sm btn-primary">Sign Up</a>
    `;
  }
}

