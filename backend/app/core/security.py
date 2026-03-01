"""
Security utilities: password hashing and JWT token management.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

# ── Compatibility shim ─────────────────────────────────────────────────────
# passlib 1.7.4 reads bcrypt.__about__.__version__ which was removed in
# bcrypt 4.x. Injecting a mock object silences the AttributeError.
import bcrypt as _bcrypt
import types as _types

if not hasattr(_bcrypt, "__about__"):
    # Try to get version from the module itself, with fallback
    _ver = getattr(_bcrypt, "__version__", "4.0.0")
    _bcrypt.__about__ = _types.SimpleNamespace(__version__=_ver)  # type: ignore

import warnings
# Suppress passlib's deprecation warnings about bcrypt version checks
warnings.filterwarnings("ignore", message=".*error reading bcrypt version.*")
warnings.filterwarnings("ignore", module="passlib.*")
# ──────────────────────────────────────────────────────────────────────────

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    - data: payload to encode (should include 'sub' = user email/id)
    - expires_delta: custom expiry, defaults to settings value
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT token.
    Returns the payload dict or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
