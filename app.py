from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

# ============================================================
#  Khalsa College Patiala — Chatbot Flask Backend
#  app.py — With Groq AI + Rule-Based Fallback
# ============================================================

# ── Groq AI Setup ─────────────────────────────────────────────
try:
    from groq import Groq
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    if groq_client:
        print("✅ Groq AI connected!")
    else:
        print("⚠️  No GROQ_API_KEY — using rule-based mode")
except ImportError:
    groq_client = None
    print("⚠️  groq package nahi — using rule-based mode")

COLLEGE_SYSTEM_PROMPT = """Tu Khalsa College Patiala da helpful inquiry chatbot hai.
Sirf college baare questions da jawab de — admissions, courses, fees, results, faculty, contact.

College di key info:
- Phone: 0175-2215835
- Email: khalsacollegepatiala@gmail.com
- Address: Badungar Road, Patiala, Punjab 147001
- Admission Portal: kcpadmissions.in
- Results: kcpresults.in/results
- Principal: Dr. Dharminder Singh Ubha (98557-11380)
- Controller of Exam: Dr. Jaspreet Kaur (97804-84847, kcpexamgrievance@gmail.com)
- Deputy Controller: Dr. Jagjit Singh (78145-11707)
- UG Courses: BCA, BBA, B.Com, B.Sc Medical/Non-Medical/CSM/Biotech/Agriculture, B.A, B.Voc
- PG Courses: M.Sc IT, M.Sc Fashion, M.Sc Physics/Chemistry/Geography/Agriculture, M.Com, M.A, MBA, PGDCA
- Diploma: Computer Hardware, Green House Tech, French
- Certificate: 14 courses including Sikh Studies, Web Dev, Spoken English, Bakery etc.
- M.Sc IT fees: Sem1=28040, Sem2=12050. Total approx 80000-100000
- UG fees: BCA/BBA 60000-70000, B.Com 40000-60000, B.Sc 40000-100000
- Admission 2025-26: CLOSED
- Office Hours: Mon-Sat, 9AM-4PM

Chhote, clear aur friendly jawab de. Punjabi/Hindi/English teeno samajh sakda hai.
Emojis use kar jawab nu sundar banane vaaste.
College toh bahar de topics te na jaa — sirf college info."""

def get_ai_response(user_message):
    """Groq AI toh response lo — fail hove ta None return karo"""
    if not groq_client:
        return None
    try:
        chat = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": COLLEGE_SYSTEM_PROMPT},
                {"role": "user",   "content": user_message}
            ],
            max_tokens=400,
            temperature=0.7
        )
        return chat.choices[0].message.content
    except Exception as e:
        print(f"Groq error: {e}")
        return None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ── College Database (Rule-Based Fallback) ────────────────────
