/* ============================================================
   Acadex LMS — faculty.js
   ============================================================ */

const FACULTY_DATA = {
  courses: [
    { id: 1, title: 'Complete Web Development', students: 128, lessons: 48, status: 'published', rating: 4.8, category: 'Web Dev' },
    { id: 2, title: 'Advanced JavaScript', students: 96, lessons: 32, status: 'published', rating: 4.7, category: 'Programming' },
    { id: 3, title: 'React & Redux Mastery', students: 74, lessons: 40, status: 'draft', rating: 0, category: 'Frontend' },
    { id: 4, title: 'Node.js Backend', students: 55, lessons: 28, status: 'published', rating: 4.6, category: 'Backend' }
  ],
  submissions: [
    { id: 1, student: 'Alex Johnson', assignment: 'Build a REST API', course: 'Web Dev', submitted: new Date(Date.now() - 3600000).toISOString(), grade: null },
    { id: 2, student: 'Emily Davis', assignment: 'JS Quiz Project', course: 'Advanced JS', submitted: new Date(Date.now() - 7200000).toISOString(), grade: 'A' },
    { id: 3, student: 'Marcus Lee', assignment: 'React App', course: 'React Mastery', submitted: new Date(Date.now() - 86400000).toISOString(), grade: null },
    { id: 4, student: 'Priya Sharma', assignment: 'API Integration', course: 'Node.js', submitted: new Date(Date.now() - 172800000).toISOString(), grade: 'B+' }
  ],
  students: [
    { name: 'Alex Johnson',  avg: 88, attendance: 92 },
    { name: 'Emily Davis',   avg: 95, attendance: 97 },
    { name: 'Marcus Lee',    avg: 72, attendance: 78 },
    { name: 'Priya Sharma',  avg: 91, attendance: 95 },
    { name: 'Tom Wilson',    avg: 65, attendance: 70 }
  ]
};

