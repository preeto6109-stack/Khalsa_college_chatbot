import sqlite3
import json
from datetime import datetime
import os

# ============================================================
#  Khalsa College Patiala — Chatbot Database Manager
#  database.py — SQLite Backend
# ============================================================

DB_PATH = "college_chatbot.db"


class CollegeDatabase:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_db()

    # ── Connection Helper ─────────────────────────────────────
    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # dict-like rows
        return conn

    # ── Initialize All Tables ─────────────────────────────────
    def init_db(self):
        conn = self._connect()
        c = conn.cursor()

        # Chat Logs — every user message + bot reply saved here
        c.execute('''
            CREATE TABLE IF NOT EXISTS chat_logs (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id    TEXT,
                user_message  TEXT NOT NULL,
                bot_response  TEXT NOT NULL,
                intent        TEXT DEFAULT 'unknown',
                timestamp     DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # FAQ Table — admin can add/update/delete custom Q&A
        c.execute('''
            CREATE TABLE IF NOT EXISTS faq (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                question    TEXT UNIQUE NOT NULL,
                answer      TEXT NOT NULL,
                category    TEXT DEFAULT 'general',
                is_active   INTEGER DEFAULT 1,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # College Data — key-value store for dynamic content
        c.execute('''
            CREATE TABLE IF NOT EXISTS college_data (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                category    TEXT NOT NULL,
                key         TEXT NOT NULL,
                value       TEXT NOT NULL,
                updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, key)
            )
        ''')

        # Intent Stats — tracks which topics are asked most
        c.execute('''
            CREATE TABLE IF NOT EXISTS intent_stats (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                intent    TEXT UNIQUE NOT NULL,
                count     INTEGER DEFAULT 1,
                last_used DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        conn.commit()
        conn.close()
        print(f"✅ Database ready: {self.db_path}")

    # ══════════════════════════════════════════════════════════
    #  CHAT LOGS
    # ══════════════════════════════════════════════════════════

    def log_chat(self, user_message, bot_response, intent="unknown", session_id=""):
        """Save one chat exchange to the database."""
        try:
            conn = self._connect()
            conn.execute(
                "INSERT INTO chat_logs (session_id, user_message, bot_response, intent) VALUES (?,?,?,?)",
                (session_id, user_message, bot_response, intent)
            )
            conn.commit()
            conn.close()
            # Also update intent stats
            self._update_intent_stats(intent)
            return True
        except Exception as e:
            print(f"[DB ERROR] log_chat: {e}")
            return False

    def get_recent_chats(self, limit=50):
        """Get recent chat logs."""
        try:
            conn = self._connect()
            rows = conn.execute(
                "SELECT id, session_id, user_message, intent, timestamp FROM chat_logs ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            ).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            print(f"[DB ERROR] get_recent_chats: {e}")
            return []

    def get_chats_by_session(self, session_id):
        """Get all messages from one session."""
        try:
            conn = self._connect()
            rows = conn.execute(
                "SELECT * FROM chat_logs WHERE session_id=? ORDER BY timestamp ASC",
                (session_id,)
            ).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            print(f"[DB ERROR] get_chats_by_session: {e}")
            return []

    def clear_old_logs(self, days=30):
        """Delete logs older than given days."""
        try:
            conn = self._connect()
            conn.execute(
                "DELETE FROM chat_logs WHERE timestamp < datetime('now', ?)",
                (f"-{days} days",)
            )
            conn.commit()
            conn.close()
            print(f"✅ Cleared logs older than {days} days.")
            return True
        except Exception as e:
            print(f"[DB ERROR] clear_old_logs: {e}")
            return False

    # ══════════════════════════════════════════════════════════
    #  FAQ MANAGEMENT
    # ══════════════════════════════════════════════════════════

    def add_faq(self, question, answer, category="general"):
        """Add a new FAQ entry."""
        try:
            conn = self._connect()
            conn.execute(
                "INSERT INTO faq (question, answer, category) VALUES (?,?,?)",
                (question.strip(), answer.strip(), category)
            )
            conn.commit()
            conn.close()
            print(f"✅ FAQ added: {question[:50]}")
            return True
        except sqlite3.IntegrityError:
            print(f"⚠️ FAQ already exists: {question[:50]}")
            return False
        except Exception as e:
            print(f"[DB ERROR] add_faq: {e}")
            return False

    def update_faq(self, faq_id, question=None, answer=None, category=None):
        """Update an existing FAQ by ID."""
        try:
            conn = self._connect()
            faq = conn.execute("SELECT * FROM faq WHERE id=?", (faq_id,)).fetchone()
            if not faq:
                conn.close()
                return False

            new_q    = question  or faq["question"]
            new_a    = answer    or faq["answer"]
            new_cat  = category  or faq["category"]

            conn.execute(
                "UPDATE faq SET question=?, answer=?, category=?, updated_at=? WHERE id=?",
                (new_q, new_a, new_cat, datetime.now().isoformat(), faq_id)
            )
            conn.commit()
            conn.close()
            print(f"✅ FAQ #{faq_id} updated.")
            return True
        except Exception as e:
            print(f"[DB ERROR] update_faq: {e}")
            return False

    def delete_faq(self, faq_id):
        """Permanently delete a FAQ by ID."""
        try:
            conn = self._connect()
            conn.execute("DELETE FROM faq WHERE id=?", (faq_id,))
            conn.commit()
            conn.close()
            print(f"✅ FAQ #{faq_id} deleted.")
            return True
        except Exception as e:
            print(f"[DB ERROR] delete_faq: {e}")
            return False

    def toggle_faq(self, faq_id, active=True):
        """Enable or disable a FAQ without deleting it."""
        try:
            conn = self._connect()
            conn.execute(
                "UPDATE faq SET is_active=?, updated_at=? WHERE id=?",
                (1 if active else 0, datetime.now().isoformat(), faq_id)
            )
            conn.commit()
            conn.close()
            status = "enabled" if active else "disabled"
            print(f"✅ FAQ #{faq_id} {status}.")
            return True
        except Exception as e:
            print(f"[DB ERROR] toggle_faq: {e}")
            return False

    def get_all_faqs(self, category=None, active_only=True):
        """Fetch all FAQs, optionally filtered by category or active status."""
        try:
            conn = self._connect()
            query  = "SELECT * FROM faq WHERE 1=1"
            params = []
            if active_only:
                query += " AND is_active=1"
            if category:
                query += " AND category=?"
                params.append(category)
            query += " ORDER BY category, id"
            rows = conn.execute(query, params).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            print(f"[DB ERROR] get_all_faqs: {e}")
            return []

    def search_faq(self, query_text):
        """Search FAQ by question text (for custom answer lookup)."""
        try:
            conn = self._connect()
            rows = conn.execute(
                "SELECT answer FROM faq WHERE question LIKE ? AND is_active=1 LIMIT 1",
                (f"%{query_text}%",)
            ).fetchall()
            conn.close()
            return rows[0]["answer"] if rows else None
        except Exception as e:
            print(f"[DB ERROR] search_faq: {e}")
            return None

    # ══════════════════════════════════════════════════════════
    #  COLLEGE DATA (Dynamic Key-Value Store)
    # ══════════════════════════════════════════════════════════

    def set_college_data(self, category, key, value):
        """Insert or update a college data entry."""
        try:
            conn = self._connect()
            conn.execute(
                "INSERT OR REPLACE INTO college_data (category, key, value, updated_at) VALUES (?,?,?,?)",
                (category, key, value, datetime.now().isoformat())
            )
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"[DB ERROR] set_college_data: {e}")
            return False

    def get_college_data(self, category, key):
        """Get a specific college data value."""
        try:
            conn = self._connect()
            row = conn.execute(
                "SELECT value FROM college_data WHERE category=? AND key=?",
                (category, key)
            ).fetchone()
            conn.close()
            return row["value"] if row else None
        except Exception as e:
            print(f"[DB ERROR] get_college_data: {e}")
            return None

    def get_category_data(self, category):
        """Get all key-value pairs for a category."""
        try:
            conn = self._connect()
            rows = conn.execute(
                "SELECT key, value FROM college_data WHERE category=?",
                (category,)
            ).fetchall()
            conn.close()
            return {r["key"]: r["value"] for r in rows}
        except Exception as e:
            print(f"[DB ERROR] get_category_data: {e}")
            return {}

    # ══════════════════════════════════════════════════════════
    #  INTENT STATS
    # ══════════════════════════════════════════════════════════

    def _update_intent_stats(self, intent):
        """Increment counter for an intent (called after each chat log)."""
        try:
            conn = self._connect()
            conn.execute('''
                INSERT INTO intent_stats (intent, count, last_used)
                VALUES (?, 1, ?)
                ON CONFLICT(intent) DO UPDATE SET
                    count = count + 1,
                    last_used = excluded.last_used
            ''', (intent, datetime.now().isoformat()))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[DB ERROR] _update_intent_stats: {e}")

    def get_top_intents(self, limit=10):
        """Get most frequently asked topics."""
        try:
            conn = self._connect()
            rows = conn.execute(
                "SELECT intent, count, last_used FROM intent_stats ORDER BY count DESC LIMIT ?",
                (limit,)
            ).fetchall()
            conn.close()
            return [dict(r) for r in rows]
        except Exception as e:
            print(f"[DB ERROR] get_top_intents: {e}")
            return []

    # ══════════════════════════════════════════════════════════
    #  ADMIN STATS
    # ══════════════════════════════════════════════════════════

    def get_stats(self):
        """Return a full stats summary for admin dashboard."""
        try:
            conn = self._connect()

            total_chats = conn.execute(
                "SELECT COUNT(*) AS n FROM chat_logs"
            ).fetchone()["n"]

            total_sessions = conn.execute(
                "SELECT COUNT(DISTINCT session_id) AS n FROM chat_logs"
            ).fetchone()["n"]

            today_chats = conn.execute(
                "SELECT COUNT(*) AS n FROM chat_logs WHERE DATE(timestamp) = DATE('now')"
            ).fetchone()["n"]

            active_faqs = conn.execute(
                "SELECT COUNT(*) AS n FROM faq WHERE is_active=1"
            ).fetchone()["n"]

            total_faqs = conn.execute(
                "SELECT COUNT(*) AS n FROM faq"
            ).fetchone()["n"]

            top_intent = conn.execute(
                "SELECT intent FROM intent_stats ORDER BY count DESC LIMIT 1"
            ).fetchone()

            conn.close()

            db_size_kb = round(os.path.getsize(self.db_path) / 1024, 1) if os.path.exists(self.db_path) else 0

            return {
                "total_chats":    total_chats,
                "total_sessions": total_sessions,
                "today_chats":    today_chats,
                "active_faqs":    active_faqs,
                "total_faqs":     total_faqs,
                "top_intent":     top_intent["intent"] if top_intent else "N/A",
                "db_size_kb":     db_size_kb,
                "generated_at":   datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            print(f"[DB ERROR] get_stats: {e}")
            return {}


# ── Singleton instance (import this in app.py) ────────────────
db = CollegeDatabase()


# ── Quick Test ────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n📊 Database Stats:")
    stats = db.get_stats()
    for k, v in stats.items():
        print(f"   {k}: {v}")

    print("\n➕ Adding sample FAQ...")
    db.add_faq(
        question="What is the college address?",
        answer="Badungar Road, Patiala, Punjab – 147001",
        category="contact"
    )

    print("\n📋 All Active FAQs:")
    for faq in db.get_all_faqs():
        print(f"   [{faq['category']}] {faq['question'][:60]}")

    print("\n🔥 Top Intents:")
    for item in db.get_top_intents(5):
        print(f"   {item['intent']}: {item['count']} times")