"""
Pydantic schemas for Booking — request/response validation.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.booking import BookingStatus, PaymentStatus


class BookingCreate(BaseModel):
    """Schema for creating a new booking."""
    show_id: int
    seat_number: str
    attendee_name: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_phone: Optional[str] = None


class BookingResponse(BaseModel):
    """Schema returned to clients."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    show_id: int
    seat_number: str
    booking_status: BookingStatus
    payment_status: PaymentStatus
    booking_time: datetime
    created_at: datetime
    
    ticket_code: Optional[str] = None
    amount_paid: Optional[float] = None
    attendee_name: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_phone: Optional[str] = None


class BookingDetail(BookingResponse):
    """Extended booking info with show details."""
    show_title: Optional[str] = None
    show_date: Optional[str] = None
    show_time: Optional[str] = None
