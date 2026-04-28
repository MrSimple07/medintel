/* ═══════════════════════════════════════
   MEDINTEL — app.js
   ═══════════════════════════════════════ */

// ── State ──
let selectedSymptoms = new Set();
let currentTab = 'home';
let treatmentData = null;
let patientData = null;
let worseCount = 0;

// ── Symptom Data ──
const SYMPTOM_SYSTEMS = [
  {
    id: 'nafas',
    icon: '🫁',
    name: 'Nafas olish tizimi',
    color: '#EFF6FF',
    iconBg: '#DBEAFE',
    symptoms: ['Yo\'tal', 'Isitma', 'Tomoq og\'rig\'i', 'Burun bitishi', 'Nafas yetishmovchilik', 'Xansirash', 'Balg\'am ajralishi', 'Terlash']
  },
  {
    id: 'yurak',
    icon: '❤️',
    name: 'Yurak-qon tomirlar tizimi',
    color: '#FFF1F2',
    iconBg: '#FFE4E6',
    symptoms: ['Xansirash', 'Ko\'krakda og\'riq', 'Qon bosimi oshishi', 'Qon bosimi tushishi', 'Yurak tez urishi', 'Yurak sekin urishi', 'Yurak notekis urishi', 'Tanada shishlar', 'Siyanoz']
  },
  {
    id: 'hazm',
    icon: '🫃',
    name: 'Ovqat hazm qilish tizimi',
    color: '#FFFBEB',
    iconBg: '#FEF3C7',
    symptoms: ['Ich qotishi', 'Ich ketishi', 'Qorin sohasida og\'riq', 'Ovqat hazm qilishning buzilishi', 'Ichildan qaynash', 'Meteorizm', 'Ishtaha pasayishi', 'Ozib ketish', 'Ko\'ngil aynishi', 'Qayt qilish']
  },
  {
    id: 'siydik',
    icon: '🫘',
    name: 'Siydik-ayirish tizimi',
    color: '#F0FDF4',
    iconBg: '#DCFCE7',
    symptoms: ['Tez-tez siydish', 'Og\'riqli siydish', 'Siydik tutib olmaslik', 'Siydik rangi o\'zgarishi', 'Tunda tez-tez siydish', 'Bel sohasida og\'riq', 'Kam siydish', 'Umuman siya olmaslik']
  },
  {
    id: 'jinsiy_a',
    icon: '👩',
    name: 'Jinsiy tizim — Ayollar',
    color: '#FFF0F9',
    iconBg: '#FCE7F3',
    symptoms: ['Hayz buzilishi', 'Miqdora oshishi', 'Bachadon sohasida og\'riq']
  },
  {
    id: 'jinsiy_e',
    icon: '👨',
    name: 'Jinsiy tizim — Erkaklar',
    color: '#EFF6FF',
    iconBg: '#DBEAFE',
    symptoms: ['Prostatit belgilari', 'Impotensiya', 'Uchidan og\'riq']
  },
  {
    id: 'immun',
    icon: '🛡️',
    name: 'Immun tizim',
    color: '#F0FDF4',
    iconBg: '#DCFCE7',
    symptoms: ['Terida toshma', 'Qichishish', 'Limfa bezlari kattalashishi', 'Shish', 'Nafas siqishi', 'Holsizlik', 'Allergik reaktsiya', 'Hushdan ketish']
  },
  {
    id: 'nerv',
    icon: '🧠',
    name: 'Nerv tizimi',
    color: '#FAF5FF',
    iconBg: '#EDE9FE',
    symptoms: ['Uyqu buzilishi', 'Kayfiyat buzilishi', 'Bosh og\'rig\'i', 'Bosh aylanishi', 'Ko\'ruv pasayishi', 'Eslab tuta olmaslik', 'Nutq buzilishi']
  }
];

// ════════════════════════════════════════
// INIT
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  renderSymptomList();

  if (patientData && patientData.name) {
    showMainApp();
  } else {
    showScreen('screen-onboarding');
  }

  setupEventListeners();
});

function loadFromStorage() {
  try {
    const p = localStorage.getItem('medintel_patient');
    if (p) patientData = JSON.parse(p);
    const t = localStorage.getItem('medintel_treatment');
    if (t) treatmentData = JSON.parse(t);
  } catch(e) {}
}

function savePatient() {
  localStorage.setItem('medintel_patient', JSON.stringify(patientData));
}

