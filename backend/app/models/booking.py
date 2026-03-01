"""
Booking model — links a user to a specific seat in a show.
"""
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class PaymentStatus(str, enum.Enum):
    MOCKED = "mocked"
    COMPLETED = "completed"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False)
    seat_number = Column(String(10), nullable=False)
    
    booking_time = Column(DateTime(timezone=True), server_default=func.now())
    
    booking_status = Column(
        Enum(BookingStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=BookingStatus.PENDING,
        nullable=False
    )
    payment_status = Column(
        Enum(PaymentStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=PaymentStatus.MOCKED,
        nullable=False
    )
    
    # New columns adapted from flight booking
    ticket_code = Column(String(50), unique=True, index=True, nullable=True)
    amount_paid = Column(Float, nullable=True)
    attendee_name = Column(String(100), nullable=True)
    attendee_email = Column(String(255), nullable=True)
    attendee_phone = Column(String(20), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="bookings")
    show = relationship("Show", back_populates="bookings")
