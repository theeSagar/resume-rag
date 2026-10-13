export interface FlowStep {
  title: string;
  detail: string;
}

/** Offline: scripts/ingest_resume.py → app/ingestion/*. */
export const ingestionFlow: FlowStep[] = [
  { title: "Resume PDF", detail: "data/sagar_python_2Y.pdf" },
  { title: "pypdf loader", detail: "Page-by-page text extraction" },
  { title: "Chunker", detail: "800 characters · 150 overlap" },
  { title: "nomic-embed-text", detail: "768-dim vectors via Ollama" },
  { title: "pgvector on Neon", detail: "document_chunks table" },
];

/** Live: React → app/main.py → app/agents/*. */
export const queryFlow: FlowStep[] = [
  { title: "React UI", detail: "This website" },
  { title: "FastAPI", detail: "POST /chat" },
  { title: "LLM router", detail: "resume · weather · general" },
  { title: "Agent", detail: "Vector search or tool call" },
  { title: "Llama 3.3 70B", detail: "Writes the grounded answer" },
];

export interface TechItem {
  name: string;
  role: string;
}

export const techStack: TechItem[] = [
  { name: "FastAPI", role: "Async Python API serving /chat and /health" },
  { name: "PostgreSQL + pgvector", role: "Cosine-similarity vector search, hosted on Neon" },
  { name: "SQLAlchemy", role: "ORM models and session management" },
  { name: "Ollama · nomic-embed-text", role: "Local 768-dimension embeddings" },
  { name: "Llama 3.3 70B", role: "Query routing and answer generation (OpenAI-compatible API)" },
  { name: "Open-Meteo", role: "Live weather tool used by the weather agent" },
  { name: "pypdf", role: "PDF text extraction for ingestion" },
  { name: "React + TypeScript", role: "This frontend, built with Vite and Tailwind CSS" },
];

export interface RoadmapItem {
  title: string;
  detail: string;
}

export const roadmap: RoadmapItem[] = [
  { title: "Faster answers", detail: "Remove a duplicate agent call and harden the weather agent." },
  { title: "Live deployment", detail: "Hosted API and frontend with CORS; the database already runs on Neon." },
  { title: "Citations", detail: "Show the resume passages, page numbers and match scores behind every answer." },
  { title: "Conversation memory", detail: "Natural follow-up questions like “tell me more about that”." },
  { title: "Streaming", detail: "Answers appear word by word with real pipeline progress." },
  { title: "Job-description match", detail: "Paste a job description and get a fit score, matched skills and gaps." },
];

/** Short explainer in the chat sidebar. */
export const howItAnswers =
  "A router picks an agent. Résumé questions search pgvector on Neon, then Llama 3.3 70B writes the answer.";
