/* ============================================================
   Acadex LMS — lifecycle.js (Lifecycle & Certificate Controller)
   ============================================================ */

const Lifecycle = {
  /** Get system settings from localStorage or defaults */
  getSettings() {
    const defaultSettings = {
      gracePeriodDays: 30,
      allowFacultyArchive: false
    };
    try {
      const stored = localStorage.getItem('Acadex_system_settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  },

  /** Save system settings */
  saveSettings(settings) {
    localStorage.setItem('Acadex_system_settings', JSON.stringify(settings));
  },

  /** Helper to calculate Expected Completion Date */
  calculateExpectedCompletionDate(enrollmentDateStr, durationStr, customDays = 30) {
    if (!enrollmentDateStr) return '';
    const date = new Date(enrollmentDateStr);
    let daysToAdd = 30;

    switch (durationStr) {
      case '1 Month':  daysToAdd = 30; break;
      case '2 Months': daysToAdd = 60; break;
      case '3 Months': daysToAdd = 90; break;
      case '6 Months': daysToAdd = 180; break;
      case 'Custom':   daysToAdd = parseInt(customDays) || 30; break;
      default:         daysToAdd = parseInt(durationStr) || 30; break;
    }

    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().slice(0, 10);
  },

  /** Calculate remaining days and percent time elapsed */
  calculateRemainingDays(expectedDateStr) {
    if (!expectedDateStr) return { remaining: 0, expired: true };
    const expected = new Date(expectedDateStr);
    expected.setHours(23, 59, 59, 999); // end of that day
    const now = new Date();
    const diffTime = expected.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      remaining: Math.max(0, diffDays),
      expired: diffDays <= 0
    };
  },

  /** Check if a student meets all completion criteria */
  checkCompletionRules(student) {
    if (!student || student.role !== 'student') return false;

    // Load or set default progress metrics if not present
    const p = student.progress || {
      course: 0,
      attendance: 0,
      assignments: 0,
      quizzes: 0,
      internshipTasks: 0,
      project: 0,
      placement: 0
    };

    const hasCompletedCourse = (p.course >= 100);
    const hasRequiredAttendance = (p.attendance >= 75); // Minimum attendance is 75%
    const hasCompletedAssignments = (p.assignments >= 100);
    const hasCompletedQuizzes = (p.quizzes >= 100);
    const hasCompletedInternship = (p.internshipTasks >= 100);
    const hasCompletedProject = (p.project >= 100);
    const hasFacultyApproval = !!student.facultyApprovedForCertificate;

    return (
      hasCompletedCourse &&
      hasRequiredAttendance &&
      hasCompletedAssignments &&
      hasCompletedQuizzes &&
      hasCompletedInternship &&
      hasCompletedProject &&
      hasFacultyApproval
    );
  },

  /** Auto generate unique verification details and certificates list */
  generateCertificates(student) {
    if (!student) return [];
    
    const certTypes = [
      { type: 'Course Completion Certificate', prefix: 'CRSE' },
      { type: 'Internship Completion Certificate', prefix: 'INTN' },
      { type: 'Project Completion Certificate', prefix: 'PROJ' },
      { type: 'Training Completion Certificate', prefix: 'TRNG' },
      { type: 'Placement Training Certificate', prefix: 'PLAC' }
    ];

    const completionDate = student.completionDate || new Date().toISOString().slice(0, 10);
    const facultyName = student.facultyMentor || 'Dr. Sarah Chen';

    return certTypes.map((c, index) => {
      const rand = Math.floor(10000 + Math.random() * 90000);
      const year = new Date(completionDate).getFullYear();
      const certId = `ACX-${c.prefix}-${year}-${rand}`;
      
      let titleName = '';
      let durationStr = '';
      if (c.prefix === 'CRSE') {
        titleName = student.courseName || 'Full Stack Software Engineering';
        durationStr = student.courseDuration || '6 Months';
      } else if (c.prefix === 'INTN') {
        titleName = student.internshipName || 'Software Developer Internship';
        durationStr = student.internshipDuration || '2 Months';
      } else if (c.prefix === 'PROJ') {
        titleName = student.projectName || 'LMS Cloud Dashboard';
        durationStr = student.projectDuration || '2 Months';
      } else if (c.prefix === 'TRNG') {
        titleName = 'Full Stack Training Batch ' + (student.trainingBatch || '2026-A');
        durationStr = student.courseDuration || '6 Months';
      } else {
        titleName = 'Placement Preparation & Corporate Readiness';
        durationStr = '1 Month';
      }

      return {
        id: certId,
        type: c.type,
        studentName: student.name,
        studentId: student.studentId || ('STU-' + student.id),
        title: titleName,
        facultyName: facultyName,
        duration: durationStr,
        completionDate: completionDate,
        verificationCode: `${c.prefix}-${rand}`,
        qrCodeValue: `https://verify.acadex.edu/certificate/${certId}`
      };
    });
  },

  /** Dispatch notification to a user */
  addNotification(user, title, message, type = 'info') {
    if (!user) return;
    if (!user.notifications) user.notifications = [];
    
    const notif = {
      id: 'notif-' + Date.now() + Math.floor(Math.random() * 100),
      title,
      message,
      type,
      date: new Date().toISOString(),
      read: false
    };

    user.notifications.unshift(notif);

    // If this is the currently logged-in user, push a toast notification
    const currentUser = JSON.parse(localStorage.getItem('Acadex_user') || '{}');
    if (currentUser && currentUser.email === user.email) {
      if (typeof Toast !== 'undefined') {
        Toast[type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'](title, message);
      }
    }
  },

  /** Log activity of student */
  logActivity(user, actionText) {
    if (!user) return;
    if (!user.activityLogs) user.activityLogs = [];
    user.activityLogs.unshift({
      id: 'log-' + Date.now() + Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      action: actionText
    });
  },

  /** Update student status automatically based on dates and rules */
  evaluateStudentStatus(student, usersList = null) {
    if (!student || student.role !== 'student') return student;

    const today = new Date();
    const settings = this.getSettings();
    let statusChanged = false;
    let oldStatus = student.status;

    // Seed default mock classes into local storage if not exist
    if (!localStorage.getItem('Acadex_classes')) {
      const mockClasses = [
        { id: 'c-101', title: 'HTML5 & CSS3 Advanced Layouts', course: 'Complete Web Development Bootcamp', faculty: 'Dr. Sarah Chen', date: '2026-07-06', time: '09:00 AM', duration: 120, status: 'completed' },
        { id: 'c-102', title: 'JavaScript Promises & Async/Await', course: 'Complete Web Development Bootcamp', faculty: 'Dr. Sarah Chen', date: '2026-07-07', time: '11:00 AM', duration: 120, status: 'completed' },
        { id: 'c-103', title: 'React Hooks & State Management', course: 'Complete Web Development Bootcamp', faculty: 'Dr. Sarah Chen', date: today.toISOString().slice(0, 10), time: '09:00 AM', duration: 120, status: 'completed' },
        { id: 'c-104', title: 'Node.js Express REST API Development', course: 'Complete Web Development Bootcamp', faculty: 'Dr. Sarah Chen', date: today.toISOString().slice(0, 10), time: '02:00 PM', duration: 120, status: 'live', link: 'https://meet.google.com/abc-defg-hij' },
        { id: 'c-105', title: 'Database Normalization & SQL Queries', course: 'Complete Web Development Bootcamp', faculty: 'Dr. Sarah Chen', date: new Date(today.getTime() + 86400000).toISOString().slice(0, 10), time: '10:00 AM', duration: 120, status: 'upcoming' },
        
        { id: 'c-201', title: 'Supervised Learning & Linear Regression', course: 'Machine Learning A-Z', faculty: 'Dr. Sarah Chen', date: '2026-07-07', time: '10:00 AM', duration: 120, status: 'completed' },
        { id: 'c-202', title: 'Neural Networks Architecture from Scratch', course: 'Machine Learning A-Z', faculty: 'Dr. Sarah Chen', date: today.toISOString().slice(0, 10), time: '03:00 PM', duration: 120, status: 'live', link: 'https://meet.google.com/xyz-qprs-tuv' },
        { id: 'c-203', title: 'Decision Trees & Random Forests', course: 'Machine Learning A-Z', faculty: 'Dr. Sarah Chen', date: new Date(today.getTime() + 86400000).toISOString().slice(0, 10), time: '11:00 AM', duration: 120, status: 'upcoming' },
        
        { id: 'c-301', title: 'Color Theory & Typography in Mobile Apps', course: 'UI/UX Design Fundamentals', faculty: 'Dr. Sarah Chen', date: '2026-07-07', time: '11:00 AM', duration: 120, status: 'completed' },
        { id: 'c-302', title: 'Wireframing & Prototyping in Figma', course: 'UI/UX Design Fundamentals', faculty: 'Dr. Sarah Chen', date: today.toISOString().slice(0, 10), time: '04:00 PM', duration: 120, status: 'live', link: 'https://meet.google.com/uiux-live-meet' }
      ];
      localStorage.setItem('Acadex_classes', JSON.stringify(mockClasses));
    }

    // Ensure progress exists
    if (!student.progress || typeof student.progress.courseTotalModules === 'undefined') {
      const prevProg = student.progress || {};
      student.progress = {
        course: prevProg.course || 72,
        courseTotalModules: 10,
        courseCompletedModules: Math.round(((prevProg.course || 72) / 100) * 10),
        courseRemainingModules: 10 - Math.round(((prevProg.course || 72) / 100) * 10),
        courseLearningHours: 48,
        
        attendance: prevProg.attendance || 85,
        attendanceTotal: 30,
        attendanceAttended: Math.round(((prevProg.attendance || 85) / 100) * 24),
        attendanceAbsent: 24 - Math.round(((prevProg.attendance || 85) / 100) * 24),
        attendanceLate: 2,
        attendanceConducted: 24,
        attendanceRemaining: 6,
        
        assignments: prevProg.assignments || 66,
        assignmentsTotal: 6,
        assignmentsCompleted: Math.round(((prevProg.assignments || 66) / 100) * 6),
        assignmentsPending: 6 - Math.round(((prevProg.assignments || 66) / 100) * 6),
        
        quizzes: prevProg.quizzes || 80,
        quizzesTotal: 5,
        quizzesCompleted: Math.round(((prevProg.quizzes || 80) / 100) * 5),
        
        internshipTasks: prevProg.internshipTasks || 50,
        internshipTasksTotal: 10,
        internshipTasksCompleted: Math.round(((prevProg.internshipTasks || 50) / 100) * 10),
        internshipMentorRemarks: 'Consistently completes tasks. Coding standards are high.',
        
        project: prevProg.project || 40,
        projectMilestonesTotal: 5,
        projectMilestonesCompleted: Math.round(((prevProg.project || 40) / 100) * 5),
        projectDocStatus: (prevProg.project || 40) >= 60 ? 'Submitted' : 'In Progress',
        projectCodeStatus: (prevProg.project || 40) >= 80 ? 'Submitted' : 'In Progress',
        projectTestingStatus: (prevProg.project || 40) >= 100 ? 'Completed' : 'Pending',
        projectFacultyReview: (prevProg.project || 40) >= 100 ? 'Reviewed' : 'Pending',
        
        placement: prevProg.placement || 60,
        placementReadiness: (prevProg.placement || 60) >= 75 ? 'Ready' : 'Not Ready'
      };
    }

    // Seed mock attendance logs if not exist
    if (!student.attendanceLogs) {
      student.attendanceLogs = [
        { id: 'att-1', classId: 'c-101', className: 'HTML5 & CSS3 Advanced Layouts', course: student.courseName || 'Complete Web Development Bootcamp', faculty: student.facultyMentor || 'Dr. Sarah Chen', date: '2026-07-06', joinTime: '09:00 AM', exitTime: '11:00 AM', durationMinutes: 120, status: 'Present', device: 'Chrome / Windows 11', ip: '192.168.1.101' },
        { id: 'att-2', classId: 'c-102', className: 'JavaScript Promises & Async/Await', course: student.courseName || 'Complete Web Development Bootcamp', faculty: student.facultyMentor || 'Dr. Sarah Chen', date: '2026-07-07', joinTime: '11:05 AM', exitTime: '12:55 PM', durationMinutes: 110, status: 'Present', device: 'Chrome / Windows 11', ip: '192.168.1.101' },
        { id: 'att-3', classId: 'c-103', className: 'React Hooks & State Management', course: student.courseName || 'Complete Web Development Bootcamp', faculty: student.facultyMentor || 'Dr. Sarah Chen', date: today.toISOString().slice(0, 10), joinTime: '09:15 AM', exitTime: '10:50 AM', durationMinutes: 95, status: 'Late', device: 'Chrome / Windows 11', ip: '192.168.1.101' }
      ];
    }

    // Seed mock daily activity logs if not exist
    if (!student.dailyActivities) {
      student.dailyActivities = [
        { date: '2026-07-06', loginTime: '08:55 AM', logoutTime: '05:30 PM', classesAttended: 1, videosWatched: 4, notesUploaded: 1, assignmentsSubmitted: 1, quizAttempted: 1, learningTimeHours: 8.5 },
        { date: '2026-07-07', loginTime: '09:00 AM', logoutTime: '06:00 PM', classesAttended: 1, videosWatched: 3, notesUploaded: 1, assignmentsSubmitted: 0, quizAttempted: 0, learningTimeHours: 9.0 },
        { date: today.toISOString().slice(0, 10), loginTime: '08:45 AM', logoutTime: '04:15 PM', classesAttended: 1, videosWatched: 2, notesUploaded: 0, assignmentsSubmitted: 1, quizAttempted: 1, learningTimeHours: 7.5 }
      ];
    }

    // Ensure notification arrays exist
    if (!student.notifications) student.notifications = [];
    if (!student.activityLogs) student.activityLogs = [];

    // Trigger Academic & Attendance Performance Alerts
    if (student.progress.attendance < 75) {
      if (!student.notifications.some(n => n.title.includes('Attendance Warning'))) {
        this.addNotification(student, 'Attendance Warning ⚠️', 'Your attendance has fallen below the mandatory 75% limit. Access to certificate generation is suspended.', 'error');
        this.logActivity(student, 'Received warning alert: attendance rate below 75% limit.');
      }
    }
    if (student.progress.assignments < 50) {
      if (!student.notifications.some(n => n.title.includes('Assignments Delayed'))) {
        this.addNotification(student, 'Assignments Delayed ⏳', 'Your assignment completion rate is behind schedule. Please submit pending tasks.', 'warning');
        this.logActivity(student, 'Received warning alert: assignment completion is behind schedule.');
      }
    }
    if (student.progress.project < 20) {
      if (!student.notifications.some(n => n.title.includes('Project Delay Alert'))) {
        this.addNotification(student, 'Project Delay Alert 📁', 'Your final project progress is under 20%. Please complete milestones to avoid suspension.', 'warning');
        this.logActivity(student, 'Received warning alert: final project progress delay.');
      }
    }
    if (student.progress.internshipTasks < 30) {
      if (!student.notifications.some(n => n.title.includes('Internship Milestone Warning'))) {
        this.addNotification(student, 'Internship Milestone Warning 💼', 'Your internship tasks completion rate is currently under 30%. Please submit reports.', 'warning');
        this.logActivity(student, 'Received warning alert: internship tasks completion warning.');
      }
    }

    // Check completion rules
    const meetsCompletion = this.checkCompletionRules(student);

    if (meetsCompletion) {
      if (student.status !== 'Completed' && student.status !== 'Archived') {
        student.status = 'Completed';
        student.completionDate = student.completionDate || today.toISOString().slice(0, 10);
        statusChanged = true;
        
        // Generate certificates
        student.certificates = this.generateCertificates(student);
        this.addNotification(student, 'Program Completed! 🏆', 'Congratulations! You have completed all course requirements and earned your certificates.', 'success');
        this.logActivity(student, 'Automatically completed all program requirements and generated certificates.');
      }
    }

    // Handle Grace Period transitions for Completed students
    if (student.status === 'Completed') {
      const compDate = new Date(student.completionDate || today.toISOString().slice(0, 10));
      const diffTime = today.getTime() - compDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const gracePeriod = parseInt(settings.gracePeriodDays) || 30;

      if (diffDays > gracePeriod) {
        student.status = 'Archived';
        statusChanged = true;
        this.addNotification(student, 'Account Archived 📦', 'Your post-completion grace period has expired. Account archived.', 'warning');
        this.logActivity(student, `Account automatically archived after grace period of ${gracePeriod} days expired.`);
      } else {
        // Send a warning notification when grace period is expiring in 5 days
        const daysLeft = gracePeriod - diffDays;
        if (daysLeft <= 5 && daysLeft > 0) {
          if (!student.notifications.some(n => n.title.includes('Access Expiring Soon'))) {
            this.addNotification(student, 'Access Expiring Soon ⚠️', `Your grace access period ends in ${daysLeft} days, after which your account will be archived.`, 'warning');
          }
        }
      }
    }

    // Handle Expiry checks for non-completed students
    if (student.status !== 'Completed' && student.status !== 'Archived') {
      const { remaining, expired } = this.calculateRemainingDays(student.expectedCompletionDate);
      if (expired) {
        if (student.status !== 'Expired') {
          student.status = 'Expired';
          statusChanged = true;
          this.addNotification(student, 'Course Access Expired ⏳', 'Your expected course duration has elapsed. Access to study materials is locked. Please contact support.', 'error');
          this.logActivity(student, 'Course access automatically expired due to deadline lapse.');
        }
      } else {
        student.status = 'In Progress';
        if (oldStatus === 'Expired') {
          statusChanged = true;
          this.logActivity(student, 'Course status restored to In Progress.');
        }

        // Notify 5 days before deadline
        if (remaining <= 5 && remaining > 0) {
          if (!student.notifications.some(n => n.title.includes('Course Deadline Approaching'))) {
            this.addNotification(student, 'Course Deadline Approaching ⏳', `Your expected course completion date is in ${remaining} days.`, 'warning');
          }
        }
      }
    }

    // Save changes back to localStorage list if provided
    if (statusChanged && usersList) {
      const idx = usersList.findIndex(u => u.email === student.email);
      if (idx >= 0) {
        usersList[idx] = student;
        localStorage.setItem('Acadex_users', JSON.stringify(usersList));
      }
    }

    return student;
  },

  /** Synchronize current student state to local storage */
  syncStudent(student) {
    if (!student) return;
    const users = JSON.parse(localStorage.getItem('Acadex_users') || '[]');
    const idx = users.findIndex(u => u.email === student.email);
    if (idx >= 0) {
      users[idx] = student;
      localStorage.setItem('Acadex_users', JSON.stringify(users));
      
      // Update session if it's the current user
      const curr = JSON.parse(localStorage.getItem('Acadex_user') || '{}');
      if (curr && curr.email === student.email) {
        localStorage.setItem('Acadex_user', JSON.stringify(student));
      }
    }
  }
};
