# app/ingestion/ingest.py
from app.ingestion.loader import load_pdf_pages
from app.ingestion.chunker import chunk_text
from app.ingestion.embedder import embed_texts
from app.db.vector_store import insert_chunk

async def ingest_pdf(pdf_path: str, source_name: str):
    all_chunks = []
    all_metadata = []

    for page_num, page_text in load_pdf_pages(pdf_path):
        for chunk in chunk_text(page_text):
            all_chunks.append(chunk)
            all_metadata.append({"page": page_num})

    vectors = await embed_texts(all_chunks)   # one batched call for everything

    for chunk, vector, metadata in zip(all_chunks, vectors, all_metadata):
        insert_chunk(content=chunk, embedding=vector, source=source_name, metadata=metadata)

    print(f"Ingested {len(all_chunks)} chunks from {source_name}")