from app.db.session import engine
from sqlalchemy import text

def add_enum():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TYPE bookingstatus ADD VALUE 'cancelled';"))
            conn.commit()
            print("Successfully added 'cancelled' to bookingstatus Enum in Postgres!")
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    add_enum()
