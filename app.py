from dotenv import load_dotenv
load_dotenv()
import os
os.environ["GROQ_API_KEY"] = "gsk_xxxxxxxx"

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

# ============================================================
#  Khalsa College Patiala — Chatbot Flask Backend  v2.0
#  Connects with script.js v5.0
# ============================================================

# ── Groq AI ───────────────────────────────────────────────────
try:
    from groq import Groq
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    groq_client  = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
    print("✅ Groq AI connected!" if groq_client else "⚠️  No GROQ_API_KEY — rule-based mode")
except ImportError:
    groq_client = None
    print("⚠️  groq package nahi — rule-based mode")

COLLEGE_SYSTEM = """Tu Khalsa College Patiala di friendly inquiry assistant "Preet" hai.
Sirf college baare questions da jawab de. Chhote, warm aur helpful jawab de.
Emojis use kar. Punjabi/Hindi/English teeno samajh sakdi hai.
College toh bahar de topics te na jaa.

College info:
- Phone: 0175-2215835 | Email: khalsacollegepatiala@gmail.com
- Address: Badungar Road, Patiala, Punjab 147001
- Portal: kcpadmissions.in | Results: kcpresults.in/results
- Principal: Dr. Dharminder Singh Ubha (98557-11380)
- Controller: Dr. Jaspreet Kaur (97804-84847)
- Admission 2025-26: CLOSED
- Office Hours: Mon-Sat 9AM-4PM"""

def get_ai_response(message, username="", lang="en"):
    if not groq_client:
        return None
    try:
        system = COLLEGE_SYSTEM
        if username:
            system += f"\nStudent da naam {username} hai — personally address kar."
        if lang == "pa":
            system += "\nPunjabi vich jawab de (Gurmukhi nahi, Roman Punjabi theek hai)."
        elif lang == "hi":
            system += "\nHindi vich jawab de."

        chat = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system",  "content": system},
                {"role": "user",    "content": message}
            ],
            max_tokens=400,
            temperature=0.7
        )
        return chat.choices[0].message.content
    except Exception as e:
        print(f"Groq error: {e}")
        return None

app = Flask(__name__)

# ── CORS — allow frontend to connect ─────────────────────────
# Development: allow all origins
# Production: change to your actual domain
#   e.g. origins=["https://yourdomain.com"]
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Rule-Based Responses ──────────────────────────────────────
KEYWORDS = {
    "admission":   ["admission","admit","apply","register","join","2025","closed","seat","daakhla"],
    "eligibility": ["eligibility","eligible","qualify","criteria","marks chahide"],
    "portal":      ["portal","online form","kcpadmissions","form bharo"],
    "process":     ["process","steps","how to apply","kive apply"],
    "dates":       ["last date","deadline","kado tak","admission date"],
    "pg":          ["pg","postgraduate","msc","mcom","mba","masters","pgdca"],
    "ug":          ["ug","undergraduate","bca","bba","bcom","bsc","bvoc","bachelor"],
    "diploma":     ["diploma","hardware","networking","french","greenhouse"],
    "certificate": ["certificate","sikh studies","web development","spoken english","bakery"],
    "courses":     ["course","courses","program","degree","study"],
    "fees":        ["fee","fees","cost","rupee","how much","kitni","payment","lagdi"],
    "results":     ["result","results","marks","grade","pass","fail"],
    "datesheet":   ["datesheet","exam date","exam kado"],
    "timetable":   ["timetable","class schedule","class kado"],
    "faculty":     ["teacher","faculty","principal","controller","jaspreet","ubha"],
    "contact":     ["contact","phone","number","email","address","kithey hai"],
    "location":    ["map","direction","how to reach","location","kive jana"],
    "whatsapp":    ["whatsapp","wa"],
    "library":     ["library","books","kitab"],
    "hostel":      ["hostel","accommodation","stay","boarding"],
    "hours":       ["timing","office time","open time","kado khulda","office hours"]
}

