/* ============================================================
   Acadex LMS — training.js
   All data layer, mock cloud sync, and T&P module business logic
   ============================================================ */

// ── Default Mock Database ────────────────────────────────────
const DEFAULT_TP_DATA = {
  programs: [
    {
      id: 'tp-1',
      title: 'Full Stack Java & Cloud Placement Program',
      instructor: 'Dr. Alan Turing',
      duration: '120 Hours / 12 Weeks',
      totalHours: 120,
      completedHours: 90,
      weeklyHours: 10,
      dailyHours: 1.5,
      startDate: '2026-05-01',
      endDate: '2026-07-31',
      schedule: 'Mon, Wed, Fri - 09:00 AM to 11:00 AM',
      batch: '2026-A',
      section: 'Sec-3',
      status: 'In Progress',
      objectives: ['Master Java Core & Advanced features', 'Learn Spring Boot microservices architecture', 'Deploy scalable apps to AWS & Google Cloud'],
      outcomes: ['Design production-ready REST APIs', 'Manage databases using PostgreSQL & Hibernate', 'Deploy containerized applications with Docker'],
      streak: 12,
      modulesCount: 8,
      modulesCompleted: 6,
      lessonsCount: 40,
      lessonsCompleted: 30,
      videosCount: 25,
      videosCompleted: 18,
      assignmentsCount: 6,
      assignmentsCompleted: 4,
      quizzesCount: 5,
      quizzesCompleted: 4
    },
    {
      id: 'tp-2',
      title: 'Data Science & Generative AI Accelerator',
      instructor: 'Dr. Fei-Fei Li',
      duration: '80 Hours / 8 Weeks',
      totalHours: 80,
      completedHours: 16,
      weeklyHours: 10,
      dailyHours: 2.0,
      startDate: '2026-06-15',
      endDate: '2026-08-15',
      schedule: 'Tue, Thu - 02:00 PM to 05:00 PM',
      batch: '2026-B',
      section: 'Sec-1',
      status: 'In Progress',
      objectives: ['Learn Python for Data Analytics & Pandas', 'Implement Supervised & Unsupervised ML Models', 'Build LLM RAG pipelines with LangChain'],
      outcomes: ['Analyze large datasets and visualize trends', 'Train, validate, and deploy model pipelines', 'Integrate Gemini API into web applications'],
      streak: 3,
      modulesCount: 6,
      modulesCompleted: 1,
      lessonsCount: 30,
      lessonsCompleted: 6,
      videosCount: 20,
      videosCompleted: 4,
      assignmentsCount: 4,
      assignmentsCompleted: 1,
      quizzesCount: 4,
      quizzesCompleted: 1
    },
    {
      id: 'tp-3',
      title: 'System Design & DSA Bootcamp',
      instructor: 'Prof. Donald Knuth',
      duration: '60 Hours / 6 Weeks',
      totalHours: 60,
      completedHours: 60,
      weeklyHours: 10,
      dailyHours: 1.5,
      startDate: '2026-03-01',
      endDate: '2026-04-15',
      schedule: 'Sat, Sun - 10:00 AM to 01:00 PM',
      batch: '2026-Alpha',
      section: 'Sec-2',
      status: 'Completed',
      objectives: ['Master Big O and asymptotic notations', 'Solve Complex LeetCode algorithms', 'Understand high-level system architectural concepts'],
      outcomes: ['Optimize code for time & space efficiency', 'Design system architectures for millions of users', 'Solve Medium/Hard algorithmic puzzles'],
      streak: 0,
      modulesCount: 5,
      modulesCompleted: 5,
      lessonsCount: 20,
      lessonsCompleted: 20,
      videosCount: 15,
      videosCompleted: 15,
      assignmentsCount: 5,
      assignmentsCompleted: 5,
      quizzesCount: 3,
      quizzesCompleted: 3
    }
  ],
  placementCategories: [
    { id: 'cat-1', name: 'Aptitude Training', progress: 85 },
    { id: 'cat-2', name: 'Technical Training', progress: 78 },
    { id: 'cat-3', name: 'Coding Practice', progress: 65 },
    { id: 'cat-4', name: 'Verbal Ability', progress: 90 },
    { id: 'cat-5', name: 'Logical Reasoning', progress: 80 },
    { id: 'cat-6', name: 'Communication Skills', progress: 88 },
    { id: 'cat-7', name: 'Soft Skills', progress: 92 },
    { id: 'cat-8', name: 'Group Discussion Prep', progress: 70 },
    { id: 'cat-9', name: 'HR Interview Prep', progress: 85 },
    { id: 'cat-10', name: 'Mock Interviews', progress: 75 }
  ],
  notes: [
    { id: 'note-1', studentName: 'John Doe', studentId: 'stu-101', fileName: 'Java_Spring_Notes.pdf', fileType: 'pdf', fileSize: '4.2 MB', uploadDate: '2026-07-01T10:30:00Z', status: 'Approved', comments: 'Excellent and well-structured concepts.', course: 'Full Stack Java & Cloud Placement Program' },
    { id: 'note-2', studentName: 'John Doe', studentId: 'stu-101', fileName: 'System_Design_Microservices.docx', fileType: 'doc', fileSize: '2.1 MB', uploadDate: '2026-07-05T14:20:00Z', status: 'Pending', comments: '', course: 'System Design & DSA Bootcamp' },
    { id: 'note-3', studentName: 'Jane Smith', studentId: 'stu-102', fileName: 'Python_Pandas_Overview.pptx', fileType: 'ppt', fileSize: '8.5 MB', uploadDate: '2026-07-07T09:15:00Z', status: 'Pending', comments: '', course: 'Data Science & Generative AI Accelerator' }
  ],
  classes: [
    {
      id: 'class-1',
      title: 'Spring Security OAuth2 Integration',
      instructor: 'Dr. Alan Turing',
      course: 'Full Stack Java & Cloud Placement Program',
      date: '2026-07-08',
      time: '09:00 AM',
      status: 'recorded',
      recordingUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      duration: 360, // 6 mins test video
      playbackPosition: 120, // resume position
      completed: false,
      bookmarks: [45, 180],
      materials: ['Spring_Security_Guide.pdf', 'OAuth2_Architecture_Diagram.png'],
      attendance: [
        { studentId: 'stu-101', studentName: 'John Doe', date: '2026-07-08', loginTime: '08:58 AM', logoutTime: '10:02 AM', totalDuration: '64 mins', status: 'Present', percent: 100 }
      ]
    },
    {
      id: 'class-2',
      title: 'LangChain Agents & Custom Tools',
      instructor: 'Dr. Fei-Fei Li',
      course: 'Data Science & Generative AI Accelerator',
      date: '2026-07-08',
      time: '02:00 PM',
      status: 'live',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      materials: ['LangChain_Intro_Notebook.ipynb'],
      attendance: []
    },
    {
      id: 'class-3',
      title: 'Dynamic Programming Paradigms',
      instructor: 'Prof. Donald Knuth',
      course: 'System Design & DSA Bootcamp',
      date: '2026-07-09',
      time: '10:00 AM',
      status: 'upcoming',
      meetingLink: 'https://meet.google.com/xyz-pqrs-uvw',
      materials: []
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Implement JWT Auth Service',
      course: 'Full Stack Java & Cloud Placement Program',
      due: '2026-07-12T23:59:59Z',
      status: 'Pending',
      points: 100,
      maxPoints: 100,
      feedback: '',
      criteria: '1. Secure endpoints\n2. Token expiry handling\n3. Correct user roles validation',
      attachments: ['jwt-auth-boilerplate.zip'],
      submissionFile: null,
      submissionDate: null
    },
    {
      id: 'task-2',
      title: 'RAG Pipeline with FAISS Database',
      course: 'Data Science & Generative AI Accelerator',
      due: '2026-07-15T23:59:59Z',
      status: 'Pending',
      points: 100,
      maxPoints: 100,
      feedback: '',
      criteria: '1. Embed PDFs\n2. Efficient similarity search\n3. Source citation support',
      attachments: [],
      submissionFile: null,
      submissionDate: null
    },
    {
      id: 'task-3',
      title: 'Red-Black Trees Implementation',
      course: 'System Design & DSA Bootcamp',
      due: '2026-07-05T23:59:59Z',
      status: 'Reviewed',
      points: 92,
      maxPoints: 100,
      feedback: 'Excellent work. Balances correctly on insertions, but check deleted node balancing edge case.',
      criteria: '1. Insertion complexity O(log N)\n2. Deletion complexity O(log N)\n3. Correct tree visualization properties',
      attachments: [],
      submissionFile: 'red_black_tree_sol.py',
      submissionDate: '2026-07-05T18:00:00Z'
    }
  ],
  resume: {
    completion: 85,
    selectedTemplate: 'ats-classic',
    personalDetails: {
      name: 'John Doe',
      email: 'john.doe@acadex.edu',
      phone: '+1 (555) 019-2834',
      location: 'San Francisco, CA',
      website: 'johndoe.dev'
    },
    education: [
      { school: 'Acadex University', degree: 'Bachelor of Science in Computer Science', dates: '2022 - 2026', gpa: '3.8/4.0' }
    ],
    skills: ['Java', 'Python', 'Spring Boot', 'SQL', 'Git', 'Data Structures & Algorithms', 'AWS'],
    projects: [
      { title: 'LMS Cloud Dashboard', tech: 'Spring Boot, Vanilla JS, PostgreSQL', desc: 'Designed a cloud-synced LMS containing real-time course completions, interactive grading dashboards and student attendance analytics.' }
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: 'June 2025' }
    ],
    internships: [
      { company: 'TechCorp Solutions', role: 'Software Engineering Intern', dates: 'June 2025 - Aug 2025', desc: 'Optimized PostgreSQL queries, reduced API load times by 15%, and designed secure OAuth2 auth middleware.' }
    ],
    achievements: [
      { title: 'Acadex Hackathon Winner', desc: 'Won 1st place among 50 teams for creating an automated syllabus planner.' }
    ],
    careerObjective: 'Motivated Computer Science undergraduate with experience in backend software development, cloud deployment, and system optimization. Seeking full-time roles in software engineering.'
  },
  portfolio: {
    completion: 75,
    profile: {
      tagline: 'Aspiring Backend Developer & GenAI Enthusiast',
      about: 'I design APIs, configure microservices, and build robust software pipelines. Extremely passionate about automating infrastructure and applying artificial intelligence to make smart platforms.'
    },
    github: 'https://github.com/johndoe-dev',
    linkedin: 'https://linkedin.com/in/johndoe-lms'
  },
  certificates: [
    { id: 'cert-101', verificationNumber: 'ACX-JW-88902', completionDate: '2026-06-10', courseName: 'Java Fundamentals & OOP Concepts', instructorName: 'Dr. Alan Turing' },
    { id: 'cert-102', verificationNumber: 'ACX-DS-12093', completionDate: '2026-06-28', courseName: 'SQL Databases for Developers', instructorName: 'Dr. Fei-Fei Li' }
  ],
  linkedinProfile: {
    url: 'https://linkedin.com/in/johndoe-lms',
    verified: true,
    completion: 100
  },
  scores: {
    aptitude: 82,
    technical: 78,
    mockInterview: 85,
    communication: 88,
    softSkills: 90
  }
};

