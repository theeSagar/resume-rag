# Resume RAG — Bento Redesign ("Ink + Ember")

**Date:** 2026-10-01
**Status:** Approved in brainstorming (visual companion), pending written-spec review
**Supersedes (visual layer only):** `2026-10-01-react-frontend-design.md` §5 Screens & Components and visual style. Its API contract, state, error handling and privacy rules remain in force.
**Approved mockups:** `.superpowers/brainstorm/1697-1790849646/content/design-home.html`, `design-chat.html`, `palette.html`

## 1. Goal

Turn the working-but-template-looking frontend into a distinctive, senior-level portfolio that balances three aims, in priority order:

1. **Recruiter efficiency** — the essentials (who, what, scale, availability) readable in ~10 seconds above the fold.
2. **Memorability** — a recognisable visual identity (bento grid, ink + ember palette, serif-italic accent word).
3. **AI-product feel** — the chat is a premium, focused workspace that shows the RAG/agent system at work.

## 2. Constraints

- Frontend only (`frontend/`). Backend, `.env`, `data/`, scripts untouched.
- Keep, unchanged in behaviour: `src/api/client.ts`, `src/hooks/useChat.ts`, `src/hooks/useHealth.ts`, `src/hooks/usePreferences.tsx`, `src/types.ts`, `src/data/*.ts` (data may gain fields), and their tests.
- Privacy: phone number never rendered (existing test stays). The PDF phone-number question is out of scope here (open user decision).
- No new runtime animation/UI libraries; motion is CSS only. Existing deps stay (react-router, react-markdown, remark-gfm, lucide-react, Tailwind 4).
- Accessibility: WCAG AA contrast in both themes, keyboard reachable, visible focus, `prefers-reduced-motion` respected.
- Responsive: 360 px → 1440 px+, no horizontal page scroll.

## 3. Information Architecture

| Route | Content |
|---|---|
| `/` | **HomePage** — single scroll: Hero bento → Work (`#work`) → Projects (`#projects`) → Skills & education (`#skills`) → How it works (`#how-it-works`) → Footer CTA |
| `/chat` | **ChatPage** — focused AI workspace (sidebar + conversation) |
| `/resume` | Redirect → `/#work` |
| `/about` | Redirect → `/#how-it-works` |
| `*` | Redirect → `/` |

Asking from anywhere outside `/chat` (Ask tile, "Ask AI about this", suggestion chips, nav/footer "Ask my AI" with a question) navigates to `/chat` with `state: { ask }`, reusing the existing exactly-once handling. Nav "✦ Ask my AI" without a question just opens `/chat`.

## 4. Design Tokens

### Typography
- **Geist** (400/500/600/700) — all UI and body. **Geist Mono** (400/500) — pipeline captions, technical labels. **Instrument Serif italic** (400) — exactly one emphasised word per headline/section title (e.g. "Backend & *AI* engineer.", "Where I've *worked*").
- Loaded from Google Fonts in `index.html` (replaces Inter).
- Scale: hero h1 40/44 px (mobile 34), section h2 22–26 px, tile big-number 34 px bold tracking −0.04em, labels 10 px uppercase tracking 0.13em semibold, body 13–14 px / 1.55.

### Color — light
| Token | Value | Use |
|---|---|---|
| `--bg` | `#F4F4F5` | page |
| `--tile` | `#FFFFFF` | tiles |
| `--line` | `#E4E4E7` | borders |
| `--ink` | `#18181B` | text, identity tile, primary buttons, user bubbles |
| `--muted` | `#71717A` | secondary text |
| `--soft` | `#A1A1AA` | placeholders |
| `--ember` | `#EA580C` | accent text/links |
| `--ember-grad` | `linear-gradient(135deg,#F97316,#EC4899)` | avatar, big stats, accent word, borders |
| ask tile bg | `linear-gradient(135deg,#FFF7ED,#FDF2F8)`, border `#FED7AA` | Ask tile, thinking state |