RESPONSES = {
    "admission":   "🚫 <strong>Admission CLOSED</strong> — Session 2025–26<br>📎 <a href='https://kcpadmissions.in'>kcpadmissions.in</a>",
    "eligibility": "✅ UG: 10+2 | PG: Graduation 50% | MBA: Any graduation<br>📎 <a href='https://kcpadmissions.in'>Full Details →</a>",
    "portal":      "🌐 <a href='https://kcpadmissions.in'>kcpadmissions.in</a> — Register, Fill Form, Upload, Pay",
    "process":     "📋 Visit kcpadmissions.in → Register → Fill Form → Upload docs → Pay fee",
    "dates":       "📅 Dates updated on portal soon. <a href='https://kcpadmissions.in'>Check Portal →</a>",
    "pg":          "🎓 M.Sc IT · Fashion · Science · Agriculture · M.Com · M.A · MBA · PGDCA",
    "ug":          "🎓 BCA · BBA · B.Com · B.Sc · B.A · B.Voc · B.Sc Agriculture",
    "diploma":     "📜 Computer Hardware · Green House Tech · French — ₹10K–₹25K",
    "certificate": "🏆 14+ courses: Web Dev · Spoken English · Bakery · Sikh Studies · etc. ₹3K–₹10K",
    "courses":     "📚 We offer PG, UG, Diploma & Certificate programmes!",
    "fees":        "💰 M.Sc IT: ₹28,040/sem | BCA/BBA: ₹60K–₹70K/yr<br>📎 <a href='https://kcpadmissions.in'>Full Fee PDF →</a>",
    "results":     "📊 <a href='https://kcpresults.in/results'>kcpresults.in/results</a><br>📞 97804-84847 (Dr. Jaspreet Kaur)",
    "datesheet":   "📅 <a href='https://khalsacollegepatiala.org/datesheets'>View Datesheets →</a>",
    "timetable":   "⏰ Visit college office for timetable. ☎️ 0175-2215835",
    "faculty":     "👑 Principal: Dr. Dharminder Singh Ubha · 98557-11380<br>🎯 Controller: Dr. Jaspreet Kaur · 97804-84847",
    "contact":     "📞 0175-2215835<br>✉️ khalsacollegepatiala@gmail.com<br>📍 Badungar Road, Patiala",
    "location":    "📍 Badungar Road, Patiala – 147001<br>🗺️ <a href='https://maps.google.com/?q=Khalsa+College+Patiala'>Google Maps →</a>",
    "whatsapp":    "💬 <a href='https://wa.me/911752215835'>Chat on WhatsApp →</a>",
    "library":     "📚 Visit campus library. <a href='https://khalsacollegepatiala.org'>College Website →</a>",
    "hostel":      "🏠 Visit office for hostel details. ☎️ 0175-2215835",
    "hours":       "🕐 Mon–Sat · 9:00 AM – 4:00 PM<br>☎️ 0175-2215835",
    "unknown":     "🤔 Please ask about admissions, courses, fees, results or contact!"
}

def find_intent(message):
    message = message.lower().strip()
    priority = ["eligibility","portal","process","dates","pg","ug","diploma","certificate",
                "library","hostel","results","datesheet","timetable","faculty","location",
                "whatsapp","hours","contact","fees","courses","admission"]
    for intent in priority:
        if any(kw in message for kw in KEYWORDS.get(intent, [])):
            return intent
    return "unknown"

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

# ── Main Chat API ─────────────────────────────────────────────
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400

    user_message = data.get('message', '').strip()
    username     = data.get('username', '')
    lang         = data.get('lang', 'en')
    session_id   = data.get('session_id', '')

    if not user_message:
        return jsonify({"response": "Please type your query!", "intent": "unknown", "mode": "rule"})

    intent = find_intent(user_message)

    # ── Try Groq AI first ──
    ai_response = get_ai_response(user_message, username, lang)

    if ai_response:
        response = ai_response
        mode     = "ai"
    else:
        # Rule-based fallback
        response = RESPONSES.get(intent, RESPONSES["unknown"])
        mode     = "rule"

    # Log to console
    name_str = f"[{username}]" if username else ""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {name_str}[{mode.upper()}][{lang}] '{user_message}' → {intent}")

    return jsonify({
        "response":   response,
        "intent":     intent,
        "mode":       mode,
        "username":   username,
        "timestamp":  datetime.now().isoformat()
    })

# ── Health Check ──────────────────────────────────────────────
@app.route('/health')
def health():
    return jsonify({
        "status":    "healthy",
        "ai_mode":   groq_client is not None,
        "timestamp": datetime.now().isoformat()
    })

# ── Stats ─────────────────────────────────────────────────────
@app.route('/api/stats')
def stats():
    return jsonify({
        "ai_mode":    groq_client is not None,
        "server_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status":     "running"
    })

# ── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    print("=" * 50)
    print("✅  Khalsa College Patiala Chatbot — v2.0")
    print(f"🤖  AI Mode: {'Groq ON ✅' if groq_client else 'Rule-Based ⚠️'}")
    print("🌐  Open: http://localhost:5000")
    print("=" * 50)
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
