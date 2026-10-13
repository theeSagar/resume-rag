# resume_rag — Project Structure & Status

A Retrieval-Augmented-Generation (RAG) backend for answering questions about a resume PDF, built with **FastAPI + PostgreSQL/pgvector + SQLAlchemy + pypdf**, with pluggable embedding providers (**Ollama** local / **OpenAI** hosted) and a planned multi-agent layer (**LangChain/LangGraph** — installed but not yet wired up).

Legend: ✅ implemented &nbsp;•&nbsp; ⚠️ file exists but is **empty** (stub / not started yet)

```
resume_rag/
├── .env                              ✅ environment config (DB url, LLM keys, embedding provider) — not read here (secrets)
├── requirements.txt                  ✅ pip freeze of dependencies
├── docker-compose.yml                ⚠️ empty — no containerization set up yet
├── create_tables.py                  ✅ one-off script: creates Postgres tables from SQLAlchemy models
├── ingest_resume.py                  ✅ one-off script: ingests data/sagar_python_2Y.pdf into the vector store
├── test_vector_store.py              ✅ manual smoke test: embed → insert → similarity search, prints results
│
├── data/
│   └── sagar_python_2Y.pdf           ✅ sample resume used as the test document
│
├── tests/
│   └── test_retrieval.py             ⚠️ empty — no automated/pytest-based tests yet
│
├── frontend/
│   └── index.html                    ⚠️ empty — no UI built yet
│
└── app/
    ├── main.py                       ⚠️ empty — FastAPI app/entrypoint NOT built yet (no HTTP API exists)
    ├── config.py                     ✅ pydantic-settings Settings class, loads .env (LLM, embedding, DB config)
    ├── schemas.py                    ⚠️ empty — no Pydantic request/response models yet
    │
    ├── db/
    │   ├── database.py               ✅ SQLAlchemy engine, SessionLocal, Base, get_session() context manager
    │   ├── models.py                 ✅ DocumentChunk model (content, embedding Vector(768), source, metadata, created_at)
    │   └── vector_store.py           ✅ insert_chunk() and similarity_search() (pgvector cosine distance)
    │
    ├── ingestion/
    │   ├── loader.py                 ✅ load_pdf_pages() — streams (page_num, text) from a PDF via pypdf
    │   ├── chunker.py                ✅ chunk_text() — generator, overlapping text chunks (800 chars, 150 overlap)
    │   ├── embedder.py               ✅ get_embedder() — picks ollama/hosted embedder based on config
    │   ├── ingest.py                 ✅ ingest_pdf() — orchestrates load → chunk → embed → insert pipeline
    │   └── providers/
    │       ├── _init__.py            ⚠️ empty, AND misnamed — should be `__init__.py` (missing an underscore)
    │       ├── ollama_embedder.py    ✅ embed() via local Ollama HTTP API (nomic-embed-text, 768-dim)
    │       └── hosted_embedder.py    ✅ embed() via OpenAI embeddings API (text-embedding-3-small, 1536-dim)
    │
    ├── retrieval/
    │   ├── vector_store.py           ⚠️ empty — duplicate/planned module, separate from db/vector_store.py
    │   └── metadata_filter.py        ⚠️ empty — planned filtering (e.g. by source/page) on retrieved chunks
    │
    ├── llms/
    │   └── client.py                 ⚠️ empty — no LLM generation client yet (the "answer using context" step)
    │
    └── agents/
        ├── router.py                 ⚠️ empty — planned: routes a query to the right agent
        ├── rag_agent.py              ⚠️ empty — planned: resume Q&A agent using retrieval + LLM
        ├── general_agent.py          ⚠️ empty — planned: fallback/general-purpose agent
        ├── ocr_agent.py              ⚠️ empty — planned: OCR-based ingestion for scanned/image PDFs
        └── weather_agent.py          ⚠️ empty — planned: example/demo tool-calling agent

(resumenv/ is the Python virtual environment — excluded above, but its installed
packages confirm the intended stack: fastapi, sqlalchemy, pgvector, psycopg2-binary,
pypdf, openai, langchain, langgraph, pytest, uvicorn.)
```

---

## What you've actually built so far

You have a **working, end-to-end ingestion + retrieval pipeline**, driven manually via scripts (no API server yet):

1. **Configuration** (`app/config.py`) — centralized settings loaded from `.env`: LLM endpoint/key/model, which embedding provider to use (`ollama` or `hosted`), and the Postgres connection string.

2. **Database layer** (`app/db/`) — a Postgres table `document_chunks` (via `pgvector`) storing chunk text, a 768-dim embedding vector, source filename, and page metadata. `database.py` sets up the SQLAlchemy engine/session; `create_tables.py` is run once to create the schema.

3. **Ingestion pipeline** (`app/ingestion/`) — fully wired:
   - `loader.py` streams text page-by-page out of a PDF (`pypdf`), skipping blank pages.
   - `chunker.py` splits each page into overlapping ~800-character chunks so context isn't cut mid-idea.
   - `embedder.py` abstracts over two embedding backends — local **Ollama** (`nomic-embed-text`) or hosted **OpenAI** (`text-embedding-3-small`) — selected purely by config, no code changes needed to switch.
   - `ingest.py` ties it together: load → chunk → embed → insert into Postgres, printing a chunk count when done.
   - `ingest_resume.py` runs this pipeline against your real resume, `data/sagar_python_2Y.pdf`.

4. **Retrieval (basic)** (`app/db/vector_store.py`) — `similarity_search()` runs a cosine-distance nearest-neighbor query against the stored chunks and returns the top-k most similar ones with a similarity score.

5. **Manual verification** (`test_vector_store.py`) — embeds a test sentence about your backend experience, inserts it, then queries it back by similarity — this is how you've been proving the pipeline works, end to end, without a UI or API yet.

## What's stubbed out / not started yet

Everything below exists as an empty file — i.e., you've scaffolded the intended architecture but haven't filled it in:

- **No HTTP API** — `app/main.py` and `app/schemas.py` are empty, so there's no FastAPI server or request/response contracts exposed yet. Right now this only runs as standalone Python scripts.
- **No answer generation (the "G" in RAG)** — `app/llms/client.py` is empty. You can retrieve relevant chunks, but nothing yet sends them + the question to an LLM to produce an answer.
- **No agent/router layer** — `app/agents/*.py` (router, rag_agent, general_agent, ocr_agent, weather_agent) are all empty. `langchain`/`langgraph` are installed, suggesting the plan is a multi-agent system that routes a query to a resume-RAG agent, a general chit-chat agent, an OCR-ingestion agent, and a demo weather/tool-calling agent — none implemented yet.
- **`app/retrieval/`** (`vector_store.py`, `metadata_filter.py`) are empty — looks like a planned cleaner separation of retrieval logic (with metadata filtering) away from the raw DB layer in `app/db/vector_store.py`, not yet migrated.
- **No automated tests** — `tests/test_retrieval.py` is empty; the only verification today is the manual `test_vector_store.py` script.
- **No frontend** — `frontend/index.html` is empty.
- **No containerization** — `docker-compose.yml` is empty.

## Small issues worth knowing about

- `app/ingestion/providers/_init__.py` is misnamed (one underscore short of `__init__.py`), so it isn't actually recognized as a package initializer by Python — it currently does nothing.

## In short

You've built the **data pipeline half of a RAG system** (PDF → chunks → embeddings → vector DB → similarity search) and proven it works against a real resume. The **serving half** — API, LLM-based answer generation, agent routing, tests, UI, and deployment — is scaffolded (file names/folders exist) but not yet implemented.
