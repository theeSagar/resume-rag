# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings
from contextlib import contextmanager

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

'''
engine:
represents the actual connection to Postgres. Created once, reused everywhere

Base:
a special class that all your table-model classes will inherit from. This is what lets SQLAlchemy know "this Python class maps to a database table.
'''

@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()