### Color — dark (`.dark` on `<html>`)
`--bg #09090B`, `--tile #18181B`, `--line #27272A`, `--ink` text `#FAFAFA`, identity tile `#0F0F12` with stronger ember glow, `--muted #A1A1AA`, ask tile bg `linear-gradient(135deg,rgba(249,115,22,.12),rgba(236,72,153,.10))` border `rgba(249,115,22,.30)`. Ember gradient unchanged. Primary buttons invert to white on ink.

### Shape & depth
Tiles radius 20 px (inner sub-tiles 14 px), buttons 10 px, chips 8 px, pills full. Shadow minimal (`0 1px 2px rgb(0 0 0 / .04)`); emphasis via ember glow (`0 10px 30px -18px rgb(234 88 12 / .5)`) only on the Ask tile, composer and hover.

### Agent badge colors
resume = ember (`#FFF7ED` bg, `#C2410C` text, `#FED7AA` border); weather = sky; general = zinc. Pipeline active nodes use the badge color of the route.

## 5. Home Page (`/`)

Layout container max-width 1200 px, 24 px gutters (16 px mobile), section gap 56 px. Grid: 4 columns ≥1024 px, 2 columns 640–1023 px, 1 column <640 px; gap 12 px.

1. **Sticky nav** — avatar+name (links to top) · Work · Projects · Skills · How it works (anchor links, scroll-spy active state) · HealthDot ("AI online/offline") · ThemeToggle · "✦ Ask my AI" (ink button, ember gradient border). Mobile: name + Ask button + menu row of anchors (horizontal scroll chips).
2. **Hero bento**
   - Identity tile (2×2, ink): avatar, h1 "Backend & *AI* engineer.", intro "I'm Sagar. I build government-scale platforms in Python, Django and FastAPI at Primus Partners — and RAG-powered AI on the side. This site is one of them.", availability badge "Open to roles · Delhi NCR · Jaipur · relocate", buttons ↓ Résumé (download), ✉ Email. Ember radial glow top-right.
   - Stat tile "Experience ~2 yrs · Backend engineering, 2024 → present".
   - Stat tile "Peak scale 2,000 (ember gradient) · concurrent users on C-GEM".
   - **Ask tile** (2 wide): label "✦ Ask my AI · answers from my résumé", input (Enter submits) + 3 suggestion chips (from `profile.suggestionGroups`, first three project/skill questions).
   - Row 2: Now tile (2 wide: current role + MPIDC one-liner), Stack tile (tags), dark "This site is a RAG system" tile (mono pipeline caption).
3. **Work (`#work`)** — "Where I've *worked*". Primus tile (2/3 width) with MPIDC and C-GEM sub-tiles (bullets + "✦ Ask AI about this"); SDLC tile (1/3). Bullets condensed from `resume.ts`.
4. **Projects (`#projects`)** — "Selected *projects*". MPIDC hero tile (row-span 2, tags, ask link), C-GEM stat tile (2,000), dark RAG tile ("You're using it right now." → links to `/chat`), Notable accomplishment tile.
5. **Skills & education (`#skills`)** — competencies tags tile (2 wide), Education tile, Certifications tile, plus the grouped technical skills (from `resume.skills`).
6. **How it works (`#how-it-works`)** — "How this site *works*": offline ingestion and live query flows as horizontal step tiles (vertical on mobile), tech-stack tiles, roadmap list (6 items) — content from `data/project.ts`.
7. **Footer CTA** — ink band: "Have a role in *mind?*" + "Ask my AI first — or just email me." + email button + Ask button; below it copyright line.

All copy is sourced from `data/profile.ts`, `data/resume.ts`, `data/project.ts`; new short copy (intro, availability, "Now" line, section titles) is added to `profile.ts`/`resume.ts` so components hold no prose.

## 6. Chat Page (`/chat`)

- **Top bar:** "← Profile" (to `/`), avatar, "Ask Sagar's AI · answers grounded in my résumé", Show-details switch, Clear (disabled when empty/pending).
- **Desktop (≥1024 px):** 280 px sidebar + conversation column (max 760 px).
  - Sidebar: ink mini-profile card (name, role, ↓ Résumé, ✉ Email); "Try asking" list (resume questions + weather and general demos labelled "· tool agent"/"· chat agent"); "How it answers" explainer card.
