/* ============================================================
   Acadex LMS — app.js  (Global Utilities & Auth Guard)
   ============================================================ */

// Synchronously load Lifecycle engine if not already present
if (typeof Lifecycle === 'undefined') {
  document.write('<script src="js/lifecycle.js"></script>');
}

// ── Constants ────────────────────────────────────────────────
const APP_NAME   = 'Acadex LMS';
const STORAGE_KEY = 'Acadex_user';
const THEME_KEY   = 'Acadex_theme';

// ── Auth Helpers ─────────────────────────────────────────────
const Auth = {
  /** Save user session */
  login(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  },

  /** Destroy session */
  logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'login.html';
  },

  /** Get current user object */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  },

  /** Check if logged in */
  isLoggedIn() {
    return !!this.getUser();
  },

  /** Guard: redirect to login if not authenticated */
  requireAuth() {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }

    // Lifecycle status guards for student accounts
    if (user.role === 'student') {
      const users = Store.get('users', []);
      const latestUser = users.find(u => u.email === user.email);

      if (latestUser && typeof Lifecycle !== 'undefined') {
        const evaluated = Lifecycle.evaluateStudentStatus(latestUser, users);
        
        if (evaluated.status === 'Archived') {
          localStorage.removeItem(STORAGE_KEY);
          alert('Your account is Archived. Please contact the administrator to restore access.');
          window.location.href = 'login.html';
          return false;
        }

        // Keep session data updated with latest status/progress
        localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluated));

        const path = window.location.pathname.split('/').pop();

        if (evaluated.status === 'Expired') {
          const restricted = ['course.html', 'course-details.html', 'assignment.html', 'quiz.html', 'tasks.html', 'placement.html', 'notes.html'];
          if (restricted.includes(path)) {
            alert('Your course access duration has expired. Study access is locked.');
            window.location.href = 'student.html';
            return false;
          }
        }

        if (evaluated.status === 'Completed') {
          const restricted = ['course.html', 'course-details.html', 'assignment.html', 'quiz.html', 'tasks.html', 'placement.html'];
          if (restricted.includes(path)) {
            alert('Program Completed! Coursework is locked, but you can access achievements and portfolio reports.');
            window.location.href = 'student.html';
            return false;
          }
        }
      }
    }

    return true;
  },

  /** Guard: redirect to dashboard if already logged in */
  requireGuest() {
    if (this.isLoggedIn()) {
      window.location.href = 'dashboard.html';
    }
  }
};

// ── Theme ────────────────────────────────────────────────────
const Theme = {
  init() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    this.apply(saved);
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Update all toggle icons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
      }
    });
  },

  toggle() {
    const current = localStorage.getItem(THEME_KEY) || 'light';
    this.apply(current === 'dark' ? 'light' : 'dark');
  },

  isDark() {
    return localStorage.getItem(THEME_KEY) === 'dark';
  }
};

