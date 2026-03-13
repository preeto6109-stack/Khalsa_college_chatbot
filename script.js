// ============================================================
//  Khalsa College Patiala — Inquiry Chatbot
//  script.js — Full Featured (Dark Mode + Feedback + Sound + PDF)
// ============================================================

let currentContext = 'main';
let isTyping = false;
let sessionId = 'session_' + Date.now();
let darkMode = localStorage.getItem('kcp-dark') === '1';

// ── College Database ──────────────────────────────────────────
const DB = {
  admission: {
    status: `<div class="resp-card error-msg">
      🚫 <strong>Admission Status: CLOSED</strong> — Session 2025–26<br><br>
      Admissions for Session 2025–26 are now closed.<br>
      For more details, please visit the college in person.<br><br>
      ✨ <em>Stay curious. Stay ready. See you in the next cycle!</em><br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Download Admission Brochure</a>
    </div>`,
    portal: `<div class="resp-card success-msg">
      🌐 <strong>Online Admission Portal</strong><br><br>
      👉 <a href="https://kcpadmissions.in" target="_blank">kcpadmissions.in</a><br><br>
      Register, fill form, upload documents &amp; pay fees — all online!<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Open Portal →</a>
    </div>`,
    process: `<div class="resp-card info-msg">
      📋 <strong>Admission Process</strong><br><br>
      <strong>Step 1:</strong> Visit <a href="https://kcpadmissions.in" target="_blank">kcpadmissions.in</a><br>
      <strong>Step 2:</strong> Register with your basic details<br>
      <strong>Step 3:</strong> Fill the Application Form online<br>
      <strong>Step 4:</strong> Upload required documents as JPG<br>
      <strong>Step 5:</strong> Pay Registration / Admission Fee online<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Start Application →</a>
    </div>`,
    dates: `<div class="resp-card info-msg">
      📅 <strong>Important Admission Dates — 2025-26</strong><br><br>
      Exact dates will be updated soon on the official portal.<br><br>
      ✅ <strong>Online Registration:</strong> Started<br>
      🔗 <a href="https://kcpadmissions.in" target="_blank">Check Portal for Updates</a>
    </div>`,
    eligibility: `<div class="resp-card info-msg">
      ✅ <strong>General Eligibility</strong><br><br>
      🎓 <strong>UG Courses:</strong> 10+2 pass from recognised board<br>
      🎓 <strong>PG Courses:</strong> Graduation with min. 50% marks<br>
      🎓 <strong>M.Sc IT:</strong> Graduation (50%) from recognised university<br>
      🎓 <strong>MBA:</strong> Graduation from recognised university<br><br>
      ℹ️ Exact eligibility varies by course.<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Check Full Eligibility →</a>
    </div>`
  },

  courses: {
    pg: `<div class="resp-card success-msg">
      🎓 <strong>Postgraduate Courses (Approx Fees)</strong><br><br>
      💻 <strong>M.Sc IT / IT Lateral</strong> — ₹80,000–₹1,00,000 | 2 Yrs<br>
      &nbsp;&nbsp;&nbsp;↳ 1st Sem: ₹28,040 &nbsp;|&nbsp; 2nd Sem: ₹12,050<br>
      &nbsp;&nbsp;&nbsp;↳ Eligibility: Graduation (50%)<br><br>
      👗 <strong>M.Sc Fashion Design &amp; Tech</strong> — ₹80,000–₹1,20,000<br>
      🔬 <strong>M.Sc Physics / Chemistry / Geography</strong> — ₹80,000–₹1,00,000<br>
      🌾 <strong>M.Sc Agriculture</strong> — ₹1,00,000–₹1,50,000<br>
      📊 <strong>M.Com</strong> — ₹60,000–₹80,000<br>
      📚 <strong>M.A</strong> (English/History/Pol.Sci/Psychology/Economics/Music) — ₹25,000–₹50,000<br>
      💼 <strong>MBA Leadership Development</strong> — Graduation | 2 Yrs<br>
      🖥️ <strong>PGDCA</strong> — ₹30,000–₹40,000<br><br>
      ℹ️ Fees are approximate. Visit office for exact details.<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Download PG Prospectus →</a>
    </div>`,

    ug: `<div class="resp-card success-msg">
      🎓 <strong>Undergraduate Courses (3–4 Years)</strong><br><br>
      💻 <strong>BCA</strong> — ₹60,000–₹70,000<br>
      📈 <strong>BBA</strong> — ₹60,000–₹70,000<br>
      🧾 <strong>B.Com / B.Com Hons.</strong> — ₹40,000–₹60,000<br>
      🔬 <strong>B.Sc Medical / Non-Medical / CSM</strong> — ₹40,000–₹1,00,000<br>
      🧬 <strong>B.Sc Biotechnology</strong> — ₹70,000–₹1,00,000<br>
      🌾 <strong>B.Sc Agriculture</strong> — ₹1,50,000–₹2,00,000<br>
      📖 <strong>B.A / B.A Hons. English</strong> — ₹35,000–₹60,000<br>
      🛠️ <strong>B.Voc</strong> (Software Dev / Agriculture / Automobile) — ₹70,000–₹90,000<br><br>
      ℹ️ Fees are approximate. Visit office for exact details.<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Download UG Prospectus →</a>
    </div>`,

    diploma: `<div class="resp-card info-msg">
      📜 <strong>Diploma Courses (1 Year)</strong><br><br>
      🖥️ <strong>Computer Hardware &amp; Networking</strong> — ₹15,000–₹25,000<br>
      🌿 <strong>Green House Technology</strong> — ₹15,000–₹25,000<br>
      🇫🇷 <strong>French / Intensive French</strong> — ₹10,000–₹20,000<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Apply for Diploma →</a>
    </div>`,

    certificate: `<div class="resp-card info-msg">
      🏆 <strong>Certificate Courses</strong><br><br>
      📿 Sikh Studies — ₹3,000–₹6,000<br>
      🌾 Agriculture Accounting — ₹3,000–₹6,000<br>
      🌟 Personality Development — ₹3,000–₹6,000<br>
      💻 Office Automation — ₹5,000–₹8,000<br>
      🌐 Web Development — ₹5,000–₹10,000<br>
      🍰 Bakery &amp; Confectionery — ₹5,000–₹10,000<br>
      🗣️ Spoken English — ₹3,000–₹7,000<br>
      🐝 Bee Keeping — ₹3,000–₹6,000<br>
      ☀️ Solar PV System Design — ₹5,000–₹10,000<br>
      🎵 Folk Music / Folk Embroidery — ₹3,000–₹6,000<br>
      🎤 Anchoring — ₹3,000–₹6,000<br>
      ✍️ Creative Writing — ₹3,000–₹6,000<br>
      🔤 Translation Proficiency — ₹3,000–₹6,000<br>
      🧪 Pharmaceutical Chemistry — ₹5,000–₹8,000<br><br>
      📎 <a href="https://kcpadmissions.in" target="_blank">Apply for Certificate →</a>
    </div>`
  },

  fees: `<div class="resp-card success-msg">
    💰 <strong>Fee Structure 2025–26</strong><br><br>
    🔗 Official: <a href="https://www.kcpadmissions.in" target="_blank">kcpadmissions.in</a><br><br>
    <strong>M.Sc IT (Example):</strong><br>
    &nbsp;&nbsp;• 1st Semester: ₹28,040<br>
    &nbsp;&nbsp;• 2nd Semester: ₹12,050<br><br>
    💳 <strong>Payment Methods:</strong><br>
    &nbsp;&nbsp;• Fee Counter / Reception Desk<br>
    &nbsp;&nbsp;• Online Payment on portal<br><br>
    ℹ️ Fees are approximate. Contact college office for exact details.<br><br>
    📎 <a href="https://www.kcpadmissions.in" target="_blank">Download Full Fee Structure PDF →</a>
  </div>`,

  results: `<div class="resp-card info-msg">
    📊 <strong>Results Portal</strong><br><br>
    🔗 <a href="https://kcpresults.in/results" target="_blank">kcpresults.in/results</a><br><br>
    For queries:<br>
    ✉️ kcpexamgrievance@gmail.com<br>
    📞 97804-84847 (Dr. Jaspreet Kaur)<br><br>
    📎 <a href="https://kcpresults.in/results" target="_blank">Check Result Now →</a>
  </div>`,

  datesheet: `<div class="resp-card info-msg">
    📅 <strong>Exam Datesheet</strong><br><br>
    🔗 <a href="https://khalsacollegepatiala.org/datesheets" target="_blank">khalsacollegepatiala.org/datesheets</a><br><br>
    For queries: ✉️ kcpexamgrievance@gmail.com<br><br>
    📎 <a href="https://khalsacollegepatiala.org/datesheets" target="_blank">Download Datesheet PDF →</a>
  </div>`,

  timetable: `<div class="resp-card info-msg">
    ⏰ <strong>Class Timetable</strong><br><br>
    Please visit the <strong>college office</strong> for the latest class timetable.<br><br>
    📍 Badungar Road, Patiala, Punjab – 147001<br>
    ☎️ 0175-2215835
  </div>`,

  faculty: `<div class="resp-card info-msg">
    👩‍🏫 <strong>Key Academic Contacts</strong><br><br>
    👑 <strong>Principal</strong><br>
    &nbsp;&nbsp;Dr. Dharminder Singh Ubha &nbsp;|&nbsp; 📞 98557-11380<br><br>
    🎯 <strong>Controller of Examination</strong><br>
    &nbsp;&nbsp;Dr. Jaspreet Kaur &nbsp;|&nbsp; 📞 97804-84847<br>
    &nbsp;&nbsp;✉️ kcpexamgrievance@gmail.com<br><br>
    🔹 <strong>Deputy Controller</strong><br>
    &nbsp;&nbsp;Dr. Jagjit Singh &nbsp;|&nbsp; 📞 78145-11707<br><br>
    📚 <strong>30+ Departments:</strong><br>
    CS · Agriculture · Commerce · English · Physics · Chemistry ·
    Fashion Design · Biotechnology · Psychology · Music · Geography ·
    Punjabi · History · Pol.Sci · Economics · Fine Arts · Theatre ·
    Hindi · Botany · Zoology · Sociology · Physical Education &amp; more<br><br>
    📎 <a href="https://khalsacollegepatiala.org" target="_blank">View Full Faculty List →</a>
  </div>`,

  contact: `<div class="resp-card success-msg">
    📞 <strong>Contact Khalsa College Patiala</strong><br><br>
    ☎️ <strong>Phone:</strong> 0175-2215835<br>
    ✉️ <strong>Email:</strong> khalsacollegepatiala@gmail.com<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;info@khalsacollegepatiala.org<br><br>
    📍 <strong>Address:</strong><br>
    &nbsp;&nbsp;General Shivdev Singh Diwan Gurbachan Singh<br>
    &nbsp;&nbsp;Khalsa College Patiala,<br>
    &nbsp;&nbsp;Badungar Road, Patiala, Punjab – 147001<br><br>
    🕐 <strong>Office Hours:</strong> Mon–Sat, 9:00 AM – 4:00 PM<br><br>
    📎 <a href="https://khalsacollegepatiala.org" target="_blank">Visit Official Website →</a>
  </div>`,

  library: `<div class="resp-card info-msg">
    📚 <strong>Library</strong><br><br>
    Please visit the <strong>college library</strong> for timings and available facilities.<br><br>
    📍 Located inside the main campus.<br><br>
    📎 <a href="https://khalsacollegepatiala.org" target="_blank">College Website →</a>
  </div>`,

  hostel: `<div class="resp-card info-msg">
    🏠 <strong>Hostel Facilities</strong><br><br>
    For hostel facilities, availability and fees,<br>
    please visit the <strong>college office</strong>.<br><br>
    ☎️ 0175-2215835
  </div>`
};

