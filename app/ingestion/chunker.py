from app.config import settings

def chunk_text(text: str, chunk_size: int = None, overlap: int = None):

    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    
    """
    Generator: splits text into overlapping chunks, one at a time.
    overlap keeps some context continuity between chunks so we don't
    cut a sentence/idea awkwardly in half at chunk boundaries.
    """
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            yield chunk
        start += chunk_size - overlap   # move forward, but overlap a bit