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
// Auth State Helper (Firebase + in-memory cache)
// ==========================================
let lmsCurrentUser = null;

/**
 * Returns a promise that resolves with the current user once Firebase Auth
 * has finished restoring the session. Use this instead of getCurrentUser()
 * in DOMContentLoaded handlers to avoid the race condition where
 * auth.currentUser is still null.
 */
function waitForAuth(timeoutMs = 5000) {
  return new Promise((resolve) => {
    // If we already have a cached user, return immediately
    if (lmsCurrentUser) { resolve(lmsCurrentUser); return; }

    // If auth isn't available yet, wait a bit for firebase-config.js
    if (typeof auth === 'undefined' || !auth) {
      resolve(null);
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(lmsCurrentUser || null); }
    }, timeoutMs);

    auth.onAuthStateChanged(async (firebaseUser) => {
      if (settled) return;
      if (!firebaseUser) {
        settled = true; clearTimeout(timer); resolve(null); return;
      }
      try {
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        if (userDoc.exists) {
          lmsCurrentUser = { uid: firebaseUser.uid, ...userDoc.data() };
        } else {
          lmsCurrentUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email || 'User',
            role: inferRoleFromPath() || 'student'
          };
        }
      } catch (err) {
        console.error('waitForAuth: error fetching user doc', err);
        lmsCurrentUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email || 'User',
          role: inferRoleFromPath() || 'student'
        };
      }
      settled = true; clearTimeout(timer); resolve(lmsCurrentUser);
    });
  });
}

function inferRoleFromPath() {
  const path = window.location.pathname;
  if (path.includes('/pages/admin/')) return 'admin';
  if (path.includes('/pages/professor/')) return 'professor';
  if (path.includes('/pages/parent/')) return 'parent';
  if (path.includes('/pages/student/')) return 'student';
  return null;
}

function getCurrentUser() {
  if (lmsCurrentUser) return lmsCurrentUser;

  if (typeof auth !== 'undefined' && auth && auth.currentUser) {
    const roleGuess = inferRoleFromPath();
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email || '',
      name: auth.currentUser.displayName || auth.currentUser.email || 'User',
      role: roleGuess || 'student'
    };
  }

  return null;
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function requireAuth(redirectTo = '/pages/public/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function logout() {
  if (typeof auth !== 'undefined') {
    auth.signOut().then(() => {
      lmsCurrentUser = null;
      window.location.href = '/pages/public/index.html';
    });
  } else {
    lmsCurrentUser = null;
    window.location.href = '/pages/public/index.html';
  }
}

// Global Auth State Listener
let lmsAuthListenerAttached = false;

function attachAuthStateListener(retries = 30) {
  if (lmsAuthListenerAttached) return;

  if (typeof auth === 'undefined' || !auth || typeof db === 'undefined' || !db) {
    if (retries > 0) {
      setTimeout(() => attachAuthStateListener(retries - 1), 200);
    }
    return;
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = { uid: user.uid, ...userDoc.data() };
          lmsCurrentUser = userData;
        } else {
          lmsCurrentUser = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || user.email || 'User',
            role: inferRoleFromPath() || 'student'
          };
        }

        if (document.getElementById('app-header')) {
          updateNavAuth();
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    } else {
      lmsCurrentUser = null;
      if (document.getElementById('app-header')) {
        updateNavAuth();
      }
    }
  });

  lmsAuthListenerAttached = true;
}

attachAuthStateListener();

// ==========================================
// Initialize Everything on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  attachAuthStateListener();
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

