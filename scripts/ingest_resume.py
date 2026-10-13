# ingest_resume.py  (run from project root: python scripts\ingest_resume.py)

import asyncio
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))

from app.ingestion.ingest import ingest_pdf

asyncio.run(ingest_pdf("data/sagar_python_2Y.pdf", source_name="sagar_python_2Y.pdf"))