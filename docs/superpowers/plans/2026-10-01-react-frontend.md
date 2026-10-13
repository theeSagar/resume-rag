# Resume RAG React Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a professional React portfolio frontend (Chat, Resume and About pages) for the existing Resume RAG FastAPI backend without modifying any backend code.

**Architecture:** A Vite + React + TypeScript single-page app in `frontend/`. It calls the existing `GET /health` and `POST /chat` endpoints through a Vite dev proxy (`/api/*` → `http://localhost:8000/*`), so the backend needs no CORS change. State lives in a few hooks (`useChat`, `useHealth`, `usePreferences`). All resume and profile copy lives in typed data files, and components only render it.

**Tech Stack:** Vite 7, React 19, TypeScript, Tailwind CSS 4 (+ typography plugin), react-router 7, react-markdown 10 + remark-gfm, lucide-react, Vitest 3 + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-10-01-react-frontend-design.md`

## Global Constraints

- **Do not modify any existing file outside `frontend/`.** `app/`, `scripts/`, root `*.py`, `.env`, `data/` stay byte-identical. The only exception: `frontend/index.html` (currently an empty file) is replaced by the Vite entry HTML.
- `data/sagar_python_2Y.pdf` is **copied** to `frontend/public/resume.pdf`. Never moved.
- Backend contract (do not assume anything else): `GET /health` → `{"status":"ok"}`; `POST /chat` body `{"query": string}` → `{"answer": string, "source": "resume"|"weather"|"general", "chunks_used": number}`.
- API base URL: `import.meta.env.VITE_API_URL ?? "/api"`.
- Chat request timeout: **60 s**. Health poll interval: **30 s**. Stored chat: last **50** messages under localStorage key `resume-rag:chat`. Preference keys: `resume-rag:theme`, `resume-rag:details`.
- The phone number from the resume must **never** appear in the frontend. Email shown: `sagar.karanveer1@gmail.com`.
- GitHub / LinkedIn URLs are empty strings in `profile.ts`. Their icons are hidden while empty (Sagar fills them in).
- Visual style: clean professional, light-first with dark mode (`.dark` class on `<html>`), single indigo accent, slate neutrals, Inter font, works at 360 px width.
- Every `localStorage` access is wrapped in try/catch, and the app must work when storage is blocked.
- Respect `prefers-reduced-motion` (no pipeline animation, no ping animation).
- Error copy (verbatim):
  - network: "Can't reach the assistant. Is the API running on :8000?"
  - server: "Something went wrong on the server for this question."
  - timeout: "This is taking longer than usual. Please try again."
  - bad_response: "Received an unexpected response from the server."
- The project is **not a git repository**, so each task ends with a **Checkpoint** (tests + type-check) instead of a commit. If Sagar runs `git init` first, commit at each checkpoint.
- Shell: commands are written for Git Bash. All `npm`/`npx` commands also work in PowerShell.

## Review Focus

1. **Double submit**: Enter pressed twice quickly, or a chip clicked while an answer is pending, must send exactly one request. Test in Task 5 (`ignores a second send while a request is in flight`).
2. **Reload mid-answer**: a message that was pending when the page reloaded must come back as an error card with Retry, never as an endless spinner. Test in Task 5 (`restores an interrupted pending message as a retryable error`).
3. **Broken or blocked storage**: corrupted JSON in `resume-rag:chat`, or `localStorage` throwing (private mode), must give an empty working chat, not a white screen. Tests in Task 5 (`starts empty when stored data is corrupted`, `keeps working when localStorage throws`).
4. **Whitespace-only input**: must not be sent, and the Send button stays disabled. Tests in Task 5 (`ignores whitespace-only input`) and Task 7 (`keeps Send disabled for whitespace`).
5. **"Ask AI about this" from the Resume page**: under React StrictMode it must send the question exactly once, and if a request is already pending, put the question in the composer instead of dropping it. Tests in Task 8 (`sends a question passed from the resume page exactly once`, `prefills the composer when the assistant is busy`).

---

## File Map

```
frontend/
├── package.json, tsconfig.json, vite.config.ts, index.html
├── public/resume.pdf, public/favicon.svg
└── src/
    ├── main.tsx                       React root
    ├── App.tsx                        providers + router + routes (Task 11)
    ├── index.css                      Tailwind, theme, animations, print rules
    ├── vite-env.d.ts                  env typing
    ├── types.ts                       API + Message types, toRoute()
    ├── api/client.ts                  sendChat(), getHealth(), ApiError
    ├── data/profile.ts                name, links, stats, suggested questions
    ├── data/resume.ts                 structured resume content
    ├── data/project.ts                About page: flows, tech stack, roadmap
    ├── hooks/usePreferences.tsx       theme + show-details context
    ├── hooks/useHealth.ts             /health polling
    ├── hooks/useChat.ts               conversation state + persistence
    ├── components/ui.ts               shared Tailwind class strings
    ├── components/Avatar.tsx
    ├── components/RouteBadge.tsx
    ├── components/PipelineView.tsx
    ├── components/chat/UserMessage.tsx
    ├── components/chat/AssistantMessage.tsx
    ├── components/chat/MessageList.tsx
    ├── components/chat/Composer.tsx
    ├── components/chat/EmptyState.tsx      (includes StatCards)
    ├── components/chat/SuggestionChips.tsx
    ├── components/chat/OfflineBanner.tsx
    ├── components/BrandIcons.tsx
    ├── components/SocialLinks.tsx
    ├── components/Footer.tsx
    ├── components/resume/primitives.tsx    Section, Tag, AskButton, BulletList
    ├── components/resume/ResumeHero.tsx
    ├── components/resume/ExperienceTimeline.tsx
    ├── components/resume/ProjectCards.tsx
    ├── components/resume/SkillsPanel.tsx
    ├── components/about/ArchitectureDiagram.tsx
    ├── components/layout/Header.tsx
    ├── components/layout/HealthDot.tsx
    ├── components/layout/ThemeToggle.tsx
    ├── pages/ChatPage.tsx, ResumePage.tsx, AboutPage.tsx
    └── test/setup.ts
```

---

### Task 1: Scaffold the Vite + React + TypeScript + Tailwind project

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/src/vite-env.d.ts`, `frontend/src/main.tsx`, `frontend/src/App.tsx` (temporary, replaced in Task 11), `frontend/src/index.css`, `frontend/src/test/setup.ts`, `frontend/src/test/smoke.test.tsx`, `frontend/public/favicon.svg`, `frontend/public/resume.pdf` (copy)
- Replace: `frontend/index.html` (currently empty)

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run build` scripts; Tailwind `dark:` variant driven by `.dark` on `<html>`; CSS classes `.pipeline-pending-node` and `.no-print`.

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "resume-rag-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Install dependencies** (run inside `frontend/`)

```bash
cd frontend
npm install react@^19 react-dom@^19 react-router@^7 react-markdown@^10 remark-gfm@^4 lucide-react
npm install -D vite@^7 @vitejs/plugin-react@^5 typescript @types/react@^19 @types/react-dom@^19 @types/node tailwindcss@^4 @tailwindcss/vite@^4 @tailwindcss/typography vitest@^3.2 jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

Expected: both commands finish without `ERESOLVE` errors.

- [ ] **Step 3: Create `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `frontend/vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import type { ServerResponse } from "node:http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Dev only: the browser talks to :5173, Vite forwards to FastAPI on :8000,
      // so the backend needs no CORS configuration.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy) => {
          // Backend not running → answer 502 so the UI shows "Can't reach the assistant".
          proxy.on("error", (_err, _req, res) => {
            const response = res as ServerResponse;
            if (typeof response.writeHead === "function" && !response.headersSent) {
              response.writeHead(502, { "Content-Type": "application/json" });
            }
            response.end?.(JSON.stringify({ detail: "Backend unreachable" }));
          });
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
```

- [ ] **Step 5: Create `frontend/index.html`** (replaces the empty file)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Sagar Verma, Software Engineer. Ask an AI assistant about his experience, projects and skills."
    />
    <title>Sagar Verma · Software Engineer</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script>
      // Apply the saved/OS theme before React loads to avoid a light flash in dark mode.
      try {
        var t = localStorage.getItem("resume-rag:theme");
        var dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (dark) document.documentElement.classList.add("dark");
      } catch (e) {}
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `frontend/public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#g)"/>
  <text x="32" y="41" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#fff">SV</text>
</svg>
```

- [ ] **Step 7: Copy the resume PDF** (the original stays in `data/`)

```bash
cp ../data/sagar_python_2Y.pdf public/resume.pdf
ls -l ../data/sagar_python_2Y.pdf public/resume.pdf
```

Expected: both files are listed with the same size.

- [ ] **Step 8: Create `frontend/src/index.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}

@layer base {
  html {
    color-scheme: light;
  }
  html.dark {
    color-scheme: dark;
  }
  body {
    @apply bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100;
  }
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-indigo-500;
  }
}

/* PipelineView "thinking" state: each node lights up in turn (delay set inline). */
@keyframes pipeline-step {
  0%,
  40%,
  100% {
    opacity: 0.45;
    transform: translateY(0);
  }
  10%,
  25% {
    opacity: 1;
    transform: translateY(-2px);
  }
}
.pipeline-pending-node {
  animation: pipeline-step 2.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .pipeline-pending-node {
    animation: none;
    opacity: 1;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: #fff;
    color: #000;
  }
}
```

- [ ] **Step 9: Create `frontend/src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production API origin, e.g. https://resume-rag-api.onrender.com. Unset in dev (proxy is used). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 10: Create `frontend/src/App.tsx`** (temporary, replaced in Task 11) **and `frontend/src/main.tsx`**

```tsx
// src/App.tsx (temporary until Task 11)
export default function App() {
  return <p className="p-8 text-indigo-600">Resume RAG frontend scaffold</p>;
}
```

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 11: Create the test setup and a smoke test**

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.className = "";
});
```

```tsx
// src/test/smoke.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

it("renders React into jsdom with jest-dom matchers", () => {
  render(<p>hello</p>);
  expect(screen.getByText("hello")).toBeInTheDocument();
});
```

- [ ] **Step 12: Verify tests, type-check and dev server**

Run: `npm test`
Expected: `1 passed`.

Run: `npm run build`
Expected: `tsc` reports no errors and Vite prints `dist/index.html` plus asset sizes.

Run: `npm run dev`, open http://localhost:5173.
Expected: indigo text "Resume RAG frontend scaffold" in Inter. Stop the server.

- [ ] **Step 13: Checkpoint.** `npm test` and `npm run build` are green. Run `git -C .. status` only if git was initialised.

---

### Task 2: Types and API client

**Files:**
- Create: `frontend/src/types.ts`, `frontend/src/api/client.ts`
- Test: `frontend/src/types.test.ts`, `frontend/src/api/client.test.ts`

**Interfaces:**
- Produces:
  - `type Route = "resume" | "weather" | "general"`; `toRoute(source: string): Route`
  - `interface ChatResponse { answer: string; source: string; chunks_used: number }`
  - `interface Message { id; role: "user"|"assistant"; content; status: "pending"|"done"|"error"; query?; route?; chunksUsed?; latencyMs?; error?: MessageError; citations?: Citation[] }`
  - `type ApiErrorKind = "network" | "server" | "timeout" | "bad_response"`
  - `class ApiError extends Error { kind: ApiErrorKind; status?: number }`
  - `ERROR_MESSAGES: Record<ApiErrorKind, string>`, `API_BASE: string`, `CHAT_TIMEOUT_MS = 60000`
  - `sendChat(query: string, timeoutMs?: number): Promise<ChatResponse>`
  - `getHealth(timeoutMs?: number): Promise<boolean>`

- [ ] **Step 1: Write the failing tests**

```ts
// src/types.test.ts
import { describe, expect, it } from "vitest";
import { toRoute } from "./types";