// ── Keyword Map ───────────────────────────────────────────────
const KEYWORDS = {
  admission:   ['admission','admit','apply','register','registration','enroll','how to join','join','session','2025','open','closed','seat','le sakde','le sakdi'],
  eligibility: ['eligibility','eligible','qualify','qualification','criteria','minimum marks','10+2','who can apply','kitni percentage','percentage chahidi','marks chahide'],
  portal:      ['portal','link','online form','apply online','kcpadmissions','form bharo'],
  process:     ['process','procedure','steps','how to apply','document','upload','kida apply','kive apply'],
  dates:       ['last date','deadline','kado ton','kado tak','admission date','start date','open date','end date'],
  pg:          ['pg','post graduate','postgraduate','msc','m.sc','mcom','m.com','mba','m.b.a','masters','master','pgdca','post graduation'],
  ug:          ['ug','under graduate','undergraduate','bca','bba','bcom','b.com','bsc','b.sc','bvoc','b.voc','bachelor','ba course','b.a'],
  diploma:     ['diploma','hardware','networking','french','greenhouse','green house'],
  certificate: ['certificate','sikh studies','web development','web dev','spoken english','bee keeping','bakery','anchoring','creative writing','folk music','translation','pharmaceutical','short course'],
  courses:     ['course','courses','program','programme','degree','study','stream','available','kaunse course','list of','all course'],
  fees:        ['fee','fees','cost','price','rupee','rupees','₹','amount','charge','how much','kitni','kitne','payment','tuition','semester fee','sem fee','lagdi','lagde','lagna'],
  results:     ['result','results','marks','grade','scorecard','merit','pass','fail','result kado','result kive'],
  datesheet:   ['datesheet','date sheet','exam date','exam schedule','paper date','exam kado','paper schedule','when is exam'],
  timetable:   ['timetable','time table','class schedule','class time','lecture','period','routine','class kado'],
  faculty:     ['teacher','faculty','professor','staff','principal','controller','hod','head','jaspreet','ubha','jagjit','department head','teacher da number'],
  contact:     ['contact','phone','number','call','email','address','location','reach','office','helpline','kithey hai','where is','college address','kithey','kidhar'],
  library:     ['library','books','reading room','lib','kitab'],
  hostel:      ['hostel','accommodation','room','stay','boarding','mess','rehna']
};