COLLEGE_DB = {
    "admission": {
        "status": (
            "🚫 <strong>Admission Status: CLOSED</strong> — Session 2025–26<br><br>"
            "Admissions for Session 2025–26 are now closed.<br>"
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
            "<strong>Step 1:</strong> Visit kcpadmissions.in<br>"
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
            "🎓 <strong>Postgraduate Courses</strong><br><br>"
            "💻 M.Sc IT — ₹80,000–₹1,00,000<br>"
            "👗 M.Sc Fashion Design — ₹80,000–₹1,20,000<br>"
            "🔬 M.Sc Physics/Chemistry/Geography — ₹80,000–₹1,00,000<br>"
            "🌾 M.Sc Agriculture — ₹1,00,000–₹1,50,000<br>"
            "📊 M.Com — ₹60,000–₹80,000<br>"
            "📚 M.A (Multiple subjects) — ₹25,000–₹50,000<br>"
            "💼 MBA — Graduation required<br>"
            "🖥️ PGDCA — ₹30,000–₹40,000"
        ),
        "ug": (
            "🎓 <strong>Undergraduate Courses</strong><br><br>"
            "💻 BCA — ₹60,000–₹70,000<br>"
            "📈 BBA — ₹60,000–₹70,000<br>"
            "🧾 B.Com/B.Com Hons. — ₹40,000–₹60,000<br>"
            "🔬 B.Sc Medical/Non-Medical/CSM — ₹40,000–₹1,00,000<br>"
            "🌾 B.Sc Agriculture — ₹1,50,000–₹2,00,000<br>"
            "📖 B.A/B.A Hons. — ₹35,000–₹60,000<br>"
            "🛠️ B.Voc — ₹70,000–₹90,000"
        ),
        "diploma": (
            "📜 <strong>Diploma Courses (1 Year)</strong><br><br>"
            "🖥️ Computer Hardware &amp; Networking — ₹15,000–₹25,000<br>"
            "🌿 Green House Technology — ₹15,000–₹25,000<br>"
            "🇫🇷 French/Intensive French — ₹10,000–₹20,000"
        ),
        "certificate": (
            "🏆 <strong>Certificate Courses</strong><br><br>"
            "Sikh Studies, Agriculture Accounting, Personality Development,<br>"
            "Office Automation, Web Development, Bakery, Spoken English,<br>"
            "Bee Keeping, Solar PV, Folk Music, Anchoring, Creative Writing,<br>"
            "Translation, Pharmaceutical Chemistry — ₹3,000–₹10,000"
        )
    },
    "fees": (
        "💰 <strong>Fee Structure 2025–26</strong><br><br>"
        "🔗 <a href='https://www.kcpadmissions.in' target='_blank'>kcpadmissions.in</a><br><br>"
        "<strong>M.Sc IT:</strong> Sem1=₹28,040 | Sem2=₹12,050<br><br>"
        "💳 Payment: Counter or Online portal<br><br>"
        "ℹ️ Visit office for exact course-wise fees."
    ),
    "results": (
        "📊 <strong>Results Portal</strong><br><br>"
        "🔗 <a href='https://kcpresults.in/results' target='_blank'>kcpresults.in/results</a><br><br>"
        "✉️ kcpexamgrievance@gmail.com<br>"
        "📞 97804-84847 (Dr. Jaspreet Kaur)"
    ),
    "datesheet": (
        "📅 <strong>Exam Datesheet</strong><br><br>"
        "🔗 <a href='https://khalsacollegepatiala.org/datesheets' target='_blank'>khalsacollegepatiala.org/datesheets</a>"
    ),
    "timetable": (
        "⏰ <strong>Class Timetable</strong><br><br>"
        "Please visit the college office.<br>"
        "📍 Badungar Road, Patiala | ☎️ 0175-2215835"
    ),
    "faculty": (
        "👩‍🏫 <strong>Key Contacts</strong><br><br>"
        "👑 Principal: Dr. Dharminder Singh Ubha | 📞 98557-11380<br><br>"
        "🎯 Controller: Dr. Jaspreet Kaur | 📞 97804-84847<br>"
        "✉️ kcpexamgrievance@gmail.com<br><br>"
        "🔹 Deputy: Dr. Jagjit Singh | 📞 78145-11707"
    ),
    "contact": (
        "📞 <strong>Contact Khalsa College Patiala</strong><br><br>"
        "☎️ 0175-2215835<br>"
        "✉️ khalsacollegepatiala@gmail.com<br><br>"
        "📍 Badungar Road, Patiala, Punjab – 147001<br>"
        "🕐 Mon–Sat, 9:00 AM – 4:00 PM"
    ),
    "library": "📚 Please visit the college library on campus for timings and facilities.",
    "hostel":  "🏠 For hostel info, visit the college office. ☎️ 0175-2215835"
}