// ── Toast Notifications ──────────────────────────────────────
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(title, message = '', type = 'info') {
    this.init();
    const icons = { success: 'fa-check', error: 'fa-times', warning: 'fa-exclamation', info: 'fa-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon"><i class="fa ${icons[type] || icons.info}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:4px;">×</button>
    `;
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
  },

  success(title, msg)  { this.show(title, msg, 'success'); },
  error(title, msg)    { this.show(title, msg, 'error'); },
  warning(title, msg)  { this.show(title, msg, 'warning'); },
  info(title, msg)     { this.show(title, msg, 'info'); }
};

// ── Modal Helpers ─────────────────────────────────────────────
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  close(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    Modal.closeAll();
  }
});

// ── Accordion ────────────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      const isOpen = header.classList.contains('open');

      // Close siblings in same container if single-open
      const parent = header.closest('.accordion-single');
      if (parent) {
        parent.querySelectorAll('.accordion-header.open').forEach(h => {
          if (h !== header) {
            h.classList.remove('open');
            h.nextElementSibling.classList.remove('open');
          }
        });
      }

      header.classList.toggle('open', !isOpen);
      body.classList.toggle('open', !isOpen);
    });
  });
}

// ── Tabs ─────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const container = btn.closest('[data-tabs]') || document;

      // Deactivate all tabs and panes in this group
      const group = btn.dataset.group;
      if (group) {
        document.querySelectorAll(`[data-tab][data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-pane][data-group="${group}"]`).forEach(p => p.classList.remove('active'));
      } else {
        container.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('[data-pane]').forEach(p => p.classList.remove('active'));
      }

      btn.classList.add('active');
      const pane = document.querySelector(`[data-pane="${target}"]`);
      if (pane) pane.classList.add('active');
    });
  });
}

// ── Sidebar Toggle ───────────────────────────────────────────
function initSidebar() {
  const sidebar    = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const innerNavbar = document.querySelector('.inner-navbar');
  const toggleBtns  = document.querySelectorAll('.sidebar-toggle');
  const overlay     = document.querySelector('.sidebar-overlay');

  if (!sidebar) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      } else {
        sidebar.classList.toggle('collapsed');
        mainContent?.classList.toggle('collapsed');
        innerNavbar?.classList.toggle('collapsed');
      }
    });
  });

  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });
}

// ── Navbar Scroll Effect ─────────────────────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handler = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', handler, { passive: true });
  handler();
}

// ── Mobile Nav Hamburger ─────────────────────────────────────
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
}

// ── Dropdown Menus ───────────────────────────────────────────
function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(dd => {
    const trigger = dd.querySelector('[data-dropdown-toggle]');
    const menu    = dd.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isActive = menu.classList.contains('active');
      closeAllDropdowns();
      if (!isActive) menu.classList.add('active');
    });
  });

  document.addEventListener('click', closeAllDropdowns);
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.active').forEach(m => m.classList.remove('active'));
}

// ── Animation on Scroll ───────────────────────────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const anim = el.dataset.animate || 'animate-fade-up';
        el.classList.add(anim);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
}

// ── Progress Bar Animations ──────────────────────────────────
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar[data-width]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        setTimeout(() => {
          bar.style.width = bar.dataset.width + '%';
        }, 100);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

// ── Counter Animation ────────────────────────────────────────
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const isFloat = String(target).includes('.');
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  const step = () => {
    start = Math.min(start + increment, target);
    el.textContent = prefix + (isFloat ? start.toFixed(1) : Math.floor(start).toLocaleString()) + suffix;
    if (start < target) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseFloat(el.dataset.counter));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ── Populate Sidebar User Info ───────────────────────────────
function populateSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;

  const nameEls = document.querySelectorAll('.sidebar-user-name, .user-name, [data-user-name]');
  const roleEls = document.querySelectorAll('.sidebar-user-role, .user-role, [data-user-role]');
  const avatarEls = document.querySelectorAll('.sidebar-avatar, [data-user-avatar]');

  nameEls.forEach(el => el.textContent = user.name || 'User');
  roleEls.forEach(el => el.textContent = user.role || 'student');
  avatarEls.forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = user.avatar || '';
    } else {
      el.textContent = (user.name || 'U')[0].toUpperCase();
    }
  });
}

// ── Logout Buttons ───────────────────────────────────────────
function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      Auth.logout();
    });
  });
}

// ── Format Helpers ────────────────────────────────────────────
const Format = {
  date(d) {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },
  time(d) {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  },
  relative(d) {
    const now = Date.now();
    const diff = now - new Date(d).getTime();
    if (diff < 60000)   return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  }
};

// ── Storage Helpers ───────────────────────────────────────────
const Store = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(`Acadex_${key}`);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    localStorage.setItem(`Acadex_${key}`, JSON.stringify(val));
  },
  remove(key) {
    localStorage.removeItem(`Acadex_${key}`);
  }
};

// ── Accordion Initializer ─────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-single .accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const body = header.nextElementSibling;
      const wasOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.accordion-single .accordion-item').forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.accordion-body');
        if (b) b.classList.remove('open');
      });

      // Open clicked if wasn't open
      if (!wasOpen) {
        item.classList.add('open');
        if (body) body.classList.add('open');
      }
    });
  });
}

// ── Tab Initializer ───────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        if (!tabId) return;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const parent = tabGroup.nextElementSibling || tabGroup.parentElement;
        parent.querySelectorAll('[data-pane]').forEach(pane => {
          pane.style.display = pane.dataset.pane === tabId ? 'block' : 'none';
        });
      });
    });
  });
}

// ── Dashboard Redirect ────────────────────────────────────────
function initDashboardRedirect() {
  if (window.location.pathname.endsWith('dashboard.html')) {
    const user = Auth.getUser();
    if (user) {
      window.location.href = user.role + '.html';
    } else {
      window.location.href = 'login.html';
    }
  }
}

// ── Initialize ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  initNavbarScroll();
  initHamburger();
  initSidebar();
  initAccordions();
  initTabs();
  initDropdowns();
  initScrollAnimations();
  initProgressBars();
  initCounters();
  populateSidebarUser();
  initLogout();
  initDashboardRedirect();

  // Theme toggle buttons
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => Theme.toggle());
  });
});
