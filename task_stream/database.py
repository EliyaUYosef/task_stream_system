from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Default to a local SQLite DB if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./task_stream.db"

# SQLite needs check_same_thread=False; other DBs do not.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()