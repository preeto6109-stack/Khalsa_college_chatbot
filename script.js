// ============================================================
//  Khalsa College Patiala — "Kaur" Chatbot  v6.0
//  Complete Database · Cute Replies · Proper Formatting
// ============================================================

let isTyping    = false;
let darkMode    = localStorage.getItem('kcp-dark') === '1';
let currentLang = localStorage.getItem('kcp-lang') || 'en';
let aiEnabled   = localStorage.getItem('kcp-ai') !== '0';

const SERVER_URL = 'https://khalsa-college-chatbot-2.onrender.com';
const sessionId  = 'sess_' + Date.now();

// ── Personalization ───────────────────────────────────────────
let userName       = localStorage.getItem('kcp-username') || '';
let userInterests  = JSON.parse(localStorage.getItem('kcp-interests') || '[]');
let waitingForName = false;

function saveInterest(intent) {
    const skip = ['unknown','hours','contact','location','whatsapp','main','ar'];
    if (skip.includes(intent)) return;
    if (!userInterests.includes(intent)) {
        userInterests.unshift(intent);
        if (userInterests.length > 5) userInterests.pop();
        localStorage.setItem('kcp-interests', JSON.stringify(userInterests));
    }
}

function getPersonalGreeting() {
    if (!userName) return '';
    return `${userName} nu ji aayan nu! 🌸<br>`;
}

function getRecommendationHTML() {
    if (!userInterests.length || !userName) return '';
    const label = {
        pg:'PG Courses', ug:'UG Courses', fees:'Fee Details',
        admission:'Admission Info', results:'Results', faculty:'Faculty',
        diploma:'Diploma', certificate:'Certificate',
        bca:'BCA', bba:'BBA', bcom:'B.Com', bsc:'B.Sc', ba:'B.A',
        mscit:'M.Sc IT', mcom:'M.Com'
    }[userInterests[0]];
    if (!label) return '';
    return `<br>💡 <em>${userName}, last time you asked about <strong>${label}</strong>!</em>`;
}

