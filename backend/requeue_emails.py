import sys
import psycopg2
from app.workers.celery_app import process_booking_confirmation

db_url = "postgresql://frontrowx:frontrowx123@db:5432/frontrowx_db"

def requeue_last_booking():
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Get the latest booking details
        cur.execute("""
            SELECT b.id, u.email, u.name, s.title, b.seat_number 
            FROM bookings b 
            JOIN users u ON b.user_id = u.id 
            JOIN shows s ON b.show_id = s.id 
            ORDER BY b.id DESC LIMIT 3;
        """)
        rows = cur.fetchall()
        for row in rows:
            b_id, u_email, u_name, s_title, seat = row
            print(f"Re-queueing email for booking #{b_id} for user {u_email}")
            process_booking_confirmation.delay(
                booking_id=b_id,
                user_email=u_email,
                user_name=u_name,
                show_title=s_title,
                seat_number=seat
            )
        
        cur.close()
        conn.close()
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    requeue_last_booking()
