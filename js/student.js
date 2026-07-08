/* ============================================================
   Acadex LMS — student.js
   ============================================================ */

// Sample data
const STUDENT_DATA = {
  courses: [
    { id: 1, title: 'Complete Web Development Bootcamp', instructor: 'Dr. Angela Yu', progress: 72, thumb: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80', category: 'Web Dev', lessons: 48, duration: '24h', rating: 4.8 },
    { id: 2, title: 'Machine Learning A-Z', instructor: 'Prof. Hadelin', progress: 35, thumb: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&q=80', category: 'AI/ML', lessons: 36, duration: '18h', rating: 4.7 },
    { id: 3, title: 'UI/UX Design Fundamentals', instructor: 'Dr. Sarah Kim', progress: 90, thumb: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80', category: 'Design', lessons: 24, duration: '12h', rating: 4.9 },
    { id: 4, title: 'Data Structures & Algorithms', instructor: 'Prof. Tim Chen', progress: 55, thumb: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80', category: 'CS', lessons: 60, duration: '30h', rating: 4.6 }
  ],
  assignments: [
    { id: 1, title: 'Build a REST API', course: 'Web Development', due: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'pending', points: 100 },
    { id: 2, title: 'Neural Network Report', course: 'Machine Learning', due: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'pending', points: 80 },
    { id: 3, title: 'Wireframe Design', course: 'UI/UX Design', due: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'submitted', points: 60 },
    { id: 4, title: 'Binary Trees Lab', course: 'DSA', due: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'pending', points: 50 }
  ],
  quizResults: [
    { id: 1, title: 'JavaScript Fundamentals', course: 'Web Dev', score: 88, total: 100, date: '2024-12-01', grade: 'B+' },
    { id: 2, title: 'NumPy & Pandas Quiz', course: 'ML', score: 72, total: 100, date: '2024-12-05', grade: 'C+' },
    { id: 3, title: 'Color Theory Quiz', course: 'UI/UX', score: 95, total: 100, date: '2024-12-10', grade: 'A' }
  ],
  attendance: {
    present: 82, absent: 8, late: 6, total: 96,
    monthly: [85, 88, 79, 92, 86, 88]
  },
  certificates: [
    { id: 1, course: 'HTML & CSS Mastery', date: '2024-10-15', instructor: 'Dr. Web' },
    { id: 2, course: 'Python Basics', date: '2024-11-02', instructor: 'Prof. Guido' }
  ]
};

// ── Render Course Cards ──────────────────────────────────────
function renderCourseList(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = STUDENT_DATA.courses.map(c => `
    <div class="enrolled-item" onclick="location.href='course-details.html?id=${c.id}'" style="cursor:pointer">
      <img src="${c.thumb}" class="enrolled-thumb" alt="${c.title}" onerror="this.src='https://via.placeholder.com/56x56/2563EB/ffffff?text=C'">
      <div class="enrolled-info">
        <div class="enrolled-title">${c.title}</div>
        <div class="enrolled-instructor">${c.instructor}</div>
        <div class="course-progress-wrap">
          <div class="course-progress-label">
            <span>Progress</span>
            <span class="course-progress-percent">${c.progress}%</span>
          </div>
          <div class="progress">
            <div class="progress-bar" data-width="${c.progress}" style="width:0%"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  initProgressBars();
}

// ── Render Assignments ────────────────────────────────────────
function renderAssignments(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = STUDENT_DATA.assignments.map(a => {
    const due = new Date(a.due);
    const now = new Date();
    const diff = due - now;
    const daysLeft = Math.ceil(diff / 86400000);
    let urgency = 'ok', urgencyText;

    if (a.status === 'submitted') {
      urgencyText = '✓ Submitted';
      urgency = 'ok';
    } else if (daysLeft < 0) {
      urgencyText = 'Overdue!';
      urgency = 'urgent';
    } else if (daysLeft <= 2) {
      urgencyText = `Due in ${daysLeft}d`;
      urgency = 'urgent';
    } else if (daysLeft <= 5) {
      urgencyText = `Due in ${daysLeft}d`;
      urgency = 'soon';
    } else {
      urgencyText = `Due ${Format.date(due)}`;
    }

    const colors = { pending: 'orange', submitted: 'green', overdue: 'red' };
    const icons  = { pending: 'fa-clock', submitted: 'fa-check-circle', overdue: 'fa-exclamation-circle' };
    const status = a.status === 'pending' && daysLeft < 0 ? 'overdue' : a.status;

    return `
      <div class="assignment-item">
        <div class="assignment-icon ${colors[status] || 'blue'}">
          <i class="fa ${icons[status] || 'fa-file'}"></i>
        </div>
        <div class="assignment-info">
          <div class="assignment-title">${a.title}</div>
          <div class="assignment-course">${a.course} · ${a.points} pts</div>
        </div>
        <div class="assignment-due ${urgency}">${urgencyText}</div>
      </div>
    `;
  }).join('');
}

// ── Render Quiz Results ───────────────────────────────────────
function renderQuizResults(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = STUDENT_DATA.quizResults.map(q => `
    <div class="report-row">
      <div class="report-subject">${q.title}<br><span class="text-xs text-muted">${q.course}</span></div>
      <div class="report-bar">
        <div class="progress">
          <div class="progress-bar ${q.score >= 90 ? 'success' : q.score >= 70 ? '' : 'warning'}"
               data-width="${q.score}" style="width:0%"></div>
        </div>
      </div>
      <div class="report-score">${q.score}%</div>
      <div class="report-grade">
        <span class="badge badge-${q.score >= 90 ? 'success' : q.score >= 70 ? 'primary' : 'warning'}">${q.grade}</span>
      </div>
    </div>
  `).join('');

  initProgressBars();
}

// ── Attendance Chart ──────────────────────────────────────────
function renderAttendanceChart() {
  const canvas = document.getElementById('attendanceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const att = STUDENT_DATA.attendance;
  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        data: [att.present, att.absent, att.late],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 16,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// ── Progress Chart ────────────────────────────────────────────
function renderProgressChart() {
  const canvas = document.getElementById('progressChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Attendance %',
        data: STUDENT_DATA.attendance.monthly,
// ── Init Student Dashboard ─────────────────────────────────────
function initStudentDashboard() {
  if (!document.getElementById('studentDashboard')) return;
  if (!Auth.requireAuth()) return;

  const user = Auth.getUser();
  if (user.role !== 'student') {
    window.location.href = `${user.role}.html`;
    return;
  }

  // Load the latest student record
  const users = Store.get('users', []);
  const student = users.find(u => u.email === user.email) || user;
  const progress = student.progress || { course: 72, attendance: 88, assignments: 66, quizzes: 80, internshipTasks: 50, project: 40, placement: 60 };

  // Render Expiry alert if status is Expired or Completed
  const alertContainer = document.getElementById('lifecycleAlertContainer');
  if (alertContainer) {
    if (student.status === 'Expired') {
      alertContainer.innerHTML = `
        <div class="card border" style="background: var(--danger-light); border-color: var(--danger); margin-bottom: 24px;">
          <div class="card-body" style="padding: 16px; display: flex; align-items: center; gap: 14px;">
            <div style="font-size: 1.5rem; color: var(--danger);"><i class="fa fa-exclamation-triangle"></i></div>
            <div>
              <h5 style="color: var(--danger); font-weight: 700; margin-bottom: 2px;">Course Access Locked</h5>
              <p class="text-xs" style="color: var(--text);">Your course access duration has expired (${student.expectedCompletionDate}). normal learning coursework is locked. Please contact your mentor or support to extend your duration.</p>
            </div>
          </div>
        </div>
      `;
    } else if (student.status === 'Completed') {
      const compDate = new Date(student.completionDate || new Date());
      const graceDays = (typeof Lifecycle !== 'undefined' ? Lifecycle.getSettings().gracePeriodDays : 30);
      const expiryDate = new Date(compDate);
      expiryDate.setDate(expiryDate.getDate() + graceDays);
      const remainingDays = typeof Lifecycle !== 'undefined' ? Lifecycle.calculateRemainingDays(expiryDate.toISOString().slice(0, 10)).remaining : 30;

      alertContainer.innerHTML = `
        <div class="card border" style="background: var(--success-light); border-color: var(--success); margin-bottom: 24px;">
          <div class="card-body" style="padding: 16px; display: flex; align-items: center; gap: 14px;">
            <div style="font-size: 1.5rem; color: var(--success);"><i class="fa fa-check-circle"></i></div>
            <div>
              <h5 style="color: var(--success); font-weight: 700; margin-bottom: 2px;">Course Completed! 🏆</h5>
              <p class="text-xs" style="color: var(--text);">Congratulations! You have completed all curriculum milestones. You have <strong>${remainingDays} days remaining</strong> in your grace access period to download your certificates, resumes, and portfolios. Your account will be archived on ${expiryDate.toISOString().slice(0, 10)}.</p>
            </div>
          </div>
        </div>
      `;
    } else {
      alertContainer.innerHTML = '';
    }
  }

  // Populate counters in top widgets row
  const totalEl = document.getElementById('totalCourses');
  const doneEl  = document.getElementById('completedCourses');
  const attEl   = document.getElementById('attendancePercent');
  const pendEl  = document.getElementById('pendingAssignments');

  if (totalEl) totalEl.textContent = student.courseName ? '1' : '0';
  if (doneEl)  doneEl.textContent  = student.certificates ? student.certificates.length : '0';
  if (attEl)   attEl.textContent   = (progress.attendance || 0) + '%';
  if (pendEl)  pendEl.textContent  = STUDENT_DATA.assignments.filter(a => a.status === 'pending').length;

  // Bind Class Attendance Dashboard details
  const attPct = progress.attendance || 0;
  const badgeEl = document.getElementById('dashAttendanceStatusBadge');
  if (badgeEl) {
    badgeEl.textContent = attPct >= 85 ? 'Excellent' : attPct >= 75 ? 'Satisfactory' : 'At Risk';
    badgeEl.className = `badge badge-${attPct >= 85 ? 'success' : attPct >= 75 ? 'primary' : 'danger'}`;
  }

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setVal('dashConductedClasses', progress.attendanceConducted ?? 24);
  setVal('dashAttendedClasses', progress.attendanceAttended ?? 21);
  setVal('dashMissedClasses', progress.attendanceAbsent ?? 3);
  setVal('dashLateClasses', progress.attendanceLate ?? 2);
  setVal('dashRemainingClasses', progress.attendanceRemaining ?? 6);

  // Render scheduled classes logs
  const todayClassesList = document.getElementById('dashTodayClassesList');
  if (todayClassesList) {
    const allCls = Store.get('classes') || [];
    const studentCourse = student.courseName || '';
    const courseClasses = allCls.filter(c => c.course === studentCourse || studentCourse === '').slice(0, 3);
    
    if (courseClasses.length === 0) {
      todayClassesList.innerHTML = '<div class="text-xs text-muted" style="padding:10px;text-align:center;">No sessions scheduled for your program.</div>';
    } else {
      todayClassesList.innerHTML = courseClasses.map(c => {
        let statusBadge = `<span class="badge badge-info">${c.status.toUpperCase()}</span>`;
        let joinBtn = '';
        if (c.status === 'live') {
          statusBadge = `<span class="badge badge-danger"><i class="fa fa-circle"></i> LIVE</span>`;
          joinBtn = `<button class="btn btn-primary btn-sm" onclick="location.href='live-classes.html'" style="padding:2px 8px; font-size:0.7rem;">Join Room</button>`;
        } else if (c.status === 'completed') {
          statusBadge = `<span class="badge badge-success">COMPLETED</span>`;
        }
        
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); padding:10px 14px; border-radius:8px;">
            <div>
              <div style="font-size:0.82rem; font-weight:700;">${c.title}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">Mentor: ${c.instructor} · Time: ${c.time}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${statusBadge}
              ${joinBtn}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Course Progress Breakdown Binding
  setVal('courseModulesMetric', `${progress.courseCompletedModules ?? 7} / ${progress.courseTotalModules ?? 10} Modules`);
  setVal('courseHoursMetric', `${progress.courseLearningHours ?? 48} Hours`);
  const cBar = document.getElementById('courseProgressFill');
  if (cBar) cBar.style.width = (progress.course || 0) + '%';

  // Internship Progress Details Binding
  setVal('dashInternshipTitle', student.internshipName || 'Software Engineer Intern');
  setVal('dashInternshipTasksCompleted', `${progress.internshipTasksCompleted ?? 5} of ${progress.internshipTasksTotal ?? 10} Tasks complete`);
  setVal('dashInternshipRemarks', progress.internshipMentorRemarks || 'Mentor feedback: consistent coding delivery.');
  const intFill = document.getElementById('dashInternshipFill');
  if (intFill) {
    intFill.style.width = (progress.internshipTasks || 0) + '%';
    intFill.className = `progress-bar ${(progress.internshipTasks || 0) >= 75 ? 'success' : ''}`;
  }

  // Project Progress Breakdown Binding
  setVal('dashProjectTitle', student.projectName || 'LMS Cloud Dashboard');
  setVal('dashProjectMilestonesCompleted', `${progress.projectMilestonesCompleted ?? 2} of ${progress.projectMilestonesTotal ?? 5} Completed`);
  setVal('dashProjectDocStatus', progress.projectDocStatus || 'In Progress');
  setVal('dashProjectCodeStatus', progress.projectCodeStatus || 'In Progress');
  setVal('dashProjectTestingStatus', progress.projectTestingStatus || 'Pending');
  setVal('dashProjectReviewStatus', progress.projectFacultyReview || 'Pending');
  const projFill = document.getElementById('dashProjectFill');
  if (projFill) {
    projFill.style.width = (progress.project || 0) + '%';
    projFill.className = `progress-bar ${(progress.project || 0) >= 75 ? 'success' : ''}`;
  }

  // Daily activity log counters
  const activities = student.dailyActivities || [];
  let totalHours = 0;
  let totalVideos = 0;
  let totalNotes = 0;
  activities.forEach(a => {
    totalHours += parseFloat(a.learningTimeHours || 0);
    totalVideos += parseInt(a.videosWatched || 0);
    totalNotes += parseInt(a.notesUploaded || 0);
  });
  setVal('dashHoursWatched', totalHours.toFixed(1) + 'h');
  setVal('dashVideosCount', totalVideos);
  setVal('dashSubmittedNotes', totalNotes);
  setVal('dashAccumulatedTime', `Accumulated study time: ${totalHours.toFixed(1)} hours`);

  // Render course banner details
  const trTitle = document.getElementById('dashTrainingTitle');
  const trInst = document.getElementById('dashTrainingInstructor');
  const trBar = document.getElementById('dashTrainingProgressBar');
  const trPct = document.getElementById('dashTrainingProgressPct');

  if (trTitle) trTitle.textContent = student.courseName || 'N/A';
  if (trInst)  trInst.textContent = 'Instructor/Mentor: ' + (student.facultyMentor || 'Dr. Sarah Chen');
  if (trBar)   trBar.style.width = (progress.course || 0) + '%';
  if (trPct)   trPct.textContent = (progress.course || 0) + '%';

  // Render course list
  const container = document.getElementById('courseList');
  if (container) {
    container.innerHTML = `
      <div class="enrolled-item" onclick="location.href='course.html'" style="cursor:pointer">
        <div class="avatar-placeholder avatar-sm" style="border-radius:var(--radius);background:var(--gradient-primary);color:#fff;width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">
          💻
        </div>
        <div class="enrolled-info" style="flex: 1; margin-left: 12px;">
          <div class="enrolled-title" style="font-weight:600;">${student.courseName || 'Enrolled Course'}</div>
          <div class="enrolled-instructor" style="font-size:0.78rem;color:var(--text-muted);">Mentor: ${student.facultyMentor || 'Faculty'}</div>
          <div class="course-progress-wrap" style="margin-top: 6px;">
            <div class="course-progress-label" style="display:flex;justify-content:space-between;font-size:0.75rem;">
              <span>Progress</span>
              <span class="course-progress-percent">${progress.course}%</span>
            </div>
            <div class="progress" style="height:6px;background:var(--border);border-radius:3px;margin-top:4px;overflow:hidden;">
              <div class="progress-bar" style="width: ${progress.course}%;height:100%;background:var(--primary);transition:width 0.3s;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render notifications & static listings
  renderDynamicNotifications(student);
  renderAssignments('assignmentList');
  renderQuizResults('quizResults');
  renderAttendanceChart();
  renderProgressChart();
}

function renderDynamicNotifications(student) {
  const notifMenu = document.getElementById('notifDropdown');
  if (!notifMenu) return;

  const list = student.notifications || [];
  const unreadCount = list.filter(n => !n.read).length;
  
  // Update header badges
  document.querySelectorAll('.inner-navbar-right .notif-badge, .inner-navbar-right [title="Notifications"] .notif-badge').forEach(b => {
    b.textContent = unreadCount;
    b.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  });

  let itemsHtml = '';
  if (list.length === 0) {
    itemsHtml = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.82rem;">No notifications yet.</div>';
  } else {
    itemsHtml = list.map(n => {
      let iconClass = 'fa-info-circle';
      let bgStyle = 'background:var(--primary-light);color:var(--primary)';
      if (n.type === 'success') {
        iconClass = 'fa-check';
        bgStyle = 'background:var(--success-light);color:var(--success)';
      } else if (n.type === 'warning') {
        iconClass = 'fa-exclamation-triangle';
        bgStyle = 'background:var(--warning-light);color:var(--warning)';
      } else if (n.type === 'error') {
        iconClass = 'fa-times';
        bgStyle = 'background:var(--danger-light);color:var(--danger)';
      }

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead('${n.id}')" style="cursor:pointer;padding:12px 16px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:flex-start;">
          <div class="notif-avatar" style="${bgStyle};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa ${iconClass}"></i></div>
          <div class="notif-content" style="flex:1;">
            <div class="notif-text" style="font-weight:600;font-size:0.82rem;">${n.title}</div>
            <div class="notif-msg" style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">${n.message}</div>
            <div class="notif-time" style="font-size:0.7rem;color:var(--text-light);margin-top:4px;">${Format.relative(n.date)}</div>
          </div>
          ${n.read ? '' : '<div class="notif-unread-dot" style="width:8px;height:8px;background:var(--primary);border-radius:50%;align-self:center;"></div>'}
        </div>
      `;
    }).join('');
  }

  notifMenu.innerHTML = `
    <div class="notif-dropdown-header" style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
      <span class="notif-dropdown-title" style="font-weight:700;">Notifications (${unreadCount})</span>
      <span class="notif-mark-all" onclick="markAllNotificationsRead()" style="cursor:pointer;font-size:0.75rem;color:var(--primary);font-weight:600;">Mark all read</span>
    </div>
    <div style="max-height: 280px; overflow-y: auto;">
      ${itemsHtml}
    </div>
  `;
}

function markNotificationRead(id) {
  const user = Auth.getUser();
  const users = Store.get('users', []);
  const s = users.find(u => u.email === user.email);
  if (s && s.notifications) {
    const n = s.notifications.find(not => not.id === id);
    if (n) n.read = true;
    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.syncStudent(s);
    }
    initStudentDashboard(); // re-render
  }
}

function markAllNotificationsRead() {
  const user = Auth.getUser();
  const users = Store.get('users', []);
  const s = users.find(u => u.email === user.email);
  if (s && s.notifications) {
    s.notifications.forEach(n => n.read = true);
    if (typeof Lifecycle !== 'undefined') {
      Lifecycle.syncStudent(s);
    }
    initStudentDashboard(); // re-render
  }
}

// ── Attendance Chart ──────────────────────────────────────────
function renderAttendanceChart() {
  const canvas = document.getElementById('attendanceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const user = Auth.getUser();
  const users = Store.get('users', []);
  const student = users.find(u => u.email === user.email) || user;
  
  const present = student.progress.attendanceAttended ?? 21;
  const late = student.progress.attendanceLate ?? 2;
  const absent = student.progress.attendanceAbsent ?? 3;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        data: [present, absent, late],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            padding: 16,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

// ── Progress Chart ────────────────────────────────────────────
function renderProgressChart() {
  const canvas = document.getElementById('progressChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const user = Auth.getUser();
  const users = Store.get('users', []);
  const student = users.find(u => u.email === user.email) || user;
  const activities = student.dailyActivities || [];

  const labels = activities.map(a => a.date.substring(5)); // e.g. "07-08"
  const hours = activities.map(a => a.learningTimeHours || 0);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['07-04', '07-05', '07-06', '07-07', '07-08'],
      datasets: [{
        label: 'Study Hours',
        data: hours.length ? hours : [4.5, 6.0, 8.5, 9.0, 7.5],
        backgroundColor: 'rgba(37,99,235,0.7)',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
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

document.addEventListener('DOMContentLoaded', initStudentDashboard);
