/* ============================================================
   Acadex LMS — login.js  (Auth Logic)
   ============================================================ */

// Seed demo users into localStorage on first load
function seedUsers() {
  if (Store.get('users')) return;
  Store.set('users', [
    { 
      id: 1, 
      name: 'Alex Johnson',   
      email: 'student@demo.com', 
      password: 'demo123', 
      role: 'student', 
      joined: '2026-05-01', 
      department: 'Computer Science', 
      avatar: '',
      studentId: 'STU-2026-10001',
      registerNumber: 'REG88902',
      year: '3rd Year',
      mobile: '+1 (555) 019-2834',
      courseName: 'Complete Web Development Bootcamp',
      internshipName: 'Frontend Developer Internship',
      projectName: 'LMS Cloud Dashboard',
      facultyMentor: 'Dr. Sarah Chen',
      trainingBatch: 'Batch 2026-A',
      enrollmentDate: '2026-05-01',
      courseDuration: '3 Months',
      internshipDuration: '2 Months',
      projectDuration: '2 Months',
      expectedCompletionDate: '2026-08-01',
      status: 'In Progress',
      progress: {
        course: 72,
        attendance: 88,
        assignments: 66,
        quizzes: 80,
        internshipTasks: 50,
        project: 40,
        placement: 60
      },
      certificates: [],
      activityLogs: [
        { id: 'l1', timestamp: '2026-05-01T09:00:00Z', action: 'Account created and enrolled in course.' },
        { id: 'l2', timestamp: '2026-06-15T14:30:00Z', action: 'Submitted Assignment: Build a REST API.' }
      ],
      notifications: [
        { id: 'n1', title: 'Enrollment Confirmed 🚀', message: 'Welcome to Acadex LMS! Your enrollment in Complete Web Development Bootcamp is confirmed.', type: 'success', date: '2026-05-01T09:01:00Z', read: false }
      ]
    },
    { 
      id: 4, 
      name: 'Jane Doe',   
      email: 'jane@demo.com', 
      password: 'demo123', 
      role: 'student', 
      joined: '2026-01-10', 
      department: 'Computer Science', 
      avatar: '',
      studentId: 'STU-2026-10004',
      registerNumber: 'REG88111',
      year: '4th Year',
      mobile: '+1 (555) 019-5566',
      courseName: 'Machine Learning A-Z',
      internshipName: 'Data Science Intern',
      projectName: 'Customer Churn Predictor',
      facultyMentor: 'Dr. Sarah Chen',
      trainingBatch: 'Batch 2026-B',
      enrollmentDate: '2026-01-10',
      courseDuration: '6 Months',
      internshipDuration: '2 Months',
      projectDuration: '2 Months',
      expectedCompletionDate: '2026-07-10',
      completionDate: '2026-07-05', // Completed 3 days ago relative to July 8
      status: 'Completed',
      progress: {
        course: 100,
        attendance: 95,
        assignments: 100,
        quizzes: 100,
        internshipTasks: 100,
        project: 100,
        placement: 100
      },
      certificates: [
        { id: 'ACX-CRSE-2026-9901', type: 'Course Completion Certificate', studentName: 'Jane Doe', studentId: 'STU-2026-10004', title: 'Machine Learning A-Z', facultyName: 'Dr. Sarah Chen', duration: '6 Months', completionDate: '2026-07-05', verificationCode: 'CRSE-9901', qrCodeValue: 'https://verify.acadex.edu/certificate/ACX-CRSE-2026-9901' },
        { id: 'ACX-INTN-2026-9902', type: 'Internship Completion Certificate', studentName: 'Jane Doe', studentId: 'STU-2026-10004', title: 'Data Science Intern', facultyName: 'Dr. Sarah Chen', duration: '2 Months', completionDate: '2026-07-05', verificationCode: 'INTN-9902', qrCodeValue: 'https://verify.acadex.edu/certificate/ACX-INTN-2026-9902' },
        { id: 'ACX-PROJ-2026-9903', type: 'Project Completion Certificate', studentName: 'Jane Doe', studentId: 'STU-2026-10004', title: 'Customer Churn Predictor', facultyName: 'Dr. Sarah Chen', duration: '2 Months', completionDate: '2026-07-05', verificationCode: 'PROJ-9903', qrCodeValue: 'https://verify.acadex.edu/certificate/ACX-PROJ-2026-9903' },
        { id: 'ACX-TRNG-2026-9904', type: 'Training Completion Certificate', studentName: 'Jane Doe', studentId: 'STU-2026-10004', title: 'Full Stack Training Batch Batch 2026-B', facultyName: 'Dr. Sarah Chen', duration: '6 Months', completionDate: '2026-07-05', verificationCode: 'TRNG-9904', qrCodeValue: 'https://verify.acadex.edu/certificate/ACX-TRNG-2026-9904' },
        { id: 'ACX-PLAC-2026-9905', type: 'Placement Training Certificate', studentName: 'Jane Doe', studentId: 'STU-2026-10004', title: 'Placement Preparation & Corporate Readiness', facultyName: 'Dr. Sarah Chen', duration: '1 Month', completionDate: '2026-07-05', verificationCode: 'PLAC-9905', qrCodeValue: 'https://verify.acadex.edu/certificate/ACX-PLAC-2026-9905' }
      ],
      activityLogs: [
        { id: 'l1', timestamp: '2026-01-10T10:00:00Z', action: 'Enrolled in ML course.' },
        { id: 'l2', timestamp: '2026-07-05T16:00:00Z', action: 'Finished all components and marked Completed.' }
      ],
      notifications: [
        { id: 'n1', title: 'Program Completed! 🏆', message: 'Congratulations! You have completed all course requirements and earned your certificates.', type: 'success', date: '2026-07-05T16:01:00Z', read: false }
      ]
    },
    { 
      id: 5, 
      name: 'Expired Student',   
      email: 'expired@demo.com', 
      password: 'demo123', 
      role: 'student', 
      joined: '2025-06-01', 
      department: 'Computer Science', 
      avatar: '',
      studentId: 'STU-2025-10005',
      registerNumber: 'REG77239',
      year: '4th Year',
      mobile: '+1 (555) 019-9988',
      courseName: 'UI/UX Design Fundamentals',
      internshipName: 'UI/UX Design Intern',
      projectName: 'Mobile App Design',
      facultyMentor: 'Dr. Sarah Chen',
      trainingBatch: 'Batch 2025-C',
      enrollmentDate: '2025-06-01',
      courseDuration: '1 Month',
      internshipDuration: '1 Month',
      projectDuration: '1 Month',
      expectedCompletionDate: '2025-07-01', // Expired long ago
      status: 'Expired',
      progress: {
        course: 30,
        attendance: 55,
        assignments: 20,
        quizzes: 40,
        internshipTasks: 10,
        project: 0,
        placement: 0
      },
      certificates: [],
      activityLogs: [
        { id: 'l1', timestamp: '2025-06-01T09:00:00Z', action: 'Account created.' }
      ],
      notifications: [
        { id: 'n1', title: 'Course Access Expired ⏳', message: 'Your expected course duration has elapsed. Access to study materials is locked. Please contact support.', type: 'error', date: '2025-07-01T00:01:00Z', read: false }
      ]
    },
    { 
      id: 6, 
      name: 'Archived Student',   
      email: 'archived@demo.com', 
      password: 'demo123', 
      role: 'student', 
      joined: '2025-01-01', 
      department: 'Computer Science', 
      avatar: '',
      studentId: 'STU-2025-10006',
      registerNumber: 'REG66212',
      year: '4th Year',
      mobile: '+1 (555) 019-1234',
      courseName: 'Data Structures & Algorithms',
      internshipName: 'Backend Intern',
      projectName: 'Graph Visualizer',
      facultyMentor: 'Dr. Sarah Chen',
      trainingBatch: 'Batch 2025-A',
      enrollmentDate: '2025-01-01',
      courseDuration: '3 Months',
      internshipDuration: '2 Months',
      projectDuration: '2 Months',
      expectedCompletionDate: '2025-04-01',
      completionDate: '2025-03-25',
      status: 'Archived',
      progress: {
        course: 100,
        attendance: 90,
        assignments: 100,
        quizzes: 100,
        internshipTasks: 100,
        project: 100,
        placement: 100
      },
      certificates: [],
      activityLogs: [
        { id: 'l1', timestamp: '2025-01-01T10:00:00Z', action: 'Account created.' },
        { id: 'l2', timestamp: '2025-04-26T00:00:00Z', action: 'Archived automatically after 30-day grace period.' }
      ],
      notifications: [
        { id: 'n1', title: 'Account Archived 📦', message: 'Your post-completion grace period has expired. Account archived.', type: 'warning', date: '2025-04-26T00:00:00Z', read: false }
      ]
    },
    { id: 2, name: 'Dr. Sarah Chen', email: 'faculty@demo.com', password: 'demo123', role: 'faculty', joined: '2023-01-15', department: 'Computer Science', avatar: '' },
    { id: 3, name: 'Admin User',     email: 'admin@demo.com',   password: 'demo123', role: 'admin',   joined: '2022-06-01', department: 'Administration', avatar: '' }
  ]);
}

