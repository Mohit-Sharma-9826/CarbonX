let currentPage = 'landing';
let charts = {};

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  currentPage = page;
  window.scrollTo(0, 0);
  
  // Show/hide nav links based on page
  const mainNav = document.getElementById('main-nav-links');
  if (['login','register'].includes(page)) {
    mainNav.style.display = 'none';
  } else {
    mainNav.style.display = 'flex';
  }

  // Init charts when page loads
  if (page === 'ai') initAIPage();
  if (page === 'credits') initCreditsPage();
  if (page === 'reports') initReportsPage();
  if (page === 'calculator') { recalculate(); }
}

// ═══════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════
function showToast(msg, type = 'success', duration = 3500) {
  const wrap = document.getElementById('toastWrap');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.animation = 'fadeOut 0.3s ease forwards'; setTimeout(() => t.remove(), 300); }, duration);
}

// ═══════════════════════════════════════════════════
// COUNTER ANIMATION
// ═══════════════════════════════════════════════════
function animateCounter(el, target, duration = 1800, prefix = '', suffix = '') {
  const start = performance.now();
  const from = 0;
  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (target - from) * eased);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Animate landing page counters on load
setTimeout(() => {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    animateCounter(el, target, 2000);
  });
}, 500);

// ═══════════════════════════════════════════════════
// PARTICLE CANVAS
// ═══════════════════════════════════════════════════
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  
  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,230,118,${p.alpha})`;
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,230,118,${0.06 * (1 - dist/100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════
function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const pass = document.getElementById('loginPass').value;
  if (!email || !pass) { showToast('Please enter email and password', 'error'); return; }
  showToast('Authenticating...', 'info', 1000);
  setTimeout(() => {
    showToast('Welcome back, Arjun! 👋', 'success');
    showPage('dashboard');
    initDashboard();
  }, 1200);
}

let currentStep = 1;
function nextStep(step) {
  document.getElementById('reg-step-' + currentStep).style.display = 'none';
  document.getElementById('reg-step-' + step).style.display = 'block';
  
  // Update step indicators
  document.querySelectorAll('.step-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.remove('active', 'done');
    if (s === step) dot.classList.add('active');
    if (s < step) dot.classList.add('done');
  });
  currentStep = step;
  
  if (step === 5) {
    showToast('Account created successfully! 🎉', 'success');
  }
}

function toggleCheck(label) {
  label.classList.toggle('checked');
}

// ═══════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════
const CHART_DEFAULTS = {
  gridColor: 'rgba(0,230,118,0.06)',
  tickColor: '#2E7D32',
  fontFamily: "'JetBrains Mono', monospace",
};

function setChartDefaults() {
  Chart.defaults.color = '#4CAF50';
  Chart.defaults.borderColor = 'rgba(0,230,118,0.06)';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 11;
}

let dashInitialized = false;
function initDashboard() {
  if (dashInitialized) return;
  dashInitialized = true;
  setChartDefaults();
  
  // Animate KPIs
  setTimeout(() => {
    animateCounter(document.getElementById('kpi-total'), 62400, 1800, '', ' kg');
    animateCounter(document.getElementById('kpi-scope2'), 44800, 1800, '', ' kg');
    animateCounter(document.getElementById('kpi-intensity'), 125, 1800, '', ' kg');
    animateCounter(document.getElementById('kpi-credits'), 124, 1800, '', ' t');
    animateCounter(document.getElementById('kpi-esg'), 72, 1600, '', '/100');
    animateCounter(document.getElementById('kpi-deadline'), 34, 1200, '', ' days');
  }, 300);
  
  buildEmissionTable();
  buildHeatmap();
  initTrendChart();
  initDonutChart();
  initCompareChart();
  initScope1Chart();
  initTargetCards();
}

function switchDashTab(tab) {
  const tabs = ['overview','scope1','scope2','scope3','targets'];
  tabs.forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
    if (item.textContent.toLowerCase().includes(tab === 'overview' ? 'overview' : tab.replace('scope',''))) {
      // crude match
    }
  });
  if (tab === 'scope1') setTimeout(() => { if (!charts.scope1) initScope1Chart(); }, 100);
}

// ─── TREND CHART ───
function initTrendChart() {
  const ctx = document.getElementById('trendChart');
  if (!ctx || charts.trend) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const s1 = [12000,11800,12400,13200,12800,13600,14200,13800,14400,15200,14800,15600];
  const s2 = [36000,35200,37600,38400,37000,39200,40800,38600,41200,43600,42000,44800];
  const s3 = [7200,7400,7600,7800,7600,8000,8200,7800,8400,8600,8200,8800];
  
  charts.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Scope 1', data: s1, fill: true, borderColor: '#FF5252', backgroundColor: 'rgba(255,82,82,0.06)', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#FF5252', borderWidth: 2 },
        { label: 'Scope 2', data: s2, fill: true, borderColor: '#FFD740', backgroundColor: 'rgba(255,215,64,0.06)', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#FFD740', borderWidth: 2 },
        { label: 'Scope 3', data: s3, fill: true, borderColor: '#00E676', backgroundColor: 'rgba(0,230,118,0.06)', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#00E676', borderWidth: 2 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', labels: { color: '#81C784', padding: 16, usePointStyle: true } }, tooltip: { backgroundColor: '#0F2218', borderColor: 'rgba(0,230,118,0.3)', borderWidth: 1 } },
      scales: {
        x: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32' } },
        y: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32', callback: v => (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

// ─── DONUT CHART ───
function initDonutChart() {
  const ctx = document.getElementById('donutChart');
  if (!ctx || charts.donut) return;
  charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Electricity','DG Diesel','Fleet','Commute','Air Travel','Waste','Other'],
      datasets: [{
        data: [44800, 4284, 2147, 3820, 3160, 374, 3815],
        backgroundColor: ['#00E676','#1DB954','#2D6A4F','#FFD740','#FF8A65','#42A5F5','#AB47BC'],
        borderColor: '#0A1A0F', borderWidth: 3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: {
        legend: { position: 'right', labels: { color: '#81C784', padding: 10, usePointStyle: true, font: { size: 11 } } },
        tooltip: { backgroundColor: '#0F2218', borderColor: 'rgba(0,230,118,0.3)', borderWidth: 1 }
      }
    }
  });
}

// ─── COMPARE CHART ───
function initCompareChart() {
  const ctx = document.getElementById('compareChart');
  if (!ctx || charts.compare) return;
  charts.compare = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: '2024', data: [55200,54400,57600,59400,57400,60800,63200,60200,64000,67400,65000,68400], backgroundColor: 'rgba(0,230,118,0.6)', borderRadius: 3 },
        { label: '2023', data: [51200,50800,53600,55000,53200,56400,58600,55800,59200,62400,60200,63200], backgroundColor: 'rgba(0,230,118,0.2)', borderRadius: 3 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#81C784', usePointStyle: true } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#2E7D32' } },
        y: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32', callback: v => (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

// ─── SCOPE 1 CHART ───
function initScope1Chart() {
  const ctx = document.getElementById('scope1Chart');
  if (!ctx || charts.scope1) return;
  charts.scope1 = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [
        { label: 'DG Diesel', data: [5200,5100,5400,5800,5600,5900,6200,6000,6300,6600,6400,6700], backgroundColor: '#FF5252', borderRadius: 4 },
        { label: 'Fleet', data: [3200,3100,3300,3600,3400,3700,3900,3700,4000,4200,4100,4300], backgroundColor: '#FF8A65', borderRadius: 4 },
        { label: 'LPG', data: [1800,1700,1900,2000,1900,2100,2200,2100,2300,2400,2300,2400], borderRadius: 4, backgroundColor: '#FFD740' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: '#2E7D32' } },
        y: { stacked: true, grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32', callback: v => (v/1000).toFixed(1) + 'k' } }
      },
      plugins: { legend: { labels: { color: '#81C784', usePointStyle: true } } }
    }
  });
}

// ─── HEATMAP ───
function buildHeatmap() {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;
  const levels = ['', 'l1', 'l2', 'l3', 'l4', 'l5'];
  let html = '';
  for (let i = 0; i < 371; i++) {
    const r = Math.random();
    const level = r < 0.3 ? '' : r < 0.5 ? 'l1' : r < 0.65 ? 'l2' : r < 0.8 ? 'l3' : r < 0.92 ? 'l4' : 'l5';
    html += `<div class="heatmap-cell ${level}" title="Day ${i+1}: ${Math.round(r * 800)} kg CO₂e"></div>`;
  }
  grid.innerHTML = html;
}

// ─── EMISSION TABLE ───
function buildEmissionTable() {
  const tbody = document.getElementById('emissionTable');
  if (!tbody) return;
  const rows = [
    { source: 'Grid Electricity', scope: 'scope2', category: 'Electricity', co2: '44,800', pct: '71.8%', trend: '↑', badge: 'badge-amber', status: '⚠ High' },
    { source: 'DG Set (Diesel)', scope: 'scope1', category: 'Fuel Combustion', co2: '4,284', pct: '6.9%', trend: '→', badge: 'badge-green', status: '✓ Normal' },
    { source: 'Employee Commute', scope: 'scope3', category: 'Transport', co2: '3,820', pct: '6.1%', trend: '↓', badge: 'badge-green', status: '✓ Reducing' },
    { source: 'Air Travel', scope: 'scope3', category: 'Business Travel', co2: '3,160', pct: '5.1%', trend: '↑', badge: 'badge-red', status: '⚠ Spiking' },
    { source: 'Fleet Vehicles', scope: 'scope1', category: 'Transport', co2: '2,147', pct: '3.4%', trend: '→', badge: 'badge-green', status: '✓ Normal' },
    { source: 'Other Sources', scope: 'scope3', category: 'Mixed', co2: '4,189', pct: '6.7%', trend: '→', badge: 'badge-green', status: '✓ Normal' },
  ];
  const scopeColors = { scope1: '#FF5252', scope2: '#FFD740', scope3: '#81C784' };
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:600;color:var(--txt);">${r.source}</td>
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:${scopeColors[r.scope]};background:${scopeColors[r.scope]}1a;padding:2px 8px;border-radius:4px;border:1px solid ${scopeColors[r.scope]}30;">${r.scope.toUpperCase()}</span></td>
      <td style="color:var(--txt3);font-size:13px;">${r.category}</td>
      <td class="mono-val">${r.co2}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="progress-bar-wrap" style="width:60px;"><div class="progress-bar" style="width:${r.pct}"></div></div><span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--txt3);">${r.pct}</span></div></td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:16px;color:${r.trend==='↑'?'#FF5252':r.trend==='↓'?'#00E676':'#FFD740'}">${r.trend}</td>
      <td><span class="badge ${r.badge}">${r.status}</span></td>
    </tr>
  `).join('');
}

