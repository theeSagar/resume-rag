# Resume RAG — React Frontend Design

**Date:** 2026-10-01
**Status:** Approved in brainstorming, pending written-spec review

## 1. Goal

Build a React frontend for the existing Resume RAG backend that serves two audiences:

- **Recruiters / visitors** — a polished "Ask about Sagar" chat with guided questions.
- **Technical reviewers / Sagar as developer** — an optional detail view that exposes the multi-agent RAG pipeline (route taken, chunks used, latency, architecture).

Success = a portfolio-grade UI that works against the current API unchanged, makes the system design visible, and is structured so Phase 2 backend features plug in without a redesign.

## 2. Constraints

- **No changes to existing code.** Phase 1 adds files only under `frontend/` (plus this `docs/` folder). `app/`, `scripts/`, root test scripts, `.env` are untouched.
- `data/sagar_python_2Y.pdf` is **copied** to `frontend/public/resume.pdf`; the original stays in place.
- Backend contract used as-is (`app/main.py`, `app/schemas.py`):
  - `GET /health` → `{ "status": "ok" }`
  - `POST /chat` body `{ "query": string }` → `{ "answer": string, "source": "resume" | "weather" | "general", "chunks_used": number }`
- Backend has no CORS → dev uses a Vite proxy; production CORS is Phase 2.
- Environment: Node 24 / npm 11 available; Windows.

## 3. Tech Stack

Vite + React (current major from the Vite template) + TypeScript, Tailwind CSS, `react-router-dom` (2 routes), `react-markdown` (answer rendering), `lucide-react` (icons). Plain `fetch`, no global state library. Tests: Vitest + React Testing Library + jsdom.

Rejected: Next.js (SSR/server unnecessary), component libraries like MUI/Chakra (generic look, heavier).

## 4. Architecture

```
frontend/
├── index.html                 (currently empty file — replaced by Vite entry HTML)
├── public/resume.pdf          copy of data/sagar_python_2Y.pdf
├── vite.config.ts             dev proxy /api/* → http://localhost:8000/* (prefix stripped)
├── src/
│   ├── main.tsx, App.tsx      router + layout
│   ├── types.ts               ChatRequest, ChatResponse, Route, Message
│   ├── api/client.ts          getHealth(), sendChat(query) — timeout, typed errors
│   ├── data/profile.ts        name, role, tagline, links, stats, suggested questions
│   ├── data/resume.ts         structured resume content (experience, projects, skills, ...)
│   ├── pages/ResumePage.tsx   "/resume"
│   ├── hooks/useChat.ts       message list, pending state, timing, localStorage
│   ├── hooks/useHealth.ts     polls /health every 30 s
│   ├── hooks/usePreferences.ts theme + "show details", persisted
│   ├── pages/ChatPage.tsx     "/"
│   ├── pages/AboutPage.tsx    "/about"
│   └── components/            see §5
```

- API base URL: `import.meta.env.VITE_API_URL ?? "/api"`. Dev uses the proxy; production sets `VITE_API_URL` (needs Phase 2.2 CORS).
- `Message` type: `{ id, role: "user" | "assistant", content, status: "pending" | "done" | "error", route?, chunksUsed?, latencyMs?, error?, citations? }`. `citations` is optional and unused in Phase 1 (reserved for Phase 2.3).
- Profile content comes from the resume and lives only in `profile.ts`. GitHub/LinkedIn are not in the resume → placeholder values Sagar fills in. Email from the resume: `sagar.karanveer1@gmail.com`. Phone number is **not** shown publicly.

## 5. Screens & Components

### Chat page (`/`)

- **Header** — avatar initials "SV", "Sagar Verma · Software Engineer", tagline "Python · FastAPI · Django · RAG"; links GitHub, LinkedIn, Email, Download Resume; `HealthDot`; `ThemeToggle`; nav Chat | About this project.
- **EmptyState** (no messages) — greeting "Hi, I'm Sagar's AI assistant. Ask me about his work."; `StatCards` (~2 yrs experience · 2 government platforms · 2,000 concurrent users); `SuggestionChips` with tabs:
  - Projects: "Explain the MPIDC Single Window System", "How was C-GEM built for 2,000 concurrent users?", "Tell me about the RAG pipeline project"
  - Experience: "What does Sagar do at Primus Partners?", "What did he do at SDLC Corp?"
  - Skills: "What is Sagar's backend tech stack?", "Has he worked with Kafka and Redis?"
  - Education: "What is Sagar's education?", "Which certifications does he have?"
  - "Try the agents" row: "What's the weather in Delhi?", "Hi, how are you?"
  Clicking a chip sends it immediately.
- **MessageList** → `UserMessage` (right bubble) / `AssistantMessage` (left card: markdown answer; footer `RouteBadge` · chunks · latency · copy · "How" toggle → `PipelineView`). Auto-scroll to newest.
- **Composer** — auto-growing textarea; Enter sends, Shift+Enter newline; disabled while pending or empty; "Clear chat"; "Show details" toggle.

### PipelineView

Horizontal node flow per route (wraps vertically on mobile):

- resume: Question → Router → Resume Agent → Embed (nomic-embed-text) → pgvector · Neon (*N* chunks) → Llama 3.3 70B → Answer
- weather: Question → Router → Weather Agent → Open-Meteo tool → Llama 3.3 70B → Answer
- general: Question → Router → General Agent → Llama 3.3 70B → Answer

While pending: generic stages (Question → Router → Agent → LLM) animate sequentially, labelled as illustrative ("Thinking…"), not live progress. When done: the actual route's nodes highlighted. Disabled animation under `prefers-reduced-motion`.

### Show-details toggle (persisted)