describe("toRoute", () => {
  it("keeps known routes", () => {
    expect(toRoute("resume")).toBe("resume");
    expect(toRoute("weather")).toBe("weather");
    expect(toRoute("general")).toBe("general");
  });

  it("maps unknown sources to general", () => {
    expect(toRoute("ocr")).toBe("general");
    expect(toRoute("")).toBe("general");
  });
});
```

```ts
// src/api/client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, ERROR_MESSAGES, getHealth, sendChat } from "./client";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendChat", () => {
  it("posts the query to /api/chat and returns the parsed body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ answer: "Hi", source: "resume", chunks_used: 8 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendChat("What is MPIDC?")).resolves.toEqual({
      answer: "Hi",
      source: "resume",
      chunks_used: 8,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ query: "What is MPIDC?" });
  });

  it("throws a server error for HTTP 500", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ detail: "boom" }, 500)));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "server", status: 500 });
  });

  it("treats 502 from the dev proxy as the backend being unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 502)));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "network", status: 502 });
  });

  it("throws a network error when fetch itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "network" });
  });

  it("throws a timeout error when the server does not answer in time", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );
    await expect(sendChat("q", 10)).rejects.toMatchObject({ kind: "timeout" });
  });

  it("throws bad_response for a non-JSON body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 200 })));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "bad_response" });
  });

  it("throws bad_response when required fields are missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ answer: "x" })));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "bad_response" });
  });

  it("throws bad_response for a 4xx such as 422 validation errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ detail: [] }, 422)));
    await expect(sendChat("q")).rejects.toMatchObject({ kind: "bad_response", status: 422 });
  });
});

describe("ApiError", () => {
  it("carries the user-facing message for its kind", () => {
    const error = new ApiError("timeout");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(ERROR_MESSAGES.timeout);
    expect(ERROR_MESSAGES.network).toBe("Can't reach the assistant. Is the API running on :8000?");
  });
});