function saveTreatment() {
  localStorage.setItem('medintel_treatment', JSON.stringify(treatmentData));
}

// ════════════════════════════════════════
// SCREEN MANAGEMENT
// ════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showMainApp() {
  document.getElementById('tab-bar').style.display = 'flex';
  navigateTo('home');
}

function hideTabBar() {
  document.getElementById('tab-bar').style.display = 'none';
}

function navigateTo(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-item').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  switch(tab) {
    case 'home':    renderHome();    showScreen('screen-home');    break;
    case 'treat':   renderTracker(); showScreen('screen-treat');   break;
    case 'apteka':  renderApteka();  showScreen('screen-apteka');  break;
    case 'profil':  renderProfil();  showScreen('screen-profil');  break;
  }
}

// ════════════════════════════════════════
// SCREEN 1 — ONBOARDING
// ════════════════════════════════════════
function setupEventListeners() {
  // Gender buttons
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Start button
  document.getElementById('btn-start').addEventListener('click', handleStart);

  // Tab bar
  document.querySelectorAll('.tab-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.tab));
  });

  // Diagnose button
  document.getElementById('btn-diagnose').addEventListener('click', runDiagnosis);

  // Enter key on onboarding
  document.getElementById('input-age').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleStart();
  });
}

function handleStart() {
  const name = document.getElementById('input-name').value.trim();
  const age  = document.getElementById('input-age').value.trim();
  const genderBtn = document.querySelector('.gender-btn.selected');

  if (!name) { showToast('Iltimos, ismingizni kiriting'); return; }
  if (!age || isNaN(age) || +age < 1 || +age > 120) { showToast('Yoshingizni to\'g\'ri kiriting'); return; }
  if (!genderBtn) { showToast('Jinsni tanlang'); return; }

  patientData = { name, age: +age, gender: genderBtn.dataset.gender };
  savePatient();
  showMainApp();
}

// ════════════════════════════════════════
// SCREEN 2 — SYMPTOMS
// ════════════════════════════════════════
function renderSymptomList() {
  const container = document.getElementById('symptom-systems');
  container.innerHTML = '';

  SYMPTOM_SYSTEMS.forEach(sys => {
    const div = document.createElement('div');
    div.className = 'symptom-system';
    div.innerHTML = `
      <div class="system-header" onclick="toggleSystem('${sys.id}')">
        <div class="system-header-left">
          <div class="system-icon" style="background:${sys.iconBg}">${sys.icon}</div>
          <span class="system-name">${sys.name}</span>
        </div>
        <div class="system-badges">
          <span class="sys-count-badge" id="badge-${sys.id}" style="display:none">0</span>
          <span class="system-chevron">▾</span>
        </div>
      </div>
      <div class="system-body">
        <div class="symptom-grid" id="grid-${sys.id}">
          ${sys.symptoms.map(s => `
            <div class="symptom-chip" data-symptom="${s}" onclick="toggleSymptom(this, '${s}')">
              ${s}
            </div>
          `).join('')}
        </div>
      </div>`;
    container.appendChild(div);
  });
}

function toggleSystem(id) {
  const el = document.querySelector(`#symptom-systems .symptom-system:has(#grid-${id})`);
  if (el) el.classList.toggle('open');
}

function toggleSymptom(chip, symptom) {
  if (selectedSymptoms.has(symptom)) {
    selectedSymptoms.delete(symptom);
    chip.classList.remove('selected');
  } else {
    selectedSymptoms.add(symptom);
    chip.classList.add('selected');
  }
  updateSymptomCounts();
  updateSelectedCount();
}

function updateSymptomCounts() {
  SYMPTOM_SYSTEMS.forEach(sys => {
    const count = sys.symptoms.filter(s => selectedSymptoms.has(s)).length;
    const badge = document.getElementById('badge-' + sys.id);
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  });
}

function updateSelectedCount() {
  const el = document.getElementById('selected-count');
  if (el) {
    el.textContent = `✓ ${selectedSymptoms.size} ta belgi tanlandi`;
    el.style.display = selectedSymptoms.size > 0 ? 'inline-flex' : 'none';
  }
  const btn = document.getElementById('btn-diagnose');
  if (btn) btn.disabled = selectedSymptoms.size === 0;
}