// ── Cloud Sync Simulation Indicator ──────────────────────────
const CloudSync = {
  async sync(data) {
    // Show cloud sync indicator in the header if available
    const indicator = document.getElementById('cloudSyncStatus');
    if (indicator) {
      indicator.innerHTML = '<i class="fa fa-refresh fa-spin" style="color:var(--primary)"></i> Syncing...';
    }

    // Save to localstorage representing client database
    Store.set('tp_data', data);

    // Simulate Network Latency (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));

    if (indicator) {
      indicator.innerHTML = '<i class="fa fa-cloud" style="color:var(--success)"></i> Cloud Synced';
    }
  }
};

// ── TP Controller & Initializer ──────────────────────────────
const TP = {
  db: null,

  async init() {
    // Load existing T&P database or set defaults
    this.db = Store.get('tp_data');
    if (!this.db) {
      this.db = JSON.parse(JSON.stringify(DEFAULT_TP_DATA));
      await CloudSync.sync(this.db);
    }
    
    // Auto-verify URL matching role to load widgets on general pages
    this.injectCloudSyncIndicator();
  },

  injectCloudSyncIndicator() {
    const headerRight = document.querySelector('.inner-navbar-right');
    if (headerRight && !document.getElementById('cloudSyncStatus')) {
      const syncDiv = document.createElement('div');
      syncDiv.id = 'cloudSyncStatus';
      syncDiv.className = 'notif-btn';
      syncDiv.style.fontSize = '0.8rem';
      syncDiv.style.color = 'var(--text-muted)';
      syncDiv.style.display = 'flex';
      syncDiv.style.alignItems = 'center';
      syncDiv.style.gap = '5px';
      syncDiv.style.whiteSpace = 'nowrap';
      syncDiv.innerHTML = '<i class="fa fa-cloud" style="color:var(--success)"></i> Cloud Synced';
      headerRight.insertBefore(syncDiv, headerRight.firstChild);
    }
  },

  async save() {
    await CloudSync.sync(this.db);
  },

  // Calculate Resume Completion %
  calculateResumeCompletion() {
    const resume = this.db.resume;
    let filled = 0;
    let total = 8; // 8 sections

    if (resume.personalDetails.name && resume.personalDetails.email) filled++;
    if (resume.education && resume.education.length > 0) filled++;
    if (resume.skills && resume.skills.length > 0) filled++;
    if (resume.projects && resume.projects.length > 0) filled++;
    if (resume.certifications && resume.certifications.length > 0) filled++;
    if (resume.internships && resume.internships.length > 0) filled++;
    if (resume.achievements && resume.achievements.length > 0) filled++;
    if (resume.careerObjective) filled++;

    resume.completion = Math.round((filled / total) * 100);
    return resume.completion;
  },

  // Calculate Portfolio Completion %
  calculatePortfolioCompletion() {
    const portfolio = this.db.portfolio;
    let filled = 0;
    const total = 10; // 10 components: Tagline, About, GitHub, LinkedIn, ContactInfo, Skills, Projects, Experience, Internships, Certifications
    
    if (portfolio.profile.tagline) filled++;
    if (portfolio.profile.about) filled++;
    if (this.db.resume.skills.length > 0) filled++;
    if (this.db.resume.projects.length > 0) filled++;
    if (this.db.resume.internships.length > 0) filled++; // counts as experience/internships
    if (this.db.resume.certifications.length > 0) filled++;
    if (portfolio.github) filled++;
    if (portfolio.linkedin) filled++;
    if (this.db.resume.personalDetails.phone) filled++; // contact info
    if (this.db.resume.personalDetails.email) filled++;

    portfolio.completion = Math.round((filled / total) * 100);
    return portfolio.completion;
  },

  // Calculate Overall Placement Readiness Score
  getPlacementReadiness() {
    const resumeComp = this.calculateResumeCompletion();
    const portfolioComp = this.calculatePortfolioCompletion();
    const linkedinComp = this.db.linkedinProfile.completion;
    const attendance = 85; // Fixed mockup default attendance %
    const trainingComp = Math.round(
      this.db.programs.reduce((acc, curr) => acc + (curr.completedHours / curr.totalHours) * 100, 0) / this.db.programs.length
    );
    const certCount = this.db.certificates.length;
    const certScore = Math.min((certCount / 4) * 100, 100); // 4 certs is max score

    const s = this.db.scores;
    const scoresAvg = (s.aptitude + s.technical + s.mockInterview + s.communication + s.softSkills) / 5;

    // Weight allocations:
    // Resume (15%), Portfolio (15%), LinkedIn (10%), Attendance (10%), Training Completion (15%), Certificates (10%), Scores Average (25%)
    const score = Math.round(
      (resumeComp * 0.15) +
      (portfolioComp * 0.15) +
      (linkedinComp * 0.10) +
      (attendance * 0.10) +
      (trainingComp * 0.15) +
      (certScore * 0.10) +
      (scoresAvg * 0.25)
    );

    let status = 'Not Ready';
    let improvements = [];

    if (score >= 85) {
      status = 'Job Ready';
    } else if (score >= 70) {
      status = 'Almost Ready';
    }

    if (resumeComp < 90) improvements.push({ category: 'Resume', text: 'Complete all sections of your resume.', priority: 'high', icon: 'fa-file-text' });
    if (portfolioComp < 90) improvements.push({ category: 'Portfolio', text: 'Build your portfolio project list and bio.', priority: 'medium', icon: 'fa-user-circle' });
    if (!this.db.linkedinProfile.verified) improvements.push({ category: 'LinkedIn', text: 'Link and verify your LinkedIn profile.', priority: 'high', icon: 'fa-linkedin' });
    if (s.codingPractice < 70) improvements.push({ category: 'Coding', text: 'Increase your coding training completion above 70%.', priority: 'high', icon: 'fa-code' });
    if (s.mockInterview < 80) improvements.push({ category: 'Interview', text: 'Book and complete a mock interview.', priority: 'medium', icon: 'fa-comments' });
    if (certCount < 3) improvements.push({ category: 'Certifications', text: 'Earn at least 1 more course completion certificate.', priority: 'low', icon: 'fa-certificate' });

    return {
      score,
      status,
      improvements
    };
  },

  // ── Notes Submission Handlers ────────────────────────────────
  async uploadNote(fileName, fileSize, course) {
    const user = Auth.getUser();
    const fileExt = fileName.split('.').pop().toLowerCase();
    const typeMapping = { pdf: 'pdf', doc: 'doc', docx: 'doc', ppt: 'ppt', pptx: 'ppt', png: 'img', jpg: 'img', jpeg: 'img' };
    
    const newNote = {
      id: 'note-' + Date.now(),
      studentName: user ? user.name : 'Student',
      studentId: user ? user.id || 'stu-101' : 'stu-101',
      fileName: fileName,
      fileType: typeMapping[fileExt] || 'pdf',
      fileSize: fileSize,
      uploadDate: new Date().toISOString(),
      status: 'Pending',
      comments: '',
      course: course
    };

    this.db.notes.unshift(newNote);
    await this.save();
    return newNote;
  },

  async deleteNote(id) {
    this.db.notes = this.db.notes.filter(n => n.id !== id);
    await this.save();
  },

  async reviewNote(id, status, comments) {
    const note = this.db.notes.find(n => n.id === id);
    if (note) {
      note.status = status;
      note.comments = comments;
      await this.save();
    }
  },

  // ── Live Class Handlers ──────────────────────────────────────
  async scheduleLiveClass(title, instructor, course, date, time, meetingLink) {
    const newClass = {
      id: 'class-' + Date.now(),
      title,
      instructor,
      course,
      date,
      time,
      status: 'upcoming',
      meetingLink,
      materials: [],
      attendance: []
    };
    this.db.classes.unshift(newClass);
    await this.save();
    return newClass;
  },

  async startLiveClass(id) {
    const cls = this.db.classes.find(c => c.id === id);
    if (cls) {
      cls.status = 'live';
      await this.save();
    }
  },

  async endLiveClass(id) {
    const cls = this.db.classes.find(c => c.id === id);
    if (cls) {
      cls.status = 'recorded';
      cls.recordingUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      cls.duration = 360;
      cls.playbackPosition = 0;
      cls.completed = false;
      cls.bookmarks = [];
      
      // Auto generate attendance list of mock students who joined during session
      cls.attendance = [
        { studentId: 'stu-101', studentName: 'John Doe', date: cls.date, loginTime: cls.time, logoutTime: '03:15 PM', totalDuration: '75 mins', status: 'Present', percent: 100 }
      ];
      
      // Create notification
      const notifMsg = `Recording is now available for: ${cls.title}`;
      this.addNotification(notifMsg, 'recorded');

      await this.save();
    }
  },

  // ── Assignment & Tasks Handlers ──────────────────────────────
  async createAssignment(title, course, due, criteria, attachments = []) {
    const newTask = {
      id: 'task-' + Date.now(),
      title,
      course,
      due: new Date(due).toISOString(),
      status: 'Pending',
      points: 0,
      maxPoints: 100,
      feedback: '',
      criteria,
      attachments,
      submissionFile: null,
      submissionDate: null
    };
    this.db.tasks.unshift(newTask);
    await this.save();
    return newTask;
  },

  async submitAssignment(id, fileName) {
    const task = this.db.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'Submitted';
      task.submissionFile = fileName;
      task.submissionDate = new Date().toISOString();
      await this.save();
    }
  },

  async gradeAssignment(id, score, feedback) {
    const task = this.db.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'Reviewed';
      task.points = score;
      task.feedback = feedback;
      await this.save();
    }
  },

  // ── Notifications ───────────────────────────────────────────
  addNotification(text, type = 'info') {
    // Notify the user via Toast first
    if (typeof Toast !== 'undefined') {
      Toast[type === 'recorded' ? 'success' : 'info']('Notification', text);
    }
    // We would append it to dashboard notifications in future UI renders
  }
};

// Auto Initialize
TP.init();