// ── Intent Finder ─────────────────────────────────────────────
function findIntent(msg) {
  msg = msg.toLowerCase().trim();
  const priority = [
    'eligibility','portal','process','dates',
    'pg','ug','diploma','certificate',
    'library','hostel','results','datesheet',
    'timetable','faculty','contact','fees',
    'courses','admission'
  ];
  for (const intent of priority) {
    if (KEYWORDS[intent] && KEYWORDS[intent].some(kw => msg.includes(kw))) return intent;
  }
  return 'unknown';
}

// ── Get Response ──────────────────────────────────────────────
function getResponse(intent) {
  const map = {
    admission:   DB.admission.status,
    eligibility: DB.admission.eligibility,
    portal:      DB.admission.portal,
    process:     DB.admission.process,
    dates:       DB.admission.dates,
    courses:     `<div class="resp-card info-msg">📚 <strong>Choose a course category:</strong><br><br>We offer PG, UG, Diploma &amp; Certificate programmes!</div>`,
    pg:          DB.courses.pg,
    ug:          DB.courses.ug,
    diploma:     DB.courses.diploma,
    certificate: DB.courses.certificate,
    fees:        DB.fees,
    results:     DB.results,
    datesheet:   DB.datesheet,
    timetable:   DB.timetable,
    faculty:     DB.faculty,
    contact:     DB.contact,
    library:     DB.library,
    hostel:      DB.hostel,
    unknown: `<div class="resp-card error-msg">
      🤔 <strong>Samajh nahi aaya!</strong><br><br>
      Inhaade baare pooch sakte ho:<br>
      🎓 Admissions &amp; Eligibility<br>
      📚 Courses (PG / UG / Diploma)<br>
      💰 Fees &amp; Payment<br>
      📊 Results &amp; Datesheet<br>
      👩‍🏫 Faculty &amp; Contact<br><br>
      Ya menu thon option choose karo 👇
    </div>`
  };
  return map[intent] || map['unknown'];
}

