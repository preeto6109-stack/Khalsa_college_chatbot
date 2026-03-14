// ============================================================
//  Khalsa College Patiala — "Preet" Chatbot
//  script.js — v5.0 (Flask Server Connected)
//  ✅ Language Toggle Fixed
//  ✅ Personalization (naam + recommendations)
//  ✅ AR/VR 3D Campus Map
//  ✅ Flask Backend at /api/chat
// ============================================================

let isTyping    = false;
let darkMode    = localStorage.getItem('kcp-dark') === '1';
let currentLang = localStorage.getItem('kcp-lang') || 'en';

// ── Server Config ─────────────────────────────────────────────
// Local development pe: 'http://localhost:5000'
// Production (same server) pe: '' (empty = same origin)
// Render/Railway deploy kita hove: 'https://your-app.onrender.com'
const SERVER_URL = 'https://khalsa-college-chatbot-2.onrender.com';  // ← apna URL paste karo jado deploy karo

async function callServer(message) {
    try {
        const res = await fetch(`${SERVER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message:    message,
                lang:       currentLang,
                username:   userName,
                session_id: sessionId
            })
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data; // { response, intent, mode, timestamp }
    } catch(e) {
        console.warn('Server error:', e);
        return null;
    }
}

// Unique session ID
const sessionId = 'sess_' + Date.now();

// ── Personalization ───────────────────────────────────────────
let userName       = localStorage.getItem('kcp-username') || '';
let userInterests  = JSON.parse(localStorage.getItem('kcp-interests') || '[]');
let waitingForName = false;

function saveInterest(intent) {
    const skip = ['unknown','hours','contact','location','whatsapp','main'];
    if (skip.includes(intent)) return;
    if (!userInterests.includes(intent)) {
        userInterests.unshift(intent);
        if (userInterests.length > 5) userInterests.pop();
        localStorage.setItem('kcp-interests', JSON.stringify(userInterests));
    }
}

function getPersonalGreeting() {
    if (!userName) return '';
    const g = { en:`Welcome back, <strong>${userName}</strong>! 🌸`, pa:`ਜੀ ਆਇਆਂ ਨੂੰ, <strong>${userName}</strong>! 🌸`, hi:`वापस आए, <strong>${userName}</strong>! 🌸` };
    return g[currentLang] || g.en;
}

function getRecommendationHTML() {
    if (!userInterests.length || !userName) return '';
    const label = { pg:'PG Courses', ug:'UG Courses', fees:'Fee Details', admission:'Admission Info', results:'Results', faculty:'Faculty', diploma:'Diploma', certificate:'Certificate' }[userInterests[0]];
    if (!label) return '';
    const m = {
        en: `💡 <em>${userName}, last time you asked about <strong>${label}</strong> — want to continue?</em>`,
        pa: `💡 <em>${userName}, ਪਿਛਲੀ ਵਾਰ ਤੁਸੀਂ <strong>${label}</strong> ਬਾਰੇ ਪੁੱਛਿਆ ਸੀ!</em>`,
        hi: `💡 <em>${userName}, पिछली बार <strong>${label}</strong> के बारे में पूछा था!</em>`
    };
    return '<br>' + (m[currentLang] || m.en);
}

// ── Mini Avatar ───────────────────────────────────────────────
const MINI_AVATAR_SVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="40" cy="32" rx="22" ry="24" fill="#3D1F0A"/>
  <ellipse cx="18" cy="44" rx="7" ry="14" fill="#3D1F0A"/>
  <ellipse cx="62" cy="44" rx="7" ry="14" fill="#3D1F0A"/>
  <ellipse cx="40" cy="36" rx="17" ry="18" fill="#FDDBB4"/>
  <ellipse cx="40" cy="20" rx="18" ry="10" fill="#4A2505"/>
  <ellipse cx="33" cy="35" rx="3" ry="3.2" fill="#fff"/>
  <ellipse cx="47" cy="35" rx="3" ry="3.2" fill="#fff"/>
  <circle cx="33.8" cy="35.5" r="1.8" fill="#3D1F0A"/>
  <circle cx="47.8" cy="35.5" r="1.8" fill="#3D1F0A"/>
  <circle cx="34.5" cy="34.5" r="0.6" fill="white"/>
  <circle cx="48.5" cy="34.5" r="0.6" fill="white"/>
  <ellipse cx="28" cy="41" rx="4" ry="2.5" fill="rgba(232,160,176,0.45)"/>
  <ellipse cx="52" cy="41" rx="4" ry="2.5" fill="rgba(232,160,176,0.45)"/>
  <path d="M34 43 Q40 48 46 43" stroke="#C4637A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M18 56 Q25 46 40 48 Q55 46 62 56 Q56 70 40 72 Q24 70 18 56Z" fill="#C4637A"/>
  <path d="M22 58 Q20 68 20 80 L60 80 Q60 68 58 58 Q50 62 40 62 Q30 62 22 58Z" fill="#9B8FC4"/>
</svg>`;

// ── Office Hours ──────────────────────────────────────────────
const OFFICE_HOURS = { open:9, close:16, days:[1,2,3,4,5,6] };

function isOfficeOpen() {
    const n = new Date();
    return OFFICE_HOURS.days.includes(n.getDay()) &&
           n.getHours() >= OFFICE_HOURS.open && n.getHours() < OFFICE_HOURS.close;
}

function getOfficeStatusHTML() {
    const open = isOfficeOpen(), now = new Date();
    const t = now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if (open) return `<span class="status-badge open">🟢 Office Open</span><span class="status-time">${days[now.getDay()]} · ${t} · Closes 4:00 PM</span>`;
    const next = (now.getDay()===0||(now.getDay()===6&&now.getHours()>=16)) ? 'Opens Monday 9:00 AM'
               : now.getHours()>=16 ? 'Opens tomorrow 9:00 AM' : 'Opens today 9:00 AM';
    return `<span class="status-badge closed">🔴 Office Closed</span><span class="status-time">${days[now.getDay()]} · ${t} · ${next}</span>`;
}

// ── Language Strings ──────────────────────────────────────────
const LANG = {
    en: {
        askName:    `😊 Hi! I'm <strong>Preet</strong> 🌸<br><br>Before we start — <strong>what's your name?</strong><br><small><em>Type your name so I can assist you better!</em></small>`,
        nameSaved:  (n) => `🌸 Nice to meet you, <strong>${n}</strong>! How can I help you today? 👇`,
        welcome:    (x)  => `👋 <strong>Sat Sri Akal!</strong> I'm <strong>Preet</strong>! 🌸<br><br>${x}Ask about admissions, courses, fees, results &amp; more!<br><br><em>Pick from the menu 👇</em>`,
        mainMenu:   '🏠 <strong>Main Menu</strong><br><br>How can I help you today? 👇',
        unknown:    `🤔 I can help with:<br>🎓 Admissions · 📚 Courses · 💰 Fees<br>📊 Results · 👩‍🏫 Faculty<br><br>Choose from menu 👇`,
        aiThinking: '🤖 Preet is thinking...',
        aiError:    `😊 Please contact: ☎️ 0175-2215835`,
        serverOff:  `⚠️ <strong>Server offline!</strong><br>Running in offline mode. Some features limited.<br>☎️ 0175-2215835`
    },
    pa: {
        askName:    `😊 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ <strong>ਪ੍ਰੀਤ</strong> ਹਾਂ 🌸<br><br><strong>ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?</strong><br><small><em>ਨਾਮ ਲਿਖੋ ਤਾਂ ਬਿਹਤਰ ਮਦਦ ਕਰ ਸਕਾਂ!</em></small>`,
        nameSaved:  (n) => `🌸 ਜੀ ਆਇਆਂ ਨੂੰ, <strong>${n}</strong>! 👇`,
        welcome:    (x)  => `👋 <strong>ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!</strong> ਮੈਂ <strong>ਪ੍ਰੀਤ</strong> ਹਾਂ! 🌸<br><br>${x}ਕੁਝ ਵੀ ਪੁੱਛੋ!<br><br><em>ਹੇਠਾਂ ਚੁਣੋ 👇</em>`,
        mainMenu:   '🏠 <strong>ਮੁੱਖ ਮੀਨੂ</strong><br><br>ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ? 👇',
        unknown:    `🤔 <strong>ਸਮਝ ਨਹੀਂ ਆਇਆ!</strong><br><br>ਮੀਨੂ ਤੋਂ ਚੁਣੋ 👇`,
        aiThinking: '🤖 ਪ੍ਰੀਤ ਸੋਚ ਰਹੀ ਹੈ...',
        aiError:    `😊 ☎️ 0175-2215835`,
        serverOff:  `⚠️ <strong>Server ਬੰਦ ਹੈ!</strong><br>Offline mode ਵਿੱਚ ਚੱਲ ਰਿਹਾ ਹੈ।`
    },
    hi: {
        askName:    `😊 नमस्ते! मैं <strong>प्रीत</strong> हूं 🌸<br><br><strong>आपका नाम क्या है?</strong><br><small><em>नाम लिखें ताकि बेहतर मदद कर सकूं!</em></small>`,
        nameSaved:  (n) => `🌸 मिलकर खुशी हुई, <strong>${n}</strong>! 👇`,
        welcome:    (x)  => `👋 <strong>सत श्री अकाल!</strong> मैं <strong>प्रीत</strong> हूं! 🌸<br><br>${x}कुछ भी पूछें!<br><br><em>नीचे से चुनें 👇</em>`,
        mainMenu:   '🏠 <strong>मुख्य मेनू</strong><br><br>कैसे मदद करूं? 👇',
        unknown:    `🤔 <strong>समझ नहीं आया!</strong><br><br>मेनू से चुनें 👇`,
        aiThinking: '🤖 प्रीत सोच रही है...',
        aiError:    `😊 ☎️ 0175-2215835`,
        serverOff:  `⚠️ <strong>Server बंद है!</strong><br>Offline mode में चल रहा है।`
    }
};

// ── Offline College Database (fallback) ──────────────────────
const DB = {
    admission: {
        status:`<div class="resp-card error-msg">🚫 <strong>Admission: CLOSED</strong> — 2025–26<br><br>📎 <a href="https://kcpadmissions.in" target="_blank">Download Brochure →</a></div>`,
        eligibility:`<div class="resp-card info-msg">✅ <strong>Eligibility</strong><br><br>🎓 UG: 10+2 from recognised board<br>🎓 PG: Graduation min. 50%<br><br>📎 <a href="https://kcpadmissions.in" target="_blank">Full Details →</a></div>`,
        portal:`<div class="resp-card success-msg">🌐 <a href="https://kcpadmissions.in" target="_blank">kcpadmissions.in</a><br>Register · Fill Form · Upload · Pay</div>`,
        process:`<div class="resp-card info-msg">📋 Visit <a href="https://kcpadmissions.in" target="_blank">kcpadmissions.in</a> → Register → Fill Form → Upload docs → Pay fee</div>`,
        dates:`<div class="resp-card info-msg">📅 Dates updated on portal soon.<br>🔗 <a href="https://kcpadmissions.in" target="_blank">Check Portal →</a></div>`
    },
    courses:{
        pg:`<div class="resp-card success-msg">🎓 <strong>PG Courses</strong><br><br>💻 M.Sc IT · 👗 Fashion · 🔬 Science · 🌾 Agriculture · 📊 M.Com · 📚 M.A · 💼 MBA · 🖥️ PGDCA<br><br>📎 <a href="https://kcpadmissions.in" target="_blank">Prospectus →</a></div>`,
        ug:`<div class="resp-card success-msg">🎓 <strong>UG Courses</strong><br><br>💻 BCA · 📈 BBA · 🧾 B.Com · 🔬 B.Sc · 🌾 B.Sc Agri · 📖 B.A · 🛠️ B.Voc<br><br>📎 <a href="https://kcpadmissions.in" target="_blank">Prospectus →</a></div>`,
        diploma:`<div class="resp-card info-msg">📜 Computer Hardware · Green House · French — ₹10K–₹25K</div>`,
        certificate:`<div class="resp-card info-msg">🏆 14+ Certificate Courses — ₹3K–₹10K each</div>`
    },
    fees:`<div class="resp-card success-msg">💰 M.Sc IT: ₹28,040/sem · BCA/BBA: ₹60K–₹70K/yr<br>📎 <a href="https://kcpadmissions.in" target="_blank">Full Fee PDF →</a></div>`,
    results:`<div class="resp-card info-msg">📊 <a href="https://kcpresults.in/results" target="_blank">kcpresults.in/results</a><br>📞 97804-84847</div>`,
    datesheet:`<div class="resp-card info-msg">📅 <a href="https://khalsacollegepatiala.org/datesheets" target="_blank">View Datesheets →</a></div>`,
    timetable:`<div class="resp-card info-msg">⏰ Visit college office.<br>☎️ 0175-2215835</div>`,
    faculty:`<div class="resp-card info-msg">👑 Principal: Dr. Dharminder Singh Ubha · 98557-11380<br>🎯 Controller: Dr. Jaspreet Kaur · 97804-84847</div>`,
    contact:`<div class="resp-card success-msg">📞 0175-2215835<br>✉️ khalsacollegepatiala@gmail.com<br>📍 Badungar Road, Patiala<br>🗺️ <a href="https://maps.google.com/?q=Khalsa+College+Patiala" target="_blank">Maps →</a></div>`,
    location:`<div class="resp-card info-msg">📍 Badungar Road, Patiala – 147001<br>🗺️ <a href="https://maps.google.com/?q=Khalsa+College+Patiala" target="_blank">Open Maps →</a><br><br><button class="ar-btn" onclick="openARMap()">🥽 View 3D Campus</button></div>`,
    whatsapp:`<div class="resp-card success-msg">📱 <a href="https://wa.me/911752215835" target="_blank"><strong>💬 Open WhatsApp →</strong></a><br>☎️ 0175-2215835</div>`,
    library:`<div class="resp-card info-msg">📚 Visit campus library.<br>📎 <a href="https://khalsacollegepatiala.org" target="_blank">College Website →</a></div>`,
    hostel:`<div class="resp-card info-msg">🏠 Visit office for hostel details.<br>☎️ 0175-2215835</div>`
};

// ── Keywords (offline fallback) ───────────────────────────────
const KEYWORDS = {
    admission:   ['admission','admit','apply','register','join','2025','closed','seat','daakhla'],
    eligibility: ['eligibility','eligible','qualify','criteria','marks chahide'],
    portal:      ['portal','online form','kcpadmissions','form bharo'],
    process:     ['process','steps','how to apply','kive apply'],
    dates:       ['last date','deadline','kado tak','admission date'],
    pg:          ['pg','postgraduate','msc','mcom','mba','masters','pgdca'],
    ug:          ['ug','undergraduate','bca','bba','bcom','bsc','bvoc','bachelor'],
    diploma:     ['diploma','hardware','networking','french','greenhouse'],
    certificate: ['certificate','sikh studies','web development','spoken english','bakery'],
    courses:     ['course','courses','program','degree','study','kaunse course'],
    fees:        ['fee','fees','cost','rupee','₹','how much','kitni','payment','lagdi'],
    results:     ['result','results','marks','grade','pass','fail'],
    datesheet:   ['datesheet','date sheet','exam date','exam kado'],
    timetable:   ['timetable','time table','class schedule','class kado'],
    faculty:     ['teacher','faculty','principal','controller','jaspreet','ubha'],
    contact:     ['contact','phone','number','email','address','kithey hai'],
    location:    ['map','maps','direction','how to reach','location','kive jana'],
    whatsapp:    ['whatsapp','whats app','wa'],
    library:     ['library','books','kitab'],
    hostel:      ['hostel','accommodation','stay','boarding'],
    hours:       ['timing','office time','open time','kado khulda','office hours'],
    ar:          ['3d','ar','vr','campus map','virtual','tour','3d map']
};

function findIntent(msg) {
    msg = msg.toLowerCase().trim();
    const priority = ['ar','eligibility','portal','process','dates','pg','ug','diploma','certificate',
                      'library','hostel','results','datesheet','timetable','faculty','location',
                      'whatsapp','hours','contact','fees','courses','admission'];
    for (const intent of priority) {
        if (KEYWORDS[intent]?.some(kw => msg.includes(kw))) return intent;
    }
    return 'unknown';
}

function getOfflineResponse(intent) {
    const hoursCard = `<div class="resp-card ${isOfficeOpen()?'success-msg':'error-msg'}">🕐 ${getOfficeStatusHTML()}<br><br>Mon–Sat · 9AM–4PM · ☎️ 0175-2215835</div>`;
    if (intent==='admission')   return DB.admission.status;
    if (intent==='eligibility') return DB.admission.eligibility;
    if (intent==='portal')      return DB.admission.portal;
    if (intent==='process')     return DB.admission.process;
    if (intent==='dates')       return DB.admission.dates;
    if (intent==='pg')          return DB.courses.pg;
    if (intent==='ug')          return DB.courses.ug;
    if (intent==='diploma')     return DB.courses.diploma;
    if (intent==='certificate') return DB.courses.certificate;
    if (intent==='courses')     return `<div class="resp-card info-msg">📚 PG · UG · Diploma · Certificate</div>`;
    if (intent==='fees')        return DB.fees;
    if (intent==='results')     return DB.results;
    if (intent==='datesheet')   return DB.datesheet;
    if (intent==='timetable')   return DB.timetable;
    if (intent==='faculty')     return DB.faculty;
    if (intent==='contact')     return DB.contact;
    if (intent==='location')    return DB.location;
    if (intent==='whatsapp')    return DB.whatsapp;
    if (intent==='library')     return DB.library;
    if (intent==='hostel')      return DB.hostel;
    if (intent==='hours')       return hoursCard;
    if (intent==='ar')          { setTimeout(openARMap,400); return `<div class="resp-card info-msg">🥽 3D Campus Map kholdi haan!</div>`; }
    return null;
}

// ── Menus ─────────────────────────────────────────────────────
const MENUS = {
    main:[
        {label:'🎓 Admission',   fn:()=>go('admission')},
        {label:'📚 Courses',     fn:()=>goMenu()},
        {label:'💰 Fees',        fn:()=>go('fees')},
        {label:'📊 Results',     fn:()=>go('results')},
        {label:'📅 Datesheet',   fn:()=>go('datesheet')},
        {label:'👩‍🏫 Faculty', fn:()=>go('faculty')},
        {label:'📞 Contact',     fn:()=>go('contact')},
        {label:'⏰ Timetable',   fn:()=>go('timetable')},
        {label:'🕐 Office Hours',fn:()=>go('hours')},
        {label:'📍 Location',    fn:()=>go('location')},
        {label:'🥽 3D Campus',   fn:()=>openARMap()}
    ],
    admission:[
        {label:'📌 Status',     fn:()=>go('admission')},
        {label:'✅ Eligibility',fn:()=>go('eligibility')},
        {label:'🌐 Portal',     fn:()=>go('portal')},
        {label:'📋 Process',    fn:()=>go('process')},
        {label:'📅 Dates',      fn:()=>go('dates')},
        {label:'🏠 Main Menu',  fn:()=>backToMain()}
    ],
    courses:[
        {label:'🎓 PG Courses', fn:()=>go('pg')},
        {label:'📖 UG Courses', fn:()=>go('ug')},
        {label:'📜 Diploma',    fn:()=>go('diploma')},
        {label:'🏆 Certificate',fn:()=>go('certificate')},
        {label:'🏠 Main Menu',  fn:()=>backToMain()}
    ],
    fees:[
        {label:'💰 Fee Details',fn:()=>go('fees')},
        {label:'🎓 PG Fees',   fn:()=>go('pg')},
        {label:'📖 UG Fees',   fn:()=>go('ug')},
        {label:'🏠 Main Menu', fn:()=>backToMain()}
    ],
    results:[
        {label:'📊 Results',         fn:()=>go('results')},
        {label:'📅 Datesheet',       fn:()=>go('datesheet')},
        {label:'👩‍🏫 Exam Contact',fn:()=>go('faculty')},
        {label:'🏠 Main Menu',       fn:()=>backToMain()}
    ],
    after:[
        {label:'📞 Contact', fn:()=>go('contact')},
        {label:'💬 WhatsApp',fn:()=>go('whatsapp')},
        {label:'📍 Location',fn:()=>go('location')},
        {label:'🏠 Main Menu',fn:()=>backToMain()}
    ]
};

const MENU_MAP = {
    admission:'admission',eligibility:'admission',portal:'admission',process:'admission',dates:'admission',
    pg:'courses',ug:'courses',diploma:'courses',certificate:'courses',courses:'courses',
    fees:'fees',results:'results',datesheet:'results',
    location:'after',whatsapp:'after',hours:'after',ar:'after',unknown:'main'
};

// ── Navigation ────────────────────────────────────────────────
function go(intent) {
    isTyping = false;
    saveInterest(intent);
    botReply(() => {
        const html = getOfflineResponse(intent);
        addBot(html || `<div class="resp-card info-msg">📚 Choose a category!</div>`, false, 'rule');
        playNotif();
        showMenu(MENU_MAP[intent] || 'after');
    });
}

function goMenu() {
    isTyping = false;
    botReply(() => {
        addBot(`<div class="resp-card info-msg">📚 <strong>Choose a category:</strong><br><br>PG · UG · Diploma · Certificate</div>`, false, 'rule');
        playNotif();
        showMenu('courses');
    });
}

function backToMain() {
    isTyping = false;
    botReply(() => {
        addBot(`<div class="resp-card info-msg">${LANG[currentLang].mainMenu}</div>`, false, 'rule');
        playNotif();
        showMenu('main');
    }, 400);
}

// ── botReply ──────────────────────────────────────────────────
function botReply(cb, delay=700) {
    if (isTyping) return;
    isTyping = true;
    const box = document.getElementById('chatMessages');
    const t = document.createElement('div');
    t.id = 'typingIndicator'; t.className = 'message bot-message';
    t.innerHTML = `<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="typing-indicator">
            <span class="typing-bot-name">Preet</span>
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>`;
    box.appendChild(t); scrollBottom();
    setTimeout(() => { hideTypingIndicator(); cb(); }, delay);
}

function hideTypingIndicator() {
    isTyping = false;
    document.getElementById('typingIndicator')?.remove();
    document.querySelector('.input-wrapper')?.classList.remove('ai-thinking');
}

// ── Send Message ──────────────────────────────────────────────
function sendMessage() {
    const inp = document.getElementById('chatInput');
    const msg = inp.value.trim();
    if (!msg) return;
    isTyping = false;

    // Name collection
    if (waitingForName) {
        waitingForName = false;
        userName = msg.trim().split(' ')[0];
        localStorage.setItem('kcp-username', userName);
        inp.value = '';
        addUser(msg);
        botReply(() => {
            addBot(`<div class="resp-card success-msg">${LANG[currentLang].nameSaved(userName)}</div>`, false, 'rule');
            playNotif();
            showMenu('main');
        });
        return;
    }

    inp.value = '';
    addUser(msg);

    const intent = findIntent(msg);

    // Known intent → try server first, fallback to offline
    if (intent !== 'unknown') {
        saveInterest(intent);
        // Try server
        setAvatarState('thinking');
        isTyping = true;
        showLoadingIndicator();

        callServer(msg).then(data => {
            hideTypingIndicator();
            setAvatarState('talking');

            if (data && data.response) {
                // Server replied
                const isAI = data.mode === 'ai';
                addBot(`<div class="resp-card ${isAI?'info-msg':'success-msg'}">${data.response}</div>`, isAI, data.mode);
            } else {
                // Server offline — use offline DB
                const html = getOfflineResponse(intent);
                addBot(html || `<div class="resp-card info-msg">📚 Choose below!</div>`, false, 'offline');
            }
            playNotif();
            setTimeout(() => setAvatarState(''), 1500);
            showMenu(MENU_MAP[intent] || 'after');
        }).catch(() => {
            hideTypingIndicator();
            setAvatarState('');
            const html = getOfflineResponse(intent);
            addBot(html || `<div class="resp-card error-msg">${LANG[currentLang].serverOff}</div>`, false, 'offline');
            showMenu(MENU_MAP[intent] || 'after');
        });

    } else {
        // Unknown → send to server (AI)
        handleUnknown(msg);
    }
}

function showLoadingIndicator() {
    const box = document.getElementById('chatMessages');
    const t = document.createElement('div');
    t.id = 'typingIndicator'; t.className = 'message bot-message';
    t.innerHTML = `<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="typing-indicator">
            <span class="typing-bot-name">🤖 ${LANG[currentLang].aiThinking}</span>
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>`;
    box.appendChild(t);
    document.querySelector('.input-wrapper')?.classList.add('ai-thinking');
    scrollBottom();
}

function handleUnknown(msg) {
    setAvatarState('thinking');
    isTyping = true;
    showLoadingIndicator();

    callServer(msg).then(data => {
        hideTypingIndicator();
        setAvatarState('talking');

        if (data && data.response) {
            const isAI = data.mode === 'ai';
            addBot(`<div class="resp-card info-msg">${data.response}</div>`, isAI, data.mode);
        } else {
            addBot(`<div class="resp-card error-msg">${smartFallback(msg)}</div>`, false, 'offline');
        }
        playNotif();
        setTimeout(() => setAvatarState(''), 1500);
        showMenu('main');
    }).catch(() => {
        hideTypingIndicator();
        setAvatarState('');
        addBot(smartFallback(msg), false, 'offline');
        showMenu('main');
    });
}

function smartFallback(msg) {
    const m = msg.toLowerCase();
    if (m.match(/hello|hi|sat sri akal|ssa/)) return `<div class="resp-card info-msg">👋 <strong>Sat Sri Akal${userName?', '+userName:''}!</strong> 🌸</div>`;
    if (m.match(/thank|shukriya/)) return `<div class="resp-card success-msg">🌸 Bahut shukriya${userName?', '+userName:''}! 😊</div>`;
    if (m.match(/bye|goodbye/)) return `<div class="resp-card info-msg">👋 Sat Sri Akal! Preet ithe hi hai! 🌸</div>`;
    if (m.match(/canteen|food/)) return `<div class="resp-card info-msg">🍽️ Campus vich canteen hai! ☎️ 0175-2215835</div>`;
    if (m.match(/sports|nss|ncc/)) return `<div class="resp-card info-msg">🏆 NSS, NCC, Sports sab available! <a href="https://khalsacollegepatiala.org" target="_blank">Details →</a></div>`;
    return `<div class="resp-card error-msg">${LANG[currentLang].unknown}</div>`;
}

// ── Avatar ────────────────────────────────────────────────────
function setAvatarState(state) {
    const av = document.getElementById('headerAvatar');
    if (!av) return;
    av.classList.remove('thinking','talking');
    if (state) av.classList.add(state);
}

// ── addBot / addUser ──────────────────────────────────────────
// mode: 'ai' | 'rule' | 'offline'
function addBot(html, isAI, mode) {
    const box = document.getElementById('chatMessages');
    const d = document.createElement('div');
    d.className = 'message bot-message';
    const badge = isAI ? '<div class="ai-badge">✨ AI · Preet</div>'
                : mode==='offline' ? '<div class="offline-badge">📵 Offline</div>'
                : '';
    d.innerHTML = `<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="message-content">${badge}${html}</div>`;
    box.appendChild(d);
    scrollBottom();
    setAvatarState('talking');
    setTimeout(() => setAvatarState(''), 1500);
    if (box.querySelectorAll('.bot-message').length % 3 === 0) setTimeout(showFeedback, 700);
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

// ── Menus ─────────────────────────────────────────────────────
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
        btn.addEventListener('click', () => {
            isTyping = false;
            removeMenus();
            addUser(item.label.replace(/[^\w\s·\-]/g,'').trim() || item.label);
            item.fn();
        });
        inner.appendChild(btn);
    });
    wrap.appendChild(inner);
    box.appendChild(wrap);
    scrollBottom();
}

function removeMenus() {
    document.querySelectorAll('.quick-replies-container,.feedback-container').forEach(e=>e.remove());
}

// ── Language Toggle — FIXED ───────────────────────────────────
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kcp-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    // Restart chatbot in new language
    isTyping = false;
    document.getElementById('chatMessages').innerHTML = '';
    removeMenus();
    setTimeout(startChatFlow, 200);
}