describe("getHealth", () => {
  it("returns true when the API reports ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: "ok" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getHealth()).resolves.toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/health");
  });

  it("returns false for an error status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 502)));
    await expect(getHealth()).resolves.toBe(false);
  });

  it("returns false when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(getHealth()).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/types.test.ts src/api/client.test.ts`
Expected: FAIL. The modules `./types` and `./client` cannot be resolved.

- [ ] **Step 3: Implement `src/types.ts`**

```ts
// Mirrors app/schemas.py on the backend.
export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  answer: string;
  source: string;
  chunks_used: number;
}

export type Route = "resume" | "weather" | "general";

/** The backend may add agents later; anything unknown is shown as "general". */
export function toRoute(source: string): Route {
  return source === "resume" || source === "weather" ? source : "general";
}

/** Reserved for Phase 2.3 (citations). The backend does not send these yet. */
export interface Citation {
  content: string;
  page: number | null;
  similarity: number;
}

export type ApiErrorKind = "network" | "server" | "timeout" | "bad_response";

export interface MessageError {
  message: string;
  status?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "done" | "error";
  /** Assistant messages only: the question being answered (used by Retry). */
  query?: string;
  route?: Route;
  chunksUsed?: number;
  latencyMs?: number;
  error?: MessageError;
  citations?: Citation[];
}
```

- [ ] **Step 4: Implement `src/api/client.ts`**

```ts
import type { ApiErrorKind, ChatRequest, ChatResponse } from "../types";

export const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";
export const CHAT_TIMEOUT_MS = 60_000;
const HEALTH_TIMEOUT_MS = 5_000;

export const ERROR_MESSAGES: Record<ApiErrorKind, string> = {
  network: "Can't reach the assistant. Is the API running on :8000?",
  server: "Something went wrong on the server for this question.",
  timeout: "This is taking longer than usual. Please try again.",
  bad_response: "Received an unexpected response from the server.",
};

/** Gateway statuses: the dev proxy (vite.config.ts) and hosting platforms return these when the API is down. */
const UNREACHABLE_STATUSES = new Set([502, 503, 504]);

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, status?: number) {
    super(ERROR_MESSAGES[kind]);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function isChatResponse(data: unknown): data is ChatResponse {
  if (typeof data !== "object" || data === null) return false;
  const body = data as Record<string, unknown>;
  return (
    typeof body.answer === "string" &&
    typeof body.source === "string" &&
    typeof body.chunks_used === "number"
  );
}

export async function sendChat(
  query: string,
  timeoutMs: number = CHAT_TIMEOUT_MS,
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const body: ChatRequest = { query };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (UNREACHABLE_STATUSES.has(res.status)) throw new ApiError("network", res.status);
  if (res.status >= 500) throw new ApiError("server", res.status);
  if (!res.ok) throw new ApiError("bad_response", res.status);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError("bad_response", res.status);
  }
  if (!isChatResponse(data)) throw new ApiError("bad_response", res.status);
  return data;
}

export async function getHealth(timeoutMs: number = HEALTH_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    return (data as { status?: unknown } | null)?.status === "ok";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/types.test.ts src/api/client.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 6: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 3: Content data (profile, resume, project)

**Files:**
- Create: `frontend/src/data/profile.ts`, `frontend/src/data/resume.ts`, `frontend/src/data/project.ts`
- Test: `frontend/src/data/data.test.ts`

**Interfaces:**
- Produces:
  - `profile: Profile` with `name, firstName, initials, role, tagline, email, location, github, linkedin, resumeUrl, resumeFileName, stats: Stat[]`
  - `suggestionGroups: SuggestionGroup[]` (`id: "projects"|"experience"|"skills"|"education"`, `label`, `questions: string[]`)
  - `agentDemos: AgentDemo[]` (`route: "weather"|"general"`, `question`)
  - `resume: Resume` (see the types below)
  - `ingestionFlow: FlowStep[]`, `queryFlow: FlowStep[]`, `techStack: TechItem[]`, `roadmap: RoadmapItem[]`

- [ ] **Step 1: Write the failing test**

```ts
// src/data/data.test.ts
import { describe, expect, it } from "vitest";
import { agentDemos, profile, suggestionGroups } from "./profile";
import { ingestionFlow, queryFlow, roadmap, techStack } from "./project";
import { resume } from "./resume";

describe("content data", () => {
  it("never exposes the phone number from the PDF", () => {
    const everything = JSON.stringify({ profile, suggestionGroups, agentDemos, resume });
    expect(everything).not.toMatch(/7078636216/);
    expect(everything).not.toMatch(/\+91/);
  });

  it("has suggestion questions for all four topics", () => {
    expect(suggestionGroups.map((g) => g.id)).toEqual(["projects", "experience", "skills", "education"]);
    for (const group of suggestionGroups) {
      expect(group.questions.length).toBeGreaterThan(0);
      for (const q of group.questions) expect(q.trim()).not.toBe("");
    }
    expect(agentDemos.map((d) => d.route)).toEqual(["weather", "general"]);
  });

  it("gives every experience and project an ask prompt", () => {
    expect(resume.experience.map((e) => e.company)).toEqual(["Primus Partners Solutions", "SDLC Corp"]);
    for (const job of resume.experience) {
      expect(job.ask).toMatch(/\?$|\.$/);
      for (const p of job.projects ?? []) expect(p.ask.length).toBeGreaterThan(10);
    }
    for (const p of resume.projects) expect(p.ask.length).toBeGreaterThan(10);
  });

  it("describes the real pipeline on the About page", () => {
    expect(ingestionFlow.map((s) => s.title)).toContain("pgvector on Neon");
    expect(queryFlow.map((s) => s.title)).toContain("LLM router");
    expect(techStack.length).toBeGreaterThanOrEqual(6);
    expect(roadmap).toHaveLength(6);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/data/data.test.ts`
Expected: FAIL. `./profile`, `./project` and `./resume` cannot be resolved.

- [ ] **Step 3: Implement `src/data/profile.ts`**

```ts
export interface Stat {
  value: string;
  label: string;
}

export interface Profile {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  tagline: string;
  email: string;
  location: string;
  /** Add your profile URLs here. Each icon stays hidden while its URL is empty. */
  github: string;
  linkedin: string;
  resumeUrl: string;
  resumeFileName: string;
  stats: Stat[];
}

export const profile: Profile = {
  name: "Sagar Verma",
  firstName: "Sagar",
  initials: "SV",
  role: "Software Engineer",
  tagline: "Python · FastAPI · Django · RAG",
  email: "sagar.karanveer1@gmail.com",
  location: "Delhi NCR, India",
  github: "",
  linkedin: "",
  resumeUrl: "/resume.pdf",
  resumeFileName: "Sagar_Verma_Resume.pdf",
  stats: [
    { value: "~2 yrs", label: "Backend engineering experience" },
    { value: "2", label: "Government platforms delivered" },
    { value: "2,000", label: "Concurrent users on C-GEM" },
  ],
};

export interface SuggestionGroup {
  id: "projects" | "experience" | "skills" | "education";
  label: string;
  questions: string[];
}

export const suggestionGroups: SuggestionGroup[] = [
  {
    id: "projects",
    label: "Projects",
    questions: [
      "Explain the MPIDC Single Window System",
      "How was C-GEM built for 2,000 concurrent users?",
      "Tell me about the RAG pipeline project",
    ],
  },
  {
    id: "experience",
    label: "Experience",
    questions: ["What does Sagar do at Primus Partners?", "What did he do at SDLC Corp?"],
  },
  {
    id: "skills",
    label: "Skills",
    questions: ["What is Sagar's backend tech stack?", "Has he worked with Kafka and Redis?"],
  },
  {
    id: "education",
    label: "Education",
    questions: ["What is Sagar's education?", "Which certifications does he have?"],
  },
];

export interface AgentDemo {
  route: "weather" | "general";
  question: string;
}

export const agentDemos: AgentDemo[] = [
  { route: "weather", question: "What's the weather in Delhi?" },
  { route: "general", question: "Hi, how are you?" },
];
```

- [ ] **Step 4: Implement `src/data/resume.ts`** (transcribed from `data/sagar_python_2Y.pdf`, phone number deliberately omitted)

```ts
export interface ExperienceProject {
  name: string;
  bullets: string[];
  ask: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets?: string[];
  projects?: ExperienceProject[];
  ask: string;
}

export interface Project {
  name: string;
  kind: "Professional" | "Personal";
  stack: string[];
  bullets: string[];
  ask: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Education {
  degree: string;
  field: string;
  institute: string;
  period: string;
}

export interface Resume {
  title: string;
  objective: string;
  locationPreference: string;
  overviewQuestion: string;
  summary: string[];
  experience: Experience[];
  projects: Project[];
  competencies: string[];
  skills: SkillGroup[];
  education: Education[];
  certifications: string[];
  accomplishments: string[];
}

export const resume: Resume = {
  title: "Software Engineer",
  objective:
    "Targeting challenging opportunities in Backend Software Engineering, Python Development, Django/FastAPI Development or AI-Driven Application Development across diverse industries.",
  locationPreference: "Delhi NCR, Jaipur (open to relocate)",
  overviewQuestion: "Give me a quick overview of Sagar's profile and strengths.",
  summary: [
    "Software Engineer with nearly 2 years of experience in designing and developing scalable backend applications using Python, Django REST Framework, FastAPI, PostgreSQL, Redis, and Kafka across government digital transformation and enterprise technology projects.",
    "Expertise in building RESTful APIs, automation solutions, payment integrations, real-time communication systems, and database-driven applications.",
    "Hands-on experience delivering critical solutions for government initiatives, including industrial development, education & public service platforms.",
    "Knowledgeable about emerging AI technologies with practical exposure to LLM-powered applications, RAG pipelines, vector databases (pgvector) & prompt engineering.",
  ],
  experience: [
    {
      role: "Associate Software Engineer",
      company: "Primus Partners Solutions",
      period: "2024 – Present",
      location: "Delhi, India",
      ask: "What does Sagar do at Primus Partners?",
      projects: [
        {
          name: "MPIDC (Single Window System)",
          ask: "Explain the MPIDC Single Window System project in detail.",
          bullets: [
            "Designed backend services for MPIDC (Madhya Pradesh Industrial Development Corporation) utilizing Python, Django REST Framework, PostgreSQL, ORM & SQL, including Razorpay payment gateway integration & Kafka-driven workflow processing.",
            "Built and maintained RESTful APIs for government workflow applications using Django REST Framework and PostgreSQL, while producing API documentation through Swagger and supporting cross-department system integrations.",
          ],
        },
        {
          name: "C-GEM",
          ask: "How did Sagar build C-GEM for 1,000–2,000 concurrent users?",
          bullets: [
            "Designed and implemented a real-time group communication platform supporting 1,000–2,000 concurrent users using Flask-SocketIO.",
            "Developed backend services and REST APIs using Flask and PostgreSQL, enabling secure and scalable application functionality.",
            "Established role-based access control mechanisms for multiple stakeholder groups, including NGOs, Investors & Developers, ensuring controlled access to platform resources.",
          ],
        },
      ],
    },
    {
      role: "Proposal Analyst Intern",
      company: "SDLC Corp",
      period: "2023 – 2024",
      location: "Noida, India",
      ask: "What did Sagar do during his internship at SDLC Corp?",
      bullets: [
        "Evaluated business & technical requirements, translating them into backend specifications & scalable Python-based solutions while collaborating with cross-functional teams.",
        "Developed APIs and backend components in accordance with functional requirements, contributing to solution design, technical documentation & implementation planning.",
      ],
    },
  ],
  projects: [
    {
      name: "MPIDC Single Window System",
      kind: "Professional",
      stack: ["Python", "Django", "ReactJS", "PostgreSQL"],
      ask: "What was Sagar's role in architecting the MPIDC Single Window System?",
      bullets: [
        "Architecting backend services for the MPIDC Single Window System using Python and Django REST Framework while delivering RESTful APIs & supporting government processes.",
        "Managing data operations through PostgreSQL using both ORM and optimized SQL queries, ensuring efficient backend functionality, system integration, and application performance.",
      ],
    },
    {
      name: "AI Assistant & RAG Pipeline",
      kind: "Personal",
      stack: ["Python", "OpenAI SDK", "Llama", "Requests"],
      ask: "Tell me about Sagar's AI Assistant and RAG pipeline project.",
      bullets: [
        "Developed an AI-powered chatbot leveraging OpenAI-compatible APIs (Llama/Gemini) & implemented Retrieval-Augmented Generation (RAG) concepts including text chunking, embedding generation, and vector search integration using PostgreSQL with pgvector.",
        "Designed Python-based AI workflow integrating OpenAI-compatible APIs, tool-calling skills, prompt orchestration & retrieval mechanisms to enable conversational interactions.",
      ],
    },
  ],
  competencies: [
    "Backend Application Development",
    "Python Software Engineering",
    "Django REST Framework Development",
    "FastAPI Application Development",
    "RESTful API Design & Integration",
    "Microservices & Distributed Systems",
    "Workflow Automation & Process Digitization",
    "Real-Time Communication Systems",
    "Database Design & Performance Optimization",
    "Event-Driven Architecture (Kafka)",
    "AI/LLM Application Development",
    "Retrieval-Augmented Generation (RAG)",
  ],
  skills: [
    { label: "Programming Languages", items: ["Python", "SQL"] },
    { label: "Frameworks & Libraries", items: ["Django", "FastAPI", "Plotly"] },
    { label: "Databases", items: ["PostgreSQL", "pgvector"] },
    { label: "Messaging & Caching", items: ["Kafka", "Redis"] },
    { label: "Cloud & DevOps", items: ["AWS", "Git"] },
  ],
  education: [
    {
      degree: "Master of Business Administration (MBA)",
      field: "Marketing",
      institute: "Dayalbagh Educational Institute, Agra",
      period: "2021 – 2023",
    },
    {
      degree: "Bachelor of Vocation (B.Voc.)",
      field: "Automobile",
      institute: "Dayalbagh Educational Institute, Agra",
      period: "2018 – 2021",
    },
  ],
  certifications: ["Clean Code (Udemy)", "Zero to Hero in SQL: SQL for Data Analytics (Udemy)"],
  accomplishments: [
    "Delivered backend solutions for multiple government digital transformation projects, contributing to process modernization, workflow automation, and improved citizen and stakeholder service accessibility.",
    "Engineered a scalable real-time chat platform supporting 1,000–2,000 concurrent users, enhancing collaboration through secure role-based access and low-latency communication.",
  ],
};
```

- [ ] **Step 5: Implement `src/data/project.ts`**

```ts
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
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/data/data.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 4: Preferences and health hooks

**Files:**
- Create: `frontend/src/hooks/usePreferences.tsx`, `frontend/src/hooks/useHealth.ts`
- Test: `frontend/src/hooks/usePreferences.test.tsx`, `frontend/src/hooks/useHealth.test.ts`

**Interfaces:**
- Consumes: `getHealth(): Promise<boolean>` (Task 2)
- Produces:
  - `PreferencesProvider({ children })`; `usePreferences(): { theme: Theme; toggleTheme(): void; showDetails: boolean; setShowDetails(v: boolean): void }`; `type Theme = "light" | "dark"`; `THEME_KEY`, `DETAILS_KEY`
  - `type HealthStatus = "checking" | "online" | "offline"`; `useHealth(intervalMs?: number): HealthStatus`; `HEALTH_POLL_MS = 30000`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/hooks/usePreferences.test.tsx
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { DETAILS_KEY, PreferencesProvider, THEME_KEY, usePreferences } from "./usePreferences";

const wrapper = ({ children }: { children: ReactNode }) => (
  <PreferencesProvider>{children}</PreferencesProvider>
);

describe("usePreferences", () => {
  it("defaults to light theme and hidden details", () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    expect(result.current.theme).toBe("light");
    expect(result.current.showDetails).toBe(false);
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("toggles dark mode on <html> and remembers it", () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("restores saved preferences", () => {
    localStorage.setItem(THEME_KEY, "dark");
    localStorage.setItem(DETAILS_KEY, "true");
    const { result } = renderHook(() => usePreferences(), { wrapper });
    expect(result.current.theme).toBe("dark");
    expect(result.current.showDetails).toBe(true);
  });

  it("persists the show-details toggle", () => {
    const { result } = renderHook(() => usePreferences(), { wrapper });
    act(() => result.current.setShowDetails(true));
    expect(result.current.showDetails).toBe(true);
    expect(localStorage.getItem(DETAILS_KEY)).toBe("true");
  });

  it("throws a clear error outside the provider", () => {
    expect(() => renderHook(() => usePreferences())).toThrow(/PreferencesProvider/);
  });
});
```

```ts
// src/hooks/useHealth.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHealth } from "../api/client";
import { useHealth } from "./useHealth";

vi.mock("../api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/client")>()),
  getHealth: vi.fn(),
}));
const getHealthMock = vi.mocked(getHealth);

beforeEach(() => getHealthMock.mockReset());

describe("useHealth", () => {
  it("starts as checking, then reports online", async () => {
    getHealthMock.mockResolvedValue(true);
    const { result } = renderHook(() => useHealth());
    expect(result.current).toBe("checking");
    await waitFor(() => expect(result.current).toBe("online"));
  });

  it("reports offline when the API is unreachable", async () => {
    getHealthMock.mockResolvedValue(false);
    const { result } = renderHook(() => useHealth());
    await waitFor(() => expect(result.current).toBe("offline"));
  });

  it("polls again on the interval", async () => {
    getHealthMock.mockResolvedValue(true);
    renderHook(() => useHealth(20));
    await waitFor(() => expect(getHealthMock.mock.calls.length).toBeGreaterThanOrEqual(2));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks`
Expected: FAIL. `./usePreferences` and `./useHealth` cannot be resolved.

- [ ] **Step 3: Implement `src/hooks/usePreferences.tsx`**

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "resume-rag:theme";
export const DETAILS_KEY = "resume-rag:details";

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the preference still applies for this visit.
  }
}

function initialTheme(): Theme {
  const stored = readStorage(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

interface Preferences {
  theme: Theme;
  toggleTheme: () => void;
  showDetails: boolean;
  setShowDetails: (value: boolean) => void;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [showDetails, setShowDetailsState] = useState(() => readStorage(DETAILS_KEY) === "true");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    writeStorage(THEME_KEY, next);
    setTheme(next);
  }, [theme]);

  const setShowDetails = useCallback((value: boolean) => {
    writeStorage(DETAILS_KEY, String(value));
    setShowDetailsState(value);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme, showDetails, setShowDetails }),
    [theme, toggleTheme, showDetails, setShowDetails],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
```

- [ ] **Step 4: Implement `src/hooks/useHealth.ts`**

```ts
import { useEffect, useState } from "react";
import { getHealth } from "../api/client";

export type HealthStatus = "checking" | "online" | "offline";
export const HEALTH_POLL_MS = 30_000;

export function useHealth(intervalMs: number = HEALTH_POLL_MS): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await getHealth();
      if (!cancelled) setStatus(ok ? "online" : "offline");
    };
    void check();
    const id = setInterval(() => void check(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/hooks`
Expected: PASS (8 tests). React may log the expected "usePreferences must be used inside" error to stderr in the outside-provider test, which is fine.

- [ ] **Step 6: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 5: Chat state hook (`useChat`)

**Files:**
- Create: `frontend/src/hooks/useChat.ts`
- Test: `frontend/src/hooks/useChat.test.ts`

**Interfaces:**
- Consumes: `sendChat`, `ApiError` (Task 2); `Message`, `toRoute` (Task 2)
- Produces:
  - `interface UseChat { messages: Message[]; isPending: boolean; send(text: string): boolean; retry(assistantId: string): void; clear(): void }`
  - `useChat(): UseChat`
  - `CHAT_STORAGE_KEY = "resume-rag:chat"`, `MAX_STORED_MESSAGES = 50`, `INTERRUPTED_MESSAGE`
  - `send` returns `false` (and does nothing) for empty/whitespace text or while a request is in flight.

- [ ] **Step 1: Write the failing tests**

```ts
// src/hooks/useChat.test.ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ERROR_MESSAGES, sendChat } from "../api/client";
import type { ChatResponse } from "../types";
import { CHAT_STORAGE_KEY, INTERRUPTED_MESSAGE, MAX_STORED_MESSAGES, useChat } from "./useChat";

vi.mock("../api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/client")>()),
  sendChat: vi.fn(),
}));
const sendChatMock = vi.mocked(sendChat);

const ANSWER: ChatResponse = { answer: "MPIDC is a Single Window System.", source: "resume", chunks_used: 8 };

beforeEach(() => sendChatMock.mockReset());

describe("useChat", () => {
  it("adds the question and a pending answer, then fills the answer in", async () => {
    sendChatMock.mockResolvedValue(ANSWER);
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.send("  What is MPIDC?  ");
    });
    expect(result.current.isPending).toBe(true);
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "What is MPIDC?", status: "done" });
    expect(result.current.messages[1]).toMatchObject({ role: "assistant", status: "pending", query: "What is MPIDC?" });

    await waitFor(() => expect(result.current.messages[1].status).toBe("done"));
    expect(result.current.messages[1]).toMatchObject({ content: ANSWER.answer, route: "resume", chunksUsed: 8 });
    expect(result.current.messages[1].latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.current.isPending).toBe(false);
    expect(sendChatMock).toHaveBeenCalledWith("What is MPIDC?");
  });

  it("maps unknown sources to the general route", async () => {
    sendChatMock.mockResolvedValue({ answer: "ok", source: "ocr", chunks_used: 0 });
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.send("scan this");
    });
    await waitFor(() => expect(result.current.messages[1].status).toBe("done"));
    expect(result.current.messages[1].route).toBe("general");
  });

  it("stores the error and can retry the same question", async () => {
    sendChatMock.mockRejectedValueOnce(new ApiError("server", 500)).mockResolvedValueOnce(ANSWER);
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.send("What is MPIDC?");
    });
    await waitFor(() => expect(result.current.messages[1].status).toBe("error"));
    expect(result.current.messages[1].error).toEqual({ message: ERROR_MESSAGES.server, status: 500 });

    act(() => result.current.retry(result.current.messages[1].id));
    expect(result.current.messages[1].status).toBe("pending");
    await waitFor(() => expect(result.current.messages[1].status).toBe("done"));
    expect(result.current.messages).toHaveLength(2);
    expect(sendChatMock).toHaveBeenCalledTimes(2);
  });

  it("treats unexpected exceptions as a bad response", async () => {
    sendChatMock.mockRejectedValue(new Error("weird"));
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.send("q");
    });
    await waitFor(() => expect(result.current.messages[1].status).toBe("error"));
    expect(result.current.messages[1].error?.message).toBe(ERROR_MESSAGES.bad_response);
  });

  it("ignores whitespace-only input", () => {
    const { result } = renderHook(() => useChat());
    let accepted = true;
    act(() => {
      accepted = result.current.send("   \n ");
    });
    expect(accepted).toBe(false);
    expect(result.current.messages).toHaveLength(0);
    expect(sendChatMock).not.toHaveBeenCalled();
  });

  it("ignores a second send while a request is in flight", async () => {
    let resolve!: (value: ChatResponse) => void;
    sendChatMock.mockReturnValue(new Promise<ChatResponse>((r) => (resolve = r)));
    const { result } = renderHook(() => useChat());

    let first = false;
    let second = true;
    act(() => {
      first = result.current.send("one");
      second = result.current.send("two");
    });
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(sendChatMock).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toHaveLength(2);

    await act(async () => resolve(ANSWER));
    expect(result.current.isPending).toBe(false);
  });

  it("persists the conversation and restores it on the next visit", async () => {
    sendChatMock.mockResolvedValue(ANSWER);
    const first = renderHook(() => useChat());
    act(() => {
      first.result.current.send("What is MPIDC?");
    });
    await waitFor(() => expect(first.result.current.messages[1].status).toBe("done"));
    first.unmount();

    const second = renderHook(() => useChat());
    expect(second.result.current.messages).toHaveLength(2);
    expect(second.result.current.messages[1].content).toBe(ANSWER.answer);
  });

  it(`stores at most ${MAX_STORED_MESSAGES} messages`, async () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      id: `m${i}`,
      role: i % 2 ? "assistant" : "user",
      content: `msg ${i}`,
      status: "done",
    }));
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(many));
    renderHook(() => useChat());
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)!)).toHaveLength(MAX_STORED_MESSAGES),
    );
  });

  it("restores an interrupted pending message as a retryable error", async () => {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify([
        { id: "u1", role: "user", content: "Q", status: "done" },
        { id: "a1", role: "assistant", content: "", status: "pending", query: "Q" },
      ]),
    );
    sendChatMock.mockResolvedValue(ANSWER);
    const { result } = renderHook(() => useChat());
    expect(result.current.isPending).toBe(false);
    expect(result.current.messages[1]).toMatchObject({ status: "error", error: { message: INTERRUPTED_MESSAGE } });

    act(() => result.current.retry("a1"));
    await waitFor(() => expect(result.current.messages[1].status).toBe("done"));
    expect(sendChatMock).toHaveBeenCalledWith("Q");
  });

  it("starts empty when stored data is corrupted", () => {
    localStorage.setItem(CHAT_STORAGE_KEY, "{not json");
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
  });

  it("drops stored entries that are not messages", () => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([{ id: 1 }, "x", null]));
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
  });

  it("keeps working when localStorage throws", async () => {
    const getSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    sendChatMock.mockResolvedValue(ANSWER);
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.send("hello");
    });
    await waitFor(() => expect(result.current.messages[1].status).toBe("done"));
    getSpy.mockRestore();
    setSpy.mockRestore();
  });

  it("clear empties the conversation", async () => {
    sendChatMock.mockResolvedValue(ANSWER);
    const { result } = renderHook(() => useChat());
    act(() => {
      result.current.send("hello");
    });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    act(() => result.current.clear());
    expect(result.current.messages).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/hooks/useChat.test.ts`
Expected: FAIL. `./useChat` cannot be resolved.

- [ ] **Step 3: Implement `src/hooks/useChat.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, sendChat } from "../api/client";
import { toRoute, type Message } from "../types";

export const CHAT_STORAGE_KEY = "resume-rag:chat";
export const MAX_STORED_MESSAGES = 50;
export const INTERRUPTED_MESSAGE = "This answer was interrupted when the page reloaded. Try again.";

export interface UseChat {
  messages: Message[];
  isPending: boolean;
  /** Returns false when ignored: empty input or a request already in flight. */
  send: (text: string) => boolean;
  retry: (assistantId: string) => void;
  clear: () => void;
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter}`;
}

function isStoredMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    (m.status === "pending" || m.status === "done" || m.status === "error")
  );
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isStoredMessage)
      .map((m): Message =>
        m.status === "pending" ? { ...m, status: "error", error: { message: INTERRUPTED_MESSAGE } } : m,
      );
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // Storage full or blocked: the chat still works, it just isn't saved.
  }
}

export function useChat(): UseChat {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isPending, setIsPending] = useState(false);
  // A ref (not state) guards in-flight requests so two sends in the same tick can't both pass.
  const pendingRef = useRef(false);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    saveMessages(messages);
  }, [messages]);

  const patch = useCallback((id: string, changes: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }, []);

  const run = useCallback(
    async (assistantId: string, query: string) => {
      pendingRef.current = true;
      setIsPending(true);
      const started = performance.now();
      try {
        const res = await sendChat(query);
        patch(assistantId, {
          status: "done",
          content: res.answer,
          route: toRoute(res.source),
          chunksUsed: res.chunks_used,
          latencyMs: Math.round(performance.now() - started),
          error: undefined,
        });
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("bad_response");
        patch(assistantId, { status: "error", error: { message: apiError.message, status: apiError.status } });
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [patch],
  );

  const send = useCallback(
    (text: string) => {
      const query = text.trim();
      if (!query || pendingRef.current) return false;
      pendingRef.current = true;
      const assistantId = newId();
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: query, status: "done" },
        { id: assistantId, role: "assistant", content: "", status: "pending", query },
      ]);
      void run(assistantId, query);
      return true;
    },
    [run],
  );

  const retry = useCallback(
    (assistantId: string) => {
      if (pendingRef.current) return;
      const target = messagesRef.current.find((m) => m.id === assistantId);
      if (!target || target.role !== "assistant" || !target.query) return;
      pendingRef.current = true;
      patch(assistantId, { status: "pending", content: "", error: undefined });
      void run(assistantId, target.query);
    },
    [patch, run],
  );

  const clear = useCallback(() => {
    if (pendingRef.current) return;
    setMessages([]);
  }, []);

  return { messages, isPending, send, retry, clear };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/hooks/useChat.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 5: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 6: Shared UI primitives, RouteBadge and PipelineView

