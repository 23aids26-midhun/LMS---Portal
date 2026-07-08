/* ============================================================
   Acadex LMS — admin.js
   ============================================================ */

let adminData = {
  users: Store ? Store.get('users', []) : [],
  departments: [
    { id: 1, name: 'Computer Science', head: 'Dr. Sarah Chen', students: 320, faculty: 12, courses: 28 },
    { id: 2, name: 'Mathematics', head: 'Prof. Alan Turing', students: 210, faculty: 8, courses: 18 },
    { id: 3, name: 'Physics', head: 'Dr. Richard Feyn', students: 180, faculty: 7, courses: 15 },
    { id: 4, name: 'Business', head: 'Prof. Peter Drucker', students: 450, faculty: 15, courses: 35 },
    { id: 5, name: 'Design', head: 'Dr. Steve Jobs', students: 145, faculty: 6, courses: 12 }
  ],
  enrollmentTrend: [120, 195, 280, 340, 410, 520, 610, 730, 820, 940, 1050, 1180],
  revenueData: [4200, 6800, 9500, 11200, 14000, 17500, 20100, 24300, 27800, 31200, 35600, 40100]
};

// ── Render Users Table ─────────────────────────────────────────
function renderUsersTable(filter = '') {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const statusSelect = document.getElementById('statusFilter');
  const statusFilter = statusSelect ? statusSelect.value : '';

  let users = adminData.users;

  // Run evaluateStudentStatus on students list to ensure statuses are correct on page refresh
  if (typeof Lifecycle !== 'undefined') {
    users = users.map(u => {
      if (u.role === 'student') {
        return Lifecycle.evaluateStudentStatus(u, adminData.users);
      }
      return u;
    });
    Store.set('users', users);
    adminData.users = users;
  }

  if (filter) {
    const f = filter.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f) ||
      u.role.toLowerCase().includes(f)
    );
  }

  if (statusFilter) {
    users = users.filter(u => u.role === 'student' && u.status === statusFilter);
  }

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:32px">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="flex items-center gap-12">
          <div class="avatar-placeholder avatar-sm" style="border-radius:50%;background:var(--gradient-primary);color:#fff;font-size:0.8rem;font-weight:700;width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${u.name[0].toUpperCase()}
          </div>
          <div>
            <div class="font-semi" style="font-size:0.875rem">${u.name}</div>
            <div class="text-xs text-muted">${u.email}</div>
            ${u.role === 'student' && u.studentId ? `<div style="font-size:0.7rem;color:var(--text-light);margin-top:2px;">ID: ${u.studentId} · Reg: ${u.registerNumber || 'N/A'}</div>` : ''}
          </div>
        </div>
      </td>
      <td><span class="badge badge-${roleColor(u.role)}">${u.role}</span></td>
      <td>${u.department || 'N/A'}</td>
      <td>${Format.date(u.joined || new Date())}</td>
      <td>${statusBadge(u)}</td>
      <td>
        <div class="table-actions">
          ${actionButtons(u)}
        </div>
      </td>
    </tr>
  `).join('');
}

function statusBadge(u) {
  if (u.role !== 'student') return '<span class="badge badge-success">Active</span>';
  
  const status = u.status || 'Active';
  const badgeMap = {
    'Active': 'primary',
    'In Progress': 'info',
    'Completed': 'success',
    'Expired': 'danger',
    'Archived': 'warning'
  };

  let extraText = '';
  if (status === 'In Progress' && typeof Lifecycle !== 'undefined' && u.expectedCompletionDate) {
    const { remaining } = Lifecycle.calculateRemainingDays(u.expectedCompletionDate);
    extraText = `<div style="font-size:0.68rem;color:var(--text-light);margin-top:2px;">${remaining}d remaining</div>`;
  } else if (status === 'Completed' && typeof Lifecycle !== 'undefined' && u.completionDate) {
    const compDate = new Date(u.completionDate);
    const graceDays = Lifecycle.getSettings().gracePeriodDays;
    const expiryDate = new Date(compDate);
    expiryDate.setDate(expiryDate.getDate() + graceDays);
    const { remaining } = Lifecycle.calculateRemainingDays(expiryDate.toISOString().slice(0, 10));
    extraText = `<div style="font-size:0.68rem;color:var(--text-light);margin-top:2px;">Grace: ${remaining}d left</div>`;
  } else if (status === 'Expired') {
    extraText = `<div style="font-size:0.68rem;color:var(--text-light);margin-top:2px;">Lapsed</div>`;
  }

  return `<span class="badge badge-${badgeMap[status] || 'primary'}">${status}</span>${extraText}`;
}

function actionButtons(u) {
  if (u.role !== 'student') {
    return `
      <button class="action-btn edit" title="Edit" onclick="openEditUserModal(${u.id})"><i class="fa fa-pencil"></i></button>
      <button class="action-btn delete" title="Delete" onclick="deleteUser(${u.id})"><i class="fa fa-trash"></i></button>
    `;
  }

  const isArchived = u.status === 'Archived';
  const archiveIcon = isArchived ? 'fa-unlock' : 'fa-archive';
  const archiveTitle = isArchived ? 'Restore Student' : 'Archive Student';
  const archiveClass = isArchived ? 'success' : 'warning';

  return `
    <div class="flex gap-4 items-center">
      <button class="action-btn edit" title="Edit Student Details" onclick="openEditUserModal(${u.id})"><i class="fa fa-pencil"></i></button>
      <button class="action-btn extend" title="Extend Duration" onclick="openExtendDurationModal(${u.id})" style="background:var(--primary-light);color:var(--primary)"><i class="fa fa-hourglass-half"></i></button>
      <button class="action-btn reenroll" title="Re-enroll Student" onclick="openReEnrollModal(${u.id})" style="background:var(--success-light);color:var(--success)"><i class="fa fa-refresh"></i></button>
      <button class="action-btn ${archiveClass}" title="${archiveTitle}" onclick="toggleStudentArchive(${u.id}, ${isArchived})" style="background:${isArchived?'var(--success-light)':'var(--warning-light)'};color:${isArchived?'var(--success)':'var(--warning)'}"><i class="fa ${archiveIcon}"></i></button>
      <button class="action-btn logs" title="Activity Logs" onclick="openViewLogsModal(${u.id})" style="background:var(--accent-light);color:var(--accent)"><i class="fa fa-history"></i></button>
      <a href="reports.html" class="action-btn report" title="Academic & Placement Report" style="background:var(--info-light);color:var(--info);display:inline-flex;align-items:center;justify-content:center;"><i class="fa fa-bar-chart"></i></a>
      <button class="action-btn delete" title="Permanently Delete" onclick="deleteUser(${u.id})"><i class="fa fa-trash"></i></button>
    </div>
  `;
}

function roleColor(role) {
  return { student: 'primary', faculty: 'accent', admin: 'purple' }[role] || 'gray';
}

// ── Modals ────────────────────────────────────────────────────
function openAddUserModal() {
  document.getElementById('addUserForm').reset();
  toggleAdminAddStudentFields('');
  Modal.open('addUserModal');
}

function saveNewUser() {
  const form = document.getElementById('addUserForm');
  const name  = form.querySelector('#newName').value.trim();
  const email = form.querySelector('#newEmail').value.trim();
  const role  = form.querySelector('#newRole').value;
  const dept  = form.querySelector('#newDept').value.trim();

  if (!name || !email || !role) {
    Toast.warning('Missing Fields', 'Please fill all required fields');
    return;
  }

  // Student specific parameters
  let studentDetails = {};
  if (role === 'student') {
    const regNo = document.getElementById('newRegNumber').value.trim();
    const mobile = document.getElementById('newMobile').value.trim();
    const year = document.getElementById('newYearSelect').value;
    const courseName = document.getElementById('newCourseSelect').value;
    const internshipName = document.getElementById('newInternshipName').value.trim() || 'No Internship';
    const projectName = document.getElementById('newProjectName').value.trim() || 'No Project';
    const facultyMentor = document.getElementById('newFacultyMentor').value;
    const trainingBatch = document.getElementById('newTrainingBatch').value.trim() || 'Batch 2026-A';
    const enrollmentDate = document.getElementById('newEnrollmentDate').value || new Date().toISOString().slice(0, 10);
    const courseDuration = document.getElementById('newCourseDuration').value;
    const customDays = document.getElementById('newCustomDurationDays').value || 30;
    const expectedCompletionDate = document.getElementById('newExpectedCompletionDate').value;
    const internshipDuration = document.getElementById('newInternshipDuration').value.trim() || 'Not Enrolled';
    const projectDuration = document.getElementById('newProjectDuration').value.trim() || 'Not Enrolled';

    if (!regNo || !mobile) {
      Toast.warning('Missing Student Fields', 'Register number and Mobile are required');
      return;
    }

    const randNo = Math.floor(10000 + Math.random() * 90000);
    const studentId = `STU-${new Date().getFullYear()}-${randNo}`;

    studentDetails = {
      studentId,
      registerNumber: regNo,
      mobile,
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
        action: 'Account manually enrolled by administrator.'
      }],
      notifications: [{
        id: 'notif-' + Date.now(),
        title: 'Enrollment Confirmed 🚀',
        message: 'Your enrollment in ' + courseName + ' has been completed by the admin.',
        type: 'success',
        date: new Date().toISOString(),
        read: false
      }]
    };
  }

  const allUsers = Store.get('users', []);
  const newUser = {
    id: Date.now(),
    name, email,
    password: 'change123',
    role, department: dept,
    joined: new Date().toISOString().slice(0, 10),
    ...studentDetails
  };

  allUsers.push(newUser);
  Store.set('users', allUsers);
  adminData.users = allUsers;
  renderUsersTable();
  Modal.close('addUserModal');
  Toast.success('User Created!', `${name} has been added`);
}

function openEditUserModal(id) {
  const user = adminData.users.find(u => u.id === id);
  if (!user) return;
  
  document.getElementById('editUserId').value    = id;
  document.getElementById('editUserName').value  = user.name;
  document.getElementById('editUserEmail').value = user.email;
  document.getElementById('editUserRole').value  = user.role;
  document.getElementById('editUserDept').value  = user.department || '';

  toggleAdminEditStudentFields(user.role);

  if (user.role === 'student') {
    document.getElementById('editRegNumber').value = user.registerNumber || '';
    document.getElementById('editMobile').value = user.mobile || '';
    document.getElementById('editYearSelect').value = user.year || '1st Year';
    document.getElementById('editCourseSelect').value = user.courseName || 'Complete Web Development Bootcamp';
    document.getElementById('editInternshipName').value = user.internshipName || '';
    document.getElementById('editProjectName').value = user.projectName || '';
    document.getElementById('editFacultyMentor').value = user.facultyMentor || 'Dr. Sarah Chen';
    document.getElementById('editTrainingBatch').value = user.trainingBatch || '';
    document.getElementById('editEnrollmentDate').value = user.enrollmentDate || '';
    document.getElementById('editCourseDuration').value = user.courseDuration || '3 Months';
    document.getElementById('editCustomDurationDays').value = user.customDurationDays || '';
    document.getElementById('editExpectedCompletionDate').value = user.expectedCompletionDate || '';
    document.getElementById('editInternshipDuration').value = user.internshipDuration || '';
    document.getElementById('editProjectDuration').value = user.projectDuration || '';
    document.getElementById('editStudentStatus').value = user.status || 'In Progress';
  }

  Modal.open('editUserModal');
}

function saveEditUser() {
  const id    = parseInt(document.getElementById('editUserId').value);
  const name  = document.getElementById('editUserName').value.trim();
  const email = document.getElementById('editUserEmail').value.trim();
  const role  = document.getElementById('editUserRole').value;
  const dept  = document.getElementById('editUserDept').value.trim();

  if (!name || !email) { Toast.warning('Required fields missing'); return; }

  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const existing = allUsers[idx];
    let studentDetails = {};

    if (role === 'student') {
      const regNo = document.getElementById('editRegNumber').value.trim();
      const mobile = document.getElementById('editMobile').value.trim();
      const year = document.getElementById('editYearSelect').value;
      const courseName = document.getElementById('editCourseSelect').value;
      const internshipName = document.getElementById('editInternshipName').value.trim();
      const projectName = document.getElementById('editProjectName').value.trim();
      const facultyMentor = document.getElementById('editFacultyMentor').value;
      const trainingBatch = document.getElementById('editTrainingBatch').value.trim();
      const enrollmentDate = document.getElementById('editEnrollmentDate').value;
      const courseDuration = document.getElementById('editCourseDuration').value;
      const customDays = document.getElementById('editCustomDurationDays').value || 30;
      const expectedCompletionDate = document.getElementById('editExpectedCompletionDate').value;
      const internshipDuration = document.getElementById('editInternshipDuration').value.trim();
      const projectDuration = document.getElementById('editProjectDuration').value.trim();
      const status = document.getElementById('editStudentStatus').value;

      studentDetails = {
        registerNumber: regNo,
        mobile,
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
        status: status,
        progress: existing.progress || {
          course: 25,
          attendance: 90,
          assignments: 30,
          quizzes: 40,
          internshipTasks: 10,
          project: 10,
          placement: 20
        }
      };

      // Add log if status changed
      if (existing.status !== status) {
        if (typeof Lifecycle !== 'undefined') {
          Lifecycle.logActivity(existing, `Admin changed status from ${existing.status} to ${status}.`);
          Lifecycle.addNotification(existing, 'Status Updated 🔔', `Your enrollment status was updated to ${status} by the admin.`, 'info');
        }
      }
    }

    allUsers[idx] = { ...existing, ...studentDetails, name, email, role, department: dept };
    Store.set('users', allUsers);
    adminData.users = allUsers;
    renderUsersTable();
    Modal.close('editUserModal');
    Toast.success('User Updated!');
  }
}

function deleteUser(id) {
  if (!confirm('Delete this user permanently? This action is irreversible.')) return;
  const allUsers = Store.get('users', []).filter(u => u.id !== id);
  Store.set('users', allUsers);
  adminData.users = allUsers;
  renderUsersTable();
  Toast.success('User Deleted');
}

function openEditDeptModal(id) {
  const dept = adminData.departments.find(d => d.id === id);
  if (!dept) return;
  document.getElementById('editDeptId').value   = id;
  document.getElementById('editDeptName').value = dept.name;
  document.getElementById('editDeptHead').value = dept.head;
  Modal.open('editDeptModal');
}

function saveEditDept() {
  const id   = parseInt(document.getElementById('editDeptId').value);
  const name = document.getElementById('editDeptName').value.trim();
  const head = document.getElementById('editDeptHead').value.trim();
  if (!name) return;
  const idx = adminData.departments.findIndex(d => d.id === id);
  if (idx >= 0) {
    adminData.departments[idx].name = name;
    adminData.departments[idx].head = head;
    renderDepartmentsTable();
    Modal.close('editDeptModal');
    Toast.success('Department Updated!');
  }
}

function deleteDept(id) {
  adminData.departments = adminData.departments.filter(d => d.id !== id);
  renderDepartmentsTable();
  Toast.success('Department Removed');
}

// ── Search ────────────────────────────────────────────────────
function initAdminSearch() {
  const searchInput = document.getElementById('userSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => renderUsersTable(e.target.value));
  }
}

// ── Init Admin Dashboard ───────────────────────────────────────
function initAdminDashboard() {
  if (!document.getElementById('adminDashboard')) return;
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  if (user.role !== 'admin') {
    window.location.href = `${user.role}.html`;
    return;
  }

  adminData.users = Store.get('users', []);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const totalStudents = adminData.users.filter(u => u.role === 'student').length;
  const totalFaculty  = adminData.users.filter(u => u.role === 'faculty').length;
  const totalUsers    = adminData.users.length;

  setEl('adminTotalStudents', totalStudents);
  setEl('adminTotalFaculty', totalFaculty);
  setEl('adminTotalDepts', adminData.departments.length);
  setEl('adminTotalUsers', totalUsers);

  // Calculate cohort dynamic averages
  const students = adminData.users.filter(u => u.role === 'student');
  const activeStudents = students.filter(s => s.status === 'In Progress' || s.status === 'Active' || s.status === 'Expired').length;
  
  let totalAttendance = 0;
  let totalCourseProgress = 0;
  let totalInternProgress = 0;
  let totalProjProgress = 0;
  let totalReadyProgress = 0;
  let certsCount = 0;

  students.forEach(s => {
    const prog = s.progress || {};
    totalAttendance += (prog.attendance || 0);
    totalCourseProgress += (prog.course || 0);
    totalInternProgress += (prog.internshipTasks || 0);
    totalProjProgress += (prog.project || 0);
    totalReadyProgress += (prog.placement || 0);
    certsCount += (s.certificates || []).length;
  });

  const studentsCount = students.length || 1;
  const avgAttendance = Math.round(totalAttendance / studentsCount);
  const avgCourse = Math.round(totalCourseProgress / studentsCount);
  const avgIntern = Math.round(totalInternProgress / studentsCount);
  const avgProj = Math.round(totalProjProgress / studentsCount);
  const avgReady = Math.round(totalReadyProgress / studentsCount);

  setEl('adminActiveCount', `Active: ${activeStudents} Students`);
  setEl('adminValAttendance', avgAttendance + '%');
  setEl('adminValCourseComp', avgCourse + '%');
  setEl('adminValInternComp', avgIntern + '%');
  setEl('adminValProjComp', avgProj + '%');
  setEl('adminValPlacementReady', avgReady + '%');
  setEl('adminValCertsCount', certsCount);

  renderUsersTable();
  renderDepartmentsTable();
  renderEnrollmentTrendChart();
  renderDeptPieChart();
  initAdminSearch();
}

// ── Student Lifecycle Admin Handlers ──────────────────────────
function toggleAdminAddStudentFields(role) {
  const fields = document.getElementById('adminAddStudentFields');
  if (!fields) return;
  if (role === 'student') {
    fields.style.display = 'block';
    const enrollInput = document.getElementById('newEnrollmentDate');
    if (!enrollInput.value) {
      enrollInput.value = new Date().toISOString().slice(0, 10);
    }
    updateAdminAddExpectedCompletion();
  } else {
    fields.style.display = 'none';
  }
}

function updateAdminAddExpectedCompletion() {
  const enrollDate = document.getElementById('newEnrollmentDate').value;
  const duration = document.getElementById('newCourseDuration').value;
  const customDays = document.getElementById('newCustomDurationDays').value || 30;

  const customGroup = document.getElementById('newCustomDurationGroup');
  if (duration === 'Custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }

  if (enrollDate && duration && typeof Lifecycle !== 'undefined') {
    const expected = Lifecycle.calculateExpectedCompletionDate(enrollDate, duration, customDays);
    document.getElementById('newExpectedCompletionDate').value = expected;
  }
}

function toggleAdminEditStudentFields(role) {
  const fields = document.getElementById('adminEditStudentFields');
  if (!fields) return;
  if (role === 'student') {
    fields.style.display = 'block';
    updateAdminEditExpectedCompletion();
  } else {
    fields.style.display = 'none';
  }
}

function updateAdminEditExpectedCompletion() {
  const enrollDate = document.getElementById('editEnrollmentDate').value;
  const duration = document.getElementById('editCourseDuration').value;
  const customDays = document.getElementById('editCustomDurationDays').value || 30;

  const customGroup = document.getElementById('editCustomDurationGroup');
  if (duration === 'Custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }

  if (enrollDate && duration && typeof Lifecycle !== 'undefined') {
    const expected = Lifecycle.calculateExpectedCompletionDate(enrollDate, duration, customDays);
    document.getElementById('editExpectedCompletionDate').value = expected;
  }
}

function toggleStudentArchive(id, isArchived) {
  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    const nextStatus = isArchived ? 'Active' : 'Archived';
    
    if (confirm(`${isArchived ? 'Restore' : 'Archive'} student ${student.name}?`)) {
      student.status = nextStatus;
      if (typeof Lifecycle !== 'undefined') {
        Lifecycle.logActivity(student, `Account manually ${isArchived ? 'restored' : 'archived'} by administrator.`);
        Lifecycle.addNotification(student, isArchived ? 'Account Restored 🔓' : 'Account Archived 📦', `Your account was ${isArchived ? 'restored' : 'archived'} by the admin.`, 'info');
      }
      
      allUsers[idx] = student;
      Store.set('users', allUsers);
      adminData.users = allUsers;
      renderUsersTable();
      Toast.success(`Student ${isArchived ? 'Restored' : 'Archived'}`);
    }
  }
}

// Extend Duration functions
function openExtendDurationModal(id) {
  const user = adminData.users.find(u => u.id === id);
  if (!user) return;

  document.getElementById('extendStudentId').value = id;
  document.getElementById('extendStudentName').textContent = user.name;
  document.getElementById('extendDurationSelect').value = user.courseDuration || '3 Months';
  document.getElementById('extendCustomDurationDays').value = user.customDurationDays || '';
  
  updateExtendExpectedDate();
  Modal.open('extendDurationModal');
}

function updateExtendExpectedDate() {
  const id = parseInt(document.getElementById('extendStudentId').value);
  const user = adminData.users.find(u => u.id === id);
  if (!user) return;

  const enrollDate = user.enrollmentDate || new Date().toISOString().slice(0, 10);
  const duration = document.getElementById('extendDurationSelect').value;
  const customDays = document.getElementById('extendCustomDurationDays').value || 30;

  const customGroup = document.getElementById('extendCustomDurationGroup');
  if (duration === 'Custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }

  if (typeof Lifecycle !== 'undefined') {
    const expected = Lifecycle.calculateExpectedCompletionDate(enrollDate, duration, customDays);
    document.getElementById('extendExpectedDate').value = expected;
  }
}

function saveExtendDuration() {
  const id = parseInt(document.getElementById('extendStudentId').value);
  const duration = document.getElementById('extendDurationSelect').value;
  const customDays = document.getElementById('extendCustomDurationDays').value || 30;
  const expectedDate = document.getElementById('extendExpectedDate').value;

  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    const oldExpected = student.expectedCompletionDate;
    student.courseDuration = duration;
    student.customDurationDays = customDays;
    student.expectedCompletionDate = expectedDate;
    
    // Reset status if it was Expired
    if (student.status === 'Expired') {
      student.status = 'In Progress';
    }

    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.logActivity(student, `Course duration extended from ${oldExpected} to ${expectedDate}.`);
      Lifecycle.addNotification(student, 'Access Duration Extended ⏳', `Your course access was extended to ${expectedDate}.`, 'success');
      Lifecycle.evaluateStudentStatus(student, allUsers);
    } else {
      allUsers[idx] = student;
      Store.set('users', allUsers);
    }
    
    adminData.users = Store.get('users', []);
    renderUsersTable();
    Modal.close('extendDurationModal');
    Toast.success('Duration Extended!');
  }
}

// Re-enroll functions
function openReEnrollModal(id) {
  const user = adminData.users.find(u => u.id === id);
  if (!user) return;

  document.getElementById('reEnrollStudentId').value = id;
  document.getElementById('reEnrollStudentName').textContent = user.name;
  document.getElementById('reEnrollDuration').value = '3 Months';
  document.getElementById('reEnrollCustomDays').value = '';

  updateReEnrollExpectedDate();
  Modal.open('reEnrollModal');
}

function updateReEnrollExpectedDate() {
  const today = new Date().toISOString().slice(0, 10);
  const duration = document.getElementById('reEnrollDuration').value;
  const customDays = document.getElementById('reEnrollCustomDays').value || 30;

  const customGroup = document.getElementById('reEnrollCustomGroup');
  if (duration === 'Custom') {
    customGroup.style.display = 'block';
  } else {
    customGroup.style.display = 'none';
  }

  if (typeof Lifecycle !== 'undefined') {
    const expected = Lifecycle.calculateExpectedCompletionDate(today, duration, customDays);
    document.getElementById('reEnrollExpectedDate').value = expected;
  }
}

function saveReEnroll() {
  const id = parseInt(document.getElementById('reEnrollStudentId').value);
  const duration = document.getElementById('reEnrollDuration').value;
  const customDays = document.getElementById('reEnrollCustomDays').value || 30;
  const expectedDate = document.getElementById('reEnrollExpectedDate').value;
  const today = new Date().toISOString().slice(0, 10);

  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    student.enrollmentDate = today;
    student.courseDuration = duration;
    student.customDurationDays = customDays;
    student.expectedCompletionDate = expectedDate;
    student.status = 'In Progress';
    student.completionDate = '';
    
    // Reset progress
    student.progress = {
      course: 0,
      attendance: 100,
      assignments: 0,
      quizzes: 0,
      internshipTasks: 0,
      project: 0,
      placement: 0
    };
    student.certificates = [];

    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.logActivity(student, `Re-enrolled in program with duration ${duration}.`);
      Lifecycle.addNotification(student, 'Re-enrolled Successfully 🚀', `You have been re-enrolled in the course. Start date is today.`, 'success');
    }

    allUsers[idx] = student;
    Store.set('users', allUsers);
    adminData.users = allUsers;
    renderUsersTable();
    Modal.close('reEnrollModal');
    Toast.success('Student Re-enrolled!');
  }
}

// Activity Logs function
function openViewLogsModal(id) {
  const user = adminData.users.find(u => u.id === id);
  if (!user) return;

  document.getElementById('logStudentName').textContent = user.name;
  const container = document.getElementById('logListContainer');
  
  const logs = user.activityLogs || [];
  if (logs.length === 0) {
    container.innerHTML = '<div class="text-xs text-muted text-center" style="padding:16px;">No activity logs recorded.</div>';
  } else {
    container.innerHTML = logs.map(l => `
      <div style="padding: 8px; border-bottom: 1px solid var(--border); font-size: 0.8rem;">
        <div style="font-weight: 600; color: var(--text);">${l.action}</div>
        <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 2px;">${Format.date(l.timestamp)} · ${Format.time(l.timestamp)}</div>
      </div>
    `).join('');
  }

  Modal.open('viewLogsModal');
}

// Render Departments Table
function renderDepartmentsTable() {
  const tbody = document.getElementById('deptTableBody');
  if (!tbody) return;

  tbody.innerHTML = adminData.departments.map(d => `
    <tr>
      <td class="font-semi">${d.name}</td>
      <td>${d.head}</td>
      <td>${d.students}</td>
      <td>${d.faculty}</td>
      <td>${d.courses}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn edit" onclick="openEditDeptModal(${d.id})"><i class="fa fa-pencil"></i></button>
          <button class="action-btn delete" onclick="deleteDept(${d.id})"><i class="fa fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Charts ────────────────────────────────────────────────────