// ── Status Bar ────────────────────────────────────────────────
function initStatusBar() {
    const bar = document.getElementById('office-status-bar');
    if (!bar) return;
    bar.innerHTML = getOfficeStatusHTML();
    setInterval(() => { bar.innerHTML = getOfficeStatusHTML(); }, 60000);
}

// ── Dark Mode ─────────────────────────────────────────────────
function applyDarkMode() {
    document.body.classList.toggle('dark-mode', darkMode);
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}
function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('kcp-dark', darkMode ? '1' : '0');
    applyDarkMode();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === currentLang);
    });
    initStatusBar();
    initChatbot();
});

function initChatbot() {
    isTyping = false;
    document.getElementById('chatMessages').innerHTML = '';
    startChatFlow();
}

function startChatFlow() {
    if (!userName) {
        waitingForName = true;
        botReply(() => {
            addBot(`<div class="resp-card info-msg">${LANG[currentLang].askName}</div>`, false, 'rule');
            playNotif();
        }, 800);
    } else {
        const extra = getPersonalGreeting() + getRecommendationHTML();
        botReply(() => {
            addBot(`<div class="resp-card info-msg">${LANG[currentLang].welcome(extra ? extra+'<br><br>' : '')}</div>`, false, 'rule');
            playNotif();
            showMenu('main');
        }, 800);
    }
}