**Files:**
- Create: `frontend/src/components/ui.ts`, `frontend/src/components/Avatar.tsx`, `frontend/src/components/RouteBadge.tsx`, `frontend/src/components/PipelineView.tsx`
- Test: `frontend/src/components/PipelineView.test.tsx`

**Interfaces:**
- Consumes: `Route` (Task 2)
- Produces:
  - Class strings: `cardClass`, `iconButtonClass`, `primaryButtonClass`, `secondaryButtonClass`, `ghostButtonClass`
  - `Avatar({ size: "sm" | "lg" | "xl" })`
  - `ROUTE_META: Record<Route, { label: string; className: string; Icon: LucideIcon }>`; `RouteBadge({ route })` renders "<Label> agent"
  - `interface PipelineNode { id; label; detail; Icon }`; `pipelineFor(route, chunksUsed?): PipelineNode[]`; `PENDING_PIPELINE`; `PipelineView({ route?, chunksUsed?, pending? })`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/PipelineView.test.tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PipelineView, pipelineFor } from "./PipelineView";
import { RouteBadge } from "./RouteBadge";

describe("pipelineFor", () => {
  it("describes the RAG path for resume questions", () => {
    expect(pipelineFor("resume", 8).map((n) => n.label)).toEqual([
      "Question",
      "Router",
      "Resume agent",
      "Embed",
      "pgvector · Neon",
      "Llama 3.3 70B",
      "Answer",
    ]);
  });

  it("describes the tool-calling path for weather", () => {
    const labels = pipelineFor("weather").map((n) => n.label);
    expect(labels).toContain("Open-Meteo");
    expect(labels).not.toContain("pgvector · Neon");
  });

  it("describes the direct path for general chat", () => {
    expect(pipelineFor("general")).toHaveLength(5);
  });
});

describe("PipelineView", () => {
  it("shows the retrieved chunk count for resume answers", () => {
    render(<PipelineView route="resume" chunksUsed={8} />);
    const figure = screen.getByRole("figure", { name: "How this answer was produced" });
    expect(within(figure).getAllByRole("listitem")).toHaveLength(7);
    expect(within(figure).getByText("8 chunks retrieved")).toBeInTheDocument();
  });

  it("shows generic, clearly-labelled stages while thinking", () => {
    render(<PipelineView pending />);
    const figure = screen.getByRole("figure", { name: "Answer pipeline, in progress" });
    expect(within(figure).getByText(/Thinking/)).toBeInTheDocument();
    expect(within(figure).getByText(/typical stages/)).toBeInTheDocument();
    expect(within(figure).getAllByRole("listitem")).toHaveLength(4);
  });
});

