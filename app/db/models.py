# app/db/models.py
from sqlalchemy import Column, Integer, Text, JSON, DateTime
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.db.database import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(1024))     # was 768, now 1024
    source = Column(Text)
    metadata_ = Column("metadata", JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())