function clearChat() {
    isTyping = false;
    userName = '';
    localStorage.removeItem('kcp-username');
    document.getElementById('chatMessages').innerHTML = '';
    startChatFlow();
}

function handleKeyPress(e) { if (e.key === 'Enter') sendMessage(); }

// ── Feedback ──────────────────────────────────────────────────
function showFeedback() {
    const box = document.getElementById('chatMessages');
    if (box.querySelector('.feedback-container')) return;
    const wrap = document.createElement('div');
    wrap.className = 'feedback-container';
    wrap.innerHTML = `<div class="feedback-card">
        <span class="feedback-label">Rate Preet's reply</span>
        <div class="stars">${[1,2,3,4,5].map(i=>`<span class="star" onclick="rateStar(${i})">☆</span>`).join('')}</div>
        <span class="feedback-skip" onclick="this.closest('.feedback-container').remove()">Skip</span>
    </div>`;
    box.appendChild(wrap); scrollBottom();
}

function rateStar(val) {
    document.querySelectorAll('.star').forEach((s,i)=>{ s.textContent=i<val?'★':'☆'; s.classList.toggle('active',i<val); });
    setTimeout(()=>{
        const fc=document.querySelector('.feedback-container');
        if(fc) fc.innerHTML=`<div class="feedback-card"><span class="feedback-label">Thanks! ${['😊','😊','🙂','😍','🌸'][val-1]}</span></div>`;
        setTimeout(()=>document.querySelector('.feedback-container')?.remove(),2000);
    },600);
}