describe("RouteBadge", () => {
  it("labels the agent that answered", () => {
    render(<RouteBadge route="weather" />);
    expect(screen.getByText("Weather agent")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/PipelineView.test.tsx`
Expected: FAIL. `./PipelineView` cannot be resolved.

- [ ] **Step 3: Implement `src/components/ui.ts`**

```ts
// Shared Tailwind class strings so every page uses the same card and button styles.
export const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900";

export const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

export const ghostButtonClass =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";
```

- [ ] **Step 4: Implement `src/components/Avatar.tsx`**

```tsx
import { profile } from "../data/profile";

const SIZES = {
  sm: "size-9 text-xs",
  lg: "size-16 text-xl",
  xl: "size-20 text-2xl sm:size-24 sm:text-3xl",
} as const;

export function Avatar({ size }: { size: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold tracking-tight text-white shadow-md shadow-indigo-500/25 ${SIZES[size]}`}
    >
      {profile.initials}
    </span>
  );
}
```

- [ ] **Step 5: Implement `src/components/RouteBadge.tsx`**

```tsx
import { CloudSun, FileText, MessageCircle, type LucideIcon } from "lucide-react";
import type { Route } from "../types";

export const ROUTE_META: Record<Route, { label: string; className: string; Icon: LucideIcon }> = {
  resume: {
    label: "Resume",
    className:
      "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
    Icon: FileText,
  },
  weather: {
    label: "Weather",
    className: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
    Icon: CloudSun,
  },
  general: {
    label: "General",
    className:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30",
    Icon: MessageCircle,
  },
};

export function RouteBadge({ route }: { route: Route }) {
  const { label, className, Icon } = ROUTE_META[route];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      <Icon className="size-3.5" aria-hidden />
      {label} agent
    </span>
  );
}
```

- [ ] **Step 6: Implement `src/components/PipelineView.tsx`**

```tsx
import {
  ArrowRight,
  Bot,
  CloudSun,
  Cpu,
  Database,
  Layers,
  MessageSquare,
  Route as RouteIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "../types";
import { ROUTE_META } from "./RouteBadge";

export interface PipelineNode {
  id: string;
  label: string;
  detail: string;
  Icon: LucideIcon;
}

const QUESTION: PipelineNode = { id: "question", label: "Question", detail: "from you", Icon: MessageSquare };
const ROUTER: PipelineNode = { id: "router", label: "Router", detail: "LLM classifier", Icon: RouteIcon };
const LLM: PipelineNode = { id: "llm", label: "Llama 3.3 70B", detail: "writes the answer", Icon: Cpu };
const ANSWER: PipelineNode = { id: "answer", label: "Answer", detail: "shown here", Icon: Sparkles };

/** Mirrors app/agents/dispatcher.py: which steps each route goes through. */
export function pipelineFor(route: Route, chunksUsed?: number): PipelineNode[] {
  switch (route) {
    case "resume":
      return [
        QUESTION,
        ROUTER,
        { id: "agent", label: "Resume agent", detail: "retrieval-augmented", Icon: Bot },
        { id: "embed", label: "Embed", detail: "nomic-embed-text", Icon: Layers },
        {
          id: "vector",
          label: "pgvector · Neon",
          detail: chunksUsed === undefined ? "similarity search" : `${chunksUsed} chunks retrieved`,
          Icon: Database,
        },
        LLM,
        ANSWER,
      ];
    case "weather":
      return [
        QUESTION,
        ROUTER,
        { id: "agent", label: "Weather agent", detail: "tool calling", Icon: Bot },
        { id: "tool", label: "Open-Meteo", detail: "live weather API", Icon: CloudSun },
        LLM,
        ANSWER,
      ];
    case "general":
      return [QUESTION, ROUTER, { id: "agent", label: "General agent", detail: "direct chat", Icon: Bot }, LLM, ANSWER];
  }
}

export const PENDING_PIPELINE: PipelineNode[] = [
  QUESTION,
  ROUTER,
  { id: "agent", label: "Agent", detail: "picked by the router", Icon: Bot },
  LLM,
];

interface Props {
  route?: Route;
  chunksUsed?: number;
  pending?: boolean;
}

export function PipelineView({ route, chunksUsed, pending = false }: Props) {
  const inProgress = pending || !route;
  const nodes = route && !pending ? pipelineFor(route, chunksUsed) : PENDING_PIPELINE;
  const nodeTone =
    route && !pending
      ? `ring-1 ring-inset border-transparent ${ROUTE_META[route].className}`
      : "pipeline-pending-node border-indigo-200 bg-indigo-50/60 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300";

  return (
    <figure
      aria-label={inProgress ? "Answer pipeline, in progress" : "How this answer was produced"}
      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50"
    >
      <figcaption className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        {inProgress ? (
          <>
            Thinking…
            <span className="font-normal text-slate-400">typical stages, not live progress</span>
          </>
        ) : (
          "How this answer was produced"
        )}
      </figcaption>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {nodes.map((node, i) => (
          <li key={node.id} className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${nodeTone}`}
              style={inProgress ? { animationDelay: `${i * 0.6}s` } : undefined}
            >
              <node.Icon className="size-3.5 shrink-0" aria-hidden />
              <div className="leading-tight">
                <div className="text-xs font-semibold">{node.label}</div>
                <div className="text-[11px] opacity-75">{node.detail}</div>
              </div>
            </div>
            {i < nodes.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-slate-400" aria-hidden />}
          </li>
        ))}
      </ol>
    </figure>
  );
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/components/PipelineView.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 8: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 7: Chat building blocks (messages, composer, empty state)

**Files:**
- Create: `frontend/src/components/chat/UserMessage.tsx`, `AssistantMessage.tsx`, `MessageList.tsx`, `Composer.tsx`, `EmptyState.tsx`, `SuggestionChips.tsx`, `OfflineBanner.tsx`
- Test: `frontend/src/components/chat/AssistantMessage.test.tsx`, `frontend/src/components/chat/Composer.test.tsx`, `frontend/src/components/chat/EmptyState.test.tsx`

**Interfaces:**
- Consumes: `Message` (Task 2); `RouteBadge`, `PipelineView`, `Avatar`, `cardClass`, `ghostButtonClass`, `primaryButtonClass` (Task 6); `profile`, `suggestionGroups`, `agentDemos` (Task 3)
- Produces:
  - `UserMessage({ content })`
  - `AssistantMessage({ message, showDetails, onRetry(id) })`
  - `MessageList({ messages, showDetails, onRetry })`
  - `Composer({ value, onChange(v), onSubmit(), busy, showDetails, onToggleDetails(), onClear(), canClear })`
  - `EmptyState({ onAsk(q) })` (includes stat cards); `SuggestionChips({ onAsk(q) })`
  - `OfflineBanner({ onDismiss() })`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/chat/AssistantMessage.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Message } from "../../types";
import { AssistantMessage } from "./AssistantMessage";

const done: Message = {
  id: "a1",
  role: "assistant",
  content: "Sagar built **MPIDC** with Django.",
  status: "done",
  query: "What is MPIDC?",
  route: "resume",
  chunksUsed: 8,
  latencyMs: 2400,
};

describe("AssistantMessage", () => {
  it("renders markdown and the route badge, hiding details by default", () => {
    render(<AssistantMessage message={done} showDetails={false} onRetry={vi.fn()} />);
    expect(screen.getByText("MPIDC").tagName).toBe("STRONG");
    expect(screen.getByText("Resume agent")).toBeInTheDocument();
    expect(screen.queryByText("8 chunks")).not.toBeInTheDocument();
    expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  });

  it("shows chunks, latency and the pipeline when details are on", () => {
    render(<AssistantMessage message={done} showDetails onRetry={vi.fn()} />);
    expect(screen.getByText("8 chunks")).toBeInTheDocument();
    expect(screen.getByText("2.4s")).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: "How this answer was produced" })).toBeInTheDocument();
  });

  it("expands the pipeline on demand", async () => {
    render(<AssistantMessage message={done} showDetails={false} onRetry={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /how it was answered/i }));
    expect(screen.getByRole("figure", { name: "How this answer was produced" })).toBeInTheDocument();
  });

  it("shows a thinking state while pending", () => {
    render(
      <AssistantMessage
        message={{ id: "a2", role: "assistant", content: "", status: "pending", query: "q" }}
        showDetails={false}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("figure", { name: "Answer pipeline, in progress" })).toBeInTheDocument();
  });

  it("shows the error with a working retry button", async () => {
    const onRetry = vi.fn();
    render(
      <AssistantMessage
        message={{
          id: "a3",
          role: "assistant",
          content: "",
          status: "error",
          query: "q",
          error: { message: "Something went wrong on the server for this question.", status: 500 },
        }}
        showDetails
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("Something went wrong on the server for this question.")).toBeInTheDocument();
    expect(screen.getByText("HTTP 500")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledWith("a3");
  });
});
```

```tsx
// src/components/chat/Composer.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "./Composer";

function Harness({ onSubmit, busy = false, onToggleDetails = vi.fn() }: { onSubmit: (v: string) => void; busy?: boolean; onToggleDetails?: () => void }) {
  const [value, setValue] = useState("");
  return (
    <Composer
      value={value}
      onChange={setValue}
      onSubmit={() => onSubmit(value)}
      busy={busy}
      showDetails={false}
      onToggleDetails={onToggleDetails}
      onClear={vi.fn()}
      canClear={false}
    />
  );
}

