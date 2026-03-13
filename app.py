from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

# ============================================================
#  Khalsa College Patiala — Chatbot Flask Backend
#  app.py
# ============================================================

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ── College Database ──────────────────────────────────────────
COLLEGE_DB = {
    "admission": {
        "status": (
            "🚫 <strong>Admission Status: CLOSED</strong> — Session 2025–26<br><br>"
            "Admissions for Session 2025–26 are now closed. Thank you for your interest!<br>"
            "For more details, please visit the college in person.<br><br>"
            "✨ <em>Stay curious. Stay ready. See you in the next cycle!</em>"
        ),
        "portal": (
            "🌐 <strong>Online Admission Portal</strong><br><br>"
            "👉 <a href='https://kcpadmissions.in' target='_blank'>kcpadmissions.in</a><br><br>"
            "Register, fill form, upload documents &amp; pay fees — all online!"
        ),
        "process": (
            "📋 <strong>Admission Process</strong><br><br>"
            "<strong>Step 1:</strong> Visit <a href='https://kcpadmissions.in' target='_blank'>kcpadmissions.in</a><br>"
            "<strong>Step 2:</strong> Register with your basic details<br>"
            "<strong>Step 3:</strong> Fill the Application Form online<br>"
            "<strong>Step 4:</strong> Upload required documents as JPG<br>"
            "<strong>Step 5:</strong> Pay Registration / Admission Fee online"
        ),
        "dates": (
            "📅 <strong>Important Admission Dates — 2025-26</strong><br><br>"
            "Exact dates will be updated soon on the official portal.<br><br>"
            "✅ <strong>Online Registration:</strong> Started<br>"
            "🔗 <a href='https://kcpadmissions.in' target='_blank'>Check Portal for Updates</a>"
        ),
        "eligibility": (
            "✅ <strong>General Eligibility</strong><br><br>"
            "🎓 <strong>UG Courses:</strong> 10+2 pass from recognised board<br>"
            "🎓 <strong>PG Courses:</strong> Graduation with min. 50% marks<br>"
            "🎓 <strong>M.Sc IT:</strong> Graduation (50%) from recognised university<br>"
            "🎓 <strong>MBA:</strong> Graduation from recognised university<br><br>"
            "ℹ️ Exact eligibility varies by course — visit portal for details."
        )
    },
    "courses": {
        "pg": (
            "🎓 <strong>Postgraduate Courses (Approx Fees)</strong><br><br>"
            "💻 <strong>M.Sc IT / IT Lateral</strong> — ₹80,000–₹1,00,000 | 2 Yrs<br>"
            "&nbsp;&nbsp;&nbsp;↳ 1st Sem: ₹28,040 &nbsp;|&nbsp; 2nd Sem: ₹12,050<br>"
            "&nbsp;&nbsp;&nbsp;↳ Eligibility: Graduation (50%)<br><br>"
            "👗 <strong>M.Sc Fashion Design &amp; Tech</strong> — ₹80,000–₹1,20,000<br>"
            "🔬 <strong>M.Sc Physics / Chemistry / Geography</strong> — ₹80,000–₹1,00,000<br>"
            "🌾 <strong>M.Sc Agriculture</strong> — ₹1,00,000–₹1,50,000<br>"
            "📊 <strong>M.Com</strong> — ₹60,000–₹80,000<br>"
            "📚 <strong>M.A</strong> (English/History/Pol.Sci/Psychology/Economics/Music) — ₹25,000–₹50,000<br>"
            "💼 <strong>MBA Leadership Development</strong> — Graduation | 2 Yrs<br>"
            "🖥️ <strong>PGDCA</strong> — ₹30,000–₹40,000<br><br>"
            "ℹ️ Fees are approximate. Visit office for exact details."
        ),
        "ug": (
            "🎓 <strong>Undergraduate Courses (3–4 Years)</strong><br><br>"
            "💻 <strong>BCA</strong> — ₹60,000–₹70,000<br>"
            "📈 <strong>BBA</strong> — ₹60,000–₹70,000<br>"
            "🧾 <strong>B.Com / B.Com Hons.</strong> — ₹40,000–₹60,000<br>"
            "🔬 <strong>B.Sc Medical / Non-Medical / CSM</strong> — ₹40,000–₹1,00,000<br>"
            "🧬 <strong>B.Sc Biotechnology</strong> — ₹70,000–₹1,00,000<br>"
            "🌾 <strong>B.Sc Agriculture</strong> — ₹1,50,000–₹2,00,000<br>"
            "📖 <strong>B.A / B.A Hons. English</strong> — ₹35,000–₹60,000<br>"
            "🛠️ <strong>B.Voc</strong> (Software Dev / Agriculture / Automobile) — ₹70,000–₹90,000<br><br>"
            "ℹ️ Fees are approximate. Visit office for exact details."
        ),
        "diploma": (
            "📜 <strong>Diploma Courses (1 Year)</strong><br><br>"
            "🖥️ <strong>Computer Hardware &amp; Networking</strong> — ₹15,000–₹25,000<br>"
            "🌿 <strong>Green House Technology</strong> — ₹15,000–₹25,000<br>"
            "🇫🇷 <strong>French / Intensive French</strong> — ₹10,000–₹20,000"
        ),
        "certificate": (
            "🏆 <strong>Certificate Courses</strong><br><br>"
            "📿 Sikh Studies — ₹3,000–₹6,000<br>"
            "🌾 Agriculture Accounting — ₹3,000–₹6,000<br>"
            "🌟 Personality Development — ₹3,000–₹6,000<br>"
            "💻 Office Automation — ₹5,000–₹8,000<br>"
            "🌐 Web Development — ₹5,000–₹10,000<br>"
            "🍰 Bakery &amp; Confectionery — ₹5,000–₹10,000<br>"
            "🗣️ Spoken English — ₹3,000–₹7,000<br>"
            "🐝 Bee Keeping — ₹3,000–₹6,000<br>"
            "☀️ Solar PV System Design — ₹5,000–₹10,000<br>"
            "🎵 Folk Music / Folk Embroidery — ₹3,000–₹6,000<br>"
            "🎤 Anchoring — ₹3,000–₹6,000<br>"
            "✍️ Creative Writing — ₹3,000–₹6,000<br>"
            "🔤 Translation Proficiency — ₹3,000–₹6,000<br>"
            "🧪 Pharmaceutical Chemistry — ₹5,000–₹8,000"
        )
    },
    "fees": (
        "💰 <strong>Fee Structure 2025–26</strong><br><br>"
        "🔗 Official: <a href='https://www.kcpadmissions.in' target='_blank'>kcpadmissions.in</a><br><br>"
        "<strong>M.Sc IT (Example):</strong><br>"
        "&nbsp;&nbsp;• 1st Semester: ₹28,040<br>"
        "&nbsp;&nbsp;• 2nd Semester: ₹12,050<br><br>"
        "💳 <strong>Payment Methods:</strong><br>"
        "&nbsp;&nbsp;• Fee Counter / Reception Desk<br>"
        "&nbsp;&nbsp;• Online Payment on portal<br><br>"
        "ℹ️ Fees are approximate. Contact college office for exact course-wise details."
    ),
    "results": (
        "📊 <strong>Results Portal</strong><br><br>"
        "🔗 <a href='https://kcpresults.in/results' target='_blank'>kcpresults.in/results</a><br><br>"
        "For queries:<br>"
        "✉️ kcpexamgrievance@gmail.com<br>"
        "📞 97804-84847 (Dr. Jaspreet Kaur)"
    ),
    "datesheet": (
        "📅 <strong>Exam Datesheet</strong><br><br>"
        "🔗 <a href='https://khalsacollegepatiala.org/datesheets' target='_blank'>khalsacollegepatiala.org/datesheets</a><br><br>"
        "For queries: ✉️ kcpexamgrievance@gmail.com"
    ),
    "timetable": (
        "⏰ <strong>Class Timetable</strong><br><br>"
        "Please visit the <strong>college office</strong> for the latest class timetable.<br><br>"
        "📍 Badungar Road, Patiala, Punjab – 147001<br>"
        "☎️ 0175-2215835"
    ),
    "faculty": (
        "👩‍🏫 <strong>Key Academic Contacts</strong><br><br>"
        "👑 <strong>Principal:</strong> Dr. Dharminder Singh Ubha &nbsp;|&nbsp; 📞 98557-11380<br><br>"
        "🎯 <strong>Controller of Examination:</strong> Dr. Jaspreet Kaur<br>"
        "&nbsp;&nbsp;&nbsp;📞 97804-84847 &nbsp;|&nbsp; ✉️ kcpexamgrievance@gmail.com<br><br>"
        "🔹 <strong>Deputy Controller:</strong> Dr. Jagjit Singh &nbsp;|&nbsp; 📞 78145-11707<br><br>"
        "📚 <strong>30+ Departments:</strong> Computer Science · Agriculture · Commerce · English · "
        "Physics · Chemistry · Mathematics · Fashion Design · Biotechnology · Psychology · "
        "Music · Geography · Punjabi · History · Political Science · Economics · Fine Arts · "
        "Theatre · Hindi · Botany · Zoology · Sociology · Physical Education · "
        "Religious Studies · Defence Studies &amp; more"
    ),
    "contact": (
        "📞 <strong>Contact Khalsa College Patiala</strong><br><br>"
        "☎️ <strong>Phone:</strong> 0175-2215835<br>"
        "✉️ <strong>Email:</strong> khalsacollegepatiala@gmail.com<br>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
        "info@khalsacollegepatiala.org<br><br>"
        "📍 <strong>Address:</strong><br>"
        "&nbsp;&nbsp;General Shivdev Singh Diwan Gurbachan Singh<br>"
        "&nbsp;&nbsp;Khalsa College Patiala,<br>"
        "&nbsp;&nbsp;Badungar Road, Patiala, Punjab – 147001<br><br>"
        "🕐 <strong>Office Hours:</strong> Mon–Sat, 9:00 AM – 4:00 PM"
    ),
    "library": (
        "📚 <strong>Library</strong><br><br>"
        "Please visit the <strong>college library</strong> for timings and available facilities.<br><br>"
        "📍 Located inside the main campus."
    ),
    "hostel": (
        "🏠 <strong>Hostel Facilities</strong><br><br>"
        "For hostel facilities, availability and fees,<br>"
        "please visit the <strong>college office</strong>.<br><br>"
        "☎️ 0175-2215835"
    )
}

