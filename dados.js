(async function(){
  const api = new TaskAPI();

  // Helpers
  function parseLocalDate(dateStr){
    if (!dateStr) return null;
    const parts = dateStr.split('-').map(p => parseInt(p,10));
    if (parts.length !== 3 || parts.some(isNaN)) return new Date(dateStr);
    const [y,m,d] = parts; return new Date(y,m-1,d);
  }
  function daysAgo(date, n){
    const d = new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d;
  }

  // Completed tasks last 7 days
  const completedListEl = document.getElementById('completed-list');
  const completedCountEl = document.getElementById('completed-count');
  const allCompleted = await api.getCompletedTasks();
  const now = new Date();
  const sevenDaysAgo = daysAgo(now, 7);
  const recent = allCompleted.filter(c => {
    if (!c.completedAt) return false;
    const d = new Date(c.completedAt);
    d.setHours(0,0,0,0);
    return d >= sevenDaysAgo && d <= now;
  });
  completedCountEl.textContent = recent.length;
  recent.forEach(r => {
    const li = document.createElement('li');
    const date = r.completedAt ? new Date(r.completedAt) : null;
    li.textContent = `${r.title} — ${date ? date.toLocaleString() : ''}`;
    completedListEl.appendChild(li);
  });

  // Pie chart for current tasks by due-date status
  const pieEl = document.getElementById('pie-chart');
  const legendEl = document.getElementById('pie-legend');
  const tasks = await api.getTasks();
  const counts = { late:0, soon:0, normal:0 };
  function dueStatusFromTask(t){
    if (!t.dueDate) return 'normal';
    const today = new Date(); today.setHours(0,0,0,0);
    const d = parseLocalDate(t.dueDate); if (!d || isNaN(d)) return 'normal'; d.setHours(0,0,0,0);
    if (d < today) return 'late';
    const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    if (diff <= 2) return 'soon';
    return 'normal';
  }
  tasks.forEach(t => counts[dueStatusFromTask(t)]++);

  // draw simple SVG pie
  const total = counts.late + counts.soon + counts.normal || 1;
  const size = 160; const r = size/2; const cx = r; const cy = r;
  const colors = { late:'#dc3545', soon:'orange', normal:'#28a745' };
  pieEl.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  let startAngle = -Math.PI/2; // start at top
  function polarToCartesian(cx,cy,r,angle){
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  ['late','soon','normal'].forEach(key => {
    const value = counts[key];
    if (value <= 0) return;
    const sliceAngle = (value / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;
    const start = polarToCartesian(cx,cy,r,startAngle);
    const end = polarToCartesian(cx,cy,r,endAngle);
    const large = sliceAngle > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', d);
    path.setAttribute('fill', colors[key]);
    svg.appendChild(path);
    startAngle = endAngle;
  });
  pieEl.appendChild(svg);

  // legend
  legendEl.innerHTML = `<span style="display:inline-block;margin-right:0.8rem;">`+
    `<span style="display:inline-block;width:12px;height:12px;background:${colors.late};margin-right:6px;border-radius:2px;"></span>Atrasadas (${counts.late})</span>`+
    `<span style="display:inline-block;margin-right:0.8rem;">`+
    `<span style="display:inline-block;width:12px;height:12px;background:${colors.soon};margin-right:6px;border-radius:2px;"></span>Prazo próximo (${counts.soon})</span>`+
    `<span style="display:inline-block;">`+
    `<span style="display:inline-block;width:12px;height:12px;background:${colors.normal};margin-right:6px;border-radius:2px;"></span>Prazo normal (${counts.normal})</span>`;

  // Weekly goal: load/save
  const goalInput = document.getElementById('goal-input');
  const saveBtn = document.getElementById('save-goal');
  const goalSaved = document.getElementById('goal-saved');
  const existingGoal = await api.getSetting('weeklyGoal');
  if (existingGoal != null) goalInput.value = existingGoal;
  saveBtn.addEventListener('click', async () => {
    const val = parseInt(goalInput.value,10);
    if (isNaN(val) || val < 0) return;
    await api.saveSetting('weeklyGoal', val);
    goalSaved.style.display = 'block';
    setTimeout(()=> goalSaved.style.display = 'none', 2200);
  });

})();