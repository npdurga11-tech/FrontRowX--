import os
import psycopg2

db_url = "postgresql://frontrowx:frontrowx123@db:5432/frontrowx_db"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, show_id FROM bookings ORDER BY id DESC LIMIT 5;")
    rows = cur.fetchall()
    print("Recent bookings:", rows)
    cur.close()
    conn.close()
except Exception as e:
    print("DB error:", e)