// ── Login Page ───────────────────────────────────────────────
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  Auth.requireGuest();
  seedUsers();

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    let valid = true;

    if (!email) {
      showError('emailError', 'Email is required');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('emailError', 'Enter a valid email address');
      valid = false;
    }

    if (!password) {
      showError('passwordError', 'Password is required');
      valid = false;
    }

    if (!valid) return;

    const users = Store.get('users', []);
    const user  = users.find(u => u.email === email && u.password === password);

    if (!user) {
      Toast.error('Login Failed', 'Invalid email or password');
      showError('passwordError', 'Invalid credentials');
      return;
    }

    // Verify if account is Archived (fully blocks login)
    if (user.role === 'student' && user.status === 'Archived') {
      Toast.error('Login Denied', 'Your account is Archived. Please contact the administrator to restore access.');
      showError('emailError', 'Account is Archived.');
      return;
    }

    // Simulate loading
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Signing in...';

    setTimeout(() => {
      // Evaluate status updates just in case before saving user session
      let updatedUser = user;
      if (user.role === 'student') {
        if (typeof Lifecycle !== 'undefined') {
          updatedUser = Lifecycle.evaluateStudentStatus(user, users);
          if (updatedUser.status === 'Archived') {
            Toast.error('Login Denied', 'Your account has just been archived. Please contact support.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa fa-sign-in"></i> Sign In';
            return;
          }
        }
      }
      Auth.login(updatedUser);
      Toast.success('Welcome back!', `Hello, ${updatedUser.name}`);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    }, 900);
  });

  // Demo login buttons
  document.querySelectorAll('[data-demo-login]').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.demoLogin;
      const demos = {
        student: { email: 'student@demo.com', password: 'demo123' },
        faculty: { email: 'faculty@demo.com', password: 'demo123' },
        admin:   { email: 'admin@demo.com',   password: 'demo123' }
      };
      const d = demos[role];
      if (d) {
        document.getElementById('email').value    = d.email;
        document.getElementById('password').value = d.password;
        Toast.info('Demo Credentials Filled', `Click Sign In to continue`);
      }
    });
  });

  // Password toggle
  const eyeBtn = document.querySelector('.input-icon-right');
  const pwdInput = document.getElementById('password');
  if (eyeBtn && pwdInput) {
    eyeBtn.addEventListener('click', () => {
      const isText = pwdInput.type === 'text';
      pwdInput.type = isText ? 'password' : 'text';
      eyeBtn.className = `input-icon-right fa ${isText ? 'fa-eye' : 'fa-eye-slash'}`;
    });
  }
}

