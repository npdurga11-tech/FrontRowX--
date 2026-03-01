"""
Show routes: Admin creates shows, public can list/view them.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_admin_user, get_current_user
from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.show import Show
from app.models.user import User
from app.schemas.show import ShowCreate, ShowResponse, ShowUpdate

router = APIRouter(prefix="/api/shows", tags=["Shows"])


def _add_available_seats(show: Show, db: Session) -> ShowResponse:
    """Helper to compute available_seats for a show."""
    confirmed_bookings = (
        db.query(Booking)
        .filter(
            Booking.show_id == show.id,
            Booking.booking_status == BookingStatus.CONFIRMED,
        )
        .count()
    )
    response = ShowResponse.model_validate(show)
    response.available_seats = show.total_seats - confirmed_bookings
    return response


@router.get("/", response_model=List[ShowResponse])
def list_shows(
    location: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Public endpoint — list all shows with available seat count.
    Supports basic filtering inspired by flight booking search.
    """
    query = db.query(Show)
    if location:
        query = query.filter(Show.location.ilike(f"%{location}%"))
    if category:
        query = query.filter(Show.category == category)
    if q:
        query = query.filter(Show.title.ilike(f"%{q}%"))
        
    shows = query.order_by(Show.show_date, Show.show_time).all()
    return [_add_available_seats(s, db) for s in shows]


@router.get("/{show_id}", response_model=ShowResponse)
def get_show(show_id: int, db: Session = Depends(get_db)):
    """Get a single show by ID."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    return _add_available_seats(show, db)


@router.post("/", response_model=ShowResponse, status_code=201)
def create_show(
    show_data: ShowCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """
    Admin only — create a new show/event.
    """
    data = show_data.model_dump()
    new_show = Show(**data)
    db.add(new_show)
    db.commit()
    db.refresh(new_show)
    return _add_available_seats(new_show, db)


@router.put("/{show_id}", response_model=ShowResponse)
def update_show(
    show_id: int,
    show_data: ShowUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin only — update show details."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    for field, value in show_data.model_dump(exclude_unset=True).items():
        setattr(show, field, value)

    db.commit()
    db.refresh(show)
    return _add_available_seats(show, db)


@router.delete("/{show_id}", status_code=204)
def delete_show(
    show_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Admin only — delete a show."""
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")
    db.delete(show)
    db.commit()


@router.get("/{show_id}/seats", response_model=dict)
def get_booked_seats(show_id: int, db: Session = Depends(get_db)):
    """
    Get the list of booked/locked seat numbers for a show.
    Used by the frontend to render a seat map.
    """
    from app.services.redis_service import redis_client
    show = db.query(Show).filter(Show.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    # Confirmed bookings from DB
    confirmed = (
        db.query(Booking.seat_number)
        .filter(
            Booking.show_id == show_id,
            Booking.booking_status == BookingStatus.CONFIRMED,
        )
        .all()
    )
    confirmed_seats = [b.seat_number for b in confirmed]

    # Temporarily locked seats from Redis (redis_client has decode_responses=True so keys are strings)
    pattern = f"show:{show_id}:seat:*"
    locked_keys = redis_client.keys(pattern)
    locked_seats = []
    for k in locked_keys:
        # k is a string like "show:1:seat:A1" — extract the seat part after last ":"
        parts = k.split(":")
        if len(parts) == 4:
            locked_seats.append(parts[-1])

    return {
        "show_id": show_id,
        "total_seats": show.total_seats,
        "confirmed_seats": confirmed_seats,
        "locked_seats": locked_seats,
    }
