# create_tables.py  (run once: python scripts\create_tables.py)

import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from sqlalchemy import text

from app.db.database import engine, Base
from app.db.models import DocumentChunk

with engine.begin() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
Base.metadata.create_all(bind=engine)
print("Tables created.")