- Off: answer + small route badge only; "How" collapsed.
- On: chunk count + latency visible; PipelineView expanded by default.

### Resume page (`/resume`)

A designed, web-native rendering of the resume (content from `data/resume.ts`, transcribed from the PDF), not just a PDF embed:

- **Hero** — name, title, objective, location preference, contact links, Download PDF button.
- **Profile summary** — the four summary points.
- **Experience timeline** — Primus Partners (Associate Software Engineer, 2024–Present, Delhi) with project sub-cards MPIDC Single Window System and C-GEM; SDLC Corp (Proposal Analyst Intern, 2023–2024, Noida).
- **Projects** — MPIDC (professional) and AI Assistant & RAG Pipeline (personal), each with tech-stack tags.
- **Skills** — grouped tag chips (Languages, Frameworks, Databases, Messaging & Caching, Cloud & DevOps) + core competencies.
- **Education, Certifications, Notable Accomplishments.**
- Every experience/project card has an **"Ask AI about this"** button → navigates to `/` and sends a prepared question (e.g. "Explain the MPIDC Single Window System project in detail").
- "View original PDF" opens `resume.pdf` in a new tab.
- Print-friendly CSS (header/nav hidden when printing).

Nav order becomes: **Chat | Resume | About this project**. The Chat page header keeps a compact profile; the Resume page is the full view.

### About page (`/about`)

Hero ("A multi-agent RAG system that answers questions about my resume"), `ArchitectureDiagram` (offline ingestion flow: PDF → pypdf → chunk 800/150 → nomic-embed-text → pgvector on Neon; live query flow: React → FastAPI → LLM router → resume/weather/general agent → Llama 3.3 → answer), `TechStackGrid`, and a "Coming next" roadmap list from §8.

### Visual style

Clean professional, light-first with dark mode. Single indigo accent, neutral grays, generous whitespace, rounded cards with subtle borders, Inter (system fallback). Route badge colors: resume = indigo, weather = sky, general = slate. Theme follows OS by default; toggle overrides and persists. Responsive down to 360 px width.

## 6. Data Flow, States, Errors

1. Send → append user message + pending assistant message, start `performance.now()` timer.
2. `sendChat` → `POST {base}/chat` with `AbortController` timeout of **60 s**.
3. Success → assistant message `done` with `answer`, `source`, `chunks_used`, `latencyMs`.
4. Persist last 50 messages to `localStorage` (`resume-rag:chat`); pending messages restored as error ("Interrupted"). All storage access wrapped in try/catch.
5. One request at a time (send disabled while pending).

`api/client.ts` throws a typed `ApiError` with `kind`: `network` | `server` | `timeout` | `bad_response`.

| kind | Message shown (inline error card + Retry) |
|---|---|
| network | "Can't reach the assistant. Is the API running on :8000?" |
| server (HTTP ≥ 500) | "Something went wrong on the server for this question." (HTTP status shown when details on) |
| timeout | "This is taking longer than usual. Please try again." |
| bad_response | "Received an unexpected response from the server." |

Unknown `source` values render as the "General" badge. Retry re-sends the same query, replacing the failed message.

`HealthDot`: green "Online" / red "Offline" / gray "Checking". When offline, a dismissible banner: "Backend offline — run `uvicorn app.main:app --reload` from the resume_rag folder."

Accessibility: semantic landmarks, keyboard reachable controls, visible focus rings, `aria-live="polite"` on the message list, icon buttons have labels, WCAG AA contrast in both themes.

## 7. Testing

- **Unit (Vitest + RTL, fetch mocked):** `api/client` — success, 500, timeout, network failure, malformed JSON; `useChat` — pending → done, pending → error, retry, clear, persistence; `PipelineView` — correct nodes for each route and chunk count shown; `RouteBadge` — unknown source fallback.
- **Build gate:** `npm run build` (type-check + bundle) passes; `npm test` passes.
- **Manual E2E:** open /resume, check every section and "Ask AI about this" sends the question; start uvicorn + `npm run dev`; ask one resume, one weather, one general question; verify badges, timings, pipeline, markdown, copy; stop backend → offline dot + network error + retry; toggle dark mode, details, mobile width; download resume.

Run commands:
```
# terminal 1 (resume_rag/)
resumenv\Scripts\activate
uvicorn app.main:app --reload
# terminal 2 (resume_rag/frontend/)
npm install
npm run dev        # http://localhost:5173
```

## 8. Phase 2 Roadmap (planned; each item requires separate approval, modifies backend)

| # | Feature | Backend | Frontend |
|---|---|---|---|
| 2.1 | Bug fixes | `dispatcher.py`: remove duplicate `agent_fn` call (lines 16–17); `weather_agent.py`: return `{answer, chunks_used}` dict on the no-tool-call path | none |
| 2.2 | CORS + deploy | `CORSMiddleware` with allowed origins from config; API to Render/Railway; DB already on Neon | set `VITE_API_URL`; deploy to Vercel |
| 2.3 | Citations | `similarity_search` results returned from `rag_agent`; `ChatResponse.citations: [{content, page, similarity}]` optional | "Sources" drawer: page, % match, quoted snippet |
| 2.4 | Conversation memory | `ChatRequest.history` (last N turns) passed to router/agents | send recent turns |
| 2.5 | Streaming | `POST /chat/stream` (SSE) emitting stage events + tokens | typewriter answer; PipelineView shows real stages |
| 2.6 | JD match | `POST /match`: JD text → retrieve resume chunks → LLM → `{score, matched_skills, gaps, summary}` | `/match` page: textarea, score gauge, skills table |

## 9. Out of Scope (Phase 1)

Resume upload/ingestion from the UI, authentication, analytics, feedback buttons, i18n, any backend modification.
