"""
Pydantic schemas for Show — request/response validation.
"""
from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict
from app.models.show import ShowCategory


class ShowCreate(BaseModel):
    """Schema for creating a new show (admin only)."""
    title: str
    description: Optional[str] = None
    category: ShowCategory
    location: str
    venue_name: str
    show_date: date
    show_time: time
    total_seats: int
    rows_count: int
    seats_per_row: int
    ticket_price: float


class ShowUpdate(BaseModel):
    """Schema for updating an existing show."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ShowCategory] = None
    location: Optional[str] = None
    venue_name: Optional[str] = None
    show_date: Optional[date] = None
    show_time: Optional[time] = None
    total_seats: Optional[int] = None
    rows_count: Optional[int] = None
    seats_per_row: Optional[int] = None
    ticket_price: Optional[float] = None


class ShowResponse(BaseModel):
    """Schema returned to clients."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str]
    category: ShowCategory
    location: str
    venue_name: str
    show_date: date
    show_time: time
    total_seats: int
    rows_count: int
    seats_per_row: int
    ticket_price: float
    
    available_seats: Optional[int] = None  # computed field
    created_at: datetime
