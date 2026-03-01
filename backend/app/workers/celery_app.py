"""
Celery application instance and task definitions.

Tasks:
  - process_booking_confirmation: simulates async processing + sends emails
"""
import time

from celery import Celery

from app.core.config import settings

# Create the Celery app connected to Redis as both broker and result backend
celery_app = Celery(
    "frontrowx",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="process_booking_confirmation")
def process_booking_confirmation(
    booking_id: int,
    user_email: str,
    user_name: str,
    show_title: str,
    seat_number: str,
) -> dict:
    """
    Background task triggered after a booking is created.
    Simulates a processing delay (as if validating payment, seat, etc.)
    then sends a confirmation email to user and admin.
    """
    # Import here to avoid circular imports at module load time
    from app.services.email_service import send_booking_confirmation

    print(f"[Celery] Starting booking confirmation for booking #{booking_id}...")

    # Simulate some processing time (e.g., payment validation)
    time.sleep(2)

    # Send email notifications
    send_booking_confirmation(
        user_email=user_email,
        user_name=user_name,
        show_title=show_title,
        seat_number=seat_number,
        booking_id=booking_id,
    )

    print(f"[Celery] Booking #{booking_id} confirmation processed successfully.")
    return {"status": "done", "booking_id": booking_id}