describe("Composer", () => {
  it("submits on Enter", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Ask a question about Sagar"), "What is C-GEM?{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("What is C-GEM?");
  });

  it("inserts a newline on Shift+Enter instead of submitting", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const box = screen.getByLabelText("Ask a question about Sagar");
    await userEvent.type(box, "line one{Shift>}{Enter}{/Shift}line two");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(box).toHaveValue("line one\nline two");
  });

  it("keeps Send disabled for whitespace", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Ask a question about Sagar"), "   {Enter}");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables Send while an answer is pending", async () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} busy />);
    await userEvent.type(screen.getByLabelText("Ask a question about Sagar"), "hi{Enter}");
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("toggles the details switch", async () => {
    const onToggleDetails = vi.fn();
    render(<Harness onSubmit={vi.fn()} onToggleDetails={onToggleDetails} />);
    const toggle = screen.getByRole("switch", { name: /show details/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    expect(onToggleDetails).toHaveBeenCalledTimes(1);
  });
});
```

```tsx
// src/components/chat/EmptyState.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("greets the visitor and shows the stat cards", () => {
    render(<EmptyState onAsk={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1, name: /ask me anything about sagar/i })).toBeInTheDocument();
    expect(screen.getByText("Hi, I'm Sagar's AI assistant. Ask me about his work.")).toBeInTheDocument();
    expect(screen.getByText("2,000")).toBeInTheDocument();
  });

  it("asks a suggested project question when clicked", async () => {
    const onAsk = vi.fn();
    render(<EmptyState onAsk={onAsk} />);
    await userEvent.click(screen.getByRole("button", { name: /explain the mpidc single window system/i }));
    expect(onAsk).toHaveBeenCalledWith("Explain the MPIDC Single Window System");
  });

  it("switches topic tabs", async () => {
    render(<EmptyState onAsk={vi.fn()} />);
    await userEvent.click(screen.getByRole("tab", { name: /education/i }));
    expect(screen.getByRole("tab", { name: /education/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("button", { name: /what is sagar's education/i })).toBeInTheDocument();
  });

  it("offers the other agents", async () => {
    const onAsk = vi.fn();
    render(<EmptyState onAsk={onAsk} />);
    await userEvent.click(screen.getByRole("button", { name: /weather in delhi/i }));
    expect(onAsk).toHaveBeenCalledWith("What's the weather in Delhi?");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/chat`
Expected: FAIL. `./AssistantMessage`, `./Composer` and `./EmptyState` cannot be resolved.

- [ ] **Step 3: Implement `src/components/chat/UserMessage.tsx`**

```tsx
export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
        {content}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/components/chat/AssistantMessage.tsx`**

```tsx
import { Bot, Check, ChevronDown, Copy, RotateCcw, TriangleAlert, Workflow } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types";
import { PipelineView } from "../PipelineView";
import { RouteBadge } from "../RouteBadge";
import { cardClass, ghostButtonClass } from "../ui";

interface Props {
  message: Message;
  showDetails: boolean;
  onRetry: (id: string) => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or permissions): nothing else to do.
    }
  };
  return (
    <button type="button" onClick={copy} className={ghostButtonClass} aria-label={copied ? "Copied" : "Copy answer"}>
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="max-sm:sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function AssistantMessage({ message, showDetails, onRetry }: Props) {
  // null = follow the global "Show details" toggle until the user opens/closes this one.
  const [pipelineOverride, setPipelineOverride] = useState<boolean | null>(null);
  const pipelineOpen = pipelineOverride ?? showDetails;

  return (
    <div className="flex gap-3">
      <span
        aria-hidden
        className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm"
      >
        <Bot className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {message.status === "pending" && (
          <div className={`${cardClass} space-y-3 p-4`} role="status">
            <PipelineView pending />
            <div className="space-y-2" aria-hidden>
              <div className="h-3 w-11/12 animate-pulse rounded bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />
              <div className="h-3 w-8/12 animate-pulse rounded bg-slate-100 motion-reduce:animate-none dark:bg-slate-800" />
            </div>
          </div>
        )}

        {message.status === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <div className="flex items-start gap-2.5">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="flex-1">
                <p>{message.error?.message}</p>
                {showDetails && message.error?.status !== undefined && (
                  <p className="mt-1 font-mono text-xs opacity-75">HTTP {message.error.status}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30 dark:hover:bg-rose-500/20"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Try again
            </button>
          </div>
        )}

        {message.status === "done" && (
          <div className={`${cardClass} p-4 sm:p-5`}>
            <div className="prose prose-sm prose-slate max-w-none break-words dark:prose-invert prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <RouteBadge route={message.route ?? "general"} />
              {showDetails && message.chunksUsed !== undefined && message.chunksUsed > 0 && (
                <span>{message.chunksUsed} chunks</span>
              )}
              {showDetails && message.latencyMs !== undefined && (
                <span>{(message.latencyMs / 1000).toFixed(1)}s</span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <CopyButton text={message.content} />
                <button
                  type="button"
                  onClick={() => setPipelineOverride(!pipelineOpen)}
                  aria-expanded={pipelineOpen}
                  className={ghostButtonClass}
                >
                  <Workflow className="size-3.5" aria-hidden />
                  How it was answered
                  <ChevronDown className={`size-3.5 transition ${pipelineOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
              </div>
            </div>

            {pipelineOpen && (
              <div className="mt-3">
                <PipelineView route={message.route ?? "general"} chunksUsed={message.chunksUsed} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/chat/MessageList.tsx`**

```tsx
import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface Props {
  messages: Message[];
  showDetails: boolean;
  onRetry: (id: string) => void;
}

export function MessageList({ messages, showDetails, onRetry }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  useEffect(() => {
    // jsdom has no scrollIntoView, hence the optional call.
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages.length, last?.status]);

  return (
    <div aria-live="polite" className="space-y-6">
      {messages.map((m) =>
        m.role === "user" ? (
          <UserMessage key={m.id} content={m.content} />
        ) : (
          <AssistantMessage key={m.id} message={m} showDetails={showDetails} onRetry={onRetry} />
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/components/chat/Composer.tsx`**

```tsx
import { LoaderCircle, SendHorizontal, SlidersHorizontal, Trash2 } from "lucide-react";
import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { cardClass, ghostButtonClass } from "../ui";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
  showDetails: boolean;
  onToggleDetails: () => void;
  onClear: () => void;
  canClear: boolean;
}

const MAX_HEIGHT_PX = 200;

export function Composer({ value, onChange, onSubmit, busy, showDetails, onToggleDetails, onClear, canClear }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <div className="no-print sticky bottom-0 -mx-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent px-4 pb-4 pt-6 sm:-mx-6 sm:px-6 dark:from-slate-950 dark:via-slate-950">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className={`${cardClass} flex items-end gap-2 p-2 transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:border-indigo-500`}
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about Sagar
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Sagar's projects, skills or experience…"
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm leading-5 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <SendHorizontal className="size-4" aria-hidden />
          )}
        </button>
      </form>

      <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-slate-500 dark:text-slate-400">
        <button
          type="button"
          role="switch"
          aria-checked={showDetails}
          onClick={onToggleDetails}
          className="inline-flex items-center gap-2 rounded-md py-1 font-medium transition hover:text-slate-900 dark:hover:text-white"
        >
          <span
            aria-hidden
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${showDetails ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}
          >
            <span
              className={`inline-block size-3 rounded-full bg-white shadow transition ${showDetails ? "translate-x-3.5" : "translate-x-0.5"}`}
            />
          </span>
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Show details
        </button>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>
          <button type="button" onClick={onClear} disabled={!canClear} className={ghostButtonClass}>
            <Trash2 className="size-3.5" aria-hidden />
            Clear chat
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implement `src/components/chat/SuggestionChips.tsx`**

```tsx
import {
  ArrowUpRight,
  Briefcase,
  CloudSun,
  FolderKanban,
  GraduationCap,
  MessageCircle,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { agentDemos, suggestionGroups, type AgentDemo, type SuggestionGroup } from "../../data/profile";
import { cardClass } from "../ui";

const GROUP_ICONS: Record<SuggestionGroup["id"], LucideIcon> = {
  projects: FolderKanban,
  experience: Briefcase,
  skills: Wrench,
  education: GraduationCap,
};

const DEMO_ICONS: Record<AgentDemo["route"], LucideIcon> = {
  weather: CloudSun,
  general: MessageCircle,
};

export function SuggestionChips({ onAsk }: { onAsk: (question: string) => void }) {
  const [activeId, setActiveId] = useState<SuggestionGroup["id"]>(suggestionGroups[0].id);
  const group = suggestionGroups.find((g) => g.id === activeId) ?? suggestionGroups[0];

  return (
    <div className="mt-10 w-full">
      <div role="tablist" aria-label="Suggested question topics" className="flex flex-wrap justify-center gap-1.5">
        {suggestionGroups.map((g) => {
          const Icon = GROUP_ICONS[g.id];
          const selected = g.id === activeId;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              id={`tab-${g.id}`}
              aria-selected={selected}
              aria-controls="suggestion-panel"
              onClick={() => setActiveId(g.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                selected
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {g.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="suggestion-panel"
        aria-labelledby={`tab-${group.id}`}
        className="mt-5 grid gap-2.5 text-left sm:grid-cols-2"
      >
        {group.questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className={`${cardClass} group flex items-start gap-3 p-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:text-slate-200 dark:hover:border-indigo-500/50`}
          >
            <span className="flex-1">{q}</span>
            <ArrowUpRight
              className="size-4 shrink-0 text-slate-400 transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              aria-hidden
            />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Try the other agents:</span>
        {agentDemos.map((demo) => {
          const Icon = DEMO_ICONS[demo.route];
          return (
            <button
              key={demo.question}
              type="button"
              onClick={() => onAsk(demo.question)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <Icon className="size-3.5" aria-hidden />
              {demo.question}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Implement `src/components/chat/EmptyState.tsx`**

```tsx
import { Sparkles } from "lucide-react";
import { profile } from "../../data/profile";
import { Avatar } from "../Avatar";
import { cardClass } from "../ui";
import { SuggestionChips } from "./SuggestionChips";

function StatCards() {
  return (
    <dl className="mt-8 grid w-full grid-cols-3 gap-2.5 sm:gap-4">
      {profile.stats.map((stat) => (
        <div key={stat.label} className={`${cardClass} px-3 py-4 sm:px-5`}>
          <dt className="text-[11px] leading-tight text-slate-500 sm:text-xs dark:text-slate-400">{stat.label}</dt>
          <dd className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section className="flex flex-col items-center pt-4 text-center sm:pt-10">
      <Avatar size="lg" />
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
        <Sparkles className="size-3.5" aria-hidden />
        AI resume assistant · answers grounded in my resume
      </span>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Ask me anything about {profile.firstName}'s work
      </h1>
      <p className="mt-3 max-w-xl text-pretty text-slate-600 dark:text-slate-400">
        Hi, I'm Sagar's AI assistant. Ask me about his work.
      </p>
      <StatCards />
      <SuggestionChips onAsk={onAsk} />
    </section>
  );
}
```

- [ ] **Step 9: Implement `src/components/chat/OfflineBanner.tsx`**

```tsx
import { TriangleAlert, X } from "lucide-react";

export function OfflineBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="flex-1">
        Backend offline. Run{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-500/20">
          uvicorn app.main:app --reload
        </code>{" "}
        from the resume_rag folder.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-md p-0.5 transition hover:bg-amber-100 dark:hover:bg-amber-500/20"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npx vitest run src/components/chat`
Expected: PASS (14 tests).

- [ ] **Step 11: Checkpoint.** `npm test && npx tsc --noEmit` is green. If `tsc` reports a missing lucide export (icon renamed in a newer lucide-react), replace it with the name exported by `node_modules/lucide-react/dist/lucide-react.d.ts` (search with `grep -o "declare const [A-Za-z]*" node_modules/lucide-react/dist/lucide-react.d.ts | grep -i <word>`).

---

### Task 8: Chat page

**Files:**
- Create: `frontend/src/pages/ChatPage.tsx`
- Test: `frontend/src/pages/ChatPage.test.tsx`

**Interfaces:**
- Consumes: `UseChat` (Task 5); `HealthStatus` (Task 4); `usePreferences` (Task 4); `MessageList`, `Composer`, `EmptyState`, `OfflineBanner` (Task 7)
- Produces: `ChatPage({ chat: UseChat; health: HealthStatus })`. Reads `location.state.ask` (string) once per navigation. Other pages navigate with `navigate("/", { state: { ask: question } })`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/ChatPage.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { UseChat } from "../hooks/useChat";
import type { HealthStatus } from "../hooks/useHealth";
import { PreferencesProvider } from "../hooks/usePreferences";
import { ChatPage } from "./ChatPage";

function fakeChat(overrides: Partial<UseChat> = {}): UseChat {
  return { messages: [], isPending: false, send: vi.fn(() => true), retry: vi.fn(), clear: vi.fn(), ...overrides };
}

function renderPage(chat: UseChat, { ask, health = "online" }: { ask?: string; health?: HealthStatus } = {}) {
  return render(
    <StrictMode>
      <PreferencesProvider>
        <MemoryRouter initialEntries={[{ pathname: "/", state: ask ? { ask } : null }]}>
          <ChatPage chat={chat} health={health} />
        </MemoryRouter>
      </PreferencesProvider>
    </StrictMode>,
  );
}

describe("ChatPage", () => {
  it("shows the empty state before the first question", () => {
    renderPage(fakeChat());
    expect(screen.getByRole("heading", { name: /ask me anything about sagar/i })).toBeInTheDocument();
  });

  it("sends typed questions and clears the input", async () => {
    const chat = fakeChat();
    renderPage(chat);
    const box = screen.getByLabelText("Ask a question about Sagar");
    await userEvent.type(box, "What is C-GEM?{Enter}");
    expect(chat.send).toHaveBeenCalledWith("What is C-GEM?");
    expect(box).toHaveValue("");
  });

  it("sends a question passed from the resume page exactly once", () => {
    const chat = fakeChat();
    renderPage(chat, { ask: "How did Sagar build C-GEM?" });
    expect(chat.send).toHaveBeenCalledTimes(1);
    expect(chat.send).toHaveBeenCalledWith("How did Sagar build C-GEM?");
  });

  it("prefills the composer when the assistant is busy", () => {
    const chat = fakeChat({ isPending: true, send: vi.fn(() => false) });
    renderPage(chat, { ask: "How did Sagar build C-GEM?" });
    expect(screen.getByLabelText("Ask a question about Sagar")).toHaveValue("How did Sagar build C-GEM?");
  });

  it("renders the conversation once there are messages", () => {
    renderPage(
      fakeChat({
        messages: [
          { id: "u1", role: "user", content: "Hello there", status: "done" },
          { id: "a1", role: "assistant", content: "Hi!", status: "done", route: "general", query: "Hello there" },
        ],
      }),
    );
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("General agent")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /ask me anything/i })).not.toBeInTheDocument();
  });

  it("shows a dismissible banner when the backend is offline", async () => {
    renderPage(fakeChat(), { health: "offline" });
    expect(screen.getByRole("alert")).toHaveTextContent("Backend offline");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/ChatPage.test.tsx`
Expected: FAIL. `./ChatPage` cannot be resolved.

- [ ] **Step 3: Implement `src/pages/ChatPage.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Composer } from "../components/chat/Composer";
import { EmptyState } from "../components/chat/EmptyState";
import { MessageList } from "../components/chat/MessageList";
import { OfflineBanner } from "../components/chat/OfflineBanner";
import type { UseChat } from "../hooks/useChat";
import type { HealthStatus } from "../hooks/useHealth";
import { usePreferences } from "../hooks/usePreferences";

interface Props {
  chat: UseChat;
  health: HealthStatus;
}

export function ChatPage({ chat, health }: Props) {
  const { showDetails, setShowDetails } = usePreferences();
  const [draft, setDraft] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Remembers which navigation's question was already handled (StrictMode runs effects twice).
  const handledKey = useRef<string | null>(null);
  const { send } = chat;

  useEffect(() => {
    const ask = (location.state as { ask?: unknown } | null)?.ask;
    if (typeof ask !== "string" || handledKey.current === location.key) return;
    handledKey.current = location.key;
    if (!send(ask)) setDraft(ask);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, send, navigate]);

  const askNow = (question: string) => {
    if (!send(question)) setDraft(question);
  };

  const submit = () => {
    if (send(draft)) setDraft("");
  };

  const hasMessages = chat.messages.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
      {health === "offline" && !bannerDismissed && <OfflineBanner onDismiss={() => setBannerDismissed(true)} />}
      <div className="flex-1 py-8">
        {hasMessages ? (
          <MessageList messages={chat.messages} showDetails={showDetails} onRetry={chat.retry} />
        ) : (
          <EmptyState onAsk={askNow} />
        )}
      </div>
      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={submit}
        busy={chat.isPending}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        onClear={chat.clear}
        canClear={hasMessages && !chat.isPending}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/pages/ChatPage.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 5: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 9: Resume page

**Files:**
- Create: `frontend/src/components/BrandIcons.tsx`, `frontend/src/components/SocialLinks.tsx`, `frontend/src/components/Footer.tsx`, `frontend/src/components/resume/primitives.tsx`, `ResumeHero.tsx`, `ExperienceTimeline.tsx`, `ProjectCards.tsx`, `SkillsPanel.tsx`, `frontend/src/pages/ResumePage.tsx`
- Test: `frontend/src/pages/ResumePage.test.tsx`

**Interfaces:**
- Consumes: `resume`, `profile` (Task 3); `Avatar`, `cardClass`, `primaryButtonClass`, `secondaryButtonClass`, `iconButtonClass` (Task 6)
- Produces:
  - `GitHubIcon`, `LinkedInIcon` (SVG components taking `className`)
  - `SocialLinks({ className? })`: icon links (GitHub/LinkedIn hidden while empty, plus Email)
  - `Footer()`
  - `Section({ id, title, icon, children })`, `Tag({ children })`, `AskButton({ topic, question, onAsk })` (accessible name "Ask AI about <topic>"), `BulletList({ items })`
  - `ResumePage()`: navigates to `/` with `{ state: { ask } }`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/ResumePage.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { ResumePage } from "./ResumePage";

function ChatProbe() {
  const location = useLocation();
  return <p>asked: {(location.state as { ask?: string } | null)?.ask}</p>;
}

function renderResume() {
  return render(
    <MemoryRouter initialEntries={["/resume"]}>
      <Routes>
        <Route path="/" element={<ChatProbe />} />
        <Route path="/resume" element={<ResumePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResumePage", () => {
  it("renders every resume section", () => {
    renderResume();
    expect(screen.getByRole("heading", { level: 1, name: "Sagar Verma" })).toBeInTheDocument();
    for (const name of [
      "Profile summary",
      "Work experience",
      "Projects",
      "Notable accomplishments",
      "Technical skills",
      "Core competencies",
      "Education",
      "Certifications",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText("Primus Partners Solutions")).toBeInTheDocument();
    expect(screen.getByText(/Flask-SocketIO/)).toBeInTheDocument();
    expect(screen.getAllByText("Dayalbagh Educational Institute, Agra")).toHaveLength(2);
  });

  it("offers download and the original PDF", () => {
    renderResume();
    expect(screen.getByRole("link", { name: /download pdf/i })).toHaveAttribute("href", "/resume.pdf");
    expect(screen.getByRole("link", { name: /view original pdf/i })).toHaveAttribute("target", "_blank");
  });

  it("sends 'Ask AI about this' questions to the chat page", async () => {
    renderResume();
    await userEvent.click(screen.getByRole("button", { name: "Ask AI about C-GEM" }));
    expect(screen.getByText("asked: How did Sagar build C-GEM for 1,000–2,000 concurrent users?")).toBeInTheDocument();
  });

  it("does not show the phone number", () => {
    const { container } = renderResume();
    expect(container.textContent).not.toMatch(/7078636216/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/ResumePage.test.tsx`
Expected: FAIL. `./ResumePage` cannot be resolved.

- [ ] **Step 3: Implement `src/components/BrandIcons.tsx`** (lucide no longer ships brand icons)

```tsx
interface IconProps {
  className?: string;
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
```

- [ ] **Step 4: Implement `src/components/SocialLinks.tsx`**

```tsx
import { Mail } from "lucide-react";
import { profile } from "../data/profile";
import { GitHubIcon, LinkedInIcon } from "./BrandIcons";
import { iconButtonClass } from "./ui";

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {profile.github && (
        <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile" className={iconButtonClass}>
          <GitHubIcon className="size-4" />
        </a>
      )}
      {profile.linkedin && (
        <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className={iconButtonClass}>
          <LinkedInIcon className="size-4" />
        </a>
      )}
      <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.firstName}`} className={iconButtonClass}>
        <Mail className="size-4" aria-hidden />
      </a>
    </div>
  );
}
```

- [ ] **Step 5: Implement `src/components/Footer.tsx`**

```tsx
import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="no-print border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with FastAPI, pgvector, Llama 3.3 and React</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Implement `src/components/resume/primitives.tsx`**

```tsx
import { Sparkles, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cardClass } from "../ui";

interface SectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section aria-labelledby={id} className={`${cardClass} p-6 sm:p-7`}>
      <h2 id={id} className="flex items-center gap-2.5 text-base font-semibold tracking-tight">
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
          <Icon className="size-4" aria-hidden />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

interface AskButtonProps {
  topic: string;
  question: string;
  onAsk: (question: string) => void;
}

export function AskButton({ topic, question, onAsk }: AskButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onAsk(question)}
      aria-label={`Ask AI about ${topic}`}
      className="no-print inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-200 transition hover:bg-indigo-50 dark:text-indigo-300 dark:ring-indigo-500/30 dark:hover:bg-indigo-500/10"
    >
      <Sparkles className="size-3.5" aria-hidden />
      Ask AI about this
    </button>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 7: Implement `src/components/resume/ResumeHero.tsx`**

```tsx
import { Download, ExternalLink, Mail, MapPin, Sparkles } from "lucide-react";
import { profile } from "../../data/profile";
import { resume } from "../../data/resume";
import { Avatar } from "../Avatar";
import { GitHubIcon, LinkedInIcon } from "../BrandIcons";
import { cardClass, primaryButtonClass, secondaryButtonClass } from "../ui";

const metaLink = "inline-flex items-center gap-1.5 transition hover:text-indigo-600 dark:hover:text-indigo-400";

export function ResumeHero({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section className={`${cardClass} relative overflow-hidden p-6 sm:p-10`}>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
        <Avatar size="xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{resume.title}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</h1>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-slate-600 dark:text-slate-300">
            {resume.objective}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden />
              {resume.locationPreference}
            </span>
            <a href={`mailto:${profile.email}`} className={metaLink}>
              <Mail className="size-4" aria-hidden />
              {profile.email}
            </a>
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className={metaLink}>
                <GitHubIcon className="size-4" />
                GitHub
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className={metaLink}>
                <LinkedInIcon className="size-4" />
                LinkedIn
              </a>
            )}
          </div>
          <div className="no-print mt-6 flex flex-wrap gap-2">
            <a href={profile.resumeUrl} download={profile.resumeFileName} className={primaryButtonClass}>
              <Download className="size-4" aria-hidden />
              Download PDF
            </a>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className={secondaryButtonClass}>
              <ExternalLink className="size-4" aria-hidden />
              View original PDF
            </a>
            <button type="button" onClick={() => onAsk(resume.overviewQuestion)} className={secondaryButtonClass}>
              <Sparkles className="size-4" aria-hidden />
              Ask the AI assistant
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Implement `src/components/resume/ExperienceTimeline.tsx`**

```tsx
import { Briefcase } from "lucide-react";
import { resume } from "../../data/resume";
import { AskButton, BulletList, Section } from "./primitives";

export function ExperienceTimeline({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <Section id="resume-experience" title="Work experience" icon={Briefcase}>
      <ol className="relative space-y-10 border-l border-slate-200 pl-6 dark:border-slate-800">
        {resume.experience.map((job) => (
          <li key={job.company} className="relative">
            <span
              aria-hidden
              className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-100 dark:border-slate-900 dark:ring-indigo-500/20"
            />
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
              <div>
                <h3 className="font-semibold">{job.role}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{job.company}</p>
              </div>
              <p className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {job.period} · {job.location}
              </p>
            </div>

            {job.bullets && (
              <div className="mt-3">
                <BulletList items={job.bullets} />
              </div>
            )}

            {job.projects?.map((project) => (
              <div
                key={project.name}
                className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">{project.name}</h4>
                  <AskButton topic={project.name} question={project.ask} onAsk={onAsk} />
                </div>
                <div className="mt-3">
                  <BulletList items={project.bullets} />
                </div>
              </div>
            ))}

            {!job.projects && (
              <div className="mt-3">
                <AskButton topic={job.company} question={job.ask} onAsk={onAsk} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 9: Implement `src/components/resume/ProjectCards.tsx`**

```tsx
import { FolderKanban } from "lucide-react";
import { resume } from "../../data/resume";
import { AskButton, BulletList, Section, Tag } from "./primitives";

export function ProjectCards({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <Section id="resume-projects" title="Projects" icon={FolderKanban}>
      <div className="grid gap-4 md:grid-cols-2">
        {resume.projects.map((project) => (
          <article
            key={project.name}
            className="flex flex-col rounded-xl border border-slate-200 p-5 transition hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-500/40"
          >
            <span
              className={`self-start rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                project.kind === "Personal"
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {project.kind}
            </span>
            <h3 className="mt-2 font-semibold">{project.name}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
            <div className="mt-4 flex-1">
              <BulletList items={project.bullets} />
            </div>
            <div className="mt-4">
              <AskButton topic={project.name} question={project.ask} onAsk={onAsk} />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 10: Implement `src/components/resume/SkillsPanel.tsx`**

```tsx
import { Award, GraduationCap, Layers, Wrench } from "lucide-react";
import { resume } from "../../data/resume";
import { Section, Tag } from "./primitives";

export function SkillsPanel() {
  return (
    <>
      <Section id="resume-skills" title="Technical skills" icon={Wrench}>
        <dl className="space-y-4">
          {resume.skills.map((group) => (
            <div key={group.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.label}
              </dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="resume-competencies" title="Core competencies" icon={Layers}>
        <ul className="flex flex-wrap gap-1.5">
          {resume.competencies.map((c) => (
            <li
              key={c}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resume-education" title="Education" icon={GraduationCap}>
        <ul className="space-y-4">
          {resume.education.map((edu) => (
            <li key={edu.degree}>
              <p className="text-sm font-semibold">{edu.degree}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{edu.field}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{edu.institute}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{edu.period}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resume-certifications" title="Certifications" icon={Award}>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {resume.certifications.map((cert) => (
            <li key={cert} className="flex gap-2">
              <Award className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden />
              {cert}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
```

- [ ] **Step 11: Implement `src/pages/ResumePage.tsx`**

```tsx
import { Trophy, UserRound } from "lucide-react";
import { useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { ExperienceTimeline } from "../components/resume/ExperienceTimeline";
import { BulletList, Section } from "../components/resume/primitives";
import { ProjectCards } from "../components/resume/ProjectCards";
import { ResumeHero } from "../components/resume/ResumeHero";
import { SkillsPanel } from "../components/resume/SkillsPanel";
import { resume } from "../data/resume";

export function ResumePage() {
  const navigate = useNavigate();
  const ask = (question: string) => navigate("/", { state: { ask: question } });

  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <ResumeHero onAsk={ask} />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Section id="resume-summary" title="Profile summary" icon={UserRound}>
              <BulletList items={resume.summary} />
            </Section>
            <ExperienceTimeline onAsk={ask} />
            <ProjectCards onAsk={ask} />
            <Section id="resume-accomplishments" title="Notable accomplishments" icon={Trophy}>
              <div className="grid gap-3 md:grid-cols-2">
                {resume.accomplishments.map((a) => (
                  <p
                    key={a}
                    className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4 text-sm leading-relaxed text-slate-700 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-slate-200"
                  >
                    {a}
                  </p>
                ))}
              </div>
            </Section>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <SkillsPanel />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 12: Run the test to verify it passes**

Run: `npx vitest run src/pages/ResumePage.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 13: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 10: About page

**Files:**
- Create: `frontend/src/components/about/ArchitectureDiagram.tsx`, `frontend/src/pages/AboutPage.tsx`
- Test: `frontend/src/pages/AboutPage.test.tsx`

**Interfaces:**
- Consumes: `ingestionFlow`, `queryFlow`, `techStack`, `roadmap` (Task 3); `cardClass`, `primaryButtonClass` (Task 6); `Footer` (Task 9)
- Produces: `ArchitectureDiagram()`, `AboutPage()`

- [ ] **Step 1: Write the failing test**

```tsx
// src/pages/AboutPage.test.tsx
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AboutPage } from "./AboutPage";

describe("AboutPage", () => {
  it("explains both pipelines, the stack and the roadmap", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { level: 1, name: /multi-agent rag system/i })).toBeInTheDocument();

    const ingestion = screen.getByRole("list", { name: "Offline ingestion steps" });
    expect(within(ingestion).getByText("pgvector on Neon")).toBeInTheDocument();
    const query = screen.getByRole("list", { name: "Live query steps" });
    expect(within(query).getByText("LLM router")).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 2, name: "Tech stack" })).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();

    const roadmap = screen.getByRole("list", { name: "Roadmap" });
    expect(within(roadmap).getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByRole("link", { name: /try the assistant/i })).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/AboutPage.test.tsx`
Expected: FAIL. `./AboutPage` cannot be resolved.

- [ ] **Step 3: Implement `src/components/about/ArchitectureDiagram.tsx`**

```tsx
import { ArrowDown, ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { ingestionFlow, queryFlow, type FlowStep } from "../../data/project";
import { cardClass } from "../ui";

interface FlowRowProps {
  title: string;
  caption: string;
  listLabel: string;
  steps: FlowStep[];
  tone: "violet" | "indigo";
}

const TONES = {
  violet: "text-violet-600 dark:text-violet-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
} as const;

function FlowRow({ title, caption, listLabel, steps, tone }: FlowRowProps) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{caption}</p>
      </div>
      <ol aria-label={listLabel} className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {steps.map((step, i) => (
          <Fragment key={step.title}>
            <li className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${TONES[tone]}`}>Step {i + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step.title}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{step.detail}</p>
            </li>
            {i < steps.length - 1 && (
              <span aria-hidden className="flex items-center justify-center text-slate-300 dark:text-slate-600">
                <ArrowDown className="size-4 lg:hidden" />
                <ArrowRight className="hidden size-4 lg:block" />
              </span>
            )}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

export function ArchitectureDiagram() {
  return (
    <div className={`${cardClass} space-y-10 p-6 sm:p-8`}>
      <FlowRow
        title="Offline ingestion"
        caption="Run once with scripts/ingest_resume.py"
        listLabel="Offline ingestion steps"
        steps={ingestionFlow}
        tone="violet"
      />
      <FlowRow
        title="Live question answering"
        caption="Every message you send in the chat"
        listLabel="Live query steps"
        steps={queryFlow}
        tone="indigo"
      />
    </div>
  );
}
```

- [ ] **Step 4: Implement `src/pages/AboutPage.tsx`**

```tsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { ArchitectureDiagram } from "../components/about/ArchitectureDiagram";
import { Footer } from "../components/Footer";
import { cardClass, primaryButtonClass } from "../components/ui";
import { roadmap, techStack } from "../data/project";

export function AboutPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-16">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">About this project</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A multi-agent RAG system that answers questions about my resume
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-slate-600 dark:text-slate-300">
            The resume PDF is split into overlapping chunks, embedded with nomic-embed-text and stored in PostgreSQL
            with pgvector on Neon. Each question is classified by an LLM router and handed to a resume (RAG), weather
            (tool-calling) or general agent, and Llama 3.3 70B writes the final answer.
          </p>
          <Link to="/" className={`${primaryButtonClass} mt-6`}>
            Try the assistant
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        <section aria-labelledby="about-how" className="mt-14">
          <h2 id="about-how" className="text-xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-5">
            <ArchitectureDiagram />
          </div>
        </section>

        <section aria-labelledby="about-stack" className="mt-14">
          <h2 id="about-stack" className="text-xl font-semibold tracking-tight">
            Tech stack
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {techStack.map((tech) => (
              <li key={tech.name} className={`${cardClass} p-5`}>
                <p className="font-semibold">{tech.name}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{tech.role}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="about-roadmap" className="mt-14">
          <h2 id="about-roadmap" className="text-xl font-semibold tracking-tight">
            Coming next
          </h2>
          <ol aria-label="Roadmap" className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item, i) => (
              <li key={item.title} className={`${cardClass} flex gap-4 p-5`}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/pages/AboutPage.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 6: Checkpoint.** `npm test && npx tsc --noEmit` is green.

---

### Task 11: App shell (header, navigation, routing)

**Files:**
- Create: `frontend/src/components/layout/HealthDot.tsx`, `ThemeToggle.tsx`, `Header.tsx`
- Replace: `frontend/src/App.tsx` (the temporary file from Task 1)
- Test: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `useChat` (Task 5); `useHealth`, `HealthStatus`, `PreferencesProvider`, `usePreferences` (Task 4); `ChatPage` (Task 8), `ResumePage` (Task 9), `AboutPage` (Task 10); `Avatar`, `iconButtonClass`, `primaryButtonClass` (Task 6); `SocialLinks` (Task 9); `profile` (Task 3)
- Produces: `default App()` (BrowserRouter); `AppShell()` (routes, used by tests inside `MemoryRouter`); `Header({ health })`; `HealthDot({ status })`; `ThemeToggle()`

- [ ] **Step 1: Write the failing test**

```tsx
// src/App.test.tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getHealth } from "./api/client";
import { AppShell } from "./App";
import { PreferencesProvider } from "./hooks/usePreferences";

vi.mock("./api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/client")>()),
  getHealth: vi.fn(),
  sendChat: vi.fn(),
}));

beforeEach(() => vi.mocked(getHealth).mockResolvedValue(true));

function renderApp(path = "/") {
  return render(
    <PreferencesProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppShell />
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

describe("AppShell", () => {
  it("starts on the chat page with the header", async () => {
    renderApp();
    expect(screen.getByRole("heading", { name: /ask me anything about sagar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download resume/i })).toHaveAttribute("href", "/resume.pdf");
    expect(await screen.findByText("API online")).toBeInTheDocument();
  });

  it("navigates between Chat, Resume and About", async () => {
    renderApp();
    const nav = screen.getByRole("navigation", { name: "Main" });
    await userEvent.click(within(nav).getByRole("link", { name: "Resume" }));
    expect(screen.getByRole("heading", { level: 2, name: "Work experience" })).toBeInTheDocument();
    await userEvent.click(within(nav).getByRole("link", { name: "About this project" }));
    expect(screen.getByRole("heading", { level: 2, name: "How it works" })).toBeInTheDocument();
    await userEvent.click(within(nav).getByRole("link", { name: "Chat" }));
    expect(screen.getByRole("heading", { name: /ask me anything about sagar/i })).toBeInTheDocument();
  });

  it("redirects unknown URLs to the chat", () => {
    renderApp("/does-not-exist");
    expect(screen.getByRole("heading", { name: /ask me anything about sagar/i })).toBeInTheDocument();
  });

  it("toggles dark mode from the header", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });

  it("shows offline status when the API is down", async () => {
    vi.mocked(getHealth).mockResolvedValue(false);
    renderApp();
    expect(await screen.findByText("API offline")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL. `AppShell` is not exported by `./App`.

- [ ] **Step 3: Implement `src/components/layout/HealthDot.tsx`**

```tsx
import type { HealthStatus } from "../../hooks/useHealth";

const META: Record<HealthStatus, { label: string; dot: string; title: string }> = {
  checking: { label: "Checking API", dot: "bg-slate-400", title: "Checking whether the backend is reachable…" },
  online: { label: "API online", dot: "bg-emerald-500", title: "Backend is reachable" },
  offline: { label: "API offline", dot: "bg-rose-500", title: "Backend not reachable. Start uvicorn on :8000." },
};

export function HealthDot({ status }: { status: HealthStatus }) {
  const meta = META[status];
  return (
    <span
      role="status"
      title={meta.title}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300"
    >
      <span className="relative flex size-2">
        {status === "online" && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
        )}
        <span className={`relative inline-flex size-2 rounded-full ${meta.dot}`} />
      </span>
      <span className="max-sm:sr-only">{meta.label}</span>
    </span>
  );
}
```

- [ ] **Step 4: Implement `src/components/layout/ThemeToggle.tsx`**

```tsx
import { Moon, Sun } from "lucide-react";
import { usePreferences } from "../../hooks/usePreferences";
import { iconButtonClass } from "../ui";

export function ThemeToggle() {
  const { theme, toggleTheme } = usePreferences();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={iconButtonClass}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
```

- [ ] **Step 5: Implement `src/components/layout/Header.tsx`**

```tsx
import { Download } from "lucide-react";
import { Link, NavLink } from "react-router";
import { profile } from "../../data/profile";
import type { HealthStatus } from "../../hooks/useHealth";
import { Avatar } from "../Avatar";
import { SocialLinks } from "../SocialLinks";
import { primaryButtonClass } from "../ui";
import { HealthDot } from "./HealthDot";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/", label: "Chat", end: true },
  { to: "/resume", label: "Resume", end: false },
  { to: "/about", label: "About this project", end: false },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
  }`;

export function Header({ health }: { health: HealthStatus }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <Avatar size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {profile.role} <span className="max-sm:hidden">· {profile.tagline}</span>
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main"
          className="order-last -mx-1 flex w-full gap-1 overflow-x-auto md:order-none md:mx-0 md:ml-6 md:w-auto"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <HealthDot status={health} />
          <SocialLinks className="max-sm:hidden" />
          <a
            href={profile.resumeUrl}
            download={profile.resumeFileName}
            aria-label="Download resume"
            className={`${primaryButtonClass} max-sm:hidden`}
          >
            <Download className="size-4" aria-hidden />
            Resume
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Replace `src/App.tsx`**

```tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { Header } from "./components/layout/Header";
import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";
import { PreferencesProvider } from "./hooks/usePreferences";
import { AboutPage } from "./pages/AboutPage";
import { ChatPage } from "./pages/ChatPage";
import { ResumePage } from "./pages/ResumePage";

/** Routes + app-wide state. Chat state lives here so a pending answer survives switching pages. */
export function AppShell() {
  const chat = useChat();
  const health = useHealth();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header health={health} />
      <Routes>
        <Route path="/" element={<ChatPage chat={chat} health={health} />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </PreferencesProvider>
  );
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 8: Checkpoint.** `npm test && npm run build` are green (the full suite, all tasks).

---

### Task 12: End-to-end verification against the real backend

**Files:**
- Create: `frontend/README.md`

**Interfaces:**
- Consumes: everything above; the running FastAPI backend.

- [ ] **Step 1: Write `frontend/README.md`**

````markdown
# Resume RAG — Frontend

React + TypeScript UI for the Resume RAG backend: chat with the resume, a web version of the resume, and an About page explaining the architecture.

## Run locally

Terminal 1 (from `resume_rag/`):

```bash
resumenv\Scripts\activate
uvicorn app.main:app --reload
```

Terminal 2 (from `resume_rag/frontend/`):

```bash
npm install
npm run dev
```

Open http://localhost:5173. In development, Vite forwards `/api/*` to `http://localhost:8000`, so the backend needs no CORS setup.

## Scripts

- `npm run dev`: dev server with hot reload
- `npm test`: unit tests (Vitest)
- `npm run build`: type-check and production build into `dist/`

## Editing content

- Name, links, stats, suggested questions: `src/data/profile.ts` (add your GitHub/LinkedIn URLs there)
- Resume content: `src/data/resume.ts`
- About page (pipeline steps, tech stack, roadmap): `src/data/project.ts`
- Downloadable PDF: `public/resume.pdf`

## Production

Set `VITE_API_URL` to the deployed API origin before `npm run build`. The backend must allow the frontend's origin via CORS (Phase 2.2).
````

- [ ] **Step 2: Run the full automated suite**

Run (in `frontend/`): `npm test && npm run build`
Expected: all test files pass (about 75 tests) and the build succeeds with no TypeScript errors.

- [ ] **Step 3: Confirm no backend file changed**

Run (in `resume_rag/`): `find . -path ./frontend -prune -o -path ./resumenv -prune -o -path ./docs -prune -o -type f -newer docs/superpowers/plans/2026-10-01-react-frontend.md -print | grep -v __pycache__`
Expected: no output. Nothing outside `frontend/` and `docs/` was modified after the plan was written.

- [ ] **Step 4: Start both servers**

Terminal 1, `resume_rag/`: `PYTHONPATH=. resumenv/Scripts/python.exe -m uvicorn app.main:app --reload`
Terminal 2, `resume_rag/frontend/`: `npm run dev`
Expected: uvicorn prints `Application startup complete`, Vite prints `Local: http://localhost:5173/`.

- [ ] **Step 5: Manual checklist** (open http://localhost:5173)

- [ ] Header shows "API online" (green), name, role, Download resume, theme toggle.
- [ ] Click the "Explain the MPIDC Single Window System" chip: the thinking pipeline animates, then a markdown answer with a "Resume agent" badge appears.
- [ ] Turn on "Show details": chunk count (e.g. "8 chunks"), response time and the full RAG pipeline with "8 chunks retrieved" are visible.
- [ ] Ask "What's the weather in Delhi?": "Weather agent" badge, pipeline includes Open-Meteo. (If the backend's weather no-tool-call bug fires, an error card with "Try again" appears instead of a crash. That is the expected Phase 1 behaviour.)
- [ ] Ask "Hi, how are you?": "General agent" badge.
- [ ] Copy button copies the answer text. "Clear chat" empties the conversation.
- [ ] Reload the page: the conversation is still there.
- [ ] Resume page: all sections render. "Ask AI about this" on C-GEM opens Chat and sends the question once. Download PDF downloads `Sagar_Verma_Resume.pdf`, and View original PDF opens it in a new tab.
- [ ] About page: both flows, tech stack, 6 roadmap items, "Try the assistant" returns to Chat.
- [ ] Stop uvicorn: within 30 s the dot turns red "API offline" and the offline banner appears. Sending a question shows "Can't reach the assistant…" with "Try again". Restart uvicorn, wait for the dot to turn green, press "Try again", and an answer arrives.
- [ ] Dark mode toggle: every page is readable in dark mode, and the choice survives a reload.
- [ ] Browser devtools at 360 px width: no horizontal scrolling on any page, nav sits on its own row, composer is usable.
- [ ] Keyboard only (Tab / Enter / Space): can reach chips, composer, toggles, nav and links, with focus rings visible.
- [ ] Print preview on Resume page: header, nav and buttons hidden.

- [ ] **Step 6: Checkpoint.** Report the test count, build output and any checklist items that failed, with screenshots or console errors.