// ════════════════════════════════════════
// SCREEN 3 — DIAGNOSIS (GEMINI)
// ════════════════════════════════════════
async function runDiagnosis() {
  if (selectedSymptoms.size === 0) { showToast('Kamida bitta belgi tanlang'); return; }

  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    showApiKeyModal();
    return;
  }

  hideTabBar();
  showScreen('screen-diagnosis');
  showLoadingState();

  const symptomList = Array.from(selectedSymptoms).join(', ');
  const gender = patientData?.gender === 'erkak' ? 'erkak' : 'ayol';
  const age = patientData?.age || 30;

  const prompt = `Sen tajribali shifokor yordamchisisisan. Bemor quyidagi simptomlarni ko'rsatdi. Faqat yengil (Type 3) kasalliklarni aniqlaysan — kasalxonada yotishni talab qilmaydigan holatlar.

Quyidagi formatda javob ber (JSON formatida):

{
  "tashxis": "Taxminiy tashxis nomi",
  "tashxis_izohi": "Qisqacha tushuntirish (2-3 gap)",
  "ogirlik": "yengil / o'rtacha",
  "davolanish_muddati": "necha kun (masalan: 7 kun)",
  "kasalxona_kerakmi": false,
  "retsept": [
    {
      "dori_nomi": "Dori nomi",
      "doza": "dozasi",
      "qabul_qilish": "qancha marta / kun",
      "vaqt": "ovqatdan oldin/keyin",
      "kun_soni": "necha kun"
    }
  ],
  "parhez_stol": {
    "raqam": 1,
    "nomi": "Parhez stol nomi",
    "tavsiya": "Nima yeyish va nima yemaslik kerak (qisqacha)"
  },
  "umumiy_tavsiyalar": [
    "Tavsiya 1",
    "Tavsiya 2",
    "Tavsiya 3"
  ],
  "kasalxonaga_boring": false,
  "kasalxona_sababi": ""
}

MUHIM: Agar simptomlar og'ir kasallikni ko'rsatsa (insult, infarkt, o'tkir qorin, nafas olish to'xtashi va hokazo), kasalxona_kerakmi = true qilib qo'y va kasalxona_sababi maydonini to'ldir. Bu holda retsept berma.

Faqat JSON qaytargin, boshqa matn yo'q.

Bemor simptomlar: ${symptomList}. Bemor: ${age} yoshli ${gender}.`;

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    if (!resp.ok) {
      const errData = await resp.json();
      throw new Error(errData?.error?.message || `API xatosi: ${resp.status}`);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    renderDiagnosis(result);
  } catch (err) {
    showErrorState(err.message);
  }
}

function showLoadingState() {
  document.getElementById('diagnosis-content').innerHTML = `
    <div class="loading-card">
      <div class="spinner"></div>
      <h3>Tahlil qilinmoqda...</h3>
      <p>Sun'iy intellekt simptomlaringizni tahlil qilmoqda.<br>Biroz kuting...</p>
    </div>`;
}

function showErrorState(msg) {
  document.getElementById('diagnosis-content').innerHTML = `
    <div class="card" style="text-align:center;padding:32px 20px">
      <div style="font-size:48px;margin-bottom:16px">⚠️</div>
      <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">Xatolik yuz berdi</h3>
      <p style="font-size:13px;color:var(--text-3);margin-bottom:20px;line-height:1.5">${msg}</p>
      <button class="btn btn-primary" onclick="runDiagnosis()">🔄 Qayta urinish</button>
      <button class="btn btn-secondary mt-8" onclick="backToSymptoms()">← Orqaga</button>
    </div>`;
}