// ── Register Page ────────────────────────────────────────────
function initRegisterPage() {
  const regForm = document.getElementById('registerForm');
  if (!regForm) return;

  Auth.requireGuest();
  seedUsers();

  regForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    const name     = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm  = document.getElementById('confirmPassword').value;
    const role     = document.getElementById('role').value;
    let valid = true;

    if (!name || name.length < 2) {
      showError('nameError', 'Full name must be at least 2 characters');
      valid = false;
    }

    if (!email || !isValidEmail(email)) {
      showError('emailError', 'Enter a valid email address');
      valid = false;
    }

    if (!password || password.length < 6) {
      showError('passwordError', 'Password must be at least 6 characters');
      valid = false;
    }

    if (password !== confirm) {
      showError('confirmError', 'Passwords do not match');
      valid = false;
    }

    if (!role) {
      showError('roleError', 'Please select a role');
      valid = false;
    }

    // Student specific validation
    let studentDetails = {};
    if (role === 'student') {
      const regNo = document.getElementById('regNumber').value.trim();
      const mobile = document.getElementById('mobile').value.trim();
      const dept = document.getElementById('dept').value;
      const year = document.getElementById('yearSelect').value;
      const courseName = document.getElementById('courseName').value;
      const internshipName = document.getElementById('internshipName').value.trim() || 'No Internship';
      const projectName = document.getElementById('projectName').value.trim() || 'No Project';
      const facultyMentor = document.getElementById('facultyMentor').value;
      const trainingBatch = document.getElementById('trainingBatch').value.trim() || 'Batch 2026-A';
      const enrollmentDate = document.getElementById('enrollmentDate').value;
      const courseDuration = document.getElementById('courseDuration').value;
      const customDays = document.getElementById('customDurationDays').value || 30;
      const expectedCompletionDate = document.getElementById('expectedCompletionDate').value;
      const internshipDuration = document.getElementById('internshipDuration').value.trim() || 'Not Enrolled';
      const projectDuration = document.getElementById('projectDuration').value.trim() || 'Not Enrolled';

      if (!regNo) { showError('regNumberError', 'Register number is required'); valid = false; }
      if (!mobile) { showError('mobileError', 'Mobile number is required'); valid = false; }
      
      if (!valid) return;
      
      const randNo = Math.floor(10000 + Math.random() * 90000);
      const studentId = `STU-${new Date().getFullYear()}-${randNo}`;

      studentDetails = {
        studentId,
        registerNumber: regNo,
        mobile,
        department: dept,
        year,
        courseName,
        internshipName,
        projectName,
        facultyMentor,
        trainingBatch,
        enrollmentDate,
        courseDuration,
        customDurationDays: customDays,
        internshipDuration,
        projectDuration,
        expectedCompletionDate,
        status: 'In Progress',
        progress: {
          course: 25,
          attendance: 90,
          assignments: 30,
          quizzes: 40,
          internshipTasks: 10,
          project: 10,
          placement: 20
        },
        certificates: [],
        activityLogs: [{
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          action: 'Registered and self-enrolled in course: ' + courseName
        }],
        notifications: [{
          id: 'notif-' + Date.now(),
          title: 'Enrollment Confirmed 🚀',
          message: 'Welcome to Acadex LMS! Your enrollment in ' + courseName + ' is confirmed.',
          type: 'success',
          date: new Date().toISOString(),
          read: false
        }]
      };
    }

    if (!valid) return;

    const users = Store.get('users', []);
    if (users.find(u => u.email === email)) {
      showError('emailError', 'Email already registered');
      Toast.error('Registration Failed', 'This email is already in use');
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      role,
      joined: new Date().toISOString().slice(0, 10),
      department: role === 'student' ? studentDetails.department : 'General',
      avatar: '',
      ...studentDetails
    };

    users.push(newUser);
    Store.set('users', users);

    const btn = regForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Creating Account...';

    setTimeout(() => {
      Auth.login(newUser);
      Toast.success('Account Created!', `Welcome to Acadex, ${newUser.name}!`);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    }, 900);
  });

  // Role selector
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('role').value = card.dataset.role;
    });
  });

  // Password strength
  const pwdInput = document.getElementById('password');
  if (pwdInput) {
    pwdInput.addEventListener('input', () => {
      updatePasswordStrength(pwdInput.value);
    });
  }
}

