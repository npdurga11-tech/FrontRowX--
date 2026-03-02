"""
Application configuration — reads settings from environment variables.
Uses a plain Python class with os.getenv for simplicity and compatibility.
"""
import os

from dotenv import load_dotenv

# Load .env file in local dev; in Docker, env vars are set by docker-compose
load_dotenv()


class Settings:
    # App
    APP_NAME: str = "FrontRowX"
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"

    # Database (PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://frontrowx:frontrowx123@localhost:5432/frontrowx_db"
    )

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://red-d6ikqhjh46gs73ev15o0:6379/0")

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    # Seat lock duration in seconds (2 minutes)
    SEAT_LOCK_DURATION: int = 120

    # Celery (uses Redis as broker)
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://red-d6ikqhjh46gs73ev15o0:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://red-d6ikqhjh46gs73ev15o0:6379/2")

    # Email — leave SMTP_PASSWORD blank to use console simulation
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "noreply@frontrowx.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@frontrowx.com")


# Single global settings instance used everywhere
settings = Settings()