function renderDiagnosis(data) {
  const content = document.getElementById('diagnosis-content');

  if (data.kasalxona_kerakmi || data.kasalxonaga_boring) {
    content.innerHTML = `
      <div class="emergency-banner">
        <div class="emer-icon">🚨</div>
        <h2>Zudlik bilan kasalxonaga boring!</h2>
        <p>${data.kasalxona_sababi || 'Simptomlaringiz jiddiy tibbiy yordamni talab qiladi.'}</p>
        <a href="tel:103">
          <button class="btn" style="background:white;color:var(--danger);font-size:16px">
            📞 103 — Tez yordam
          </button>
        </a>
      </div>
      <button class="btn btn-secondary mt-12" onclick="backToSymptoms()">← Simptomlarni o'zgartirish</button>`;
    return;
  }

  // Save treatment
  const totalDays = parseInt(data.davolanish_muddati) || 7;
  treatmentData = {
    startDate: new Date().toISOString().slice(0, 10),
    totalDays,
    tashxis: data.tashxis,
    tashxis_izohi: data.tashxis_izohi,
    ogirlik: data.ogirlik,
    retsept: data.retsept || [],
    parhez_stol: data.parhez_stol || {},
    umumiy_tavsiyalar: data.umumiy_tavsiyalar || [],
    dailyLog: {}
  };
  saveTreatment();

  // Render
  let rxHTML = '';
  (data.retsept || []).forEach(rx => {
    rxHTML += `
      <div class="rx-item">
        <div class="rx-name">
          <div class="rx-icon">💊</div>
          ${rx.dori_nomi}
        </div>
        <div class="rx-details">
          <div class="rx-detail">
            <div class="rx-detail-label">Doza</div>
            <div class="rx-detail-val">${rx.doza}</div>
          </div>
          <div class="rx-detail">
            <div class="rx-detail-label">Qabul qilish</div>
            <div class="rx-detail-val">${rx.qabul_qilish}</div>
          </div>
          <div class="rx-detail">
            <div class="rx-detail-label">Vaqt</div>
            <div class="rx-detail-val">${rx.vaqt}</div>
          </div>
          <div class="rx-detail">
            <div class="rx-detail-label">Davomiyligi</div>
            <div class="rx-detail-val">${rx.kun_soni}</div>
          </div>
        </div>
      </div>`;
  });

  let recHTML = (data.umumiy_tavsiyalar || []).map(r =>
    `<li><span class="rec-dot">✓</span>${r}</li>`
  ).join('');

  content.innerHTML = `
    <div class="diagnosis-hero">
      <div class="diag-label">Taxminiy tashxis</div>
      <h2>${data.tashxis}</h2>
      <p>${data.tashxis_izohi}</p>
      <div class="diag-meta">
        <span class="diag-tag">⏱ ${data.davolanish_muddati}</span>
        <span class="diag-tag">📊 ${data.ogirlik}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💊 Retsept — Dorilar</div>
      ${rxHTML || '<p style="color:var(--text-3);font-size:14px">Dori buyurilmadi</p>'}
    </div>

    ${data.parhez_stol ? `
    <div class="diet-card">
      <div class="diet-header">
        <div class="diet-number">${data.parhez_stol.raqam || '?'}</div>
        <div>
          <h3>Parhez Stol №${data.parhez_stol.raqam}</h3>
          <p>${data.parhez_stol.nomi || ''}</p>
        </div>
      </div>
      <div class="diet-text">${data.parhez_stol.tavsiya || ''}</div>
    </div>` : ''}

    <div class="card">
      <div class="card-title">📋 Umumiy tavsiyalar</div>
      <ul class="rec-list">${recHTML}</ul>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
      <button class="btn btn-secondary" onclick="backToSymptoms()">← Orqaga</button>
      <button class="btn btn-primary" onclick="goToTracker()">Davolanishni boshlash →</button>
    </div>

    <p style="font-size:11px;color:var(--text-4);text-align:center;padding:0 10px 16px;line-height:1.5">
      ⚠️ Bu ma'lumot tibbiy maslahat emas. Shifokor ko'rigidan o'tishni tavsiya qilamiz.
    </p>`;
}

function backToSymptoms() {
  document.getElementById('tab-bar').style.display = 'flex';
  navigateTo('home');
}

function goToTracker() {
  document.getElementById('tab-bar').style.display = 'flex';
  navigateTo('treat');
}

