"""
Booking routes: seat selection, booking confirmation, and history.

Flow:
  1. User selects a seat → POST /lock (Redis lock acquired)
  2. User confirms → POST / (booking saved to DB, Celery task dispatched)
  3. User views own bookings → GET /my
"""
from typing import List
import random
import string

def generate_ticket_code() -> str:
    chars = string.ascii_uppercase + string.digits
    return "TKT" + "".join(random.choices(chars, k=7))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.notification import Notification
from app.models.show import Show
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingDetail, BookingResponse
from app.services.redis_service import (
    get_seat_lock_owner,
    is_seat_locked,
    lock_seat,
    release_seat_lock,
)
from app.workers.celery_app import process_booking_confirmation

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("/lock", response_model=dict)
def lock_seat_endpoint(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 1: Lock a seat for 2 minutes.
    Prevents other users from booking the seat while this user is deciding.
    """
    show = db.query(Show).filter(Show.id == booking_data.show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    # Check if seat number is valid
    seat_num = int(booking_data.seat_number) if booking_data.seat_number.isdigit() else None
    if seat_num and (seat_num < 1 or seat_num > show.total_seats):
        raise HTTPException(status_code=400, detail="Invalid seat number")

    # Check if already confirmed in DB
    existing = (
        db.query(Booking)
        .filter(
            Booking.show_id == booking_data.show_id,
            Booking.seat_number == booking_data.seat_number,
            Booking.booking_status == BookingStatus.CONFIRMED,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Seat already booked")

    # Try to acquire Redis lock
    acquired = lock_seat(
        show_id=booking_data.show_id,
        seat_number=booking_data.seat_number,
        user_id=current_user.id,
    )

    if not acquired:
        # Check who holds the lock
        owner = get_seat_lock_owner(booking_data.show_id, booking_data.seat_number)
        if owner and owner != str(current_user.id):
            raise HTTPException(
                status_code=409,
                detail="Seat is currently being booked by another user. Try again in a moment."
            )

    return {
        "message": "Seat locked successfully. You have 2 minutes to complete your booking.",
        "show_id": booking_data.show_id,
        "seat_number": booking_data.seat_number,
        "lock_duration_seconds": 120,
    }


@router.post("/", response_model=BookingResponse, status_code=201)
def confirm_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 2: Confirm the booking.
    - Verifies the seat is locked by THIS user
    - Saves booking to PostgreSQL
    - Releases the Redis lock
    - Dispatches Celery task for async email notification
    - Creates in-app notification
    """
    show = db.query(Show).filter(Show.id == booking_data.show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    # Ensure no duplicate confirmed booking
    existing = (
        db.query(Booking)
        .filter(
            Booking.show_id == booking_data.show_id,
            Booking.seat_number == booking_data.seat_number,
            Booking.booking_status == BookingStatus.CONFIRMED,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Seat already booked")

    # Verify the user holds the Redis lock
    lock_owner = get_seat_lock_owner(booking_data.show_id, booking_data.seat_number)
    if lock_owner is None:
        raise HTTPException(
            status_code=400,
            detail="Seat lock expired. Please lock the seat again."
        )
    if lock_owner != str(current_user.id):
        raise HTTPException(
            status_code=409,
            detail="This seat is locked by another user."
        )

    # Save booking to database
    booking = Booking(
        user_id=current_user.id,
        show_id=booking_data.show_id,
        seat_number=booking_data.seat_number,
        booking_status=BookingStatus.CONFIRMED,
        ticket_code=generate_ticket_code(),
        amount_paid=show.ticket_price,
        attendee_name=booking_data.attendee_name,
        attendee_email=booking_data.attendee_email,
        attendee_phone=booking_data.attendee_phone,
    )
    db.add(booking)

    # Save in-app notification
    notification = Notification(
        user_id=current_user.id,
        message=(
            f"Your booking for '{show.title}' — Seat {booking_data.seat_number} "
            f"has been confirmed!"
        ),
    )
    db.add(notification)

    db.commit()
    db.refresh(booking)

    # Release Redis seat lock (seat is now permanently booked in DB)
    release_seat_lock(booking_data.show_id, booking_data.seat_number)

    # Dispatch Celery background task for email confirmation
    # If attendee email provided, send it there; else user email
    recipient_email = booking.attendee_email if booking.attendee_email else current_user.email
    recipient_name = booking.attendee_name if booking.attendee_name else current_user.name
    
    process_booking_confirmation.delay(
        booking_id=booking.id,
        user_email=recipient_email,
        user_name=recipient_name,
        show_title=show.title,
        seat_number=booking.seat_number,
    )

    return booking


@router.get("/my", response_model=List[BookingDetail])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the current user's full booking history."""
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.booking_time.desc())
        .all()
    )

    result = []
    for b in bookings:
        detail = BookingDetail.model_validate(b)
        if b.show:
            detail.show_title = b.show.title
            detail.show_date = str(b.show.show_date)
            detail.show_time = str(b.show.show_time)
        result.append(detail)
    return result


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a booking (only the owner can cancel)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")

    if booking.booking_status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    booking.booking_status = BookingStatus.CANCELLED
    db.commit()