# ── Keyword Map ───────────────────────────────────────────────
KEYWORDS = {
    "admission":   ["admission","admit","apply","register","registration","enroll","how to join","join","session","2025","open","closed","seat","le sakde","le sakdi"],
    "eligibility": ["eligibility","eligible","qualify","qualification","criteria","minimum marks","10+2","who can apply","kitni percentage","percentage chahidi","marks chahide"],
    "portal":      ["portal","link","online form","apply online","kcpadmissions","form bharo"],
    "process":     ["process","procedure","steps","how to apply","document","upload","kida apply","kive apply"],
    "dates":       ["last date","deadline","kado","kado ton","kado tak","admission date","start date","open date","end date"],
    "pg":          ["pg","post graduate","postgraduate","msc","m.sc","mcom","m.com","mba","m.b.a","masters","master","pgdca","post graduation"],
    "ug":          ["ug","under graduate","undergraduate","bca","bba","bcom","b.com","bsc","b.sc","bvoc","b.voc","bachelor","ba course","b.a"],
    "diploma":     ["diploma","hardware","networking","french","greenhouse","green house"],
    "certificate": ["certificate","sikh studies","web development","web dev","spoken english","bee keeping","bakery","anchoring","creative writing","folk music","translation","pharmaceutical","short course"],
    "courses":     ["course","courses","program","programme","degree","study","stream","available","kaunse course","list of","all course"],
    "fees":        ["fee","fees","cost","price","rupee","rupees","₹","amount","charge","how much","kitni","kitne","payment","tuition","semester fee","sem fee","lagdi","lagde","lagna"],
    "results":     ["result","results","marks","grade","scorecard","merit","pass","fail","result kado","result kive"],
    "datesheet":   ["datesheet","date sheet","exam date","exam schedule","paper date","exam kado","paper schedule","when is exam"],
    "timetable":   ["timetable","time table","class schedule","class time","lecture","period","routine","class kado"],
    "faculty":     ["teacher","faculty","professor","staff","principal","controller","hod","head","jaspreet","ubha","jagjit","department head","teacher da number"],
    "contact":     ["contact","phone","number","call","email","address","location","reach","office","helpline","kithey hai","where is","college address","kithey","kidhar"],
    "library":     ["library","books","reading room","lib","kitab"],
    "hostel":      ["hostel","accommodation","room","stay","boarding","mess","rehna"]
}