// ── Server Call ───────────────────────────────────────────────
async function callServer(message) {
    try {
        const res = await fetch(`${SERVER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ message, lang:currentLang, username:userName, session_id:sessionId })
        });
        if (!res.ok) return null;
        return await res.json();
    } catch(e) { return null; }
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
const OFFICE_HOURS = {open:9, close:16, days:[1,2,3,4,5,6]};

function isOfficeOpen() {
    const n = new Date();
    return OFFICE_HOURS.days.includes(n.getDay()) &&
           n.getHours() >= OFFICE_HOURS.open && n.getHours() < OFFICE_HOURS.close;
}

function getOfficeStatusHTML() {
    const open=isOfficeOpen(), now=new Date();
    const t=now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});
    const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if(open) return `<span class="status-badge open">🟢 Office Open</span><span class="status-time">${days[now.getDay()]} · ${t} · Closes 4:00 PM</span>`;
    const next=(now.getDay()===0||(now.getDay()===6&&now.getHours()>=16))?'Opens Monday 9:00 AM':now.getHours()>=16?'Opens tomorrow 9:00 AM':'Opens today 9:00 AM';
    return `<span class="status-badge closed">🔴 Office Closed</span><span class="status-time">${days[now.getDay()]} · ${t} · ${next}</span>`;
}

// ── Language Strings ──────────────────────────────────────────
const LANG = {
    en:{
        askName:   `😊 Hi! I'm <strong>Kaur</strong> 🌸<br>Before we start — <strong>what's your name?</strong><br><small><em>Type your name so I can assist you better!</em></small>`,
        nameSaved: (n)=>`🌸 Nice to meet you, <strong>${n}</strong>!<br>I'm here to help with anything about Khalsa College Patiala 👇`,
        welcome:   (x)=>`👋 <strong>Sat Sri Akal!</strong> I'm <strong>Kaur</strong>, your college guide! 🌸<br>${x}<br>Ask about admissions, courses, fees, results &amp; more!<br><em>Pick from the menu 👇</em>`,
        mainMenu:  '🏠 <strong>Main Menu</strong><br>How can I help you today? 👇',
        unknown:   `🤔 Hmm, I can help with:<br>🎓 Admissions · 📚 Courses · 💰 Fees<br>📊 Results · 👩‍🏫 Faculty<br><br>Please choose from the menu 👇`,
        aiThinking:'🤖 Kaur is thinking...',
        aiError:   `😊 Please contact the office:<br>☎️ <strong>0175-2215835</strong>`,
        aiOn:      '🤖 AI Mode: ON',
        aiOff:     '📋 AI Mode: OFF'
    },
    pa:{
        askName:   `😊 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ <strong>ਕੌਰ</strong> ਹਾਂ 🌸<br><strong>ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?</strong><br><small><em>ਨਾਮ ਲਿਖੋ ਤਾਂ ਬਿਹਤਰ ਮਦਦ ਕਰ ਸਕਾਂ!</em></small>`,
        nameSaved: (n)=>`🌸 ਜੀ ਆਇਆਂ ਨੂੰ, <strong>${n}</strong>!<br>ਖ਼ਾਲਸਾ ਕਾਲਜ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ 👇`,
        welcome:   (x)=>`👋 <strong>ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!</strong> ਮੈਂ <strong>ਕੌਰ</strong> ਹਾਂ! 🌸<br>${x}<br>ਕੁਝ ਵੀ ਪੁੱਛੋ!<br><em>ਹੇਠਾਂ ਚੁਣੋ 👇</em>`,
        mainMenu:  '🏠 <strong>ਮੁੱਖ ਮੀਨੂ</strong><br>ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ? 👇',
        unknown:   `🤔 <strong>ਸਮਝ ਨਹੀਂ ਆਇਆ!</strong><br>ਮੀਨੂ ਤੋਂ ਚੁਣੋ 👇`,
        aiThinking:'🤖 ਕੌਰ ਸੋਚ ਰਹੀ ਹੈ...',
        aiError:   `😊 ਕਾਲਜ ਦਫ਼ਤਰ ਕਾਲ ਕਰੋ:<br>☎️ <strong>0175-2215835</strong>`,
        aiOn:      '🤖 AI: ਚਾਲੂ',
        aiOff:     '📋 AI: ਬੰਦ'
    },
    hi:{
        askName:   `😊 नमस्ते! मैं <strong>कौर</strong> हूं 🌸<br><strong>आपका नाम क्या है?</strong><br><small><em>नाम लिखें ताकि बेहतर मदद कर सकूं!</em></small>`,
        nameSaved: (n)=>`🌸 मिलकर खुशी हुई, <strong>${n}</strong>!<br>खालसा कॉलेज के बारे में कुछ भी पूछें 👇`,
        welcome:   (x)=>`👋 <strong>सत श्री अकाल!</strong> मैं <strong>कौर</strong> हूं! 🌸<br>${x}<br>कुछ भी पूछें!<br><em>नीचे से चुनें 👇</em>`,
        mainMenu:  '🏠 <strong>मुख्य मेनू</strong><br>कैसे मदद करूं? 👇',
        unknown:   `🤔 <strong>समझ नहीं आया!</strong><br>मेनू से चुनें 👇`,
        aiThinking:'🤖 कौर सोच रही है...',
        aiError:   `😊 कॉलेज ऑफिस कॉल करें:<br>☎️ <strong>0175-2215835</strong>`,
        aiOn:      '🤖 AI: चालू',
        aiOff:     '📋 AI: बंद'
    }
};

// ════════════════════════════════════════════════════════════════
//  COLLEGE DATABASE — Complete & Properly Formatted
// ════════════════════════════════════════════════════════════════
const DB = {

    // ── Admission ──────────────────────────────────────────────
    admission_status: `
        🚫 <strong>Admissions CLOSED</strong> — Session 2025–26<br><br>
        Admissions for this session are now closed.<br>
        For more details, please visit the college in person.<br><br>
        ✨ <em>Stay curious. Stay ready.<br>See you in the next admission cycle!</em><br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Download Brochure →</a>
    `,

    admission_portal: `
        🌐 <strong>Online Admission Portal</strong><br><br>
        👉 <a href="https://kcpadmissions.in" target="_blank"><strong>kcpadmissions.in</strong></a><br><br>
        <strong>Step 1:</strong> Click the link above & register<br>
        <strong>Step 2:</strong> Fill the Application Form online<br>
        <strong>Step 3:</strong> Upload required documents (JPG)<br>
        <strong>Step 4:</strong> Pay Registration / Admission Fee online<br><br>
        💡 <em>Keep your documents ready before applying!</em>
    `,

    admission_dates: `
        📅 <strong>Admission Dates — 2025-26</strong><br><br>
        ✅ <strong>Online Registration:</strong> Started<br>
        🚫 <strong>Admissions:</strong> Closed for 2025-26<br><br>
        Important dates for next session will be updated soon.<br><br>
        🔗 <a href="https://kcpadmissions.in" target="_blank">Check Portal for Updates →</a>
    `,

    eligibility_ug: `
        ✅ <strong>UG Eligibility (General)</strong><br><br>
        📌 Most UG courses: <strong>10+2 in any stream</strong><br>
        📌 B.Sc Medical/Non-Medical: <strong>10+2 Science</strong><br>
        📌 B.Sc Agriculture: <strong>10+2 with Phy, Chem, Bio/Math — 50%</strong><br>
        📌 B.Sc Biotechnology: <strong>10+2 Medical/Non-Medical — 45%</strong><br>
        📌 B.Sc CSM: <strong>10+2 Non-Medical/Arts with Math</strong><br>
        📌 B.Com: <strong>10+2 Commerce stream</strong><br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Full Eligibility Details →</a>
    `,

    eligibility_pg: `
        ✅ <strong>PG Eligibility (General)</strong><br><br>
        📌 Most PG courses: <strong>Graduation with 50% marks</strong><br>
        📌 M.Sc IT: <strong>Graduation (50%) from recognised university</strong><br>
        📌 M.Sc IT Lateral: <strong>PGDCA — 1 year only</strong><br>
        📌 M.Sc Agriculture: <strong>B.Sc Agriculture (4yr) — 50%</strong><br>
        📌 M.Com: <strong>B.Com/BBA/B.Com Hons — 50%</strong><br>
        📌 M.A Geography: <strong>B.A with Geography as subject</strong><br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Full Eligibility Details →</a>
    `,

    // ── PG Courses ─────────────────────────────────────────────
    pg_all: `
        🎓 <strong>Postgraduate Courses</strong><br><br>
        💻 M.Sc IT (2 Yrs) · M.Sc IT Lateral (1 Yr)<br>
        👗 M.Sc Fashion Design &amp; Technology (2 Yrs)<br>
        🔬 M.Sc Physics · Chemistry · Geography (2 Yrs)<br>
        🌾 M.Sc Agriculture/Agronomy (2 Yrs)<br>
        📊 M.Com (2 Yrs)<br>
        📚 M.A — English, Punjabi, Music, History,<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Pol. Science, Psychology, Economics (2 Yrs)<br>
        🖥️ PGDCA (2 Yrs)<br><br>
        👇 Choose a course for fees &amp; eligibility!
    `,

    pg_mscit: `
        💻 <strong>M.Sc IT / M.Sc IT Lateral</strong><br><br>
        📌 <strong>Eligibility:</strong> Graduation with 50% marks<br>
        📌 <strong>Lateral:</strong> PGDCA holders — 1 year only<br>
        ⏱️ <strong>Duration:</strong> 2 Years (Lateral: 1 Year)<br><br>
        💰 <strong>Fee Structure:</strong><br>
        &nbsp;&nbsp;• 1st Semester: <strong>₹28,040</strong><br>
        &nbsp;&nbsp;• 2nd Semester: <strong>₹12,050</strong><br>
        &nbsp;&nbsp;• Approx Total: <strong>₹80,000 – ₹1,00,000</strong><br><br>
        💳 Pay at fee counter or online at portal<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_fashion: `
        👗 <strong>M.Sc Fashion Design &amp; Technology</strong><br><br>
        📌 <strong>Eligibility:</strong> Graduation in any stream — 50%<br>
        ⏱️ <strong>Duration:</strong> 2 Years<br>
        💰 <strong>Approx Fees:</strong> ₹80,000 – ₹1,20,000<br><br>
        💳 Fee payable at counter or online<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_science: `
        🔬 <strong>M.Sc Science Courses</strong><br><br>
        🧪 <strong>M.Sc Physics</strong><br>
        &nbsp;&nbsp;📌 B.Sc with Physics as full subject — 50%<br>
        &nbsp;&nbsp;💰 Approx: ₹80,000 – ₹1,00,000<br><br>
        ⚗️ <strong>M.Sc Chemistry</strong><br>
        &nbsp;&nbsp;📌 B.Sc with Chemistry — 50%<br>
        &nbsp;&nbsp;💰 Approx: ₹80,000 – ₹1,00,000<br><br>
        🗺️ <strong>M.Sc Geography</strong><br>
        &nbsp;&nbsp;📌 B.A with Geography as subject<br>
        &nbsp;&nbsp;💰 Approx: ₹80,000 – ₹1,00,000<br><br>
        ⏱️ Duration: 2 Years each<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_agri: `
        🌾 <strong>M.Sc Agriculture (Agronomy)</strong><br><br>
        📌 <strong>Eligibility:</strong> B.Sc Agriculture (4 yr) — 50%<br>
        &nbsp;&nbsp;&nbsp;(SC/ST/PH: 45%)<br>
        ⏱️ <strong>Duration:</strong> 2 Years<br>
        💰 <strong>Approx Fees:</strong> ₹1,00,000 – ₹1,50,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_mcom: `
        📊 <strong>M.Com (Master of Commerce)</strong><br><br>
        📌 <strong>Eligibility:</strong> B.Com / BBA / B.Com Hons — 50%<br>
        ⏱️ <strong>Duration:</strong> 2 Years<br>
        💰 <strong>Approx Fees:</strong> ₹60,000 – ₹80,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_ma: `
        📚 <strong>M.A Courses</strong><br><br>
        📌 <strong>Eligibility:</strong> Graduation with 50% marks<br>
        ⏱️ <strong>Duration:</strong> 2 Years each<br>
        💰 <strong>Approx Fees:</strong> ₹25,000 – ₹50,000<br><br>
        Available subjects:<br>
        ✨ English · Punjabi · Music (Vocal)<br>
        ✨ History · Political Science<br>
        ✨ Psychology · Economics<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    pg_pgdca: `
        🖥️ <strong>PGDCA</strong> (PG Diploma in Computer Applications)<br><br>
        📌 <strong>Eligibility:</strong> Graduation with 50% marks<br>
        ⏱️ <strong>Duration:</strong> 2 Years<br>
        💰 <strong>Approx Fees:</strong> ₹30,000 – ₹40,000<br><br>
        💡 PGDCA holders can apply for M.Sc IT Lateral (1 yr)!<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    // ── UG Courses ─────────────────────────────────────────────
    ug_all: `
        🎓 <strong>Undergraduate Courses</strong><br><br>
        💻 BCA · 📈 BBA · 🧾 B.Com · B.Com Hons<br>
        🧬 B.Sc Biotechnology · 🌾 B.Sc Agriculture<br>
        🔬 B.Sc Medical · Non-Medical · CSM<br>
        🧪 B.Sc Hons Chemistry · Physics · Math<br>
        📖 B.A · B.A Hons English<br>
        🛠️ B.Voc Software Dev · Agriculture · Automobile · Food Processing<br>
        🏛️ B.Com Accounting &amp; Finance · B.A Political Science<br><br>
        👇 Choose a course for fees &amp; details!
    `,

    ug_bca: `
        💻 <strong>BCA</strong> (Bachelor of Computer Applications)<br><br>
        📌 <strong>Eligibility:</strong> 10+2 in any stream<br>
        ⏱️ <strong>Duration:</strong> 3 Years<br>
        💰 <strong>Approx Total Fees:</strong> ₹60,000 – ₹70,000<br><br>
        💳 Fee payable at counter or online<br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_bba: `
        📈 <strong>BBA</strong> (Bachelor of Business Administration)<br><br>
        📌 <strong>Eligibility:</strong> 10+2 in any stream<br>
        ⏱️ <strong>Duration:</strong> 3 Years<br>
        💰 <strong>Approx Total Fees:</strong> ₹60,000 – ₹70,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_bcom: `
        🧾 <strong>B.Com Courses</strong><br><br>
        📚 <strong>B.Com</strong><br>
        &nbsp;&nbsp;📌 10+2 Commerce stream · ⏱️ 3 Yrs<br>
        &nbsp;&nbsp;💰 Approx: ₹40,000 – ₹60,000<br><br>
        📚 <strong>B.Com Honours</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · ⏱️ 3 Yrs<br>
        &nbsp;&nbsp;💰 Approx: ₹40,000 – ₹60,000<br><br>
        📚 <strong>B.Com Accounting &amp; Finance</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · ⏱️ 3 Yrs<br>
        &nbsp;&nbsp;💰 Approx: ₹40,000 – ₹60,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_bsc: `
        🔬 <strong>B.Sc Courses</strong><br><br>
        🧪 <strong>B.Sc Medical</strong> — 10+2 Science · ₹40K–₹1L<br>
        🔭 <strong>B.Sc Non-Medical</strong> — 10+2 Science · ₹40K–₹1L<br>
        💻 <strong>B.Sc CSM</strong> — 10+2 Non-Med/Arts+Math · ₹40K–₹1L<br>
        🧬 <strong>B.Sc Biotechnology</strong> — 10+2 Med/Non-Med 45% · ₹70K–₹1L<br>
        🌾 <strong>B.Sc Agriculture</strong> — 10+2 Sci 50% · ₹1.5L–₹2L<br>
        🧪 <strong>B.Sc Hons Chemistry</strong> — 10+2 Science<br>
        🔭 <strong>B.Sc Hons Physics</strong> — 10+2 Science<br>
        📐 <strong>B.Sc Hons Math</strong> — 10+2 Science<br><br>
        ⏱️ Duration: 3 Years each<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_ba: `
        📖 <strong>B.A Courses</strong><br><br>
        📚 <strong>B.A</strong> — 10+2 any stream · ⏱️ 3 Yrs<br>
        &nbsp;&nbsp;💰 Approx: ₹35,000 – ₹50,000<br><br>
        📚 <strong>B.A Hons English</strong> — 10+2 any stream · ⏱️ 3 Yrs<br>
        &nbsp;&nbsp;💰 Approx: ₹40,000 – ₹60,000<br><br>
        📚 <strong>B.A Political Science</strong> — 10+2 any stream<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_bvoc: `
        🛠️ <strong>B.Voc Courses</strong> (Vocational)<br><br>
        💻 <strong>B.Voc Software Development</strong><br>
        🌾 <strong>B.Voc Agriculture</strong><br>
        🚗 <strong>B.Voc Automobile</strong><br>
        🍕 <strong>B.Voc Food Processing &amp; Engineering</strong><br><br>
        📌 <strong>Eligibility:</strong> 10+2 in any stream<br>
        ⏱️ <strong>Duration:</strong> 3 Years<br>
        💰 <strong>Approx Total Fees:</strong> ₹70,000 – ₹90,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    ug_agri: `
        🌾 <strong>B.Sc Agriculture</strong><br><br>
        📌 <strong>Eligibility:</strong><br>
        &nbsp;&nbsp;10+2 with Phy, Chem, Bio/Math &amp; English<br>
        &nbsp;&nbsp;Min. 50% aggregate (SC/ST: 45%)<br>
        ⏱️ <strong>Duration:</strong> 4 Years<br>
        💰 <strong>Approx Total Fees:</strong> ₹1,50,000 – ₹2,00,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    // ── Diploma Courses ────────────────────────────────────────
    diploma_all: `
        📜 <strong>Diploma Courses (1 Year)</strong><br><br>
        🖥️ <strong>Diploma in Computer Hardware &amp; Networking</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · 💰 ₹15,000–₹25,000<br><br>
        🌿 <strong>Diploma in Green House Technology</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · 💰 ₹15,000–₹25,000<br><br>
        🇫🇷 <strong>Diploma in French</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · 💰 ₹10,000–₹20,000<br><br>
        🇫🇷 <strong>One Year Intensive Diploma in French</strong><br>
        &nbsp;&nbsp;📌 10+2 any stream · 💰 ₹10,000–₹20,000<br><br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    // ── Certificate Courses ────────────────────────────────────
    certificate_all: `
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
        📎 <a href="https://kcpadmissions.in" target="_blank">Apply Now →</a>
    `,

    // ── Fees ───────────────────────────────────────────────────
    fees_general: `
        💰 <strong>Fee Structure 2025–26</strong><br><br>
        ℹ️ For exact fees, visit:<br>
        🔗 <a href="https://kcpadmissions.in" target="_blank"><strong>www.kcpadmissions.in</strong></a><br><br>
        <strong>Approximate Fees:</strong><br>
        💻 M.Sc IT: Sem1 ₹28,040 | Sem2 ₹12,050<br>
        🎓 PG Courses: ₹25,000 – ₹1,50,000<br>
        📖 UG Courses: ₹35,000 – ₹2,00,000<br>
        📜 Diploma: ₹10,000 – ₹25,000<br>
        🏆 Certificate: ₹3,000 – ₹10,000<br><br>
        💳 <strong>Payment Options:</strong><br>
        &nbsp;&nbsp;• Fee Counter / Reception Desk<br>
        &nbsp;&nbsp;• Online via Admission Portal<br><br>
        👇 Ask for a specific course fee!
    `,

    fees_pg: `
        💰 <strong>PG Course Fees (Approx)</strong><br><br>
        💻 M.Sc IT: <strong>₹80,000–₹1,00,000</strong><br>
        &nbsp;&nbsp;&nbsp;↳ Sem1: ₹28,040 | Sem2: ₹12,050<br>
        👗 M.Sc Fashion: <strong>₹80,000–₹1,20,000</strong><br>
        🔬 M.Sc Physics/Chem/Geo: <strong>₹80,000–₹1,00,000</strong><br>
        🌾 M.Sc Agriculture: <strong>₹1,00,000–₹1,50,000</strong><br>
        📊 M.Com: <strong>₹60,000–₹80,000</strong><br>
        📚 M.A (all): <strong>₹25,000–₹50,000</strong><br>
        🖥️ PGDCA: <strong>₹30,000–₹40,000</strong><br><br>
        💳 Pay at counter or online<br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Exact Fees →</a>
    `,

    fees_ug: `
        💰 <strong>UG Course Fees (Approx)</strong><br><br>
        💻 BCA: <strong>₹60,000–₹70,000</strong><br>
        📈 BBA: <strong>₹60,000–₹70,000</strong><br>
        🧾 B.Com / Hons / A&amp;F: <strong>₹40,000–₹60,000</strong><br>
        🔬 B.Sc Med/Non-Med/CSM: <strong>₹40,000–₹1,00,000</strong><br>
        🧬 B.Sc Biotechnology: <strong>₹70,000–₹1,00,000</strong><br>
        🌾 B.Sc Agriculture: <strong>₹1,50,000–₹2,00,000</strong><br>
        📖 B.A: <strong>₹35,000–₹50,000</strong><br>
        📖 B.A Hons English: <strong>₹40,000–₹60,000</strong><br>
        🛠️ B.Voc: <strong>₹70,000–₹90,000</strong><br><br>
        💳 Pay at counter or online<br>
        📎 <a href="https://kcpadmissions.in" target="_blank">Exact Fees →</a>
    `,

    // ── Results ────────────────────────────────────────────────
    results: `
        📊 <strong>Results Portal</strong><br><br>
        🔗 <a href="https://kcpresults.in/results" target="_blank"><strong>kcpresults.in/results</strong></a><br><br>
        For any result queries:<br>
        📞 <strong>97804-84847</strong> (Dr. Jaspreet Kaur)<br>
        ✉️ kcpexamgrievance@gmail.com<br><br>
        💡 <em>Check the portal for latest results!</em>
    `,

    // ── Datesheet ──────────────────────────────────────────────
    datesheet: `
        📅 <strong>Exam Datesheet</strong><br><br>
        🔗 <a href="https://khalsacollegepatiala.org/datesheets" target="_blank"><strong>Click here for Official Datesheet →</strong></a><br><br>
        For exam queries:<br>
        ✉️ kcpexamgrievance@gmail.com<br>
        📞 97804-84847<br><br>
        💡 <em>Datesheet is regularly updated on the link above!</em>
    `,

    // ── Timetable ──────────────────────────────────────────────
    timetable: `
        ⏰ <strong>Class Timetable</strong><br><br>
        Please visit the <strong>college office</strong> for the latest class timetable.<br><br>
        📍 Badungar Road, Patiala<br>
        ☎️ <strong>0175-2215835</strong><br>
        🕐 Mon–Sat · 9:00 AM – 4:00 PM
    `,

    // ── Faculty ────────────────────────────────────────────────
    faculty: `
        👩‍🏫 <strong>Key Contacts</strong><br><br>
        👑 <strong>Principal</strong><br>
        &nbsp;&nbsp;Dr. Dharminder Singh Ubha<br>
        &nbsp;&nbsp;📞 98557-11380<br><br>
        🎯 <strong>Controller of Examination</strong><br>
        &nbsp;&nbsp;Dr. Jaspreet Kaur<br>
        &nbsp;&nbsp;📞 97804-84847<br>
        &nbsp;&nbsp;✉️ kcpexamgrievance@gmail.com<br><br>
        🔹 <strong>Deputy Controller</strong><br>
        &nbsp;&nbsp;Dr. Jagjit Singh<br>
        &nbsp;&nbsp;📞 78145-11707<br><br>
        📚 <strong>Departments:</strong><br>
        CS · Agriculture · Commerce · English · Physics<br>
        Chemistry · Fashion Design · Biotechnology<br>
        Psychology · Music · Geography · Punjabi<br>
        History · Pol.Sci · Economics · Fine Arts<br>
        Theatre · Hindi · Botany · Zoology · Sociology<br>
        Physical Education &amp; many more!<br><br>
        📎 <a href="https://khalsacollegepatiala.org" target="_blank">View Full Faculty List →</a>
    `,

    // ── Contact ────────────────────────────────────────────────
    contact: `
        📞 <strong>Contact Khalsa College Patiala</strong><br><br>
        ☎️ <strong>Phone:</strong> 0175-2215835<br><br>
        ✉️ <strong>Email:</strong><br>
        &nbsp;&nbsp;khalsacollegepatiala@gmail.com<br>
        &nbsp;&nbsp;info@khalsacollegepatiala.org<br><br>
        📍 <strong>Address:</strong><br>
        &nbsp;&nbsp;General Shivdev Singh Diwan Gurbachan Singh<br>
        &nbsp;&nbsp;Khalsa College Patiala,<br>
        &nbsp;&nbsp;Badungar Road, Patiala, Punjab – 147001<br><br>
        🕐 <strong>Office Hours:</strong> Mon–Sat · 9:00 AM – 4:00 PM<br><br>
        🗺️ <a href="https://maps.google.com/?q=Khalsa+College+Patiala" target="_blank">📍 View on Google Maps →</a><br>
        🌐 <a href="https://khalsacollegepatiala.org" target="_blank">Visit Official Website →</a>
    `,

    // ── Location ───────────────────────────────────────────────
    location: `
        📍 <strong>How to Reach KCP</strong><br><br>
        🏛️ Badungar Road, Patiala, Punjab – 147001<br><br>
        🚌 <strong>By Bus:</strong> Patiala Bus Stand → Auto to Badungar Road<br>
        🚂 <strong>By Train:</strong> Patiala Railway Station → 3 km approx.<br>
        🚗 <strong>By Car:</strong> Search "Khalsa College Patiala" on Google Maps<br><br>
        🗺️ <a href="https://maps.google.com/?q=Khalsa+College+Patiala+Badungar+Road" target="_blank">📍 Open Google Maps →</a><br><br>
        <button class="ar-btn" onclick="openARMap()">🥽 View 3D Campus Map</button>
    `,

    // ── WhatsApp ───────────────────────────────────────────────
    whatsapp: `
        💬 <strong>Chat on WhatsApp</strong><br><br>
        📱 <a href="https://wa.me/911752215835?text=Hello%2C%20I%20have%20an%20inquiry%20about%20Khalsa%20College%20Patiala" target="_blank"><strong>💬 Open WhatsApp Chat →</strong></a><br><br>
        ☎️ Or call: <strong>0175-2215835</strong><br>
        🕐 Available: Mon–Sat · 9:00 AM – 4:00 PM
    `,

    // ── Library ────────────────────────────────────────────────
    library: `
        📚 <strong>College Library</strong><br><br>
        Please visit the <strong>college library on campus</strong><br>
        for timings and available facilities.<br><br>
        📍 Located inside the main campus<br>
        ☎️ 0175-2215835<br>
        🌐 <a href="https://khalsacollegepatiala.org" target="_blank">College Website →</a>
    `,

    // ── Hostel ─────────────────────────────────────────────────
    hostel: `
        🏠 <strong>Hostel Facilities</strong><br><br>
        For hostel availability and fees,<br>
        please visit the <strong>college office</strong>.<br><br>
        ☎️ <strong>0175-2215835</strong><br>
        🕐 Mon–Sat · 9:00 AM – 4:00 PM
    `,

    // ── Hours ──────────────────────────────────────────────────
    hours: () => {
        const open = isOfficeOpen();
        return `
        🕐 <strong>Office Hours</strong><br><br>
        ${getOfficeStatusHTML()}<br><br>
        📅 <strong>Working Days:</strong> Monday to Saturday<br>
        ⏰ <strong>Timing:</strong> 9:00 AM – 4:00 PM<br><br>
        ☎️ 0175-2215835<br>
        💬 <a href="https://wa.me/911752215835" target="_blank">WhatsApp →</a>
        `;
    }
};

// ── Keywords — Detailed ───────────────────────────────────────
const KEYWORDS = {
    // Specific course keywords first (priority)
    bca:         ['bca','bachelor of computer'],
    bba:         ['bba','bachelor of business'],
    bcom:        ['bcom','b.com','bachelor of commerce','b com'],
    bsc_agri:    ['bsc agriculture','b.sc agriculture','bsc agri','agriculture course'],
    bsc:         ['bsc','b.sc','bachelor of science','bsc medical','bsc non medical','bsc csm','biotechnology','bsc hons'],
    ba:          ['b.a','ba course','bachelor of arts','ba hons','political science course'],
    bvoc:        ['bvoc','b.voc','vocational','software development course','automobile course','food processing'],
    mscit:       ['msc it','m.sc it','msc information','msit','information technology course','it masters','lateral'],
    msc_fashion: ['fashion design','msc fashion','fashion technology'],
    msc_science: ['msc physics','msc chemistry','msc geography','m.sc physics','m.sc chemistry'],
    msc_agri:    ['msc agriculture','m.sc agriculture','msc agri','masters agriculture'],
    mcom:        ['mcom','m.com','master of commerce','masters commerce'],
    ma:          ['m.a','ma english','ma history','ma punjabi','ma psychology','ma economics','ma music','ma political','master of arts'],
    pgdca:       ['pgdca','pg diploma computer','pg diploma in computer'],
    diploma:     ['diploma','hardware networking','green house','french diploma','intensive french'],
    certificate: ['certificate','sikh studies','web development course','spoken english','bee keeping','bakery','anchoring','folk music','translation','pharmaceutical','office automation','solar pv','personality development'],

    // General
    admission:   ['admission','admit','apply','register','join','2025','closed','seat','daakhla','le sakde','le sakdi'],
    eligibility: ['eligibility','eligible','qualify','criteria','minimum marks','marks chahide','percentage chahidi','who can apply'],
    portal:      ['portal','online form','kcpadmissions','form bharo','apply online'],
    process:     ['process','procedure','steps','how to apply','kive apply','documents required'],
    dates:       ['last date','deadline','kado tak','admission date','when will','kado shuru'],
    pg:          ['pg courses','postgraduate','pg course list','masters courses','pg programs'],
    ug:          ['ug courses','undergraduate','ug course list','bachelor courses'],
    courses:     ['courses available','all courses','course list','what courses','kaunse course','programs offered'],
    fees:        ['fee','fees','cost','rupee','₹','amount','how much','kitni fee','kitne rupee','payment','fee structure','lagdi','lagde','fee kitni'],
    fees_pg:     ['pg fees','masters fees','msc fees','mcom fees','ma fees','pgdca fees'],
    fees_ug:     ['ug fees','bachelor fees','bca fees','bba fees','bcom fees','bsc fees','ba fees','bvoc fees'],
    results:     ['result','results','marks','grade','scorecard','merit','pass','fail','result kado','result check'],
    datesheet:   ['datesheet','date sheet','exam date','exam schedule','paper date','exam kado','when is exam'],
    timetable:   ['timetable','time table','class schedule','class time','lecture time','class kado'],
    faculty:     ['faculty','teacher','professor','principal','controller','jaspreet','ubha','jagjit','hod','department head','staff'],
    contact:     ['contact','phone number','call','email','address','kithey hai','college address','kidhar hai','reach'],
    location:    ['location','map','google map','direction','how to reach','route','navigate','kive jana','nearest','distance'],
    whatsapp:    ['whatsapp','whats app','wa','wp'],
    library:     ['library','books','reading room','kitab','lib'],
    hostel:      ['hostel','accommodation','room','stay','boarding','mess','rehna'],
    hours:       ['timing','timings','office time','open time','close time','kado khulda','kado band','office hours','working hours'],
    ar:          ['3d','ar map','vr','campus map','virtual tour','3d campus','campus dekho']
};

function findIntent(msg) {
    msg = msg.toLowerCase().trim();
    // Priority order — specific before general
    const priority = [
        'ar',
        'mscit','msc_fashion','msc_science','msc_agri','mcom','ma','pgdca',
        'bca','bba','bcom','bsc_agri','bsc','ba','bvoc',
        'diploma','certificate',
        'eligibility','portal','process','dates',
        'fees_pg','fees_ug',
        'library','hostel','results','datesheet','timetable',
        'faculty','location','whatsapp','hours','contact',
        'fees','pg','ug','courses','admission'
    ];
    for (const intent of priority) {
        if (KEYWORDS[intent]?.some(kw => msg.includes(kw))) return intent;
    }
    return 'unknown';
}

function getOfflineResponse(intent) {
    const map = {
        admission:   DB.admission_status,
        portal:      DB.admission_portal,
        process:     DB.admission_portal,
        dates:       DB.admission_dates,
        eligibility: DB.eligibility_ug + '<br><br>' + DB.eligibility_pg,

        // PG specific
        pg:          DB.pg_all,
        mscit:       DB.pg_mscit,
        msc_fashion: DB.pg_fashion,
        msc_science: DB.pg_science,
        msc_agri:    DB.pg_agri,
        mcom:        DB.pg_mcom,
        ma:          DB.pg_ma,
        pgdca:       DB.pg_pgdca,

        // UG specific
        ug:          DB.ug_all,
        bca:         DB.ug_bca,
        bba:         DB.ug_bba,
        bcom:        DB.ug_bcom,
        bsc:         DB.ug_bsc,
        bsc_agri:    DB.ug_agri,
        ba:          DB.ug_ba,
        bvoc:        DB.ug_bvoc,

        // Other
        courses:     `<div class="resp-card info-msg">📚 <strong>Choose a category:</strong><br><br>🎓 PG Courses · 📖 UG Courses<br>📜 Diploma · 🏆 Certificate</div>`,
        diploma:     DB.diploma_all,
        certificate: DB.certificate_all,

        fees:        DB.fees_general,
        fees_pg:     DB.fees_pg,
        fees_ug:     DB.fees_ug,

        results:     DB.results,
        datesheet:   DB.datesheet,
        timetable:   DB.timetable,
        faculty:     DB.faculty,
        contact:     DB.contact,
        location:    DB.location,
        whatsapp:    DB.whatsapp,
        library:     DB.library,
        hostel:      DB.hostel,
        hours:       typeof DB.hours === 'function' ? DB.hours() : DB.hours,
    };

    if (intent === 'ar') {
        setTimeout(openARMap, 400);
        return `<div class="resp-card info-msg">🥽 <strong>3D Campus Map kholdi haan!</strong><br>Khalsa College da virtual tour enjoy karo! 🏛️</div>`;
    }

    const html = map[intent];
    if (!html) return null;
    return `<div class="resp-card info-msg">${html}</div>`;
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
        {label:'🥽 3D Campus',   fn:()=>openARMap()},
        {label:'', fn:()=>toggleAI(), isAI:true}
    ],
    admission:[
        {label:'📌 Admission Status', fn:()=>go('admission')},
        {label:'✅ Eligibility',       fn:()=>go('eligibility')},
        {label:'🌐 Apply Online',      fn:()=>go('portal')},
        {label:'📅 Important Dates',   fn:()=>go('dates')},
        {label:'🏠 Main Menu',         fn:()=>backToMain()}
    ],
    courses:[
        {label:'🎓 PG Courses',  fn:()=>go('pg')},
        {label:'📖 UG Courses',  fn:()=>go('ug')},
        {label:'📜 Diploma',     fn:()=>go('diploma')},
        {label:'🏆 Certificate', fn:()=>go('certificate')},
        {label:'🏠 Main Menu',   fn:()=>backToMain()}
    ],
    pg:[
        {label:'💻 M.Sc IT',      fn:()=>go('mscit')},
        {label:'👗 M.Sc Fashion', fn:()=>go('msc_fashion')},
        {label:'🔬 M.Sc Science', fn:()=>go('msc_science')},
        {label:'🌾 M.Sc Agri',    fn:()=>go('msc_agri')},
        {label:'📊 M.Com',        fn:()=>go('mcom')},
        {label:'📚 M.A',          fn:()=>go('ma')},
        {label:'🖥️ PGDCA',       fn:()=>go('pgdca')},
        {label:'🏠 Main Menu',    fn:()=>backToMain()}
    ],
    ug:[
        {label:'💻 BCA',        fn:()=>go('bca')},
        {label:'📈 BBA',        fn:()=>go('bba')},
        {label:'🧾 B.Com',      fn:()=>go('bcom')},
        {label:'🔬 B.Sc',       fn:()=>go('bsc')},
        {label:'🌾 B.Sc Agri',  fn:()=>go('bsc_agri')},
        {label:'📖 B.A',        fn:()=>go('ba')},
        {label:'🛠️ B.Voc',     fn:()=>go('bvoc')},
        {label:'🏠 Main Menu',  fn:()=>backToMain()}
    ],
    fees:[
        {label:'💰 All Fees',   fn:()=>go('fees')},
        {label:'🎓 PG Fees',   fn:()=>go('fees_pg')},
        {label:'📖 UG Fees',   fn:()=>go('fees_ug')},
        {label:'📜 Diploma Fees', fn:()=>go('diploma')},
        {label:'🏠 Main Menu', fn:()=>backToMain()}
    ],
    results:[
        {label:'📊 Check Results',   fn:()=>go('results')},
        {label:'📅 Datesheet',       fn:()=>go('datesheet')},
        {label:'👩‍🏫 Exam Contact',fn:()=>go('faculty')},
        {label:'🏠 Main Menu',       fn:()=>backToMain()}
    ],
    after:[
        {label:'📞 Contact',  fn:()=>go('contact')},
        {label:'💬 WhatsApp', fn:()=>go('whatsapp')},
        {label:'📍 Location', fn:()=>go('location')},
        {label:'🏠 Main Menu',fn:()=>backToMain()}
    ]
};

const MENU_MAP = {
    admission:'admission', eligibility:'admission', portal:'admission', process:'admission', dates:'admission',
    pg:'pg', mscit:'pg', msc_fashion:'pg', msc_science:'pg', msc_agri:'pg', mcom:'pg', ma:'pg', pgdca:'pg',
    ug:'ug', bca:'ug', bba:'ug', bcom:'ug', bsc:'ug', bsc_agri:'ug', ba:'ug', bvoc:'ug',
    courses:'courses', diploma:'after', certificate:'after',
    fees:'fees', fees_pg:'fees', fees_ug:'fees',
    results:'results', datesheet:'results',
    location:'after', whatsapp:'after', hours:'after',
    ar:'after', unknown:'main',
    faculty:'after', contact:'after', timetable:'after', library:'after', hostel:'after'
};

// ── AI Toggle ─────────────────────────────────────────────────
function toggleAI() {
    aiEnabled = !aiEnabled;
    localStorage.setItem('kcp-ai', aiEnabled ? '1' : '0');
    updateAIToggleUI();
    const msg = aiEnabled
        ? `<div class="resp-card success-msg">🤖 <strong>AI Mode ON!</strong><br>Kaur hune smart AI naal jawab degi! ✨</div>`
        : `<div class="resp-card info-msg">📋 <strong>AI Mode OFF</strong><br>Kaur fast rule-based mode vich hai.</div>`;
    botReply(()=>{ addBot(msg, false, 'rule'); playNotif(); showMenu('main'); }, 300);
}

function updateAIToggleUI() {
    const toggleBtn = document.querySelector('.ai-toggle-wrap');
    if (!toggleBtn) return;
    const sw = toggleBtn.querySelector('.ai-toggle-switch');
    const lb = toggleBtn.querySelector('.ai-toggle-label');
    if (sw) sw.classList.toggle('on', aiEnabled);
    if (lb) lb.textContent = aiEnabled ? LANG[currentLang].aiOn : LANG[currentLang].aiOff;
}

// ── Navigation ────────────────────────────────────────────────
function go(intent) {
    isTyping = false;
    saveInterest(intent);
    botReply(()=>{
        const html = getOfflineResponse(intent);
        addBot(html || `<div class="resp-card info-msg">📚 Choose a category below!</div>`, false, 'rule');
        playNotif();
        showMenu(MENU_MAP[intent] || 'after');
    });
}

function goMenu() {
    isTyping = false;
    botReply(()=>{
        addBot(`<div class="resp-card info-msg">📚 <strong>Choose a course category:</strong><br><br>🎓 PG · 📖 UG · 📜 Diploma · 🏆 Certificate</div>`, false, 'rule');
        playNotif();
        showMenu('courses');
    });
}

function backToMain() {
    isTyping = false;
    botReply(()=>{
        addBot(`<div class="resp-card info-msg">${LANG[currentLang].mainMenu}</div>`, false, 'rule');
        playNotif();
        showMenu('main');
    }, 300);
}

// ── botReply ──────────────────────────────────────────────────
function botReply(cb, delay=700) {
    if (isTyping) return;
    isTyping = true;
    const box = document.getElementById('chatMessages');
    const t = document.createElement('div');
    t.id='typingIndicator'; t.className='message bot-message';
    t.innerHTML=`<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="typing-indicator">
            <span class="typing-bot-name">Kaur</span>
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>`;
    box.appendChild(t); scrollBottom();
    setTimeout(()=>{ hideTypingIndicator(); cb(); }, delay);
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

    if (waitingForName) {
        waitingForName = false;
        userName = msg.trim().split(' ')[0];
        localStorage.setItem('kcp-username', userName);
        inp.value = '';
        addUser(msg);
        playUserSound();
        botReply(()=>{
            addBot(`<div class="resp-card success-msg">${LANG[currentLang].nameSaved(userName)}</div>`, false, 'rule');
            playNotif(); showMenu('main');
        });
        return;
    }

    inp.value = '';
    addUser(msg);
    playUserSound();
    const intent = findIntent(msg);

    if (intent !== 'unknown') {
        // Known intent — always use offline DB (fast & reliable)
        // Only unknown/general questions go to AI/server
        saveInterest(intent);
        botReply(()=>{
            addBot(getOfflineResponse(intent)||`<div class="resp-card info-msg">📚 Choose below!</div>`, false, 'rule');
            playNotif();
            showMenu(MENU_MAP[intent]||'after');
        });
    } else {
        // Unknown question — use AI if enabled
        handleUnknown(msg);
    }
}

function showLoadingIndicator() {
    const box=document.getElementById('chatMessages');
    const t=document.createElement('div');
    t.id='typingIndicator'; t.className='message bot-message';
    t.innerHTML=`<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="typing-indicator">
            <span class="typing-bot-name">🤖 ${LANG[currentLang].aiThinking}</span>
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>`;
    box.appendChild(t);
    document.querySelector('.input-wrapper')?.classList.add('ai-thinking');
    scrollBottom();
}

function handleUnknown(msg) {
    // AI OFF — smartFallback use karo
    if(!aiEnabled) {
        botReply(()=>{
            addBot(smartFallback(msg), false, 'rule');
            playNotif();
            showMenu('main');
        });
        return;
    }
    // AI ON — Groq server call karo
    setAvatarState('thinking');
    isTyping = true;
    showLoadingIndicator();
    callServer(msg).then(data=>{
        hideTypingIndicator();
        setAvatarState('talking');
        if(data && data.response) {
            const isAI = data.mode === 'ai';
            addBot(`<div class="resp-card info-msg">${data.response}</div>`, isAI, data.mode);
        } else {
            // Server nahi mila — smartFallback
            addBot(smartFallback(msg), false, 'offline');
        }
        playNotif();
        setTimeout(()=>setAvatarState(''), 1500);
        showMenu('main');
    }).catch(()=>{
        hideTypingIndicator();
        setAvatarState('');
        addBot(smartFallback(msg), false, 'offline');
        showMenu('main');
    });
}

function smartFallback(msg) {
    const m=msg.toLowerCase();
    if(m.match(/hello|hi|sat sri akal|ssa|namaskar/))
        return `<div class="resp-card info-msg">👋 <strong>Sat Sri Akal${userName?', '+userName:''}!</strong> 🌸<br>Main Kaur haan — KCP di guide!<br>Kuch vi puchho 😊</div>`;
    if(m.match(/thank|shukriya|dhanyavad/))
        return `<div class="resp-card success-msg">🌸 <strong>Bahut shukriya${userName?', '+userName:''}!</strong><br>Koi hor sawaal hove ta zaroor puchho! 😊</div>`;
    if(m.match(/bye|goodbye|alvida/))
        return `<div class="resp-card info-msg">👋 <strong>Sat Sri Akal!</strong><br>Kaur hun vi ithe hai jado bhi zaroorat hove! 🌸</div>`;
    if(m.match(/canteen|food|khana|lunch/))
        return `<div class="resp-card info-msg">🍽️ <strong>Canteen</strong><br><br>Campus vich canteen available hai!<br>☎️ 0175-2215835</div>`;
    if(m.match(/sports|nss|ncc|cultural|extra/))
        return `<div class="resp-card info-msg">🏆 <strong>Extra Curricular</strong><br><br>KCP vich NSS, NCC, Sports,<br>Cultural activities available hain!<br>📎 <a href="https://khalsacollegepatiala.org" target="_blank">Details →</a></div>`;
    if(m.match(/parking|park/))
        return `<div class="resp-card info-msg">🚗 <strong>Parking</strong><br><br>Campus vich parking available hai.<br>☎️ 0175-2215835</div>`;
    return `<div class="resp-card error-msg">${LANG[currentLang].unknown}</div>`;
}

// ── Avatar ────────────────────────────────────────────────────
function setAvatarState(state) {
    const av=document.getElementById('headerAvatar');
    if(!av) return;
    av.classList.remove('thinking','talking');
    if(state) av.classList.add(state);
}

// ── addBot / addUser ──────────────────────────────────────────
function addBot(html, isAI, mode) {
    const box=document.getElementById('chatMessages');
    const d=document.createElement('div');
    d.className='message bot-message';
    const badge = isAI ? '<div class="ai-badge">✨ AI · Kaur</div>'
                : mode==='offline' ? '<div class="offline-badge">📵 Offline Mode</div>'
                : '';
    d.innerHTML=`<div class="msg-avatar">${MINI_AVATAR_SVG}</div>
        <div class="message-content">${badge}${html}</div>`;
    box.appendChild(d); scrollBottom();
    setAvatarState('talking'); setTimeout(()=>setAvatarState(''),1500);
    if(box.querySelectorAll('.bot-message').length%3===0) setTimeout(showFeedback,800);
}

function addUser(text) {
    removeMenus();
    const box=document.getElementById('chatMessages');
    const d=document.createElement('div');
    d.className='message user-message';
    d.innerHTML=`<div class="message-content">${esc(text)}</div>`;
    box.appendChild(d); scrollBottom();
}

// ── Show Menu ─────────────────────────────────────────────────
function showMenu(key) {
    removeMenus();
    const items=MENUS[key];
    if(!items) return;
    const box=document.getElementById('chatMessages');
    const wrap=document.createElement('div');
    wrap.className='quick-replies-container';
    const inner=document.createElement('div');
    inner.className='quick-replies';
    items.forEach(item=>{
        if(item.isAI) {
            const div=document.createElement('div');
            div.className='ai-toggle-wrap';
            div.innerHTML=`<span class="ai-toggle-label">${aiEnabled?LANG[currentLang].aiOn:LANG[currentLang].aiOff}</span>
                <div class="ai-toggle-switch ${aiEnabled?'on':''}"></div>`;
            div.addEventListener('click',()=>{ isTyping=false; removeMenus(); toggleAI(); });
            inner.appendChild(div);
            return;
        }
        const btn=document.createElement('button');
        btn.className='quick-reply-btn';
        btn.innerHTML=item.label;
        btn.addEventListener('click',()=>{
            isTyping=false; removeMenus();
            addUser(item.label.replace(/[^\w\s·\-]/g,'').trim()||item.label);
            item.fn();
        });
        inner.appendChild(btn);
    });
    wrap.appendChild(inner);
    box.appendChild(wrap); scrollBottom();
}

function removeMenus() {
    document.querySelectorAll('.quick-replies-container,.feedback-container').forEach(e=>e.remove());
}

// ── Language Toggle ───────────────────────────────────────────
function setLanguage(lang) {
    currentLang=lang;
    localStorage.setItem('kcp-lang',lang);
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
    isTyping=false;
    document.getElementById('chatMessages').innerHTML='';
    removeMenus();
    setTimeout(startChatFlow,200);
}

// ── Status Bar ────────────────────────────────────────────────
function initStatusBar() {
    const bar=document.getElementById('office-status-bar');
    if(!bar) return;
    bar.innerHTML=getOfficeStatusHTML();
    setInterval(()=>{ bar.innerHTML=getOfficeStatusHTML(); },60000);
}

// ── Dark Mode ─────────────────────────────────────────────────
function applyDarkMode() {
    document.body.classList.toggle('dark-mode',darkMode);
    const btn=document.getElementById('dark-toggle');
    if(btn) btn.innerHTML=darkMode?'<i class="fas fa-sun"></i>':'<i class="fas fa-moon"></i>';
}
function toggleDarkMode() { darkMode=!darkMode; localStorage.setItem('kcp-dark',darkMode?'1':'0'); applyDarkMode(); }

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
    applyDarkMode();
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===currentLang));
    initStatusBar();
    initChatbot();
});

function initChatbot() {
    isTyping=false;
    document.getElementById('chatMessages').innerHTML='';
    startChatFlow();
}

function startChatFlow() {
    if(!userName) {
        waitingForName=true;
        botReply(()=>{
            addBot(`<div class="resp-card info-msg">${LANG[currentLang].askName}</div>`, false, 'rule');
            playNotif();
        }, 800);
    } else {
        const extra = getPersonalGreeting() + getRecommendationHTML();
        botReply(()=>{
            addBot(`<div class="resp-card info-msg">${LANG[currentLang].welcome(extra)}</div>`, false, 'rule');
            playNotif();
            showMenu('main');
        }, 800);
    }
}

function clearChat() {
    isTyping=false;
    userName='';
    localStorage.removeItem('kcp-username');
    document.getElementById('chatMessages').innerHTML='';
    startChatFlow();
}

function handleKeyPress(e) { if(e.key==='Enter') sendMessage(); }

// ── Feedback ──────────────────────────────────────────────────
function showFeedback() {
    const box=document.getElementById('chatMessages');
    if(box.querySelector('.feedback-container')) return;
    const wrap=document.createElement('div');
    wrap.className='feedback-container';
    wrap.innerHTML=`<div class="feedback-card">
        <span class="feedback-label">Rate Kaur's reply</span>
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
// Jado USER msg send kare — swoosh (low to high)
function playUserSound() {
    if(localStorage.getItem('kcp-sound')==='0') return;
    try {
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type='sine';
        osc.frequency.setValueAtTime(350,ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580,ctx.currentTime+0.09);
        gain.gain.setValueAtTime(0.06,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.14);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.14);
    } catch(e){}
}

// Jado BOT reply kare — ding (high to low)
function playNotif() {
    if(localStorage.getItem('kcp-sound')==='0') return;
    try {
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type='sine';
        osc.frequency.setValueAtTime(880,ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660,ctx.currentTime+0.12);
        gain.gain.setValueAtTime(0.08,ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.22);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime+0.22);
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
    const overlay=document.createElement('div');
    overlay.id='ar-overlay';
    overlay.innerHTML=`
    <div class="ar-modal">
        <div class="ar-header">
            <span>🏛️ Khalsa College Patiala — 3D Campus</span>
            <div class="ar-controls-hint">🖱️ Drag · Scroll to zoom</div>
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
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload=initThreeScene;
    document.head.appendChild(s);
}

function closeARMap() {
    document.getElementById('ar-overlay')?.remove();
    if(window._arAnimId) cancelAnimationFrame(window._arAnimId);
    if(window._arRenderer) { window._arRenderer.dispose(); window._arRenderer=null; }
}

function initThreeScene() {
    const canvas=document.getElementById('ar-canvas');
    if(!canvas) return;
    const W=canvas.clientWidth||460, H=canvas.clientHeight||300;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.setClearColor(0x0d1117,1);
    window._arRenderer=renderer;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(55,W/H,0.1,1000);
    camera.position.set(0,18,28); camera.lookAt(0,0,0);
    scene.add(new THREE.AmbientLight(0xffeedd,0.6));
    const dir=new THREE.DirectionalLight(0xfff8f0,1.2);
    dir.position.set(15,25,15); dir.castShadow=true; scene.add(dir);
    scene.add(new THREE.HemisphereLight(0x9B8FC4,0x4A2D35,0.4));
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshLambertMaterial({color:0x1a3a1a}));
    ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
    scene.add(new THREE.GridHelper(60,30,0x2a5a2a,0x2a5a2a));
    const buildings=[
        {name:'Main Academic Block',pos:[0,0,0],    size:[12,6,8],  color:0xC4637A},
        {name:'Library',            pos:[-10,0,6],  size:[6,4,6],   color:0x9B8FC4},
        {name:'Science Labs',       pos:[10,0,6],   size:[7,3.5,6], color:0x4A9B7F},
        {name:'Sports Ground',      pos:[0,0,14],   size:[14,0.3,8],color:0xC4A84A},
        {name:'Hostel Block',       pos:[-12,0,-6], size:[6,5,8],   color:0x7A9BC4},
        {name:'Admin Block',        pos:[10,0,-6],  size:[6,4,6],   color:0xC47A4A},
        {name:'Canteen',            pos:[0,0,-10],  size:[5,2.5,4], color:0xB5ABDA},
        {name:'Parking Area',       pos:[14,0,0],   size:[8,0.2,6], color:0x555555}
    ];
    const meshes=[];
    buildings.forEach(b=>{
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(...b.size),new THREE.MeshLambertMaterial({color:b.color}));
        mesh.position.set(b.pos[0],b.pos[1]+b.size[1]/2,b.pos[2]);
        mesh.castShadow=true; mesh.receiveShadow=true; mesh.userData.name=b.name;
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(...b.size)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.12})));
        scene.add(mesh); meshes.push(mesh);
    });
    [[-6,0,10],[6,0,10],[-4,0,-4],[4,0,-4],[-8,0,0],[8,0,0]].forEach(([x,,z])=>{
        const t=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,1.5,6),new THREE.MeshLambertMaterial({color:0x5C3D1E}));
        t.position.set(x,.75,z); scene.add(t);
        const l=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),new THREE.MeshLambertMaterial({color:0x2D8B2D}));
        l.position.set(x,2.5,z); scene.add(l);
    });
    let isDragging=false,lastX=0,lastY=0,rotX=0.3,rotY=0,radius=28;
    canvas.addEventListener('mousedown',e=>{isDragging=true;lastX=e.clientX;lastY=e.clientY;});
    canvas.addEventListener('mousemove',e=>{
        if(!isDragging) return;
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
    const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
    const tip=document.getElementById('ar-tooltip');
    canvas.addEventListener('mousemove',e=>{
        if(isDragging) return;
        const r=canvas.getBoundingClientRect();
        mouse.x=((e.clientX-r.left)/r.width)*2-1;
        mouse.y=-((e.clientY-r.top)/r.height)*2+1;
        raycaster.setFromCamera(mouse,camera);
        const hits=raycaster.intersectObjects(meshes);
        if(hits.length){tip.textContent=hits[0].object.userData.name;tip.style.opacity='1';tip.style.left=(e.clientX-r.left+10)+'px';tip.style.top=(e.clientY-r.top-30)+'px';}
        else tip.style.opacity='0';
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