// ── Render Faculty Course Table ───────────────────────────────
function renderFacultyCourses() {
  const tbody = document.getElementById('facultyCourseTable');
  if (!tbody) return;

  tbody.innerHTML = FACULTY_DATA.courses.map(c => `
    <tr>
      <td>
        <div class="font-semi">${c.title}</div>
        <div class="text-xs text-muted">${c.category}</div>
      </td>
      <td>${c.students}</td>
      <td>${c.lessons} lessons</td>
      <td>
        <span class="badge badge-${c.status === 'published' ? 'success' : 'warning'}">
          ${c.status}
        </span>
      </td>
      <td>
        ${c.rating ? `
          <div class="stars">
            ${'<i class="fa fa-star"></i>'.repeat(Math.floor(c.rating))}
            ${c.rating % 1 ? '<i class="fa fa-star-half-o"></i>' : ''}
          </div>
          <span class="text-xs">${c.rating}</span>
        ` : '<span class="text-muted text-xs">No ratings</span>'}
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn view" title="View" onclick="location.href='course-details.html?id=${c.id}'"><i class="fa fa-eye"></i></button>
          <button class="action-btn edit" title="Edit" onclick="openEditCourseModal(${c.id})"><i class="fa fa-pencil"></i></button>
          <button class="action-btn delete" title="Delete" onclick="deleteCourse(${c.id})"><i class="fa fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Render Submissions ────────────────────────────────────────
function renderSubmissions() {
  const tbody = document.getElementById('submissionsTable');
  if (!tbody) return;

  tbody.innerHTML = FACULTY_DATA.submissions.map(s => `
    <tr>
      <td>
        <div class="flex items-center gap-8">
          <div class="avatar-placeholder avatar-sm" style="border-radius:50%;background:var(--gradient-primary);color:#fff;font-size:0.75rem;font-weight:700;">
            ${s.student[0]}
          </div>
          ${s.student}
        </div>
      </td>
      <td>${s.assignment}</td>
      <td>${s.course}</td>
      <td>${Format.relative(s.submitted)}</td>
      <td>
        ${s.grade
          ? `<span class="badge badge-success">${s.grade}</span>`
          : `<button class="btn btn-primary btn-sm" onclick="openGradeModal('${s.id}','${s.student}')">Grade</button>`
        }
      </td>
    </tr>
  `).join('');
}

// ── Student Performance Chart ─────────────────────────────────
function renderPerformanceChart() {
  const canvas = document.getElementById('performanceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: FACULTY_DATA.students.map(s => s.name.split(' ')[0]),
      datasets: [
        {
          label: 'Avg Score',
          data: FACULTY_DATA.students.map(s => s.avg),
          backgroundColor: 'rgba(37,99,235,0.8)',
          borderRadius: 6
        },
        {
          label: 'Attendance %',
          data: FACULTY_DATA.students.map(s => s.attendance),
          backgroundColor: 'rgba(20,184,166,0.8)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: textColor, font: { size: 12 } }
        }
      },
      scales: {
        y: {
          min: 0, max: 100,
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor }
        }
      }
    }
  });
}

// ── Enrollment Trend Chart ────────────────────────────────────
function renderEnrollmentChart() {
  const canvas = document.getElementById('enrollmentChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'New Enrollments',
        data: [24, 38, 52, 61, 74, 96],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#2563EB',
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }]
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

// ── Modals ────────────────────────────────────────────────────
function openGradeModal(id, student) {
  document.getElementById('gradeStudentName').textContent = student;
  document.getElementById('submissionId').value = id;
  Modal.open('gradeModal');
}

function submitGrade() {
  const grade = document.getElementById('gradeInput').value;
  if (!grade) { Toast.warning('Please enter a grade'); return; }

  const idx = FACULTY_DATA.submissions.findIndex(s => s.id == document.getElementById('submissionId').value);
  if (idx >= 0) {
    FACULTY_DATA.submissions[idx].grade = grade;
    renderSubmissions();
    Modal.close('gradeModal');
    Toast.success('Grade Submitted!', `Graded successfully`);
  }
}

function openEditCourseModal(id) {
  const course = FACULTY_DATA.courses.find(c => c.id === id);
  if (!course) return;
  document.getElementById('editCourseTitle').value  = course.title;
  document.getElementById('editCourseCategory').value = course.category;
  document.getElementById('editCourseId').value = id;
  Modal.open('editCourseModal');
}

function saveEditCourse() {
  const id    = parseInt(document.getElementById('editCourseId').value);
  const title = document.getElementById('editCourseTitle').value.trim();
  const cat   = document.getElementById('editCourseCategory').value.trim();

  if (!title) { Toast.warning('Please enter a course title'); return; }

  const idx = FACULTY_DATA.courses.findIndex(c => c.id === id);
  if (idx >= 0) {
    FACULTY_DATA.courses[idx].title    = title;
    FACULTY_DATA.courses[idx].category = cat;
    renderFacultyCourses();
    Modal.close('editCourseModal');
    Toast.success('Course Updated!');
  }
}

function deleteCourse(id) {
  const idx = FACULTY_DATA.courses.findIndex(c => c.id === id);
  if (idx >= 0) {
    FACULTY_DATA.courses.splice(idx, 1);
    renderFacultyCourses();
    Toast.success('Course Deleted');
  }
}

// ── Init Faculty Dashboard ─────────────────────────────────────
function initFacultyDashboard() {
  if (!document.getElementById('facultyDashboard')) return;
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  if (user.role !== 'faculty') {
    window.location.href = `${user.role}.html`;
    return;
  }

  // Stats
  const totalStudents = FACULTY_DATA.courses.reduce((s, c) => s + c.students, 0);
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('totalStudents', totalStudents);
  setEl('totalCourses', FACULTY_DATA.courses.length);
  setEl('pendingGrades', FACULTY_DATA.submissions.filter(s => !s.grade).length);
  setEl('avgRating', (FACULTY_DATA.courses.filter(c => c.rating).reduce((s, c) => s + c.rating, 0) / FACULTY_DATA.courses.filter(c => c.rating).length).toFixed(1));

  renderFacultyCourses();
  renderSubmissions();
  renderPerformanceChart();
  renderEnrollmentChart();
  renderFacultyStudentDirectory();
}

function renderFacultyStudentDirectory() {
  const tbody = document.getElementById('facultyStudentDirectoryTable');
  if (!tbody) return;

  const users = Store.get('users', []);
  const students = users.filter(u => u.role === 'student');

  // 1. Populate Interventions alerts table
  const interventionTable = document.getElementById('facultyInterventionTable');
  if (interventionTable) {
    const atRiskStudents = students.filter(s => {
      const p = s.progress || {};
      return (p.attendance < 75) || (p.assignments < 50) || (p.project < 20) || (p.internshipTasks < 30);
    });

    if (atRiskStudents.length === 0) {
      interventionTable.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:16px;">All students on track. No interventions required.</td></tr>';
    } else {
      interventionTable.innerHTML = atRiskStudents.map(s => {
        const p = s.progress || {};
        let alerts = [];
        if (p.attendance < 75) alerts.push(`<span class="badge badge-danger">Low Attendance (${p.attendance}%)</span>`);
        if (p.assignments < 50) alerts.push(`<span class="badge badge-warning">Delayed Assignments (${p.assignments}%)</span>`);
        if (p.project < 20) alerts.push(`<span class="badge badge-warning">Delayed Project (${p.project}%)</span>`);
        if (p.internshipTasks < 30) alerts.push(`<span class="badge badge-warning">Delayed Internship (${p.internshipTasks}%)</span>`);

        return `
          <tr>
            <td>
              <div class="font-semi" style="font-size:0.875rem">${s.name}</div>
              <div style="font-size:0.7rem;color:var(--text-light)">ID: ${s.studentId || 'N/A'}</div>
            </td>
            <td><div style="display:flex;gap:4px;flex-wrap:wrap;">${alerts.join(' ')}</div></td>
            <td><strong style="color:var(--danger)">${p.attendance || 0}%</strong></td>
            <td>
              <div style="font-size:0.75rem;">
                Course: ${p.course || 0}% · Project: ${p.project || 0}% · Intern: ${p.internshipTasks || 0}%
              </div>
            </td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="sendInterventionNotice(${s.id})" style="padding:4px 8px;font-size:0.72rem;"><i class="fa fa-envelope-o"></i> Send Notice</button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding:32px">No student records found</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(s => {
    const progress = s.progress || { course: 0, attendance: 100, assignments: 0, quizzes: 0, internshipTasks: 0, project: 0, placement: 0 };
    const attendanceVal = progress.attendance || 100;
    const isArchiveRecommended = s.archiveRecommended || false;
    const isArchived = s.status === 'Archived';
    
    // Status color
    const statusColorMap = {
      'Active': 'primary',
      'In Progress': 'info',
      'Completed': 'success',
      'Expired': 'danger',
      'Archived': 'warning'
    };
    const statusColor = statusColorMap[s.status || 'Active'] || 'primary';

    // Actions depending on archive state
    let actionButtonsHtml = '';
    if (isArchived) {
      actionButtonsHtml = '<span class="text-xs text-muted">Archived</span>';
    } else {
      actionButtonsHtml = `
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="facultyMarkAttendance(${s.id})" title="Mark Attendance" style="padding:4px 8px;font-size:0.75rem;"><i class="fa fa-calendar"></i> Attendance</button>
          <button class="btn btn-warning btn-sm" onclick="facultyRecommendArchive(${s.id})" ${isArchiveRecommended ? 'disabled' : ''} style="padding:4px 8px;font-size:0.75rem;"><i class="fa fa-thumbs-o-down"></i> ${isArchiveRecommended ? 'Recommended' : 'Recommend'}</button>
          <button class="btn btn-primary btn-sm" onclick="facultyArchiveStudent(${s.id})" style="background:var(--danger);border-color:var(--danger);padding:4px 8px;font-size:0.75rem;"><i class="fa fa-archive"></i> Archive</button>
        </div>
      `;
    }

    // Certificate Approval layout
    let approvalHtml = '';
    if (s.facultyApprovedForCertificate) {
      approvalHtml = `<span class="badge badge-success" style="font-size:0.72rem;"><i class="fa fa-check"></i> Approved</span>`;
    } else {
      // Check if they satisfy criteria
      const isEligible = (progress.course >= 100) && (attendanceVal >= 75) && (progress.assignments >= 100) && (progress.quizzes >= 100) && (progress.internshipTasks >= 100) && (progress.project >= 100);
      if (isEligible) {
        approvalHtml = `<button class="btn btn-success btn-sm" onclick="approveStudentCertificate(${s.id})" style="padding:4px 8px;font-size:0.7rem;"><i class="fa fa-certificate"></i> Approve Credentials</button>`;
      } else {
        const tooltip = `Course: ${progress.course}% (Req: 100%)\nAttendance: ${attendanceVal}% (Req: >=75%)\nAssignments: ${progress.assignments}% (Req: 100%)\nQuizzes: ${progress.quizzes}% (Req: 100%)\nInternship: ${progress.internshipTasks}% (Req: 100%)\nProject: ${progress.project}% (Req: 100%)`;
        approvalHtml = `<span class="text-xs text-muted" title="${tooltip}" style="text-decoration:underline;cursor:help;">Criteria Incomplete</span>`;
      }
    }

    return `
      <tr>
        <td>
          <div class="font-semi" style="font-size:0.875rem">${s.name}</div>
          <div class="text-xs text-muted">${s.email}</div>
          <div style="font-size:0.7rem;color:var(--text-light);margin-top:2px;">ID: ${s.studentId || 'N/A'} · Reg: ${s.registerNumber || 'N/A'}</div>
        </td>
        <td>
          <div class="font-semi" style="font-size:0.82rem">${s.courseName || 'N/A'}</div>
          <div class="text-xs text-muted">Mentor: ${s.facultyMentor || 'Unassigned'}</div>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
            <div>Course Syllabus: <strong>${progress.course}%</strong></div>
            <div>Tasks/Quizzes: <strong>${progress.assignments}% / ${progress.quizzes}%</strong></div>
            <div>Intern / Project: <strong>${progress.internshipTasks}% / ${progress.project}%</strong></div>
            <div style="margin-top:2px;"><span class="badge badge-${statusColor}">${s.status || 'Active'}</span></div>
          </div>
        </td>
        <td>
          <span style="font-weight:700; color:${attendanceVal >= 75 ? 'var(--success)' : 'var(--danger)'}">${attendanceVal}%</span>
          <div class="text-xs text-light" style="font-size:0.68rem;">Req: >= 75%</div>
        </td>
        <td>
          ${approvalHtml}
        </td>
        <td>
          ${actionButtonsHtml}
        </td>
      </tr>
    `;
  }).join('');
}