FAQ_DB = []

# ── Intent Finder ─────────────────────────────────────────────
def find_intent(message):
    message = message.lower().strip()
    priority = [
        "eligibility","portal","process","dates",
        "pg","ug","diploma","certificate",
        "library","hostel","results","datesheet",
        "timetable","faculty","contact","fees",
        "courses","admission"
    ]
    for intent in priority:
        if intent in KEYWORDS:
            if any(kw in message for kw in KEYWORDS[intent]):
                return intent
    return "unknown"

# ── Get Response ──────────────────────────────────────────────
def get_response(intent):
    responses = {
        "admission":   COLLEGE_DB["admission"]["status"],
        "eligibility": COLLEGE_DB["admission"]["eligibility"],
        "portal":      COLLEGE_DB["admission"]["portal"],
        "process":     COLLEGE_DB["admission"]["process"],
        "dates":       COLLEGE_DB["admission"]["dates"],
        "courses":     "📚 We offer PG, UG, Diploma &amp; Certificate programmes. Choose a category!",
        "pg":          COLLEGE_DB["courses"]["pg"],
        "ug":          COLLEGE_DB["courses"]["ug"],
        "diploma":     COLLEGE_DB["courses"]["diploma"],
        "certificate": COLLEGE_DB["courses"]["certificate"],
        "fees":        COLLEGE_DB["fees"],
        "results":     COLLEGE_DB["results"],
        "datesheet":   COLLEGE_DB["datesheet"],
        "timetable":   COLLEGE_DB["timetable"],
        "faculty":     COLLEGE_DB["faculty"],
        "contact":     COLLEGE_DB["contact"],
        "library":     COLLEGE_DB["library"],
        "hostel":      COLLEGE_DB["hostel"],
        "unknown": (
            "🤔 I didn't catch that! Try asking about "
            "<strong>admissions, courses, fees, results, faculty</strong> or use the menu!"
        )
    }
    return responses.get(intent, responses["unknown"])