// ════════════════════════════════════════
// HOME SCREEN
// ════════════════════════════════════════
function renderHome() {
  const content = document.getElementById('home-content');
  const greeting = getGreeting();

  if (!treatmentData) {
    content.innerHTML = `
      <div class="welcome-home">
        <div class="wh-icon">🏥</div>
        <h3>Xush kelibsiz, ${patientData?.name || ''}!</h3>
        <p>MedIntelga xush kelibsiz. Simptomlaringizni kiriting va sun'iy intellekt yordamida davolanish rejasini oling.</p>
        <button class="btn btn-primary" onclick="startDiagnosis()">
          🔍 Simptomlarni kiritish
        </button>
      </div>
      <div class="quick-actions">
        <div class="quick-action" onclick="startDiagnosis()">
          <div class="qa-icon">🩺</div>
          <h4>Tashxis olish</h4>
          <p>Simptomlarni tanlang</p>
        </div>
        <div class="quick-action" onclick="navigateTo('apteka')">
          <div class="qa-icon">🏪</div>
          <h4>Apteka topish</h4>
          <p>Yaqin aptekallar</p>
        </div>
      </div>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(treatmentData.startDate);
  const now   = new Date(today);
  const dayNum = Math.floor((now - start) / 86400000) + 1;
  const total  = treatmentData.totalDays;
  const done   = dayNum > total;
  const pct    = Math.min(100, Math.round((dayNum / total) * 100));

  const todayLog = treatmentData.dailyLog[today] || {};
  const meds = treatmentData.retsept || [];
  const checkedCount = Object.values(todayLog.medications || {}).filter(v => v).length;

  content.innerHTML = `
    <div class="home-status-card">
      <div class="status-label">${greeting}</div>
      <h3>${treatmentData.tashxis}</h3>
      <p>${done ? 'Davolanish kursi tugadi! 🎉' : `${dayNum}-kun / ${total} kundan · Bugun ${checkedCount}/${meds.length} dori qabul qilindi`}</p>
    </div>

    <div class="card" style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:13px;font-weight:700;color:var(--text-2)">Davolanish jarayoni</span>
        <span style="font-size:13px;font-weight:800;color:var(--teal)">${pct}%</span>
      </div>
      <div class="progress-track" style="background:var(--border)">
        <div class="progress-fill" style="width:${pct}%;background:var(--teal)"></div>
      </div>
    </div>

    <div class="quick-actions">
      <div class="quick-action" onclick="navigateTo('treat')">
        <div class="qa-icon">💊</div>
        <h4>Davolanish</h4>
        <p>${done ? 'Kurs tugadi' : `${dayNum}-kun jarayoni`}</p>
      </div>
      <div class="quick-action" onclick="navigateTo('apteka')">
        <div class="qa-icon">🏪</div>
        <h4>Apteka</h4>
        <p>Dori topish</p>
      </div>
      <div class="quick-action" onclick="startDiagnosis()">
        <div class="qa-icon">🩺</div>
        <h4>Yangi tashxis</h4>
        <p>Simptomlar kiriting</p>
      </div>
      <div class="quick-action" onclick="navigateTo('profil')">
        <div class="qa-icon">👤</div>
        <h4>Profil</h4>
        <p>${patientData?.name}</p>
      </div>
    </div>`;
}

function startDiagnosis() {
  selectedSymptoms.clear();
  document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('selected'));
  updateSelectedCount();
  updateSymptomCounts();
  document.querySelectorAll('.symptom-system').forEach(s => s.classList.remove('open'));
  hideTabBar();
  showScreen('screen-symptoms');
}

// ════════════════════════════════════════
// SCREEN 4 — TRACKER
// ════════════════════════════════════════
function renderTracker() {
  const content = document.getElementById('tracker-content');

  if (!treatmentData) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💊</div>
        <h3>Davolanish rejasi yo'q</h3>
        <p>Avval simptomlaringizni kiriting va AI tashxis olsin.</p>
        <button class="btn btn-primary mt-16" onclick="startDiagnosis()">🩺 Tashxis olish</button>
      </div>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(treatmentData.startDate);
  const now   = new Date(today);
  const dayNum = Math.floor((now - start) / 86400000) + 1;
  const total  = treatmentData.totalDays;

  if (dayNum > total) {
    content.innerHTML = `
      <div class="complete-screen">
        <div class="complete-icon">🎉</div>
        <h2>Davolanish kursi tugadi!</h2>
        <p>Tabriklaymiz! ${total} kunlik davolanish kursini muvaffaqiyatli yakunladingiz.<br><br>Nazorat uchun poliklinikaga boring va shifokorga ko'rining.</p>
        <div style="background:var(--teal-pale);border:1.5px solid var(--teal-light);border-radius:var(--radius);padding:16px;margin-bottom:20px;text-align:left">
          <div style="font-size:13px;font-weight:700;color:var(--teal);margin-bottom:6px">📋 Tavsiya</div>
          <p style="font-size:14px;color:var(--teal-dark);line-height:1.5">Shifokorga ko'rinish uchun mahalliy poliklinikaga murojaat qiling. Tashxisni tasdiqlash va sog'liqni tekshirish muhim.</p>
        </div>
        <button class="btn btn-secondary" onclick="startDiagnosis()">🔄 Yangi tashxis olish</button>
      </div>`;
    return;
  }

  const pct = Math.min(100, Math.round((dayNum / total) * 100));
  const todayLog = treatmentData.dailyLog[today] || { medications: {}, ahvol: null };
  const meds = treatmentData.retsept || [];

  // Check for worsening
  checkWorseStreak();

  let medsHTML = meds.map(rx => {
    const checked = todayLog.medications[rx.dori_nomi] || false;
    return `
      <div class="med-check-item ${checked ? 'checked' : ''}" 
           onclick="toggleMed('${today}', '${rx.dori_nomi}', this)">
        <div class="med-checkbox">${checked ? '✓' : ''}</div>
        <div class="med-check-info">
          <div class="med-check-name">${rx.dori_nomi}</div>
          <div class="med-check-desc">${rx.doza} · ${rx.qabul_qilish} · ${rx.vaqt}</div>
        </div>
      </div>`;
  }).join('');

  const ahvol = todayLog.ahvol;

  content.innerHTML = `
    <div class="tracker-hero">
      <div class="day-label">Davolanish kuni</div>
      <h2>${dayNum}-kun / ${total} kundan</h2>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="progress-label">
        <span>Boshlanish: ${formatDate(treatmentData.startDate)}</span>
        <span>${pct}% tugadi</span>
      </div>
    </div>

    <div class="page-content">
      <div class="card">
        <div class="card-title">💊 Bugungi dorilar</div>
        ${meds.length > 0 ? medsHTML : '<p style="color:var(--text-3);font-size:14px">Dori buyurilmagan</p>'}
      </div>

      <div class="card">
        <div class="card-title">🌡️ Ahvolingiz qanday?</div>
        <div class="ahvol-grid">
          <button class="ahvol-btn ${ahvol === 'yaxshi' ? 'selected-yaxshi' : ''}" 
                  onclick="setAhvol('${today}', 'yaxshi', this.parentNode)">
            <span style="font-size:24px">😊</span>
            Yaxshilashdi
          </button>
          <button class="ahvol-btn ${ahvol === 'xuddi' ? 'selected-xuddi' : ''}"
                  onclick="setAhvol('${today}', 'xuddi', this.parentNode)">
            <span style="font-size:24px">😐</span>
            Xuddi shunday
          </button>
          <button class="ahvol-btn ${ahvol === 'yomon' ? 'selected-yomon' : ''}"
                  onclick="setAhvol('${today}', 'yomon', this.parentNode)">
            <span style="font-size:24px">😟</span>
            Yomonlashdi
          </button>
        </div>
        <div id="worse-alert" style="display:none" class="warn-alert">
          <span class="warn-icon">⚠️</span>
          <p>Ahvolingiz 2 kun ketma-ket yomonlashdi. Iltimos, shifokorga murojaat qiling!</p>
        </div>
      </div>

      ${treatmentData.parhez_stol ? `
      <div class="diet-card">
        <div class="diet-header">
          <div class="diet-number">${treatmentData.parhez_stol.raqam || '?'}</div>
          <div>
            <h3>Parhez Stol №${treatmentData.parhez_stol.raqam}</h3>
            <p>${treatmentData.parhez_stol.nomi || ''}</p>
          </div>
        </div>
        <div class="diet-text">${treatmentData.parhez_stol.tavsiya || ''}</div>
      </div>` : ''}

      ${treatmentData.umumiy_tavsiyalar?.length ? `
      <div class="card">
        <div class="card-title">📋 Tavsiyalar</div>
        <ul class="rec-list">
          ${treatmentData.umumiy_tavsiyalar.map(r => `<li><span class="rec-dot">✓</span>${r}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>`;

  updateWorseAlert();
}

function toggleMed(date, medName, el) {
  if (!treatmentData.dailyLog[date]) {
    treatmentData.dailyLog[date] = { medications: {}, ahvol: null };
  }
  const current = treatmentData.dailyLog[date].medications[medName] || false;
  treatmentData.dailyLog[date].medications[medName] = !current;
  saveTreatment();
  el.classList.toggle('checked', !current);
  const cb = el.querySelector('.med-checkbox');
  cb.textContent = !current ? '✓' : '';
  showToast(!current ? '✓ Qabul qilindi' : 'Bekor qilindi');
}

function setAhvol(date, val, container) {
  if (!treatmentData.dailyLog[date]) {
    treatmentData.dailyLog[date] = { medications: {}, ahvol: null };
  }
  treatmentData.dailyLog[date].ahvol = val;
  saveTreatment();
  container.querySelectorAll('.ahvol-btn').forEach(b => {
    b.className = 'ahvol-btn';
  });
  const map = { yaxshi: 'selected-yaxshi', xuddi: 'selected-xuddi', yomon: 'selected-yomon' };
  const active = container.querySelectorAll('.ahvol-btn')[['yaxshi','xuddi','yomon'].indexOf(val)];
  if (active) active.classList.add(map[val]);
  updateWorseAlert();
  showToast('Ahvol saqlandi');
}

function checkWorseStreak() {
  if (!treatmentData) return;
  const logs = treatmentData.dailyLog;
  const dates = Object.keys(logs).sort().slice(-3);
  worseCount = 0;
  dates.forEach(d => {
    if (logs[d]?.ahvol === 'yomon') worseCount++;
  });
}

function updateWorseAlert() {
  checkWorseStreak();
  const el = document.getElementById('worse-alert');
  if (el) el.style.display = worseCount >= 2 ? 'flex' : 'none';
}

// ════════════════════════════════════════
// SCREEN 5 — APTEKA
// ════════════════════════════════════════
function renderApteka() {
  const list = document.getElementById('apteka-list');
  const meds = treatmentData?.retsept || [];

  if (meds.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:32px 20px">
        <div class="empty-icon">🏪</div>
        <h3>Dorilar ro'yxati yo'q</h3>
        <p>Avval tashxis oling, keyin dorilarni topish mumkin bo'ladi.</p>
      </div>`;
    return;
  }

  list.innerHTML = meds.map(rx => `
    <div class="med-apt-card">
      <div class="med-apt-header">
        <div class="med-apt-icon">💊</div>
        <div>
          <div class="med-apt-name">${rx.dori_nomi}</div>
          <div class="med-apt-dose">${rx.doza} · ${rx.qabul_qilish}</div>
        </div>
      </div>
      <div class="apt-actions">
        <button class="apt-find-btn" onclick="findApteka('${rx.dori_nomi}')">
          📍 Yaqin aptekani topish
        </button>
        <button class="apt-price-btn" onclick="comparePrices('${rx.dori_nomi}')">
          💰 Narx
        </button>
      </div>
    </div>`).join('');
}

function findApteka(medName) {
  const query = encodeURIComponent(`apteka ${medName} yaqinimda`);
  window.open(`https://www.google.com/maps/search/apteka+${encodeURIComponent(medName)}`, '_blank');
}

function comparePrices(medName) {
  showToast('Narx solishtirish tez kunda...');
}

function searchApteka() {
  const query = document.getElementById('apteka-search-input').value.trim();
  if (!query) return;
  window.open(`https://www.google.com/maps/search/apteka+${encodeURIComponent(query)}`, '_blank');
}

// ════════════════════════════════════════
// PROFILE SCREEN
// ════════════════════════════════════════
function renderProfil() {
  const content = document.getElementById('profil-content');
  const p = patientData || {};
  const apiKey = getApiKey();
  const keyDisplay = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY'
    ? `${apiKey.slice(0,8)}...${apiKey.slice(-4)}`
    : 'Kiritilmagan';

  const stats = getStats();

  content.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar">${p.gender === 'erkak' ? '👨' : '👩'}</div>
      <h2>${p.name || 'Bemor'}</h2>
      <p>${p.age || '—'} yosh · ${p.gender === 'erkak' ? 'Erkak' : 'Ayol'}</p>
    </div>

    <div class="page-content">
      <div class="card">
        <div class="card-title">👤 Shaxsiy ma'lumotlar</div>
        <div class="profile-row">
          <span class="profile-row-icon">🧑</span>
          <div>
            <div class="profile-row-label">Ism</div>
            <div class="profile-row-val">${p.name || '—'}</div>
          </div>
        </div>
        <div class="profile-row">
          <span class="profile-row-icon">🎂</span>
          <div>
            <div class="profile-row-label">Yosh</div>
            <div class="profile-row-val">${p.age || '—'}</div>
          </div>
        </div>
        <div class="profile-row">
          <span class="profile-row-icon">⚕️</span>
          <div>
            <div class="profile-row-label">Jins</div>
            <div class="profile-row-val">${p.gender === 'erkak' ? 'Erkak' : 'Ayol'}</div>
          </div>
        </div>
      </div>

      ${treatmentData ? `
      <div class="card">
        <div class="card-title">📊 Davolanish statistikasi</div>
        <div class="profile-row">
          <span class="profile-row-icon">🩺</span>
          <div>
            <div class="profile-row-label">Joriy tashxis</div>
            <div class="profile-row-val">${treatmentData.tashxis}</div>
          </div>
        </div>
        <div class="profile-row">
          <span class="profile-row-icon">📅</span>
          <div>
            <div class="profile-row-label">Boshlanish sanasi</div>
            <div class="profile-row-val">${formatDate(treatmentData.startDate)}</div>
          </div>
        </div>
        <div class="profile-row">
          <span class="profile-row-icon">✅</span>
          <div>
            <div class="profile-row-label">Qabul qilingan kunlar</div>
            <div class="profile-row-val">${stats.checkedDays} / ${treatmentData.totalDays} kun</div>
          </div>
        </div>
      </div>` : ''}

      <div class="api-key-setup">
        <h4>🔑 Gemini API kalit</h4>
        <p>Hozirgi kalit: ${keyDisplay}<br>
        Kalit olish: <strong>aistudio.google.com</strong> → "Get API Key"</p>
        <div class="api-key-input-row">
          <input type="password" id="api-key-field" placeholder="AIza..." value="${(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') ? apiKey : ''}">
          <button onclick="saveApiKey()">Saqlash</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">⚙️ Sozlamalar</div>
        <button class="btn btn-secondary mb-8" onclick="resetTreatment()">🔄 Davolanishni tozalash</button>
        <button class="btn btn-danger" onclick="resetAll()">🗑️ Barcha ma'lumotlarni o'chirish</button>
      </div>

      <p style="font-size:11px;color:var(--text-4);text-align:center;padding:8px 0 20px;line-height:1.6">
        MedIntel v1.0 · Hackathon MVP<br>
        Bu ilova tibbiy maslahat o'rnini bosa olmaydi.
      </p>
    </div>`;
}

function saveApiKey() {
  const key = document.getElementById('api-key-field').value.trim();
  if (!key) { showToast('API kalitni kiriting'); return; }
  localStorage.setItem('medintel_api_key', key);
  showToast('✓ API kalit saqlandi');
  renderProfil();
}

function getApiKey() {
  return localStorage.getItem('medintel_api_key') || (typeof CONFIG !== 'undefined' ? CONFIG.GEMINI_API_KEY : 'YOUR_GEMINI_API_KEY');
}

function resetTreatment() {
  if (!confirm('Joriy davolanish ma\'lumotlarini o\'chirasizmi?')) return;
  localStorage.removeItem('medintel_treatment');
  treatmentData = null;
  showToast('Davolanish tozalandi');
  renderProfil();
}

function resetAll() {
  if (!confirm('Barcha ma\'lumotlarni o\'chirasizmi? Bu qaytarib bo\'lmaydi.')) return;
  localStorage.clear();
  location.reload();
}

function getStats() {
  if (!treatmentData) return { checkedDays: 0 };
  const logs = treatmentData.dailyLog || {};
  let checked = 0;
  Object.values(logs).forEach(log => {
    if (Object.values(log.medications || {}).some(v => v)) checked++;
  });
  return { checkedDays: checked };
}

// ════════════════════════════════════════
// API KEY MODAL
// ════════════════════════════════════════
function showApiKeyModal() {
  const modal = document.getElementById('api-key-modal');
  modal.style.display = 'flex';
}

function closeApiKeyModal() {
  document.getElementById('api-key-modal').style.display = 'none';
}

function saveApiKeyModal() {
  const key = document.getElementById('modal-api-key').value.trim();
  if (!key) { showToast('API kalitni kiriting'); return; }
  localStorage.setItem('medintel_api_key', key);
  closeApiKeyModal();
  showToast('✓ API kalit saqlandi. Tashxis qayta boshlanmoqda...');
  setTimeout(() => runDiagnosis(), 500);
}

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return 'Kechasi xayr 🌙';
  if (h < 12) return 'Xayrli tong ☀️';
  if (h < 17) return 'Xayrli kun 🌤️';
  if (h < 21) return 'Xayrli kech 🌇';
  return 'Xayrli oqshom 🌃';
}