function initTargetCards() {
  const container = document.getElementById('targetCards');
  if (!container) return;
  const targets = [
    { name: '45% Absolute Reduction by 2030', scope: 'All Scopes', base: 620000, target: 341000, current: 485000, year: 2030, sbti: true },
    { name: '30% Scope 1 Reduction by 2027', scope: 'Scope 1', base: 180000, target: 126000, current: 142800, year: 2027, sbti: false },
    { name: '100% Renewable Electricity by 2026', scope: 'Scope 2', base: 450000, target: 0, current: 385600, year: 2026, sbti: true },
  ];
  container.innerHTML = targets.map(t => {
    const progress = Math.round(((t.base - t.current) / (t.base - t.target)) * 100);
    return `
    <div class="target-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--txt);margin-bottom:4px;">${t.name}</div>
          <div style="display:flex;gap:8px;">
            <span class="badge badge-blue">${t.scope}</span>
            ${t.sbti ? '<span class="badge badge-green">SBTi Aligned</span>' : ''}
            <span style="font-size:11px;color:var(--txt3);font-family:\'JetBrains Mono\',monospace;display:flex;align-items:center;">Target: ${t.year}</span>
          </div>
        </div>
        <span style="font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:600;color:${progress >= 50 ? 'var(--acc)' : 'var(--amber)'};">${progress}%</span>
      </div>
      <div class="progress-bar-wrap mb-8"><div class="progress-bar" style="width:${progress}%"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;font-family:'JetBrains Mono',monospace;color:var(--txt4);">
        <span>Base: ${(t.base/1000).toFixed(0)}k kg CO₂e</span>
        <span>Current: ${(t.current/1000).toFixed(0)}k kg</span>
        <span>Target: ${(t.target/1000).toFixed(0)}k kg</span>
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════
// CALCULATOR ENGINE
// ═══════════════════════════════════════════════════
const FACTORS = {
  FUEL: { diesel: 2.68, lpg: 1.61, nat_gas: 2.04, coal: 2860 },
  WASTE: { landfill: 0.467, recycled: 0.021 },
  WATER: { supply: 0.344, wastewater: 0.717 }
};

function recalculate() {
  // Scope 2: Electricity
  const kwh = parseFloat(document.getElementById('inp-kwh')?.value) || 0;
  const gridFactor = parseFloat(document.getElementById('inp-state')?.value) || 0.716;
  const renewable = parseFloat(document.getElementById('inp-renewable')?.value) || 0;
  const s2_elec = kwh * (1 - renewable / 100) * gridFactor;
  document.getElementById('formula-factor').textContent = gridFactor.toFixed(3);

  // Scope 1: Vehicles
  const vehCount = parseFloat(document.getElementById('inp-veh-count')?.value) || 0;
  const vehKm = parseFloat(document.getElementById('inp-veh-km')?.value) || 0;
  const vehFactor = parseFloat(document.getElementById('inp-veh-type')?.value) || 0.171;
  const s1_vehicles = vehCount * vehKm * vehFactor;

  // Scope 1: Fuel
  const diesel = (parseFloat(document.getElementById('inp-diesel')?.value) || 0) * FACTORS.FUEL.diesel;
  const lpg = (parseFloat(document.getElementById('inp-lpg')?.value) || 0) * FACTORS.FUEL.lpg;
  const gas = (parseFloat(document.getElementById('inp-gas')?.value) || 0) * FACTORS.FUEL.nat_gas;
  const coal = (parseFloat(document.getElementById('inp-coal')?.value) || 0) * FACTORS.FUEL.coal;
  const s1_fuel = diesel + lpg + gas + coal;

  // Scope 3: Commute
  const emp = parseFloat(document.getElementById('inp-emp')?.value) || 0;
  const empKm = parseFloat(document.getElementById('inp-emp-km')?.value) || 0;
  const commuteFactor = parseFloat(document.getElementById('inp-commute-mode')?.value) || 0.089;
  const s3_commute = emp * empKm * 22 * commuteFactor;

  // Scope 3: Waste
  const wasteKg = parseFloat(document.getElementById('inp-waste')?.value) || 0;
  const landfillPct = parseFloat(document.getElementById('inp-landfill')?.value) || 70;
  const s3_waste = wasteKg * (landfillPct/100 * FACTORS.WASTE.landfill + (1 - landfillPct/100) * FACTORS.WASTE.recycled);
  
  // Scope 3: Water
  const water = (parseFloat(document.getElementById('inp-water')?.value) || 0) * FACTORS.WATER.supply;
  const ww = (parseFloat(document.getElementById('inp-wastewater')?.value) || 0) * FACTORS.WATER.wastewater;

  // Scope 3: Flights
  const flights = parseFloat(document.getElementById('inp-dom-flights')?.value) || 0;
  const flightKm = parseFloat(document.getElementById('inp-flight-km')?.value) || 0;
  const flightPax = parseFloat(document.getElementById('inp-flight-pax')?.value) || 0;
  const s3_flights = flights * flightKm * flightPax * 0.255;

  const scope1 = s1_vehicles + s1_fuel;
  const scope2 = s2_elec;
  const scope3 = s3_commute + s3_waste + water + ww + s3_flights;
  const total = scope1 + scope2 + scope3;

  // Update display
  const fmt = n => Math.round(n).toLocaleString();
  const el = id => document.getElementById(id);
  
  el('calc-grand-total').textContent = fmt(total);
  el('calc-scope1').textContent = fmt(scope1) + ' kg';
  el('calc-scope2').textContent = fmt(scope2) + ' kg';
  el('calc-scope3-val').textContent = fmt(scope3) + ' kg';
  
  // Equivalents
  el('eq-trees').textContent = fmt(total / 21);
  el('eq-flights').textContent = (total / 500).toFixed(1);
  el('eq-cars').textContent = fmt(total / 0.142);
  el('eq-phones').textContent = fmt(total / 0.008);
}

function switchCalcTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('calc-' + tab);
  if (panel) panel.classList.add('active');
}

function saveCalculation() {
  showToast('Calculation saved to dashboard!', 'success');
}

// ═══════════════════════════════════════════════════
// AI INSIGHTS PAGE
// ═══════════════════════════════════════════════════
let aiInitialized = false;
function initAIPage() {
  if (aiInitialized) return;
  aiInitialized = true;
  setChartDefaults();
  initForecastChart();
  initBenchmarkChart();
  buildRecommendations();
}

function initForecastChart() {
  const ctx = document.getElementById('forecastChart');
  if (!ctx || charts.forecast) return;
  const months = ['Jan 24','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan 25','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec 25'];
  const historical = [55200,54400,57600,59400,57400,60800,63200,60200,64000,67400,65000,68400,null,null,null,null,null,null,null,null,null,null,null,null];
  const predicted = [null,null,null,null,null,null,null,null,null,null,null,null,69200,70800,72400,71600,73200,74800,76400,75200,77600,79200,78400,80000];
  const upper = predicted.map(v => v ? v * 1.08 : null);
  const lower = predicted.map(v => v ? v * 0.92 : null);

  charts.forecast = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        { label: 'Actual', data: historical, borderColor: '#00E676', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#00E676', tension: 0.4 },
        { label: 'Forecast', data: predicted, borderColor: '#00E676', borderWidth: 2, borderDash: [6, 4], pointRadius: 3, pointBackgroundColor: '#00E676', tension: 0.4, fill: false },
        { label: 'Upper Bound', data: upper, borderColor: 'transparent', fill: '+1', backgroundColor: 'rgba(0,230,118,0.08)', pointRadius: 0 },
        { label: 'Lower Bound', data: lower, borderColor: 'transparent', fill: false, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0F2218', borderColor: 'rgba(0,230,118,0.3)', borderWidth: 1 } },
      scales: {
        x: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32' } },
        y: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32', callback: v => (v/1000).toFixed(0) + 'k' } }
      }
    }
  });
}

function updateForecast() { /* Would refresh forecast data */ }
function updateScenario() {
  const solar = parseFloat(document.getElementById('solar-val').textContent) / 100;
  const ev = parseFloat(document.getElementById('ev-val').textContent) / 100;
  const waste = parseFloat(document.getElementById('waste-val').textContent) / 100;
  const combined = Math.round((solar * 0.45 + ev * 0.25 + waste * 0.08) * 100);
  const saving = Math.round(7840000 * combined / 100);
  document.getElementById('scenario-saving').textContent = combined + '%';
  document.getElementById('scenario-kg').textContent = (saving / 1000000).toFixed(2) + 'M kg';
  document.getElementById('scenario-credits').textContent = Math.round(saving / 1000).toLocaleString();
}

function initBenchmarkChart() {
  const ctx = document.getElementById('benchmarkChart');
  if (!ctx || charts.benchmark) return;
  charts.benchmark = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Electricity\n(per emp)', 'Fuel\n(per emp)', 'Transport\n(per emp)', 'Waste\n(per emp)', 'Air Travel\n(per emp)', 'Total\n(per emp)'],
      datasets: [
        { label: 'TechCorp India', data: [89.6, 28.6, 17.2, 0.7, 6.3, 125.1], backgroundColor: 'rgba(0,230,118,0.7)', borderRadius: 4, borderWidth: 0 },
        { label: 'Industry Average', data: [142.4, 31.2, 14.8, 2.1, 2.9, 190.2], backgroundColor: 'rgba(0,230,118,0.2)', borderRadius: 4, borderWidth: 0 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#81C784', usePointStyle: true } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#2E7D32' } },
        y: { grid: { color: 'rgba(0,230,118,0.05)' }, ticks: { color: '#2E7D32', callback: v => v + ' kg' } }
      }
    }
  });
}

function buildRecommendations() {
  const container = document.getElementById('recommendationsGrid');
  if (!container) return;
  const recs = [
    { icon: '☀️', title: 'Install Rooftop Solar (200 kWp)', saving: '18%', co2: '69,408', cost: '₹80–100L', roi: '3.2 yrs', diff: 'Medium', sdgs: [7,13] },
    { icon: '🚗', title: 'EV Fleet Conversion (Phase 1)', saving: '8%', co2: '30,848', cost: '₹1.2–1.8Cr', roi: '4.5 yrs', diff: 'Medium', sdgs: [11,13] },
    { icon: '🌡️', title: 'Smart HVAC Scheduling', saving: '5%', co2: '19,280', cost: '₹2–4L', roi: '0.8 yrs', diff: 'Easy', sdgs: [7] },
    { icon: '♻️', title: 'Zero Waste to Landfill Program', saving: '2%', co2: '7,712', cost: '₹50K', roi: '0.3 yrs', diff: 'Easy', sdgs: [12,13] },
    { icon: '✈️', title: 'Remote-First Travel Policy', saving: '4%', co2: '15,424', cost: '₹0', roi: 'Immediate', diff: 'Easy', sdgs: [13] },
    { icon: '💡', title: 'LED Lighting Upgrade', saving: '3%', co2: '11,568', cost: '₹8–15L', roi: '1.4 yrs', diff: 'Easy', sdgs: [7,13] },
  ];
  const diffColors = { Easy: 'badge-green', Medium: 'badge-amber', Hard: 'badge-red' };
  container.innerHTML = `<div class="grid-3">${recs.map(r => `
    <div class="card" style="cursor:pointer;" onclick="showToast('Marked as In Progress: ${r.title}', 'success')">
      <div style="font-size:32px;margin-bottom:12px;">${r.icon}</div>
      <div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--txt);margin-bottom:8px;line-height:1.3;">${r.title}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="badge badge-green">${r.saving} reduction</span>
        <span class="badge ${diffColors[r.diff]}">${r.diff}</span>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--txt3);line-height:1.8;">
        CO₂e saved: <span style="color:var(--acc);">${r.co2} kg</span><br>
        Est. cost: <span style="color:var(--txt2);">${r.cost}</span><br>
        ROI: <span style="color:var(--acc);">${r.roi}</span>
      </div>
      <div style="display:flex;gap:4px;margin-top:10px;">
        ${r.sdgs.map(s => `<span class="sdg-chip">SDG ${s}</span>`).join('')}
      </div>
    </div>`).join('')}</div>`;
}

// ═══════════════════════════════════════════════════
// REPORTS PAGE
// ═══════════════════════════════════════════════════
function initReportsPage() {
  buildComplianceList();
}

function buildComplianceList() {
  const container = document.getElementById('complianceList');
  if (!container) return;
  const items = [
    { name: 'SEBI BRSR Submission', date: 'Mar 31, 2025', days: 34, status: 'at_risk' },
    { name: 'Internal Audit Q3', date: 'Jan 15, 2025', days: -12, status: 'overdue' },
    { name: 'CDP Climate Questionnaire', date: 'Apr 30, 2025', days: 64, status: 'on_track' },
    { name: 'Annual ESG Report', date: 'May 31, 2025', days: 94, status: 'on_track' },
  ];
  const statusMap = { on_track: { badge: 'badge-green', text: 'On Track' }, at_risk: { badge: 'badge-amber', text: 'At Risk' }, overdue: { badge: 'badge-red', text: 'Overdue' } };
  container.innerHTML = items.map(i => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border2);">
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:3px;">${i.name}</div>
        <div style="font-size:11px;color:var(--txt3);font-family:'JetBrains Mono',monospace;">${i.date} · ${i.days > 0 ? i.days + ' days left' : Math.abs(i.days) + ' days ago'}</div>
      </div>
      <span class="badge ${statusMap[i.status].badge}">${statusMap[i.status].text}</span>
    </div>`).join('');
}

function generateReport() {
  const type = document.getElementById('reportType')?.value || 'GHG Protocol';
  showToast('Generating ' + type + ' report...', 'info', 2000);
  setTimeout(() => showToast('✅ Report generated! PDF ready for download.', 'success', 4000), 2500);
}

// ═══════════════════════════════════════════════════
// CARBON CREDITS
// ═══════════════════════════════════════════════════
const CREDIT_PROJECTS = [
  { name: 'Rajasthan Wind Farm', location: 'Rajasthan, India 🇮🇳', icon: '🌬️', type: 'renewable', registry: 'Verra (VCS)', vintage: 2023, price: 4200, available: 5000, sdgs: [7,8,13], verified: true },
  { name: 'Sundarbans Mangrove Restoration', location: 'West Bengal, India 🇮🇳', icon: '🌿', type: 'reforestation', registry: 'Gold Standard', vintage: 2022, price: 7800, available: 1200, sdgs: [14,15,13], verified: true },
  { name: 'Odisha Coal Mine Methane Capture', location: 'Odisha, India 🇮🇳', icon: '🏭', type: 'methane', registry: 'Verra (VCS)', vintage: 2023, price: 3600, available: 8400, sdgs: [7,13], verified: true },
  { name: 'Gujarat Solar Micro-Grid', location: 'Gujarat, India 🇮🇳', icon: '☀️', type: 'renewable', registry: 'Gold Standard', vintage: 2023, price: 5200, available: 3200, sdgs: [7,9,13], verified: true },
  { name: 'Kenya Cookstoves Program', location: 'Kenya 🇰🇪', icon: '🍳', type: 'efficiency', registry: 'Gold Standard', vintage: 2022, price: 6400, available: 15000, sdgs: [3,7,13], verified: true },
  { name: 'Amazon REDD+ Conservation', location: 'Brazil 🇧🇷', icon: '🌳', type: 'reforestation', registry: 'Verra (VCS)', vintage: 2022, price: 12000, available: 2400, sdgs: [13,14,15], verified: true },
];

let filteredCredits = [...CREDIT_PROJECTS];

function initCreditsPage() {
  renderCreditGrid(CREDIT_PROJECTS);
}

function filterCredits(type) {
  filteredCredits = type === 'all' ? CREDIT_PROJECTS : CREDIT_PROJECTS.filter(c => c.type === type);
  renderCreditGrid(filteredCredits);
}

function renderCreditGrid(projects) {
  const grid = document.getElementById('creditGrid');
  if (!grid) return;
  grid.innerHTML = projects.map(p => `
    <div class="credit-card" onclick="showBuyModal(${JSON.stringify(p).replace(/"/g,'&quot;')})">
      <div class="credit-img">${p.icon}</div>
      <div class="credit-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
          <div class="credit-name">${p.name}</div>
          ${p.verified ? '<span class="badge badge-green" style="font-size:9px;padding:2px 6px;">✓</span>' : ''}
        </div>
        <div class="credit-location">${p.location}</div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <span class="badge badge-blue" style="font-size:9px;">${p.registry}</span>
          <span style="font-size:10px;color:var(--txt4);font-family:'JetBrains Mono',monospace;display:flex;align-items:center;">V${p.vintage}</span>
        </div>
        <div class="credit-price">₹${p.price.toLocaleString()} <span>/ tCO₂e</span></div>
        <div style="font-size:11px;color:var(--txt3);font-family:'JetBrains Mono',monospace;margin-bottom:8px;">${p.available.toLocaleString()} tonnes available</div>
        <div class="sdg-chips">${p.sdgs.map(s => `<span class="sdg-chip">SDG ${s}</span>`).join('')}</div>
        <button class="btn btn-outline btn-sm w-full mt-8" style="justify-content:center;" onclick="event.stopPropagation();showBuyModal()">Purchase Credits →</button>
      </div>
    </div>`).join('');
}

function showBuyModal() {
  const inner = document.getElementById('modalInner');
  inner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div>
        <div class="modal-title">Purchase Carbon Credits</div>
        <div style="font-size:13px;color:var(--txt3);">Rajasthan Wind Farm · Verra VCS</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button>
    </div>
    <div class="form-group">
      <label class="form-label">Tonnes CO₂e to Purchase</label>
      <input class="form-input mono-input" type="number" placeholder="50" id="buy-tonnes" value="50" oninput="updatePurchaseTotal()">
    </div>
    <div style="background:var(--glass);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:13px;color:var(--txt3);">Price per tonne</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--txt);">₹4,200</span>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:14px;font-weight:700;color:var(--txt);">Total Amount</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--acc);" id="purchase-total">₹2,10,000</span>
      </div>
    </div>
    <button class="btn btn-primary w-full" style="justify-content:center;padding:13px;" onclick="completePurchase()">Confirm Purchase →</button>
    <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--txt4);font-family:'JetBrains Mono',monospace;">Secured via Razorpay · Instant retirement certificates</div>`;
  openModal();
}

