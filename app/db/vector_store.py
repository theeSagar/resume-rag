from app.db.database import get_session
from app.db.models import DocumentChunk

def insert_chunk(content: str, embedding: list[float], source: str, metadata: dict):
    with get_session() as session:
        session.add(DocumentChunk(content=content, embedding=embedding, source=source, metadata_=metadata))

def similarity_search(query_embedding: list[float], top_k: int = 3):
    with get_session() as session:
        results = (
            session.query(
                DocumentChunk.content, DocumentChunk.source, DocumentChunk.metadata_,
                DocumentChunk.embedding.cosine_distance(query_embedding).label("distance")
            )
            .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k)
            .all()
        )
        return [{"content": r.content, "source": r.source, "metadata": r.metadata_, "similarity": 1 - r.distance} for r in results]