"""
Show model — represents ticketed events/shows.
"""
import enum
from sqlalchemy import Column, Date, DateTime, Enum, Integer, String, Text, Time, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ShowCategory(str, enum.Enum):
    CONCERT = "concert"
    COMEDY = "comedy"
    THEATRE = "theatre"
    FESTIVAL = "festival"


class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Enum(ShowCategory, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=ShowCategory.CONCERT)
    location = Column(String(100), nullable=False)
    venue_name = Column(String(200), nullable=False)
    show_date = Column(Date, nullable=False)
    show_time = Column(Time, nullable=False)
    total_seats = Column(Integer, nullable=False)
    rows_count = Column(Integer, nullable=False, default=10)
    seats_per_row = Column(Integer, nullable=False, default=10)
    ticket_price = Column(Float, nullable=False, default=50.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bookings = relationship("Booking", back_populates="show")