// ── Sound ─────────────────────────────────────────────────────
function playNotif() {
    if (localStorage.getItem('kcp-sound') === '0') return;
    try {
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880,ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660,ctx.currentTime+0.1);
        gain.gain.setValueAtTime(0.07,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.18);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.18);
    } catch(e){}
}

// ── Helpers ───────────────────────────────────────────────────
function scrollBottom() { const b=document.getElementById('chatMessages'); if(b) b.scrollTop=b.scrollHeight; }
function esc(t) { return String(t).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

// ════════════════════════════════════════════════════════════════
//  AR / 3D Campus Map (Three.js)
// ════════════════════════════════════════════════════════════════
function openARMap() {
    document.getElementById('ar-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'ar-overlay';
    overlay.innerHTML = `
    <div class="ar-modal">
        <div class="ar-header">
            <span>🏛️ Khalsa College Patiala — 3D Campus</span>
            <div class="ar-controls-hint">🖱️ Drag to rotate · Scroll to zoom</div>
            <button class="ar-close" onclick="closeARMap()">✕</button>
        </div>
        <canvas id="ar-canvas"></canvas>
        <div class="ar-legend">
            <div class="ar-legend-item"><span style="background:#C4637A"></span> Main Block</div>
            <div class="ar-legend-item"><span style="background:#9B8FC4"></span> Library</div>
            <div class="ar-legend-item"><span style="background:#4A9B7F"></span> Science Labs</div>
            <div class="ar-legend-item"><span style="background:#C4A84A"></span> Sports Ground</div>
            <div class="ar-legend-item"><span style="background:#7A9BC4"></span> Hostel</div>
            <div class="ar-legend-item"><span style="background:#C47A4A"></span> Admin Block</div>
        </div>
        <div class="ar-tooltip" id="ar-tooltip"></div>
    </div>`;
    document.body.appendChild(overlay);
    window.THREE ? initThreeScene() : loadThree();
}

function loadThree() {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = initThreeScene;
    document.head.appendChild(s);
}

function closeARMap() {
    document.getElementById('ar-overlay')?.remove();
    if (window._arAnimId) cancelAnimationFrame(window._arAnimId);
    if (window._arRenderer) { window._arRenderer.dispose(); window._arRenderer = null; }
}

function initThreeScene() {
    const canvas = document.getElementById('ar-canvas');
    if (!canvas) return;
    const W = canvas.clientWidth || 460, H = canvas.clientHeight || 320;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled = true; renderer.setClearColor(0x0d1117,1);
    window._arRenderer = renderer;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55,W/H,0.1,1000);
    camera.position.set(0,18,28); camera.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffeedd,0.6));
    const dir = new THREE.DirectionalLight(0xfff8f0,1.2);
    dir.position.set(15,25,15); dir.castShadow=true; scene.add(dir);
    scene.add(new THREE.HemisphereLight(0x9B8FC4,0x4A2D35,0.4));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60,60), new THREE.MeshLambertMaterial({color:0x1a3a1a}));
    ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
    scene.add(new THREE.GridHelper(60,30,0x2a5a2a,0x2a5a2a));
    const buildings = [
        {name:'Main Academic Block', pos:[0,0,0],    size:[12,6,8],  color:0xC4637A},
        {name:'Library',             pos:[-10,0,6],  size:[6,4,6],   color:0x9B8FC4},
        {name:'Science Labs',        pos:[10,0,6],   size:[7,3.5,6], color:0x4A9B7F},
        {name:'Sports Ground',       pos:[0,0,14],   size:[14,0.3,8],color:0xC4A84A},
        {name:'Hostel Block',        pos:[-12,0,-6], size:[6,5,8],   color:0x7A9BC4},
        {name:'Admin Block',         pos:[10,0,-6],  size:[6,4,6],   color:0xC47A4A},
        {name:'Canteen',             pos:[0,0,-10],  size:[5,2.5,4], color:0xB5ABDA},
        {name:'Parking',             pos:[14,0,0],   size:[8,0.2,6], color:0x555555}
    ];
    const meshes = [];
    buildings.forEach(b => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...b.size), new THREE.MeshLambertMaterial({color:b.color}));
        mesh.position.set(b.pos[0], b.pos[1]+b.size[1]/2, b.pos[2]);
        mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.name=b.name;
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...b.size)), new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.12})));
        scene.add(mesh); meshes.push(mesh);
    });
    // Trees
    [[-6,0,10],[6,0,10],[-4,0,-4],[4,0,-4],[-8,0,0],[8,0,0]].forEach(([x,,z])=>{
        const t=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,1.5,6),new THREE.MeshLambertMaterial({color:0x5C3D1E}));
        t.position.set(x,.75,z); scene.add(t);
        const l=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),new THREE.MeshLambertMaterial({color:0x2D8B2D}));
        l.position.set(x,2.5,z); scene.add(l);
    });
    let isDragging=false,lastX=0,lastY=0,rotX=0.3,rotY=0,radius=28;
    canvas.addEventListener('mousedown',e=>{isDragging=true;lastX=e.clientX;lastY=e.clientY;});
    canvas.addEventListener('mousemove',e=>{
        if(!isDragging)return;
        rotY+=(e.clientX-lastX)*.005; rotX+=(e.clientY-lastY)*.005;
        rotX=Math.max(.1,Math.min(1.2,rotX)); lastX=e.clientX; lastY=e.clientY;
    });
    canvas.addEventListener('mouseup',()=>isDragging=false);
    canvas.addEventListener('mouseleave',()=>isDragging=false);
    canvas.addEventListener('wheel',e=>{radius=Math.max(10,Math.min(50,radius+e.deltaY*.05));e.preventDefault();},{passive:false});
    let lTX=0,lTY=0;
    canvas.addEventListener('touchstart',e=>{lTX=e.touches[0].clientX;lTY=e.touches[0].clientY;});
    canvas.addEventListener('touchmove',e=>{
        rotY+=(e.touches[0].clientX-lTX)*.006; rotX+=(e.touches[0].clientY-lTY)*.006;
        rotX=Math.max(.1,Math.min(1.2,rotX)); lTX=e.touches[0].clientX; lTY=e.touches[0].clientY; e.preventDefault();
    },{passive:false});
    const raycaster=new THREE.Raycaster(), mouse=new THREE.Vector2();
    const tip=document.getElementById('ar-tooltip');
    canvas.addEventListener('mousemove',e=>{
        if(isDragging)return;
        const r=canvas.getBoundingClientRect();
        mouse.x=((e.clientX-r.left)/r.width)*2-1;
        mouse.y=-((e.clientY-r.top)/r.height)*2+1;
        raycaster.setFromCamera(mouse,camera);
        const hits=raycaster.intersectObjects(meshes);
        if(hits.length){tip.textContent=hits[0].object.userData.name;tip.style.opacity='1';tip.style.left=(e.clientX-r.left+10)+'px';tip.style.top=(e.clientY-r.top-30)+'px';}
        else{tip.style.opacity='0';}
    });
    (function animate(){
        window._arAnimId=requestAnimationFrame(animate);
        if(!isDragging) rotY+=.003;
        camera.position.x=radius*Math.sin(rotY)*Math.cos(rotX);
        camera.position.y=radius*Math.sin(rotX);
        camera.position.z=radius*Math.cos(rotY)*Math.cos(rotX);
        camera.lookAt(0,2,0); renderer.render(scene,camera);
    })();
}