def get_suggestions(intent):
    suggestions = {
        "admission":   ["Eligibility", "Portal", "Process", "Dates", "Main Menu"],
        "eligibility": ["Portal", "Process", "Courses", "Main Menu"],
        "courses":     ["PG Courses", "UG Courses", "Diploma", "Certificate", "Main Menu"],
        "pg":          ["UG Courses", "Fees", "Eligibility", "Main Menu"],
        "ug":          ["PG Courses", "Fees", "Eligibility", "Main Menu"],
        "fees":        ["PG Fees", "UG Fees", "Fee Portal", "Main Menu"],
        "results":     ["Datesheet", "Exam Contact", "Main Menu"],
    }
    return suggestions.get(intent, ["Admission", "Courses", "Fees", "Contact", "Main Menu"])

# ── Routes ────────────────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({"response": "Please type your query!", "intent": "unknown"})

    intent   = find_intent(user_message)
    response = get_response(intent)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] '{user_message}' → {intent}")

    return jsonify({
        "response":    response,
        "intent":      intent,
        "suggestions": get_suggestions(intent),
        "timestamp":   datetime.now().isoformat()
    })

# ── FAQ Routes ────────────────────────────────────────────────
@app.route('/api/faq', methods=['GET', 'POST'])
def faq():
    if request.method == 'POST':
        faq_data = request.get_json()
        if not faq_data:
            return jsonify({"status": "error", "message": "No data"}), 400
        FAQ_DB.append({
            "question": faq_data.get('question'),
            "answer":   faq_data.get('answer'),
            "category": faq_data.get('category', 'general'),
            "added":    datetime.now().isoformat()
        })
        return jsonify({"status": "success", "message": "FAQ added", "total": len(FAQ_DB)})
    return jsonify({"faqs": FAQ_DB, "total": len(FAQ_DB)})

@app.route('/api/faq/<int:faq_id>', methods=['DELETE'])
def delete_faq(faq_id):
    if 0 <= faq_id < len(FAQ_DB):
        removed = FAQ_DB.pop(faq_id)
        return jsonify({"status": "success", "removed": removed})
    return jsonify({"status": "error", "message": "FAQ not found"}), 404

# ── Admin & Health ────────────────────────────────────────────
@app.route('/api/admin/stats')
def stats():
    return jsonify({
        "active_faqs":       len(FAQ_DB),
        "intents_available": len(KEYWORDS),
        "uptime":            "99.9%",
        "last_update":       datetime.now().strftime("%Y-%m-%d"),
        "server_time":       datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# ── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    os.makedirs("logs", exist_ok=True)
    print("=" * 50)
    print("✅  Khalsa College Patiala Chatbot Server")
    print("🌐  http://localhost:5000")
    print("=" * 50)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