- **Mobile:** sidebar hidden; "Try asking" becomes a horizontal chip row above the composer when the conversation is empty or short.
- **Empty state:** centred avatar, h1 "Ask me anything about Sagar's *work*", 4 suggestion cards.
- **Messages:** user = ink bubble right (radius 16/16/4/16); assistant = ✦ ember avatar + white card (radius 4/18/18/18) with markdown, footer (agent badge · chunks · latency when details on · Copy · "How it was answered"), expandable PipelineView (mono, active route nodes in badge color).
- **Pending:** ember-tinted card "Routing your question → searching my résumé…" (static text) with animated shimmer bar + pending pipeline; reduced motion → static.
- **Error:** existing error card restyled (rose), Try again.
- **Composer:** floating rounded (18 px) input with ember glow on focus, ink send button, hint "Enter to send · Shift+Enter for a new line · AI answers can be imperfect — check the résumé".
- **Offline banner:** existing behaviour, restyled amber.
- Fixes folded in: on answer arrival scroll the **start** of the new assistant message into view; markdown tables wrapped in horizontal scroll container; markdown links open in new tab with `rel="noreferrer"`.

## 7. Motion

CSS only; all disabled under `prefers-reduced-motion: reduce`.
- Tile entrance: fade + 8 px rise, 400 ms ease-out, staggered 40 ms by tile index (CSS custom property `--i`), first paint only.
- Tile hover (interactive tiles only): translateY(−2px) + ember border/glow, 150 ms.
- Smooth anchor scrolling (`scroll-behavior: smooth`, with `scroll-margin-top` for sticky nav).
- Scroll-spy via `IntersectionObserver` (no library) sets the active nav link.
- Thinking shimmer: gradient bar translateX loop 1.4 s.

## 8. Component Architecture

```
src/
├── index.css                      tokens (light/dark), fonts, motion keyframes, print rules
├── components/ui/                 Tile, SectionHeader (accent word), Button variants, Tag, AccentText
├── components/layout/             SiteNav (anchors + scroll-spy), HealthDot, ThemeToggle, Footer
├── components/home/               HeroBento, AskTile, WorkSection, ProjectsSection, SkillsSection,
│                                  HowItWorksSection, FooterCTA
├── components/chat/               ChatTopBar, ChatSidebar, EmptyState, MessageList, UserMessage,
│                                  AssistantMessage, Composer, OfflineBanner, PipelineView, RouteBadge
├── hooks/useScrollSpy.ts          active section id from IntersectionObserver
├── pages/HomePage.tsx, ChatPage.tsx
└── App.tsx                        routes + redirects, scroll-to-top (except /chat), app-wide chat/health
```

Old `components/resume/*`, `components/about/*`, `pages/ResumePage.tsx`, `pages/AboutPage.tsx`, `components/chat/SuggestionChips.tsx` are removed once their content lives in the new sections.

## 9. Testing

- Existing: api/client, types, data, usePreferences, useHealth, useChat tests unchanged and green.
- Updated: PipelineView/RouteBadge, AssistantMessage, Composer, ChatPage, App tests adjusted to new markup/labels (behavioural assertions preserved: exactly-once ask, busy prefill, whitespace, retry, offline banner, theme toggle).
- New:
  - HomePage renders hero facts (name, ~2 yrs, 2,000, availability) and all section headings with anchors `work`, `projects`, `skills`, `how-it-works`.
  - AskTile: Enter with text navigates to `/chat` and the question is sent once; whitespace does nothing; chip click asks its question.
  - "Ask AI about this" in Work/Projects navigates to `/chat` with the correct question.
  - Redirects: `/resume` → home with `#work` hash, `/about` → `#how-it-works`.
  - useScrollSpy returns the intersecting section id (IntersectionObserver mocked).
  - AssistantMessage: links get `target="_blank"`; tables are inside a scroll wrapper.
  - Privacy: rendered HomePage and ChatPage never contain the phone number.
- Build gate: `npm test`, `npm run build`.
- Visual verification in Chrome: home + chat at 1440 px and 360 px, light and dark; no horizontal overflow; reduced-motion check.

## 10. Out of Scope

Backend changes (Phase 2 roadmap unchanged), PDF redaction (pending user decision), new data beyond copy strings, analytics, i18n.