// ── Menus ─────────────────────────────────────────────────────
const MENUS = {
  main: [
    { label: '🎓 Admission',  fn: () => go('admission') },
    { label: '📚 Courses',    fn: () => goMenu() },
    { label: '💰 Fees',       fn: () => go('fees') },
    { label: '📊 Results',    fn: () => go('results') },
    { label: '📅 Datesheet',  fn: () => go('datesheet') },
    { label: '👩‍🏫 Faculty', fn: () => go('faculty') },
    { label: '📞 Contact',    fn: () => go('contact') },
    { label: '⏰ Timetable',  fn: () => go('timetable') }
  ],
  admission: [
    { label: '📌 Status',      fn: () => go('admission') },
    { label: '✅ Eligibility', fn: () => go('eligibility') },
    { label: '🌐 Portal',      fn: () => go('portal') },
    { label: '📋 Process',     fn: () => go('process') },
    { label: '📅 Dates',       fn: () => go('dates') },
    { label: '🏠 Main Menu',   fn: () => backToMain() }
  ],
  courses: [
    { label: '🎓 PG Courses',  fn: () => go('pg') },
    { label: '📖 UG Courses',  fn: () => go('ug') },
    { label: '📜 Diploma',     fn: () => go('diploma') },
    { label: '🏆 Certificate', fn: () => go('certificate') },
    { label: '🏠 Main Menu',   fn: () => backToMain() }
  ],
  fees: [
    { label: '💰 Fee Details', fn: () => go('fees') },
    { label: '🎓 PG Fees',     fn: () => go('pg') },
    { label: '📖 UG Fees',     fn: () => go('ug') },
    { label: '🌐 Fee Portal',  fn: () => go('portal') },
    { label: '🏠 Main Menu',   fn: () => backToMain() }
  ],
  results: [
    { label: '📊 Results',         fn: () => go('results') },
    { label: '📅 Datesheet',       fn: () => go('datesheet') },
    { label: '👩‍🏫 Exam Contact', fn: () => go('faculty') },
    { label: '🏠 Main Menu',       fn: () => backToMain() }
  ],
  after: [
    { label: '🔍 More Details', fn: () => go('contact') },
    { label: '📞 Contact Info', fn: () => go('contact') },
    { label: '🏠 Main Menu',    fn: () => backToMain() }
  ]
};