function sendInterventionNotice(id) {
  const allUsers = Store.get('users', []);
  const student = allUsers.find(u => u.id === id);
  if (student && typeof Lifecycle !== 'undefined') {
    Lifecycle.addNotification(student, 'Academic Intervention Alert ⚠️', 'Your Faculty Mentor requests immediate contact regarding attendance or milestone delays.', 'error');
    Lifecycle.logActivity(student, 'Faculty mentor sent academic intervention notice.');
    Lifecycle.syncStudent(student);
    Toast.success('Notice Sent', `Performance intervention notice successfully dispatched to ${student.name}`);
    renderFacultyStudentDirectory();
  }
}

function approveStudentCertificate(id) {
  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    student.facultyApprovedForCertificate = true;
    
    // Evaluate status so completed certificates generate immediately
    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.evaluateStudentStatus(student, allUsers);
      Lifecycle.syncStudent(student);
    }
    
    Toast.success('Certificates Approved!', `Approved credentials for ${student.name}. Certificate has been generated.`);
    renderFacultyStudentDirectory();
  }
}

function facultyMarkAttendance(id) {
  const percentage = prompt('Enter student attendance percentage (0-100):');
  if (percentage === null) return;
  const val = parseInt(percentage);
  if (isNaN(val) || val < 0 || val > 100) {
    Toast.error('Invalid input', 'Attendance percentage must be a number between 0 and 100.');
    return;
  }

  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    if (!student.progress) student.progress = {};
    const oldVal = student.progress.attendance || 100;
    student.progress.attendance = val;

    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.logActivity(student, `Faculty Mentor updated attendance from ${oldVal}% to ${val}%.`);
      Lifecycle.addNotification(student, 'Attendance Updated 📝', `Your course attendance progress was marked as ${val}% by your faculty mentor.`, 'info');
      Lifecycle.evaluateStudentStatus(student, allUsers);
    } else {
      allUsers[idx] = student;
      Store.set('users', allUsers);
    }
    
    renderFacultyStudentDirectory();
    Toast.success('Attendance Updated');
  }
}

