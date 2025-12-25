from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from database import Base
import time

class Task(Base):
    __tablename__ = "tasks"

    # Basic metadata
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False, default="anonymous")
    audio_path = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    created_at = Column(
        Integer,
        default=lambda: int(time.time()),
        nullable=False
    )

    # Parsed task fields (explicit columns)
    title = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    priority = Column(Integer, nullable=True)
    category = Column(String, nullable=True)

    raw_time_expression = Column(String, nullable=True)
    deadline_expression = Column(String, nullable=True)
    estimated_duration_min = Column(Integer, nullable=True)

    contact_person = Column(String, nullable=True)
    location = Column(String, nullable=True)
    requested_file = Column(String, nullable=True)

    is_night = Column(Boolean, nullable=True)
    is_event = Column(Boolean, nullable=True)

    action_type = Column(String, nullable=True)
