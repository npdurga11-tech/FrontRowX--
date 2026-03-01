"""
FrontRowX — FastAPI Application Entry Point

Registers all routers, configures CORS, and sets up the app metadata.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import auth, bookings, notifications, reports, shows

# Create the FastAPI app
app = FastAPI(
    title="FrontRowX API",
    description="Show Ticket Booking API — built with FastAPI + PostgreSQL + Redis + Celery",
    version="1.0.0",
)

# CORS — allow the React frontend to call the API from any origin (dev mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all route modules
app.include_router(auth.router)
app.include_router(shows.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {"message": "FrontRowX API is running 🎭", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    """Detailed health check."""
    return {"status": "ok", "app": settings.APP_NAME}
