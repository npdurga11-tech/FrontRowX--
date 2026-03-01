# FrontRowX 🎭 — Show Ticket Booking Application

A full-stack online show ticket booking system built with **FastAPI**, **React**, **PostgreSQL**, **Redis**, and **Celery**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI + Uvicorn |
| Database | PostgreSQL 15 + SQLAlchemy ORM + Alembic |
| Cache / Lock | Redis 7 |
| Background Jobs | Celery |
| Frontend | React 18 + Tailwind CSS (npm/PostCSS) + Axios |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Infrastructure | Docker + Docker Compose |

---

## Project Structure

```
TBA1/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── core/
│   │   │   ├── config.py        # Settings (env vars)
│   │   │   ├── security.py      # JWT + bcrypt
│   │   │   └── deps.py          # Auth dependencies
│   │   ├── db/
│   │   │   ├── base.py          # SQLAlchemy Base
│   │   │   └── session.py       # DB engine + session
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   ├── show.py          # Show model
│   │   │   ├── booking.py       # Booking model
│   │   │   └── notification.py  # Notification model
│   │   ├── schemas/
│   │   │   ├── user.py          # Pydantic user schemas
│   │   │   ├── show.py          # Pydantic show schemas
│   │   │   ├── booking.py       # Pydantic booking schemas
│   │   │   └── notification.py  # Pydantic notification schema
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth/*
│   │   │   ├── shows.py         # /api/shows/*
│   │   │   ├── bookings.py      # /api/bookings/*
│   │   │   ├── reports.py       # /api/reports/*
│   │   │   └── notifications.py # /api/notifications/*
│   │   ├── services/
│   │   │   ├── redis_service.py # Redis seat locking
│   │   │   └── email_service.py # SMTP / console email
│   │   ├── workers/
│   │   │   └── celery_app.py    # Celery app + tasks
│   │   └── utils/
│   ├── alembic/                 # DB migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── App.js               # Root + routing
│   │   ├── index.js             # React entry point
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Toast.js
│   │   │   ├── Spinner.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ShowsPage.js
│   │   │   ├── SeatSelectionPage.js
│   │   │   └── MyBookingsPage.js
│   │   └── services/
│   │       ├── api.js           # Axios instance
│   │       ├── authService.js
│   │       ├── showService.js
│   │       ├── bookingService.js
│   │       └── notificationService.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## Quick Start (Docker)

### 1. Clone the project

```bash
git clone <your-repo-url>
cd TBA1
```

### 2. Start all services

```bash
docker-compose up --build
```

This will:
- Start **PostgreSQL** on port 5432
- Start **Redis** on port 6379
- Run **Alembic migrations** automatically
- Start **FastAPI** on port 8000
- Start **Celery worker** for background tasks
- Start **React frontend** on port 3000

### 3. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env to point to local DB and Redis

# Run migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --reload --port 8000
```

### Celery Worker

```bash
cd backend
celery -A app.workers.celery_app worker --loglevel=info
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |

### Shows
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/shows/` | List all shows | Public |
| GET | `/api/shows/{id}` | Get show details | Public |
| GET | `/api/shows/{id}/seats` | Get seat availability | Public |
| POST | `/api/shows/` | Create show | Admin |
| PUT | `/api/shows/{id}` | Update show | Admin |
| DELETE | `/api/shows/{id}` | Delete show | Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings/lock` | Lock a seat (Redis, 2 min) | JWT |
| POST | `/api/bookings/` | Confirm booking | JWT |
| GET | `/api/bookings/my` | My booking history | JWT |
| DELETE | `/api/bookings/{id}` | Cancel booking | JWT |

### Reports
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/total-bookings` | Total confirmed bookings | JWT |
| GET | `/api/reports/show-summary` | Per-show breakdown | JWT |
| GET | `/api/reports/user/{id}` | User booking history | JWT |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications/` | My notifications | JWT |
| PATCH | `/api/notifications/{id}/read` | Mark as read | JWT |

---

## Default Admin User

On first boot, a default admin user is **automatically created** by the seed script:

| Field | Value |
|-------|-------|
| Email | `admin@frontrowx.com` |
| Password | `admin123` |

> **Important:** Change this password in production!

You can also promote any registered user to admin:

1. **Via Docker:**
   ```bash
   docker exec -it frontrowx_db psql -U frontrowx -d frontrowx_db \
     -c "UPDATE users SET role = 'admin' WHERE email = 'your@email.com';"
   ```

2. **Directly in PostgreSQL:**
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```

---

## How Seat Locking Works

1. User clicks a seat → `POST /api/bookings/lock`
2. Backend calls `redis.SET seat_lock:{show_id}:{seat} user_id NX EX 120`
3. If SET succeeds → seat is locked for 2 minutes
4. If SET fails → seat is held by another user
5. User confirms → `POST /api/bookings/` → checks Redis ownership → saves to DB → deletes Redis key
6. If user does nothing → Redis key auto-expires after 2 minutes → seat becomes available again

---

## Email Notifications

Email is sent asynchronously via **Celery** after a successful booking.

- If `SMTP_PASSWORD` is empty in `.env` → emails are **printed to the console** (default for demo)
- To enable real email: set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `ADMIN_EMAIL` in `.env`

Both the **user** and the **admin** receive a confirmation email for each booking.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `REDIS_URL` | `redis://redis:6379/0` | Redis for seat locks |
| `CELERY_BROKER_URL` | `redis://redis:6379/1` | Celery task queue |
| `SECRET_KEY` | `change-me` | JWT signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiry |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | — | SMTP login email |
| `SMTP_PASSWORD` | — | SMTP password (leave blank for console) |
| `ADMIN_EMAIL` | `admin@frontrowx.com` | Admin email for notifications |
