"""
Redis utilities for seat locking.
A seat lock prevents two users from booking the same seat simultaneously.
"""
from typing import Optional

import redis

from app.core.config import settings

# Global Redis client (reused across requests)
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Key pattern: show:{show_id}:seat:{seat_number}
SEAT_LOCK_KEY = "show:{show_id}:seat:{seat_number}"


def get_lock_key(show_id: int, seat_number: str) -> str:
    """Build the Redis key for a seat lock."""
    return SEAT_LOCK_KEY.format(show_id=show_id, seat_number=seat_number)


def lock_seat(show_id: int, seat_number: str, user_id: int) -> bool:
    """
    Try to lock a seat for a user using atomic SET NX.
    Returns True if lock acquired, False if seat is already locked.
    SET NX = only set if key does NOT exist (atomic, race-condition safe).
    EX = auto-expire after SEAT_LOCK_DURATION seconds (2 minutes).
    """
    key = get_lock_key(show_id, seat_number)
    result = redis_client.set(
        key,
        str(user_id),
        nx=True,
        ex=settings.SEAT_LOCK_DURATION
    )
    return result is not None  # None means key already existed


def release_seat_lock(show_id: int, seat_number: str) -> None:
    """Release a seat lock after booking is confirmed or cancelled."""
    key = get_lock_key(show_id, seat_number)
    redis_client.delete(key)


def get_seat_lock_owner(show_id: int, seat_number: str) -> Optional[str]:
    """
    Return the user_id (as string) that currently holds the seat lock,
    or None if the seat is not locked.
    """
    key = get_lock_key(show_id, seat_number)
    return redis_client.get(key)


def is_seat_locked(show_id: int, seat_number: str) -> bool:
    """Check whether a seat is currently locked by any user."""
    return get_seat_lock_owner(show_id, seat_number) is not None
