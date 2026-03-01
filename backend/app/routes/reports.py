"""
Reporting routes — provides summary statistics for admin/analytics.

Endpoints:
  GET /api/reports/total-bookings     — overall booking count
  GET /api/reports/show-summary       — per-show booking breakdown
  GET /api/reports/user/{user_id}     — individual user booking history
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.show import Show
from app.models.user import User

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/total-bookings")
def total_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Total number of confirmed bookings across all shows."""
    count = (
        db.query(func.count(Booking.id))
        .filter(Booking.booking_status == BookingStatus.CONFIRMED)
        .scalar()
    )
    return {"total_confirmed_bookings": count}


@router.get("/show-summary")
def show_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Per-show booking summary:
    Returns each show with confirmed booking count and available seats.
    """
    shows = db.query(Show).all()
    result = []

    for show in shows:
        confirmed = (
            db.query(func.count(Booking.id))
            .filter(
                Booking.show_id == show.id,
                Booking.booking_status == BookingStatus.CONFIRMED,
            )
            .scalar()
        )
        result.append({
            "show_id": show.id,
            "show_title": show.title,
            "show_date": str(show.show_date),
            "total_seats": show.total_seats,
            "confirmed_bookings": confirmed,
            "available_seats": show.total_seats - confirmed,
            "revenue": float(confirmed * show.ticket_price)
        })

    return {"shows": result}


@router.get("/total-revenue")
def total_revenue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Total revenue generated from all confirmed bookings."""
    # We can join Booking and Show to sum (ticket_price)
    from sqlalchemy.sql import func
    result = (
        db.query(func.sum(Show.ticket_price))
        .join(Booking, Show.id == Booking.show_id)
        .filter(Booking.booking_status == BookingStatus.CONFIRMED)
        .scalar()
    )
    return {"total_revenue": result if result else 0.0}


@router.get("/user/{user_id}")
def user_booking_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Individual user booking history.
    Users can view their own; admins can view any user's.
    """
    if current_user.role != "admin" and current_user.id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Access denied")

    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.booking_time.desc())
        .all()
    )

    result = []
    for b in bookings:
        result.append({
            "booking_id": b.id,
            "show_title": b.show.title if b.show else None,
            "show_date": str(b.show.show_date) if b.show else None,
            "seat_number": b.seat_number,
            "status": b.booking_status.value,
            "booking_time": str(b.booking_time),
        })

    return {"user_id": user_id, "bookings": result}