async function updateNavAuth() {
  const user = getCurrentUser();
  const headerContainer = document.getElementById('app-header');
  if (!headerContainer) return;

  const currentPath = window.location.pathname;
  let componentName = 'nav-public.html';

  if (!currentPath.includes('/pages/')) {
    componentName = 'nav-public.html';
  } else if (currentPath.includes('/pages/public/')) {
    componentName = 'nav-public.html';
  } else if (currentPath.includes('/pages/student/')) {
    componentName = 'nav-student.html';
  } else if (currentPath.includes('/pages/parent/')) {
    componentName = 'nav-parent.html';
  } else if (currentPath.includes('/pages/admin/')) {
    componentName = 'nav-admin.html';
  } else if (currentPath.includes('/pages/professor/')) {
    componentName = 'nav-professor.html';
  } else if (currentPath.includes('/pages/shared/')) {
    // Shared pages: determine role nav based on logged in user
    if (user) {
      if (user.role === 'admin') componentName = 'nav-admin.html';
      else if (user.role === 'parent') componentName = 'nav-parent.html';
      else if (user.role === 'professor') componentName = 'nav-professor.html';
      else componentName = 'nav-student.html';
    }
  }

  try {
    let response = await fetch('/components/' + componentName);
    if (!response.ok) {
      const pageSegments = window.location.pathname.split('/').filter(Boolean);
      const depth = Math.max(pageSegments.length - 1, 0);
      const relPrefix = '../'.repeat(depth);
      response = await fetch(relPrefix + 'components/' + componentName);
    }
    if (response.ok) {
      headerContainer.innerHTML = await response.text();

      // Student pages need a guaranteed logout button + course nav even if cached/partial component markup is served.
      if (currentPath.includes('/pages/student/')) {
        const navActions = headerContainer.querySelector('.nav-actions');
        if (navActions && !navActions.querySelector('button[onclick*="logout"]')) {
          const logoutBtn = document.createElement('button');
          logoutBtn.className = 'btn btn-sm btn-outline';
          logoutBtn.setAttribute('onclick', 'logout()');
          logoutBtn.style.borderColor = '#ef4444';
          logoutBtn.style.color = '#ef4444';
          logoutBtn.textContent = 'Logout';
          navActions.appendChild(logoutBtn);
        }

        if (!headerContainer.querySelector('.course-navbar')) {
          const secondaryNav = document.createElement('div');
          secondaryNav.className = 'course-navbar animate-up';
          secondaryNav.innerHTML = `
            <div class="container">
              <nav class="course-nav-links">
                <a href="/pages/student/student-dash.html">Overview</a>
                <a href="/pages/student/student-dash.html#section-courses">My Courses</a>
                <a href="/pages/shared/calendar.html">Calendar</a>
                <a href="/pages/shared/zoom-classes.html">Live Classes</a>
                <a href="/pages/student/my-library.html">Library</a>
                <a href="/pages/shared/messages.html">Messages</a>
                <a href="/pages/student/grades.html">Grades</a>
                <a href="/pages/student/profile.html">Profile</a>
              </nav>
            </div>`;
          headerContainer.appendChild(secondaryNav);
        }
      }

      if (currentPath.includes('/pages/parent/') && !headerContainer.querySelector('.course-navbar')) {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'course-navbar animate-up';
        secondaryNav.innerHTML = `
          <div class="container">
            <nav class="course-nav-links">
              <a href="/pages/parent/parent-dash.html#section-overview">Overview</a>
              <a href="/pages/parent/parent-dash.html#section-students">My Children</a>
              <a href="/pages/parent/parent-dash.html#section-billing">Billing</a>
              <a href="/pages/shared/messages.html">Messages</a>
              <a href="/pages/shared/calendar.html">Calendar</a>
            </nav>
          </div>`;
        headerContainer.appendChild(secondaryNav);
      }

      if (currentPath.includes('/pages/professor/') && !headerContainer.querySelector('.course-navbar')) {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'course-navbar animate-up';
        secondaryNav.innerHTML = `
          <div class="container">
            <nav class="course-nav-links">
              <a href="/pages/professor/professor-dash.html#section-overview">Overview</a>
              <a href="/pages/professor/professor-dash.html#section-courses">My Courses</a>
              <a href="/pages/shared/calendar.html">Calendar</a>
              <a href="/pages/professor/professor-dash.html#section-live-classes">Live Classes</a>
              <a href="/pages/shared/messages.html">Messages</a>
              <a href="/pages/professor/professor-dash.html#section-settings">Settings</a>
            </nav>
          </div>`;
        headerContainer.appendChild(secondaryNav);
      }

      if (currentPath.includes('/pages/admin/') && !headerContainer.querySelector('.course-navbar')) {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'course-navbar animate-up';
        secondaryNav.innerHTML = `
          <div class="container">
            <nav class="course-nav-links">
              <a href="/pages/admin/admin-dash.html#section-overview">System Overview</a>
              <a href="/pages/admin/admin-dash.html#section-users">User Management</a>
              <a href="/pages/admin/admin-dash.html#section-courses">Course Enrollments</a>
              <a href="/pages/admin/admin-dash.html#section-settings">Platform Settings</a>
            </nav>
          </div>`;
        headerContainer.appendChild(secondaryNav);
      }

      if (!currentPath.includes('/pages/public/')) {
        const navActions = headerContainer.querySelector('.nav-actions');
        if (navActions && !navActions.querySelector('button[onclick*="logout"]')) {
          const logoutBtn = document.createElement('button');
          logoutBtn.className = 'btn btn-sm btn-outline';
          logoutBtn.setAttribute('onclick', 'logout()');
          logoutBtn.style.borderColor = '#ef4444';
          logoutBtn.style.color = '#ef4444';
          logoutBtn.textContent = 'Logout';
          navActions.appendChild(logoutBtn);
        }
      }

      // On shared pages, force role-specific secondary nav when component output is partial.
      if (currentPath.includes('/pages/shared/') && user && user.role === 'student' && !headerContainer.querySelector('.course-navbar')) {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'course-navbar animate-up';
        secondaryNav.innerHTML = `
          <div class="container">
            <nav class="course-nav-links">
              <a href="/pages/student/student-dash.html">Overview</a>
              <a href="/pages/student/student-dash.html#section-courses">My Courses</a>
              <a href="/pages/shared/calendar.html">Calendar</a>
              <a href="/pages/shared/zoom-classes.html">Live Classes</a>
              <a href="/pages/student/my-library.html">Library</a>
              <a href="/pages/shared/messages.html">Messages</a>
              <a href="/pages/student/grades.html">Grades</a>
              <a href="/pages/student/profile.html">Profile</a>
            </nav>
          </div>`;
        headerContainer.appendChild(secondaryNav);
      }

      if (currentPath.includes('/pages/shared/') && user && user.role === 'parent' && !headerContainer.querySelector('.course-navbar')) {
        const secondaryNav = document.createElement('div');
        secondaryNav.className = 'course-navbar animate-up';
        secondaryNav.innerHTML = `
          <div class="container">
            <nav class="course-nav-links">
              <a href="/pages/parent/parent-dash.html#section-overview">Overview</a>
              <a href="/pages/parent/parent-dash.html#section-students">My Children</a>
              <a href="/pages/parent/parent-dash.html#section-billing">Billing</a>
              <a href="/pages/shared/messages.html">Messages</a>
              <a href="/pages/shared/calendar.html">Calendar</a>
            </nav>
          </div>`;
        headerContainer.appendChild(secondaryNav);
      }
      
      // Auto set active state for active path
      const pathSuffix = currentPath.split('/').pop() || 'index.html';
      const exactMatchPath = currentPath.endsWith('/') ? currentPath + 'index.html' : currentPath;

      document.querySelectorAll('#app-header a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        // precise matching for dashboard inner hashes like #section-courses
        const currentHash = window.location.hash;
        if (currentHash && href.includes(currentHash)) {
           link.classList.add('active');
        } else if (!currentHash && href === exactMatchPath) {
           link.classList.add('active');
        }
      });
      
      // Re-bind theme toggles if present
      const themeBtn = headerContainer.querySelector('.theme-toggle');
      if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
      }

      // Re-initialize handlers for dynamically injected nav markup.
      initNav();
      setActiveNav();
      initSidebar();
      
      // Re-bind course navbar active links internal scrolling
      document.querySelectorAll('.course-nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
          if (link.getAttribute('href').includes('#section-')) {
            // Check if we are already on the identical base path
            const baseHref = link.getAttribute('href').split('#')[0];
            if(window.location.pathname === baseHref) {
              e.preventDefault();
              document.querySelectorAll('.course-nav-links a').forEach(l => l.classList.remove('active'));
              link.classList.add('active');
              
              const sectionId = link.getAttribute('href').split('#')[1];
              const target = document.getElementById(sectionId);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // update URL hash without jump
                history.pushState(null, null, '#' + sectionId);
              }
            }
          }
        });
      });

    }
  } catch(e) {
    console.error('Error loading navbar', e);
  }
}