function updatePurchaseTotal() {
  const tonnes = parseFloat(document.getElementById('buy-tonnes')?.value) || 0;
  const total = tonnes * 4200;
  const el = document.getElementById('purchase-total');
  if (el) el.textContent = '₹' + total.toLocaleString('en-IN');
}

function completePurchase() {
  closeModal();
  showToast('✅ Purchase confirmed! Retirement certificate generated.', 'success', 5000);
}

function showNotifModal() {
  const inner = document.getElementById('modalInner');
  inner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div class="modal-title">Notifications</div>
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">✕</button>
    </div>
    ${[
      { icon: '⚠️', title: 'Emission Spike Detected', msg: 'Electricity usage up 23% this week vs 30-day average.', time: '2 hours ago', type: 'badge-red' },
      { icon: '🤖', title: 'New AI Recommendation', msg: 'Rooftop solar could reduce Scope 2 by 18%.', time: '4 hours ago', type: 'badge-blue' },
      { icon: '📋', title: 'BRSR Deadline Approaching', msg: '34 days until SEBI BRSR submission deadline.', time: '1 day ago', type: 'badge-amber' },
    ].map(n => `
      <div style="display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--border2);">
        <span style="font-size:22px;flex-shrink:0;">${n.icon}</span>
        <div>
          <div style="font-weight:700;color:var(--txt);font-size:13px;margin-bottom:3px;">${n.title}</div>
          <div style="font-size:12px;color:var(--txt3);">${n.msg}</div>
          <div style="font-size:10px;color:var(--txt4);font-family:'JetBrains Mono',monospace;margin-top:4px;">${n.time}</div>
        </div>
        <span class="badge ${n.type}" style="margin-left:auto;height:fit-content;flex-shrink:0;">New</span>
      </div>`).join('')}`;
  openModal();
}

// ═══════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}
document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ═══════════════════════════════════════════════════
// NAV SCROLL
// ═══════════════════════════════════════════════════
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ═══════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════
recalculate();