function facultyRecommendArchive(id) {
  if (!confirm('Recommend this student for archiving? (Administrators will receive a request to archive)')) return;

  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx >= 0) {
    const student = allUsers[idx];
    student.archiveRecommended = true;

    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.logActivity(student, 'Faculty mentor recommended account for archiving.');
      Lifecycle.addNotification(student, 'Archive Recommended 📦', 'Your faculty mentor has recommended this profile for archival.', 'warning');
    }

    allUsers[idx] = student;
    Store.set('users', allUsers);
    renderFacultyStudentDirectory();
    Toast.success('Archive Recommended');
  }
}

function facultyArchiveStudent(id) {
  const settings = typeof Lifecycle !== 'undefined' ? Lifecycle.getSettings() : { allowFacultyArchive: false };
  const allUsers = Store.get('users', []);
  const idx = allUsers.findIndex(u => u.id === id);
  if (idx < 0) return;

  const student = allUsers[idx];

  if (!settings.allowFacultyArchive) {
    Toast.warning('Archive Recommendation Sent', 'Faculty archiving is disabled by Admin. Sending archive recommendation instead.');
    student.archiveRecommended = true;
    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.logActivity(student, 'Faculty mentor recommended account for archiving (Direct archive disabled by admin settings).');
    }
    allUsers[idx] = student;
    Store.set('users', allUsers);
    renderFacultyStudentDirectory();
    return;
  }

  if (!confirm(`Archive student ${student.name} immediately?`)) return;

  student.status = 'Archived';
  student.archiveRecommended = false;
  if (typeof Lifecycle !== 'undefined') {
    Lifecycle.logActivity(student, 'Account archived directly by Faculty Mentor.');
    Lifecycle.addNotification(student, 'Account Archived 📦', 'Your account has been archived by your Faculty Mentor.', 'info');
  }

  allUsers[idx] = student;
  Store.set('users', allUsers);
  renderFacultyStudentDirectory();
  Toast.success('Student Archived Successfully');
}

document.addEventListener('DOMContentLoaded', initFacultyDashboard);
