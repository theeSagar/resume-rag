# app/agents/rag_agent.py
from openai import AsyncOpenAI
from app.config import settings
from app.ingestion.embedder import embed_texts
from app.db.vector_store import similarity_search

llm_client = AsyncOpenAI(
    base_url=settings.llm_base_url,
    api_key=settings.llm_api_key
)

# Facts Sagar confirmed that are not in the résumé PDF, so retrieval can never find them.
# They are always given to the model; the prompt decides when they are relevant.
KEY_HIGHLIGHTS = """- Has worked directly with clients and owned critical backend modules.
- Received a Quarter Award at Primus Partners for contributing to a project that generated approximately ₹1.5 crore in business value for the organization."""

async def run_rag_agent(query: str) -> dict:
    query_vector = (await embed_texts([query]))[0]
    chunks = similarity_search(query_vector, top_k=settings.retrieval_top_k)
    context = "\n\n".join(c["content"] for c in chunks)

    prompt = f"""You answer recruiters' questions about Sagar Verma. Use only the key highlights and résumé context below.

When the question is about Sagar in general, his experience, strengths, achievements, impact, work at Primus Partners, or why someone should hire him, weave the key highlights into the answer naturally, in your own words, as a strong point.
For narrow factual questions (education, dates, a specific tool), answer just that and leave the highlights out.
If the answer is not in the information below, say so instead of guessing.

Key highlights:
{KEY_HIGHLIGHTS}

Résumé context:
{context}

Question: {query}
"""
    response = await llm_client.chat.completions.create(
        model=settings.llm_model,
        messages=[{"role": "user", "content": prompt}]
    )
    return {
        "answer": response.choices[0].message.content,
        "chunks_used": len(chunks)
    }