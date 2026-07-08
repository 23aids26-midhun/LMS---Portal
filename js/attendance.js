/* ============================================================
   Acadex LMS — attendance.js
   ============================================================ */

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Load logged in student's real data from users list
function getStudentAttendanceData() {
  const user = Auth.getUser();
  const users = Store.get('users', []);
  const student = users.find(u => u.email === user.email) || user;
  const logs = student.attendanceLogs || [];
  
  const data = {};
  logs.forEach(log => {
    data[log.date] = log.status.toLowerCase();
  });
  
  // Seed holidays for visual completeness in calendar
  const now = new Date();
  const year = now.getFullYear();
  for (let m = 0; m <= now.getMonth(); m++) {
    for (let d = 1; d <= 31; d++) {
      const date = new Date(year, m, d);
      if (date > now) break;
      const key = `${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      
      // Holiday mappings
      if ((m === 0 && d === 1) || (m === 7 && d === 15) || (m === 9 && d === 2)) {
        data[key] = 'holiday';
      }
    }
  }
  
  return data;
}

let attendanceData = getStudentAttendanceData();
let viewYear   = new Date().getFullYear();
let viewMonth  = new Date().getMonth();
let viewSubject = 'all';

// ── Render Calendar ────────────────────────────────────────────
function renderAttendanceCalendar() {
  const calBody = document.getElementById('attendanceCal');
  if (!calBody) return;

  const monthTitle = document.getElementById('calMonthTitle');
  if (monthTitle) monthTitle.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today       = new Date();

  let cells = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells += '<div class="att-cell empty"></div>';
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    const key  = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const status = attendanceData[key] || '';
    const isToday = date.toDateString() === today.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isFuture = date > today;

    let cls = 'att-cell';
    if (isToday)   cls += ' today';
    if (isWeekend) cls += ' weekend';
    if (!isWeekend && !isFuture && status) cls += ` ${status}`;
    if (isFuture)  cls += ' future';

    const title = isWeekend ? 'Weekend' : isFuture ? 'Upcoming' : status ? status.charAt(0).toUpperCase() + status.slice(1) : 'No class';

    cells += `<div class="${cls}" title="${title}: ${Format.date(date)}" onclick="showDayDetail('${key}', '${status}')">${d}</div>`;
  }

  calBody.innerHTML = cells;

  updateAttendanceSummary();
}

// ── Update Summary Stats ───────────────────────────────────────
function updateAttendanceSummary() {
  const monthKeys = Object.keys(attendanceData).filter(k => {
    const [y, m] = k.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1;
  });

  const counts = { present: 0, absent: 0, late: 0, holiday: 0 };
  monthKeys.forEach(k => { if (counts[attendanceData[k]] !== undefined) counts[attendanceData[k]]++; });

  const total = counts.present + counts.absent + counts.late;
  const pct   = total ? Math.round((counts.present + counts.late * 0.5) / total * 100) : 0;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('attPresent',  counts.present);
  setEl('attAbsent',   counts.absent);
  setEl('attLate',     counts.late);
  setEl('attHoliday',  counts.holiday);
  setEl('attPercent',  pct + '%');
  setEl('attTotal',    total);

  // Update overall bar
  const bar = document.getElementById('attPercentBar');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct >= 85 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)';
  }

  // Update badge
  const badge = document.getElementById('attBadge');
  if (badge) {
    badge.textContent = pct >= 85 ? 'Excellent' : pct >= 70 ? 'Satisfactory' : 'At Risk';
    badge.className   = `badge badge-${pct >= 85 ? 'success' : pct >= 70 ? 'warning' : 'danger'}`;
  }
}

// ── Day Detail Modal ──────────────────────────────────────────
function showDayDetail(key, status) {
  if (!status) return;
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m-1, d);

  document.getElementById('dayDetailDate').textContent   = Format.date(date);
  document.getElementById('dayDetailStatus').textContent = status.charAt(0).toUpperCase() + status.slice(1);
  document.getElementById('dayDetailStatus').className = `badge badge-${status === 'present' ? 'success' : status === 'absent' ? 'danger' : status === 'late' ? 'warning' : 'primary'}`;
  Modal.open('dayDetailModal');
}

// ── Monthly Trend Chart ────────────────────────────────────────
function renderMonthlyTrendChart() {
  const canvas = document.getElementById('monthlyTrendChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const isDark = Theme.isDark();
  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const monthlyPct = [];
  for (let m = 0; m <= new Date().getMonth(); m++) {
    const keys = Object.keys(attendanceData).filter(k => {
      const [y, mo] = k.split('-').map(Number);
      return y === viewYear && mo === m + 1 && attendanceData[k] !== 'holiday';
    });
    const total = keys.length;
    const present = keys.filter(k => attendanceData[k] === 'present').length;
    const late    = keys.filter(k => attendanceData[k] === 'late').length;
    monthlyPct.push(total ? Math.round((present + late * 0.5) / total * 100) : 0);
  }

  const labels = MONTHS.slice(0, monthlyPct.length);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Attendance %',
        data: monthlyPct,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.08)',
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
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => `${ctx.raw}%` }
        }
      },
      scales: {
        y: {
          min: 0, max: 100,
          grid: { color: gridColor },
          ticks: { color: textColor, callback: v => v + '%' }
        },
        x: { grid: { display: false }, ticks: { color: textColor } }
      }
    }
  });
}

// ── Session Attendance Logs History ──────────────────────────────────
function renderSessionAttendanceLogs() {
  const container = document.getElementById('sessionAttendanceLogs');
  if (!container) return;

  const user = Auth.getUser();
  const users = Store.get('users', []);
  const student = users.find(u => u.email === user.email) || user;
  const logs = student.attendanceLogs || [];

  if (logs.length === 0) {
    container.innerHTML = '<div class="text-muted text-center py-4">No class logs found. Join live sessions to generate records.</div>';
    return;
  }

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sortedLogs.map(log => {
    let statusClass = 'primary';
    if (log.status === 'Present') statusClass = 'success';
    else if (log.status === 'Late') statusClass = 'warning';
    else if (log.status === 'Absent') statusClass = 'danger';

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding:12px 0; gap:16px;">
        <div style="flex:1;">
          <div class="font-semi" style="font-size:0.95rem; color:var(--text);">${log.className}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">
            Mentor: <strong>${log.faculty}</strong> · Date: ${log.date}
          </div>
          <div style="font-size:0.72rem; color:var(--text-light); margin-top:2px;">
            Join: ${log.joinTime} · Exit: ${log.exitTime} · Duration: ${log.durationMinutes} mins · Dev: ${log.device || 'Web Browser'}
          </div>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-${statusClass}">${log.status}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── Month Navigation ───────────────────────────────────────────
function prevMonth() {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderAttendanceCalendar();
}

function nextMonth() {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewYear > new Date().getFullYear() || (viewYear === new Date().getFullYear() && viewMonth > new Date().getMonth())) {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    return;
  }
  renderAttendanceCalendar();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('attendancePage')) return;
  if (!Auth.requireAuth()) return;

  Store.set('attendance_data', attendanceData);

  document.getElementById('prevMonthBtn')?.addEventListener('click', prevMonth);
  document.getElementById('nextMonthBtn')?.addEventListener('click', nextMonth);

  renderAttendanceCalendar();
  renderMonthlyTrendChart();
  renderSessionAttendanceLogs();
});