// ── Navigation ────────────────────────────────────────────────
function go(intent) {
  typing(() => {
    addBot(getResponse(intent));
    playNotif();
    const menuMap = {
      admission:'admission', eligibility:'admission', portal:'admission',
      process:'admission',   dates:'admission',
      pg:'courses', ug:'courses', diploma:'courses', certificate:'courses', courses:'courses',
      fees:'fees', results:'results', datesheet:'results', unknown:'main'
    };
    showMenu(menuMap[intent] || 'after');
  });
}

function goMenu() {
  typing(() => {
    addBot(`<div class="resp-card info-msg">📚 <strong>Choose a course category:</strong><br><br>We offer PG, UG, Diploma &amp; Certificate programmes!</div>`);
    playNotif();
    showMenu('courses');
  });
}

function backToMain() {
  typing(() => {
    addBot(`<div class="resp-card info-msg">🏠 <strong>Main Menu</strong><br><br>How can I help you today? Choose below 👇</div>`);
    playNotif();
    showMenu('main');
  }, 400);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyDarkMode();
  initChatbot();
  addDarkModeToggle();
});

function initChatbot() {
  currentContext = 'main';
  document.getElementById('chatMessages').innerHTML = '';
  typing(() => {
    addBot(`<div class="resp-card info-msg">
      👋 <strong>Sat Sri Akal!</strong> Welcome to<br>
      <strong>Khalsa College Patiala</strong> Inquiry Chatbot ✨<br><br>
      I can help you with admissions, courses, fees, results, faculty &amp; more.<br><br>
      <em>Type your question or pick an option below!</em>
    </div>`);
    playNotif();
    showMenu('main');
  }, 1000);
}

// ── Message Functions ─────────────────────────────────────────
function addBot(html) {
  hideTyping();
  const box = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = 'message bot-message';
  d.innerHTML = `<div class="message-content">${html}</div>`;
  box.appendChild(d);
  scrollBottom();
  // Show feedback after every 3rd bot message
  if (box.querySelectorAll('.bot-message').length % 3 === 0) {
    setTimeout(() => showFeedback(), 600);
  }
}

function addUser(text) {
  removeMenus();
  const box = document.getElementById('chatMessages');
  const d = document.createElement('div');
  d.className = 'message user-message';
  d.innerHTML = `<div class="message-content">${esc(text)}</div>`;
  box.appendChild(d);
  scrollBottom();
}

function typing(cb, delay = 800) {
  if (isTyping) return;
  isTyping = true;
  const box = document.getElementById('chatMessages');
  const t = document.createElement('div');
  t.id = 'typingIndicator';
  t.className = 'message bot-message';
  t.innerHTML = `<div class="typing-indicator">
    <span class="typing-bot-name">KCP Bot</span>
    <div class="typing-dots"><span></span><span></span><span></span></div>
  </div>`;
  box.appendChild(t);
  scrollBottom();
  setTimeout(() => { hideTyping(); cb(); }, delay);
}