KEYWORDS = {
    "admission":   ["admission","admit","apply","register","join","session","2025","closed","seat","le sakde","le sakdi"],
    "eligibility": ["eligibility","eligible","qualify","criteria","minimum marks","10+2","kitni percentage","marks chahide"],
    "portal":      ["portal","link","online form","apply online","kcpadmissions","form bharo"],
    "process":     ["process","procedure","steps","how to apply","document","upload","kive apply"],
    "dates":       ["last date","deadline","kado tak","kado ton","admission date","end date"],
    "pg":          ["pg","postgraduate","msc","m.sc","mcom","mba","masters","pgdca","post graduation"],
    "ug":          ["ug","undergraduate","bca","bba","bcom","b.com","bsc","b.sc","bvoc","bachelor","b.a"],
    "diploma":     ["diploma","hardware","networking","french","greenhouse"],
    "certificate": ["certificate","sikh studies","web development","spoken english","bee keeping","bakery","anchoring"],
    "courses":     ["course","courses","program","degree","study","stream","kaunse course","all course"],
    "fees":        ["fee","fees","cost","rupee","₹","amount","how much","kitni","kitne","payment","lagdi","lagde"],
    "results":     ["result","results","marks","grade","merit","pass","fail"],
    "datesheet":   ["datesheet","date sheet","exam date","exam schedule","paper date","exam kado"],
    "timetable":   ["timetable","time table","class schedule","class time","routine","class kado"],
    "faculty":     ["teacher","faculty","professor","principal","controller","jaspreet","ubha","jagjit"],
    "contact":     ["contact","phone","number","email","address","kithey hai","college address","kithey","kidhar"],
    "library":     ["library","books","reading room","kitab"],
    "hostel":      ["hostel","accommodation","stay","boarding","mess","rehna"]
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

def get_rule_response(intent):
    responses = {
        "admission":   COLLEGE_DB["admission"]["status"],
        "eligibility": COLLEGE_DB["admission"]["eligibility"],
        "portal":      COLLEGE_DB["admission"]["portal"],
        "process":     COLLEGE_DB["admission"]["process"],
        "dates":       COLLEGE_DB["admission"]["dates"],
        "courses":     "📚 We offer PG, UG, Diploma &amp; Certificate programmes!",
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
        "unknown":     "🤔 Please ask about admissions, courses, fees, results or faculty!"
    }
    return responses.get(intent, responses["unknown"])

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

@app.route('/admin.html')
def admin():
    return send_from_directory('.', 'admin.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data received"}), 400

    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({"response": "Please type your query!", "intent": "unknown"})

    # ── 1. Groq AI try karo ──
    ai_response = get_ai_response(user_message)

    if ai_response:
        intent = find_intent(user_message)
        response = ai_response
        mode = "ai"
    else:
        # ── 2. Rule-based fallback ──
        intent = find_intent(user_message)
        response = get_rule_response(intent)
        mode = "rule"

    print(f"[{datetime.now().strftime('%H:%M:%S')}] [{mode.upper()}] '{user_message}' → {intent}")

    return jsonify({
        "response":  response,
        "intent":    intent,
        "mode":      mode,
        "timestamp": datetime.now().isoformat()
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
        return jsonify({"status": "success", "total": len(FAQ_DB)})
    return jsonify({"faqs": FAQ_DB, "total": len(FAQ_DB)})

@app.route('/api/faq/<int:faq_id>', methods=['DELETE'])
def delete_faq(faq_id):
    if 0 <= faq_id < len(FAQ_DB):
        removed = FAQ_DB.pop(faq_id)
        return jsonify({"status": "success", "removed": removed})
    return jsonify({"status": "error", "message": "FAQ not found"}), 404

@app.route('/api/admin/stats')
def stats():
    return jsonify({
        "active_faqs":  len(FAQ_DB),
        "ai_mode":      groq_client is not None,
        "last_update":  datetime.now().strftime("%Y-%m-%d"),
        "server_time":  datetime.now().isoformat()
    })

@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "ai":     groq_client is not None,
        "timestamp": datetime.now().isoformat()
    })

# ── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 50)
    print("✅  Khalsa College Patiala Chatbot")
    print(f"🤖  AI Mode: {'Groq ON' if groq_client else 'Rule-Based'}")
    print("=" * 50)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
