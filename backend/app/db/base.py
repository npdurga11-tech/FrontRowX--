"""
SQLAlchemy declarative base.
All models import from here to share the same metadata.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