function hideTyping() {
  isTyping = false;
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

// ── Quick Reply Menus ─────────────────────────────────────────
function showMenu(key) {
  removeMenus();
  const items = MENUS[key];
  if (!items) return;
  const box = document.getElementById('chatMessages');
  const wrap = document.createElement('div');
  wrap.className = 'quick-replies-container';
  const inner = document.createElement('div');
  inner.className = 'quick-replies';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.innerHTML = item.label;
    btn.onclick = () => {
      removeMenus();
      addUser(item.label.replace(/[\u{1F300}-\u{1FFFF}]/gu,'').trim());
      item.fn();
    };
    inner.appendChild(btn);
  });
  wrap.appendChild(inner);
  box.appendChild(wrap);
  scrollBottom();
}

function removeMenus() {
  document.querySelectorAll('.quick-replies-container, .feedback-container').forEach(e => e.remove());
}

// ── Send Message ──────────────────────────────────────────────
function sendMessage() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg || isTyping) return;
  inp.value = '';
  addUser(msg);
  typing(() => {
    const intent = findIntent(msg);
    addBot(getResponse(intent));
    playNotif();
    const menuMap = {
      admission:'admission', eligibility:'admission', portal:'admission',
      process:'admission',   dates:'admission',
      pg:'courses', ug:'courses', diploma:'courses', certificate:'courses', courses:'courses',
      fees:'fees', results:'results', datesheet:'results', unknown:'main'
    };
    showMenu(menuMap[intent] || 'after');
  });
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

function clearChat() {
  document.getElementById('chatMessages').innerHTML = '';
  currentContext = 'main';
  initChatbot();
}

// ── FEEDBACK / STAR RATING ────────────────────────────────────
function showFeedback() {
  const box = document.getElementById('chatMessages');
  // Don't show if one already visible
  if (box.querySelector('.feedback-container')) return;
  const wrap = document.createElement('div');
  wrap.className = 'feedback-container';
  wrap.innerHTML = `
    <div class="feedback-card">
      <span class="feedback-label">Rate this response</span>
      <div class="stars" id="star-row">
        ${[1,2,3,4,5].map(i=>`<span class="star" data-val="${i}" onclick="rateStar(${i})">☆</span>`).join('')}
      </div>
      <span class="feedback-skip" onclick="this.closest('.feedback-container').remove()">Skip</span>
    </div>`;
  box.appendChild(wrap);
  scrollBottom();
}

function rateStar(val) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((s, i) => { s.textContent = i < val ? '★' : '☆'; s.classList.toggle('active', i < val); });
  setTimeout(() => {
    const fc = document.querySelector('.feedback-container');
    if (fc) fc.innerHTML = `<div class="feedback-card"><span class="feedback-label">Thanks for rating! ${['😊','😊','🙂','😍','🌸'][val-1]}</span></div>`;
    setTimeout(() => { const fc2 = document.querySelector('.feedback-container'); if(fc2) fc2.remove(); }, 2000);
  }, 600);
}

// ── DARK MODE ─────────────────────────────────────────────────
function addDarkModeToggle() {
  const container = document.querySelector('.chat-header');
  if (!container) return;
  const btn = document.createElement('button');
  btn.id = 'dark-toggle';
  btn.className = 'clear-btn';
  btn.title = 'Toggle Dark Mode';
  btn.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  btn.onclick = toggleDarkMode;
  container.insertBefore(btn, container.querySelector('.clear-btn'));
}

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('kcp-dark', darkMode ? '1' : '0');
  applyDarkMode();
  const btn = document.getElementById('dark-toggle');
  if (btn) btn.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function applyDarkMode() {
  document.body.classList.toggle('dark-mode', darkMode);
}

// ── NOTIFICATION SOUND ────────────────────────────────────────
let soundEnabled = localStorage.getItem('kcp-sound') !== '0';

function playNotif() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.18);
  } catch(e) {}
}

// ── Helpers ───────────────────────────────────────────────────
function scrollBottom() {
  const b = document.getElementById('chatMessages');
  b.scrollTop = b.scrollHeight;
}

function esc(t) {
  return t.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}