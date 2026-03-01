"""
Seed script — creates a default admin user if none exists.
Run once after migrations: python -m app.utils.seed
"""
from datetime import date, time, timedelta
from app.db.session import SessionLocal
from app.models.user import User
from app.models.show import Show
from app.core.security import hash_password


def seed_admin():
    """Create a default admin user and seed initial shows."""
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            print(f"[Seed] Admin user already exists: {existing_admin.email}")
        else:
            admin = User(
                name="Admin",
                email="admin@frontrowx.com",
                hashed_password=hash_password("admin123"),
                role="admin",
            )
            db.add(admin)
            db.commit()
            print("[Seed] ✅ Admin user created: admin@frontrowx.com / admin123")
        
        # Seed test shows if none exist
        existing_shows = db.query(Show).first()
        if existing_shows:
            print("[Seed] Shows already exist in the database.")
        else:
            from app.models.show import ShowCategory
            print("[Seed] Seeding sample live shows...")
            
            show1 = Show(
                title="The Eras Tour",
                description="The ultimate pop concert experience of the decade.",
                category=ShowCategory.CONCERT,
                location="Bangalore",
                venue_name="M. Chinnaswamy Stadium",
                show_date=date.today() + timedelta(days=10),
                show_time=time(19, 0),
                total_seats=150,
                rows_count=10,
                seats_per_row=15,
                ticket_price=150.0
            )

            show2 = Show(
                title="Laugh Out Loud Special",
                description="A hilarious stand-up comedy special.",
                category=ShowCategory.COMEDY,
                location="Chennai",
                venue_name="Nehru Stadium",
                show_date=date.today() + timedelta(days=5),
                show_time=time(20, 30),
                total_seats=100,
                rows_count=10,
                seats_per_row=10,
                ticket_price=80.0
            )

            show3 = Show(
                title="Neon Nights DJ Set",
                description="High energy EDM party all night long.",
                category=ShowCategory.FESTIVAL,
                location="Mumbai",
                venue_name="Jio World Garden",
                show_date=date.today() + timedelta(days=14),
                show_time=time(23, 0),
                total_seats=200,
                rows_count=10,
                seats_per_row=20,
                ticket_price=120.0
            )

            show4 = Show(
                title="Hamlet Revisited",
                description="A classic theatre drama with a modern twist.",
                category=ShowCategory.THEATRE,
                location="Delhi NCR",
                venue_name="Siri Fort Auditorium",
                show_date=date.today() + timedelta(days=20),
                show_time=time(19, 30),
                total_seats=120,
                rows_count=12,
                seats_per_row=10,
                ticket_price=90.0
            )

            show5 = Show(
                title="Coachella Valley Music Festival",
                description="The ultimate multi-day music festival experience.",
                category=ShowCategory.FESTIVAL,
                location="Goa",
                venue_name="Vagator Beach Grounds",
                show_date=date.today() + timedelta(days=30),
                show_time=time(15, 0),
                total_seats=500,
                rows_count=20,
                seats_per_row=25,
                ticket_price=450.0
            )

            db.add_all([show1, show2, show3, show4, show5])
            db.commit()
            print("[Seed] ✅ 5 sample shows successfully created.")

    except Exception as e:
        print(f"[Seed] Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
