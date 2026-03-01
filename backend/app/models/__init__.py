# Import all models here so Alembic and SQLAlchemy can discover them
from app.models.user import User  # noqa: F401
from app.models.show import Show  # noqa: F401
from app.models.booking import Booking, BookingStatus  # noqa: F401
from app.models.notification import Notification  # noqa: F401