function updatePasswordStrength(pwd) {
  const bar      = document.getElementById('strengthBar');
  const text     = document.getElementById('strengthText');
  if (!bar || !text) return;

  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = [
    { label: 'Very Weak', color: '#EF4444', w: 20 },
    { label: 'Weak',      color: '#F97316', w: 40 },
    { label: 'Fair',      color: '#F59E0B', w: 60 },
    { label: 'Strong',    color: '#10B981', w: 80 },
    { label: 'Very Strong', color: '#059669', w: 100 }
  ];

  const level = levels[Math.min(score, 4)];
  bar.style.width = level.w + '%';
  bar.style.background = level.color;
  text.textContent = level.label;
  text.style.color = level.color;
}

// ── Helpers ───────────────────────────────────────────────────
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
  const input = el?.previousElementSibling?.querySelector('input, select');
  if (input) input.classList.add('error');
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => {
    e.textContent = '';
    e.style.display = 'none';
  });
  document.querySelectorAll('.form-control.error').forEach(i => i.classList.remove('error'));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Dashboard Redirect ────────────────────────────────────────
function initDashboardRedirect() {
  if (!document.getElementById('dashboard-redirect')) return;
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  const routes = {
    student: 'student.html',
    faculty: 'faculty.html',
    admin:   'admin.html'
  };

  setTimeout(() => {
    window.location.href = routes[user.role] || 'student.html';
  }, 300);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedUsers();
  initLoginPage();
  initRegisterPage();
  initDashboardRedirect();
});
