# Resume RAG — Frontend

React + TypeScript UI for the Resume RAG backend: a bento-style portfolio home page (experience, projects, skills, how it works) and a focused AI chat that answers from the resume.

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

Open http://localhost:5173. In development, Vite forwards `/api/*` to `http://127.0.0.1:8000`, so the backend needs no CORS setup.

## Scripts

- `npm run dev`: dev server with hot reload
- `npm test`: unit tests (Vitest)
- `npm run build`: type-check and production build into `dist/`

## Editing content

- Name, headline, intro, availability, hero stats, chat suggestions, links: `src/data/profile.ts` (add your GitHub/LinkedIn URLs there)
- Résumé content and home-page highlights: `src/data/resume.ts`
- "How it works" (pipeline steps, tech stack, roadmap): `src/data/project.ts`
- Design tokens (colors, fonts, motion): `src/index.css`
- Downloadable PDF: `public/resume.pdf`

## Pages

- `/` — bento home: hero, work, projects, skills & education, how it works
- `/chat` — the AI workspace (old `/resume` and `/about` links redirect to home sections)

## Production

Set `VITE_API_URL` to the deployed API origin before `npm run build`. The backend must allow the frontend's origin via CORS (Phase 2.2).