function renderEnrollmentTrendChart() {
  const canvas = document.getElementById('enrollmentTrendChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        {
          label: 'Students',
          data: adminData.enrollmentTrend,
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderWidth: 2.5,
          pointBackgroundColor: '#2563EB',
          pointRadius: 3,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
        x: { grid: { display: false }, ticks: { color: textColor } }
      }
    }
  });
}

function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        label: 'Revenue ($)',
        data: adminData.revenueData,
        backgroundColor: 'rgba(20,184,166,0.8)',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + v.toLocaleString() } },
        x: { grid: { display: false }, ticks: { color: textColor } }
      }
    }
  });
}

function renderDeptPieChart() {
  const canvas = document.getElementById('deptPieChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: adminData.departments.map(d => d.name),
      datasets: [{
        data: adminData.departments.map(d => d.students),
        backgroundColor: ['#2563EB','#14B8A6','#F59E0B','#EF4444','#8B5CF6'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, padding: 12, font: { size: 11 } }
        }
      }
    }
  });
}

// Hook change events on enrollment form elements
document.addEventListener('DOMContentLoaded', () => {
  const addEnroll = document.getElementById('newEnrollmentDate');
  const addDur = document.getElementById('newCourseDuration');
  const addCust = document.getElementById('newCustomDurationDays');

  if (addEnroll) addEnroll.addEventListener('change', updateAdminAddExpectedCompletion);
  if (addDur) addDur.addEventListener('change', updateAdminAddExpectedCompletion);
  if (addCust) addCust.addEventListener('input', updateAdminAddExpectedCompletion);

  const editEnroll = document.getElementById('editEnrollmentDate');
  const editDur = document.getElementById('editCourseDuration');
  const editCust = document.getElementById('editCustomDurationDays');

  if (editEnroll) editEnroll.addEventListener('change', updateAdminEditExpectedCompletion);
  if (editDur) editDur.addEventListener('change', updateAdminEditExpectedCompletion);
  if (editCust) editCust.addEventListener('input', updateAdminEditExpectedCompletion);
});

document.addEventListener('DOMContentLoaded', initAdminDashboard);
