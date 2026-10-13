# Bento Redesign ("Ink + Ember") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-page frontend with a single-scroll bento home page (`/`) plus a focused AI chat workspace (`/chat`) in the approved Ink + Ember design, keeping all existing chat/API behaviour.

**Architecture:** Design tokens live as CSS variables (light + `.dark`) registered with Tailwind 4 `@theme inline`, so components use semantic utilities (`bg-tile`, `text-muted`, `border-line`, `text-ember`). Small UI primitives (`Tile`, `TileLabel`, `SectionHeader`, `AccentText`, `Tag`) build every bento tile. Home sections read all copy from `src/data/*`; asking from anywhere navigates to `/chat` with `state.ask`, reusing the existing exactly-once logic in `ChatPage`.

**Tech Stack:** Vite 7, React 19, TypeScript 7, Tailwind CSS 4 (+ typography), react-router 7, react-markdown 10 + remark-gfm, lucide-react, Vitest 3 + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-01-bento-redesign-design.md` (visual layer). The earlier spec `docs/superpowers/specs/2026-10-01-react-frontend-design.md` still governs API contract, errors, privacy.

## Global Constraints

- Only files under `frontend/` change. Backend, `.env`, `data/`, `scripts/`, root `*.py` stay untouched.
- Do not change behaviour of `src/api/client.ts`, `src/hooks/useChat.ts`, `src/hooks/useHealth.ts`, `src/hooks/usePreferences.tsx`, `src/types.ts`; their tests must stay green unmodified.
- No new npm dependencies. Motion is CSS only.
- Fonts: Geist (400/500/600/700), Geist Mono (400/500), Instrument Serif italic (400) from Google Fonts. Exactly one serif-italic accent word per headline/section title.
- Light tokens: canvas `#F4F4F5`, tile `#FFFFFF`, tile-2 `#FAFAFA`, line `#E4E4E7`, ink-tile `#18181B`, fg `#18181B`, fg-2 `#3F3F46`, muted `#71717A`, soft `#A1A1AA`, ember `#EA580C`, ember gradient `linear-gradient(135deg,#F97316,#EC4899)`, ask surface `#FFF7ED → #FDF2F8` border `#FED7AA`.
- Dark tokens (`.dark` on `<html>`): canvas `#09090B`, tile `#18181B`, tile-2 `#111113`, line `#27272A`, ink-tile `#0F0F12`, fg `#FAFAFA`, fg-2 `#D4D4D8`, muted `#A1A1AA`, soft `#71717A`, ember `#FB923C`, ask surface `rgb(249 115 22 / .12) → rgb(236 72 153 / .10)` border `rgb(249 115 22 / .30)`.
- Radii: tiles 20 px, sub-tiles 14 px, buttons 10 px, chips 8 px.
- Routes: `/` home, `/chat` chat, `/resume` → `/#work`, `/about` → `/#how-it-works`, `*` → `/`.
- Home section ids: `work`, `projects`, `skills`, `how-it-works`; hero section id `top`. Every section has `scroll-mt-24`.
- Phone number never rendered. Agent badge label text stays "Resume agent" / "Weather agent" / "General agent".
- `prefers-reduced-motion: reduce` disables entrance, hover lift, shimmer, pipeline animation and smooth scroll.
- Project is not a git repo: each task ends with a **Checkpoint** (`npm test` + `npx tsc --noEmit`) instead of a commit. All commands run in `frontend/`.

## Review Focus

1. **Old links `/resume` and `/about`** must land on the matching section after the redirect (the element exists only after the redirect renders). Test in Task 7: `scrolls to the #work section after the /resume redirect`.
2. **Sticky nav hiding section headings** after an anchor jump: every home section carries `scroll-mt-24`. Test in Task 6: `offsets every section below the sticky nav`.
3. **Empty GitHub/LinkedIn URLs** must not render dead icon links in the hero. Test in Task 5: `hides social links whose URL is empty`.
4. **Browsers without IntersectionObserver** (and jsdom): scroll-spy returns null, nav still works. Test in Task 3: `returns null without IntersectionObserver`.
5. **Long answers arriving** must show the answer's first line, not its last. Test in Task 8: `scrolls a finished answer to its start`.

---

## File Map

```
frontend/
├── index.html                                  fonts + theme-color (Task 1)
└── src/
    ├── index.css                               tokens, utilities, motion (Task 1)
    ├── test/setup.ts                           + window.scrollTo stub (Task 7)
    ├── data/profile.ts, resume.ts, project.ts  + hero/chat copy, highlights (Task 2)
    ├── hooks/useScrollSpy.ts                   (Task 3)
    ├── components/ui.ts                        class strings re-pointed to tokens (Task 1)
    ├── components/ui/Tile.tsx                  Tile, TileLabel (Task 1)
    ├── components/ui/AccentText.tsx            (Task 1)
    ├── components/ui/SectionHeader.tsx         (Task 1)
    ├── components/ui/Tag.tsx                   (Task 1)
    ├── components/Avatar.tsx                   ember avatar sizes sm/md/lg/xl (Task 1)
    ├── components/layout/SiteNav.tsx           (Task 4)
    ├── components/layout/HealthDot.tsx         restyle + "AI online" (Task 4)
    ├── components/Footer.tsx                   restyle (Task 4)
    ├── components/home/AskTile.tsx             (Task 5)
    ├── components/home/HeroBento.tsx           (Task 5)
    ├── components/home/parts.tsx               Highlights, AskLink (Task 6)
    ├── components/home/WorkSection.tsx         (Task 6)
    ├── components/home/ProjectsSection.tsx     (Task 6)
    ├── components/home/SkillsSection.tsx       (Task 6)
    ├── components/home/HowItWorksSection.tsx   (Task 6)
    ├── components/home/FooterCTA.tsx           (Task 6)
    ├── pages/HomePage.tsx                      (Task 7)
    ├── App.tsx                                 routes/redirects/scroll (Task 7)
    ├── components/RouteBadge.tsx, PipelineView.tsx   restyle (Task 8)
    ├── components/chat/UserMessage.tsx, AssistantMessage.tsx, MessageList.tsx  (Task 8)
    ├── components/chat/ChatTopBar.tsx, ChatSidebar.tsx (Task 9)
    ├── components/chat/EmptyState.tsx, Composer.tsx    rewritten (Task 9)
    └── pages/ChatPage.tsx                       new layout (Task 9)
Removed in Task 10: components/resume/*, components/about/*, pages/ResumePage*, pages/AboutPage*,
components/chat/SuggestionChips.tsx, components/layout/Header.tsx, components/SocialLinks.tsx,
profile.stats / suggestionGroups / agentDemos.
```

---

### Task 1: Design tokens, fonts and UI primitives

**Files:**
- Modify: `frontend/index.html` (font link + theme-color)
- Replace: `frontend/src/index.css`, `frontend/src/components/ui.ts`, `frontend/src/components/Avatar.tsx`
- Create: `frontend/src/components/ui/Tile.tsx`, `AccentText.tsx`, `SectionHeader.tsx`, `Tag.tsx`
- Test: `frontend/src/components/ui/ui.test.tsx`

**Interfaces:**
- Produces:
  - `Tile({ variant?: "default"|"ink"|"ask"|"sub"; interactive?: boolean; index?: number; className?: string; children })` → `<div data-variant data-index>`; `index` adds `tile-enter` + `--i`.
  - `TileLabel({ className?, children })` → small uppercase label `<p>`.
  - `AccentText({ children })` → `<em>` serif italic ember-gradient.
  - `SectionHeader({ id, before, accent, after?, meta? })` → `<h2 id>` = before + AccentText(accent) + after.
  - `Tag({ children })`.
  - `Avatar({ size: "sm"|"md"|"lg"|"xl" })`.
  - CSS utilities: `ember-bg`, `ember-text`, `ask-surface`, `ember-ring`, `ember-glow`, `ink-glow`, `tile-enter`, `tile-interactive`, `shimmer`, `pipeline-pending-node`, `no-print`; Tailwind colors `canvas, tile, tile-2, line, ink-tile, fg, fg-2, muted, soft, ember, ask-line`; fonts `font-sans`, `font-mono`, `font-serif`.
  - `ui.ts` exports (same names as before plus two): `cardClass`, `iconButtonClass`, `primaryButtonClass`, `secondaryButtonClass`, `ghostButtonClass`, `onInkPrimaryClass`, `onInkSecondaryClass`.

- [ ] **Step 1: Write the failing test** `src/components/ui/ui.test.tsx`

```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccentText } from "./AccentText";
import { SectionHeader } from "./SectionHeader";
import { Tag } from "./Tag";
import { Tile, TileLabel } from "./Tile";

describe("Tile", () => {
  it("applies the variant and staggers its entrance", () => {
    render(<Tile variant="ink" index={3}>Hello</Tile>);
    const tile = screen.getByText("Hello");
    expect(tile).toHaveAttribute("data-variant", "ink");
    expect(tile).toHaveAttribute("data-index", "3");
    expect(tile).toHaveClass("tile-enter");
  });

  it("only adds hover motion to interactive tiles", () => {
    render(
      <>
        <Tile>Static</Tile>
        <Tile interactive>Clickable</Tile>
      </>,
    );
    expect(screen.getByText("Static")).not.toHaveClass("tile-interactive");
    expect(screen.getByText("Static")).not.toHaveClass("tile-enter");
    expect(screen.getByText("Clickable")).toHaveClass("tile-interactive");
  });

  it("renders a small label", () => {
    render(<TileLabel>Peak scale</TileLabel>);
    expect(screen.getByText("Peak scale")).toHaveClass("uppercase");
  });
});

describe("SectionHeader", () => {
  it("renders an h2 with one serif accent word", () => {
    render(<SectionHeader id="work-title" before="Where I've " accent="worked" meta="2023 → present" />);
    const heading = screen.getByRole("heading", { level: 2, name: "Where I've worked" });
    expect(heading).toHaveAttribute("id", "work-title");
    expect(within(heading).getByText("worked").tagName).toBe("EM");
    expect(screen.getByText("2023 → present")).toBeInTheDocument();
  });
});

describe("AccentText and Tag", () => {
  it("renders accent text in the serif face", () => {
    render(<AccentText>AI</AccentText>);
    expect(screen.getByText("AI")).toHaveClass("font-serif", "italic", "ember-text");
  });

  it("renders a tag", () => {
    render(<Tag>FastAPI</Tag>);
    expect(screen.getByText("FastAPI")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/ui`
Expected: FAIL — cannot resolve `./AccentText`, `./SectionHeader`, `./Tag`, `./Tile`.

- [ ] **Step 3: Update `index.html`** — replace the Inter font `<link ... family=Inter...>` line with:

```html
    <link
      href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap"
      rel="stylesheet"
    />
    <meta name="theme-color" content="#F4F4F5" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#09090B" media="(prefers-color-scheme: dark)" />
```

- [ ] **Step 4: Replace `src/index.css`**

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where(.dark, .dark *));

/* Ink + Ember design tokens. Components use the semantic utilities registered below. */
:root {
  --canvas: #f4f4f5;
  --tile: #ffffff;
  --tile-2: #fafafa;
  --line: #e4e4e7;
  --ink-tile: #18181b;
  --fg: #18181b;
  --fg-2: #3f3f46;
  --muted: #71717a;
  --soft: #a1a1aa;
  --ember: #ea580c;
  --ask-from: #fff7ed;
  --ask-to: #fdf2f8;
  --ask-line: #fed7aa;
  --ember-gradient: linear-gradient(135deg, #f97316, #ec4899);
}

.dark {
  --canvas: #09090b;
  --tile: #18181b;
  --tile-2: #111113;
  --line: #27272a;
  --ink-tile: #0f0f12;
  --fg: #fafafa;
  --fg-2: #d4d4d8;
  --muted: #a1a1aa;
  --soft: #71717a;
  --ember: #fb923c;
  --ask-from: rgb(249 115 22 / 0.12);
  --ask-to: rgb(236 72 153 / 0.1);
  --ask-line: rgb(249 115 22 / 0.3);
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-tile: var(--tile);
  --color-tile-2: var(--tile-2);
  --color-line: var(--line);
  --color-ink-tile: var(--ink-tile);
  --color-fg: var(--fg);
  --color-fg-2: var(--fg-2);
  --color-muted: var(--muted);
  --color-soft: var(--soft);
  --color-ember: var(--ember);
  --color-ask-line: var(--ask-line);
}

@theme {
  --font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "Geist Mono", ui-monospace, "SFMono-Regular", Consolas, monospace;
  --font-serif: "Instrument Serif", Georgia, "Times New Roman", serif;
}

@layer base {
  html {
    color-scheme: light;
    scroll-behavior: smooth;
  }
  html.dark {
    color-scheme: dark;
  }
  body {
    @apply bg-canvas font-sans text-fg antialiased;
  }
  :focus-visible {
    @apply outline-2 outline-offset-2 outline-ember;
  }
  ::selection {
    background: rgb(249 115 22 / 0.25);
  }
}

@layer components {
  .ember-bg {
    background-image: var(--ember-gradient);
  }
  .ember-text {
    background-image: var(--ember-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .ask-surface {
    background-image: linear-gradient(135deg, var(--ask-from), var(--ask-to));
    border-color: var(--ask-line);
  }
  /* 1px gradient border that follows the element's radius. */
  .ember-ring {
    position: relative;
  }
  .ember-ring::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: var(--ember-gradient);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
  .ember-glow {
    box-shadow: 0 10px 30px -18px rgb(234 88 12 / 0.5);
  }
  /* Soft ember light in the top-right corner of ink tiles. */
  .ink-glow::before {
    content: "";
    position: absolute;
    right: -90px;
    top: -90px;
    width: 280px;
    height: 280px;
    border-radius: 9999px;
    background: radial-gradient(circle, rgb(249 115 22 / 0.45), rgb(236 72 153 / 0.15) 55%, transparent 70%);
    filter: blur(10px);
    pointer-events: none;
  }
  .dark .ink-glow::before {
    background: radial-gradient(circle, rgb(249 115 22 / 0.6), rgb(236 72 153 / 0.25) 55%, transparent 70%);
  }
}

/* Motion — unlayered so hover states win over utility classes. */
@keyframes tile-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.tile-enter {
  animation: tile-enter 400ms ease-out both;
  animation-delay: calc(var(--i, 0) * 40ms);
}
.tile-interactive {
  transition:
    transform 150ms ease,
    box-shadow 150ms ease,
    border-color 150ms ease;
}
.tile-interactive:hover {
  transform: translateY(-2px);
  border-color: var(--ask-line);
  box-shadow: 0 12px 30px -20px rgb(234 88 12 / 0.55);
}

@keyframes shimmer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}
.shimmer {
  position: relative;
  overflow: hidden;
  height: 3px;
  border-radius: 9999px;
  background: rgb(249 115 22 / 0.12);
}
.shimmer::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 40%;
  border-radius: inherit;
  background: var(--ember-gradient);
  animation: shimmer 1.4s ease-in-out infinite;
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
  html {
    scroll-behavior: auto;
  }
  .tile-enter,
  .pipeline-pending-node,
  .shimmer::after {
    animation: none;
  }
  .pipeline-pending-node {
    opacity: 1;
  }
  .tile-interactive:hover {
    transform: none;
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

- [ ] **Step 5: Replace `src/components/ui.ts`**

```ts
// Shared Tailwind class strings built on the Ink + Ember tokens in index.css.
export const cardClass = "rounded-[20px] border border-line bg-tile";

export const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-[10px] text-muted transition hover:bg-tile hover:text-fg";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[10px] bg-fg px-3.5 py-2 text-sm font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[10px] border border-line bg-tile px-3.5 py-2 text-sm font-semibold text-fg transition hover:border-soft";

export const ghostButtonClass =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-tile-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

/** Buttons placed on ink tiles (always dark, in both themes). */
export const onInkPrimaryClass =
  "inline-flex items-center gap-2 rounded-[10px] bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100";

export const onInkSecondaryClass =
  "inline-flex items-center gap-2 rounded-[10px] border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-white/15";
```

- [ ] **Step 6: Replace `src/components/Avatar.tsx`**

```tsx
import { profile } from "../data/profile";

const SIZES = {
  sm: "size-7 rounded-[9px] text-[11px]",
  md: "size-9 rounded-[11px] text-xs",
  lg: "size-12 rounded-[14px] text-base",
  xl: "size-16 rounded-2xl text-xl",
} as const;

export function Avatar({ size }: { size: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`ember-bg inline-flex shrink-0 items-center justify-center font-bold tracking-tight text-white shadow-md shadow-orange-500/20 ${SIZES[size]}`}
    >
      {profile.initials}
    </span>
  );
}
```

- [ ] **Step 7: Create the primitives**

```tsx
// src/components/ui/Tile.tsx
import type { CSSProperties, ReactNode } from "react";

type Variant = "default" | "ink" | "ask" | "sub";

const VARIANTS: Record<Variant, string> = {
  default: "rounded-[20px] border border-line bg-tile p-5",
  ink: "ink-glow rounded-[20px] bg-ink-tile p-5 text-white",
  ask: "ask-surface rounded-[20px] border p-5",
  sub: "rounded-[14px] border border-line bg-tile-2 p-4",
};

interface TileProps {
  variant?: Variant;
  /** Hover lift + ember glow — only for tiles the visitor can act on. */
  interactive?: boolean;
  /** Position in its grid; staggers the entrance animation. */
  index?: number;
  className?: string;
  children: ReactNode;
}

export function Tile({ variant = "default", interactive = false, index, className = "", children }: TileProps) {
  const style = index === undefined ? undefined : ({ "--i": index } as CSSProperties);
  return (
    <div
      data-variant={variant}
      data-index={index}
      style={style}
      className={`relative overflow-hidden ${VARIANTS[variant]} ${index === undefined ? "" : "tile-enter"} ${
        interactive ? "tile-interactive" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function TileLabel({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <p className={`text-[10px] font-semibold uppercase tracking-[0.13em] text-muted ${className}`}>{children}</p>
  );
}
```

```tsx
// src/components/ui/AccentText.tsx
import type { ReactNode } from "react";

/** The one serif-italic, ember-gradient word in a headline. */
export function AccentText({ children }: { children: ReactNode }) {
  return <em className="ember-text pr-1 font-serif font-normal italic">{children}</em>;
}
```

```tsx
// src/components/ui/SectionHeader.tsx
import { AccentText } from "./AccentText";

interface Props {
  id: string;
  before: string;
  accent: string;
  after?: string;
  meta?: string;
}

export function SectionHeader({ id, before, accent, after = "", meta }: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 px-1">
      <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-[26px]">
        {before}
        <AccentText>{accent}</AccentText>
        {after}
      </h2>
      {meta && <p className="text-sm text-muted">{meta}</p>}
    </div>
  );
}
```

```tsx
// src/components/ui/Tag.tsx
import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[7px] border border-line bg-tile-2 px-2 py-0.5 text-[11px] font-medium text-fg-2">
      {children}
    </span>
  );
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/components/ui`
Expected: PASS (6 tests).

- [ ] **Step 9: Checkpoint** — `npm test` (whole suite still green: old components only use renamed-compatible class strings) and `npx tsc --noEmit`.

---

### Task 2: Copy for the hero, chat suggestions and home highlights

**Files:**
- Modify: `frontend/src/data/profile.ts`, `frontend/src/data/resume.ts`, `frontend/src/data/project.ts`
- Test: `frontend/src/data/data.test.ts` (add tests)

**Interfaces:**
- Produces (all exported from `profile.ts` unless noted):
  - `profile.headline: { before: string; accent: string; after: string }`, `profile.intro: string`, `profile.availability: string`, `profile.now: { title: string; detail: string }`, `profile.heroStats: HeroStat[]` (`{ label; value; caption; accent?: boolean }`), `profile.heroQuestions: string[]`
  - `chatSuggestions: ChatSuggestion[]` (`{ question: string; hint?: string }`)
  - `resume.ts`: `ExperienceProject.highlights: string[]`, `Experience.highlights?: string[]`, `Project.tagline: string`
  - `project.ts`: `howItAnswers: string`

- [ ] **Step 1: Add the failing tests** — in `src/data/data.test.ts` change the first import to
`import { agentDemos, chatSuggestions, profile, suggestionGroups } from "./profile";`,
change the next import to `import { howItAnswers, ingestionFlow, queryFlow, roadmap, techStack } from "./project";`, change the phone test's `JSON.stringify({ profile, suggestionGroups, agentDemos, resume })` to `JSON.stringify({ profile, suggestionGroups, agentDemos, chatSuggestions, resume })`, and append inside the `describe` block:

```ts
  it("provides the hero copy", () => {
    const { before, accent, after } = profile.headline;
    expect(`${before}${accent}${after}`).toBe("Backend & AI engineer.");
    expect(profile.availability).toBe("Open to roles · Delhi NCR · Jaipur · relocate");
    expect(profile.heroStats.map((s) => s.value)).toEqual(["~2 yrs", "2,000"]);
    expect(profile.heroQuestions).toHaveLength(3);
    expect(chatSuggestions.filter((s) => s.hint).map((s) => s.hint)).toEqual(["tool agent", "chat agent"]);
    expect(howItAnswers).toMatch(/pgvector on Neon/);
  });

  it("has short highlights and taglines for the home page", () => {
    for (const job of resume.experience) {
      const lists = job.projects ? job.projects.map((p) => p.highlights) : [job.highlights ?? []];
      for (const list of lists) {
        expect(list.length).toBeGreaterThan(0);
        for (const h of list) expect(h.length).toBeLessThanOrEqual(60);
      }
    }
    for (const p of resume.projects) expect(p.tagline.length).toBeGreaterThan(10);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/data`
Expected: FAIL — `chatSuggestions` / `howItAnswers` not exported (and TS-level undefined `profile.headline`).

- [ ] **Step 3: Extend `src/data/profile.ts`**

Add after `export interface Stat { ... }`:

```ts
export interface HeroStat {
  label: string;
  value: string;
  caption: string;
  /** Render the value in the ember gradient. */
  accent?: boolean;
}
```

Add these fields to `interface Profile` (after `stats: Stat[];`):

```ts
  headline: { before: string; accent: string; after: string };
  intro: string;
  availability: string;
  now: { title: string; detail: string };
  heroStats: HeroStat[];
  heroQuestions: string[];
```

Add these values to the `profile` object (after `stats: [...]`):

```ts
  headline: { before: "Backend & ", accent: "AI", after: " engineer." },
  intro:
    "I'm Sagar. I build government-scale platforms in Python, Django and FastAPI at Primus Partners — and RAG-powered AI on the side. This site is one of them.",
  availability: "Open to roles · Delhi NCR · Jaipur · relocate",
  now: {
    title: "Associate Software Engineer · Primus Partners",
    detail: "Building MPIDC's Single Window System — Django REST, PostgreSQL, Razorpay, Kafka workflows.",
  },
  heroStats: [
    { label: "Experience", value: "~2 yrs", caption: "Backend engineering, 2024 → present" },
    { label: "Peak scale", value: "2,000", caption: "concurrent users on C-GEM", accent: true },
  ],
  heroQuestions: [
    "Explain the MPIDC Single Window System",
    "How was C-GEM built for 2,000 concurrent users?",
    "What is Sagar's backend tech stack?",
  ],
```

Append at the end of the file:

```ts
export interface ChatSuggestion {
  question: string;
  /** Shown after the question, e.g. which agent answers it. */
  hint?: string;
}

export const chatSuggestions: ChatSuggestion[] = [
  { question: "How was C-GEM built for 2,000 concurrent users?" },
  { question: "What is Sagar's backend tech stack?" },
  { question: "Has he worked with Kafka and Redis?" },
  { question: "What is Sagar's education?" },
  { question: "What's the weather in Delhi?", hint: "tool agent" },
  { question: "Hi, how are you?", hint: "chat agent" },
];
```

- [ ] **Step 4: Extend `src/data/resume.ts`**

In `interface ExperienceProject` add `highlights: string[];` (after `bullets`). In `interface Experience` add `highlights?: string[];` (after `bullets?`). In `interface Project` add `tagline: string;` (after `name`).

Add `highlights` to each experience project and SDLC:

```ts
// MPIDC (Single Window System) project object, after its bullets array:
          highlights: [
            "Django REST + PostgreSQL backend services",
            "Razorpay payments & Kafka-driven workflows",
            "Swagger-documented cross-department APIs",
          ],
// C-GEM project object, after its bullets array:
          highlights: [
            "Real-time group chat for 1,000–2,000 concurrent users",
            "Flask-SocketIO with PostgreSQL REST APIs",
            "Role-based access for NGOs, investors & developers",
          ],
// SDLC Corp experience object, after its bullets array:
      highlights: [
        "Requirements turned into backend specifications",
        "APIs and backend components to spec",
        "Solution design & technical documentation",
      ],
```

Add `tagline` to each project:

```ts
// MPIDC Single Window System project (after name):
      tagline: "Madhya Pradesh Industrial Development Corporation",
// AI Assistant & RAG Pipeline project (after name):
      tagline: "Chunking, embeddings, pgvector search and tool calling. You're using it right now.",
```

- [ ] **Step 5: Extend `src/data/project.ts`** — append:

```ts
/** Short explainer in the chat sidebar. */
export const howItAnswers =
  "A router picks an agent. Résumé questions search pgvector on Neon, then Llama 3.3 70B writes the answer.";
```

- [ ] **Step 6: Run to verify it passes**

Run: `npx vitest run src/data`
Expected: PASS (6 tests).

- [ ] **Step 7: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 3: Scroll-spy hook

**Files:**
- Create: `frontend/src/hooks/useScrollSpy.ts`
- Test: `frontend/src/hooks/useScrollSpy.test.ts`

**Interfaces:**
- Produces: `useScrollSpy(ids: string[], rootMargin?: string): string | null` — id of the last section reported intersecting the middle band of the viewport; `null` when none or when `IntersectionObserver` is unavailable.

- [ ] **Step 1: Write the failing test**

```ts
// src/hooks/useScrollSpy.test.ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollSpy } from "./useScrollSpy";

type Entry = { isIntersecting: boolean; target: Element };

class FakeObserver {
  static last: FakeObserver;
  callback: (entries: Entry[]) => void;
  observed: Element[] = [];
  disconnected = false;
  constructor(callback: (entries: Entry[]) => void) {
    this.callback = callback;
    FakeObserver.last = this;
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("useScrollSpy", () => {
  it("reports the section that enters the viewport", () => {
    vi.stubGlobal("IntersectionObserver", FakeObserver);
    document.body.innerHTML = '<section id="work"></section><section id="projects"></section>';
    const { result, unmount } = renderHook(() => useScrollSpy(["work", "projects"]));

    expect(FakeObserver.last.observed.map((el) => el.id)).toEqual(["work", "projects"]);
    expect(result.current).toBeNull();

    act(() => FakeObserver.last.callback([{ isIntersecting: true, target: document.getElementById("projects")! }]));
    expect(result.current).toBe("projects");

    act(() => FakeObserver.last.callback([{ isIntersecting: false, target: document.getElementById("work")! }]));
    expect(result.current).toBe("projects");

    unmount();
    expect(FakeObserver.last.disconnected).toBe(true);
  });

  it("returns null without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    document.body.innerHTML = '<section id="work"></section>';
    const { result } = renderHook(() => useScrollSpy(["work"]));
    expect(result.current).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/hooks/useScrollSpy.test.ts`
Expected: FAIL — cannot resolve `./useScrollSpy`.

- [ ] **Step 3: Implement `src/hooks/useScrollSpy.ts`**

```ts
import { useEffect, useState } from "react";

/** Id of the section currently crossing the middle band of the viewport (null if none). */
export function useScrollSpy(ids: string[], rootMargin = "-40% 0px -55% 0px"): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin },
    );
    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key, rootMargin]);

  return active;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/hooks/useScrollSpy.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 4: Site navigation, health dot and footer

**Files:**
- Create: `frontend/src/components/layout/SiteNav.tsx`
- Replace: `frontend/src/components/layout/HealthDot.tsx`, `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/App.test.tsx` (label text "API online/offline" → "AI online/offline")
- Test: `frontend/src/components/layout/SiteNav.test.tsx`

**Interfaces:**
- Consumes: `useScrollSpy` (Task 3), `Avatar` (Task 1), `ThemeToggle` (existing), `HealthStatus` (existing).
- Produces: `SiteNav({ health: HealthStatus })` with `<nav aria-label="Sections">` anchors `#work #projects #skills #how-it-works` (`aria-current="true"` on active) and a "Ask my AI" link to `/chat`; `HOME_SECTIONS` constant; `HealthDot` labels "Checking", "AI online", "AI offline"; `Footer()`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/layout/SiteNav.test.tsx
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { PreferencesProvider } from "../../hooks/usePreferences";
import { SiteNav } from "./SiteNav";

vi.mock("../../hooks/useScrollSpy", () => ({ useScrollSpy: () => "projects" }));

function renderNav() {
  return render(
    <PreferencesProvider>
      <MemoryRouter>
        <SiteNav health="online" />
      </MemoryRouter>
    </PreferencesProvider>,
  );
}

describe("SiteNav", () => {
  it("links to every home section and marks the active one", () => {
    renderNav();
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "#work",
      "#projects",
      "#skills",
      "#how-it-works",
    ]);
    expect(within(nav).getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "true");
    expect(within(nav).getByRole("link", { name: "Work" })).not.toHaveAttribute("aria-current");
  });

  it("offers the AI chat, health status and theme toggle", () => {
    renderNav();
    expect(screen.getByRole("link", { name: /ask my ai/i })).toHaveAttribute("href", "/chat");
    expect(screen.getByText("AI online")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/layout`
Expected: FAIL — cannot resolve `./SiteNav`.

- [ ] **Step 3: Replace `src/components/layout/HealthDot.tsx`**

```tsx
import type { HealthStatus } from "../../hooks/useHealth";

const META: Record<HealthStatus, { label: string; dot: string; title: string }> = {
  checking: { label: "Checking", dot: "bg-zinc-400", title: "Checking whether the AI backend is reachable…" },
  online: { label: "AI online", dot: "bg-emerald-500", title: "The AI backend is reachable" },
  offline: { label: "AI offline", dot: "bg-rose-500", title: "The AI backend is not reachable. Start uvicorn on :8000." },
};

export function HealthDot({ status }: { status: HealthStatus }) {
  const meta = META[status];
  return (
    <span
      role="status"
      title={meta.title}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-tile px-2.5 py-1 text-[11px] font-medium text-muted"
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

- [ ] **Step 4: Create `src/components/layout/SiteNav.tsx`**

```tsx
import { Sparkles } from "lucide-react";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import type { HealthStatus } from "../../hooks/useHealth";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { Avatar } from "../Avatar";
import { HealthDot } from "./HealthDot";
import { ThemeToggle } from "./ThemeToggle";

export const HOME_SECTIONS = [
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "how-it-works", label: "How it works" },
];

const SECTION_IDS = HOME_SECTIONS.map((s) => s.id);

export function SiteNav({ health }: { health: HealthStatus }) {
  const active = useScrollSpy(SECTION_IDS);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <Avatar size="sm" />
          {profile.name}
        </a>

        <nav
          aria-label="Sections"
          className="order-last -mx-1 flex w-full gap-1 overflow-x-auto md:order-none md:mx-0 md:ml-4 md:w-auto"
        >
          {HOME_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                active === s.id ? "bg-tile text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <HealthDot status={health} />
          <ThemeToggle />
          <Link
            to="/chat"
            className="ember-ring inline-flex items-center gap-1.5 rounded-[10px] bg-fg px-3.5 py-2 text-[13px] font-semibold text-canvas transition hover:opacity-90"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Ask my AI
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Replace `src/components/Footer.tsx`**

```tsx
import { profile } from "../data/profile";

export function Footer() {
  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Built with FastAPI, pgvector, Llama 3.3 and React</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Update `src/App.test.tsx` labels** — replace `findByText("API online")` with `findByText("AI online")` and `findByText("API offline")` with `findByText("AI offline")`.

- [ ] **Step 7: Run to verify it passes**

Run: `npx vitest run src/components/layout src/App.test.tsx`
Expected: PASS (SiteNav 2 tests, App 6 tests).

- [ ] **Step 8: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 5: Hero bento and Ask tile

**Files:**
- Create: `frontend/src/components/home/AskTile.tsx`, `frontend/src/components/home/HeroBento.tsx`
- Test: `frontend/src/components/home/HeroBento.test.tsx`

**Interfaces:**
- Consumes: `Tile`, `TileLabel`, `AccentText`, `Tag`, `Avatar`, `onInkPrimaryClass`, `onInkSecondaryClass` (Task 1); `profile.headline|intro|availability|now|heroStats|heroQuestions` (Task 2); `resume.skills`; `GitHubIcon`, `LinkedInIcon` (existing).
- Produces: `AskTile({ onAsk: (q: string) => void; index?: number })` — input labelled "Ask my AI a question", submit trims and ignores whitespace, clears after asking; chips for `profile.heroQuestions`. `HeroBento({ onAsk })` — `<section id="top" aria-labelledby="hero-title">`, h1 "Backend & AI engineer.", "Try it" link to `/chat`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/home/HeroBento.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { profile } from "../../data/profile";
import { AskTile } from "./AskTile";
import { HeroBento } from "./HeroBento";

function renderHero(onAsk = vi.fn()) {
  render(
    <MemoryRouter>
      <HeroBento onAsk={onAsk} />
    </MemoryRouter>,
  );
  return onAsk;
}

describe("HeroBento", () => {
  it("states who, what and availability at a glance", () => {
    renderHero();
    expect(screen.getByRole("heading", { level: 1, name: "Backend & AI engineer." })).toBeInTheDocument();
    expect(screen.getByText("Sagar Verma")).toBeInTheDocument();
    expect(screen.getByText("~2 yrs")).toBeInTheDocument();
    expect(screen.getByText("2,000")).toBeInTheDocument();
    expect(screen.getByText(profile.availability)).toBeInTheDocument();
    expect(screen.getByText(profile.now.title)).toBeInTheDocument();
    expect(screen.getByText("pgvector")).toBeInTheDocument();
  });

  it("offers résumé download, email and the live demo", () => {
    renderHero();
    expect(screen.getByRole("link", { name: /résumé/i })).toHaveAttribute("href", "/resume.pdf");
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute("href", `mailto:${profile.email}`);
    expect(screen.getByRole("link", { name: /try it/i })).toHaveAttribute("href", "/chat");
  });

  it("hides social links whose URL is empty", () => {
    renderHero();
    expect(screen.queryByRole("link", { name: "GitHub profile" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "LinkedIn profile" })).not.toBeInTheDocument();
  });
});

describe("AskTile", () => {
  it("asks the typed question on Enter and clears the box", async () => {
    const onAsk = vi.fn();
    render(<AskTile onAsk={onAsk} />);
    const box = screen.getByLabelText("Ask my AI a question");
    await userEvent.type(box, "  What is C-GEM?  {Enter}");
    expect(onAsk).toHaveBeenCalledWith("What is C-GEM?");
    expect(box).toHaveValue("");
  });

  it("ignores whitespace-only input", async () => {
    const onAsk = vi.fn();
    render(<AskTile onAsk={onAsk} />);
    await userEvent.type(screen.getByLabelText("Ask my AI a question"), "   {Enter}");
    expect(onAsk).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /^ask/i })).toBeDisabled();
  });

  it("asks a suggestion chip's question", async () => {
    const onAsk = vi.fn();
    render(<AskTile onAsk={onAsk} />);
    await userEvent.click(screen.getByRole("button", { name: /explain the mpidc single window system/i }));
    expect(onAsk).toHaveBeenCalledWith("Explain the MPIDC Single Window System");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/home`
Expected: FAIL — cannot resolve `./AskTile`, `./HeroBento`.

- [ ] **Step 3: Create `src/components/home/AskTile.tsx`**

```tsx
import { ArrowUpRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "../../data/profile";
import { Tile, TileLabel } from "../ui/Tile";

interface Props {
  onAsk: (question: string) => void;
  index?: number;
}

export function AskTile({ onAsk, index }: Props) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const question = value.trim();
    if (!question) return;
    onAsk(question);
    setValue("");
  };

  return (
    <Tile variant="ask" index={index} className="sm:col-span-2">
      <TileLabel className="text-ember">✦ Ask my AI · answers from my résumé</TileLabel>
      <form
        onSubmit={submit}
        className="ember-glow mt-3 flex items-center gap-2 rounded-[14px] border border-ask-line bg-tile p-1.5 pl-3.5"
      >
        <label htmlFor="ask-tile-input" className="sr-only">
          Ask my AI a question
        </label>
        <input
          id="ask-tile-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about my projects, stack, experience…"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="inline-flex items-center gap-1 rounded-[10px] bg-fg px-3 py-2 text-xs font-semibold text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ask <span aria-hidden>↵</span>
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {profile.heroQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="inline-flex items-center gap-1 rounded-lg border border-ask-line bg-tile/70 px-2.5 py-1 text-xs font-medium text-ember transition hover:bg-tile"
          >
            {q}
            <ArrowUpRight className="size-3" aria-hidden />
          </button>
        ))}
      </div>
    </Tile>
  );
}
```

- [ ] **Step 4: Create `src/components/home/HeroBento.tsx`**

```tsx
import { ArrowRight, Download, Mail } from "lucide-react";
import { Link } from "react-router";
import { profile, type HeroStat } from "../../data/profile";
import { resume } from "../../data/resume";
import { Avatar } from "../Avatar";
import { GitHubIcon, LinkedInIcon } from "../BrandIcons";
import { onInkPrimaryClass, onInkSecondaryClass } from "../ui";
import { AccentText } from "../ui/AccentText";
import { Tag } from "../ui/Tag";
import { Tile, TileLabel } from "../ui/Tile";
import { AskTile } from "./AskTile";

const STACK = resume.skills.flatMap((group) => group.items);

function StatTile({ stat, index }: { stat: HeroStat; index: number }) {
  return (
    <Tile index={index} className="flex flex-col justify-between">
      <TileLabel>{stat.label}</TileLabel>
      <div>
        <p className={`mt-6 text-[38px] font-bold leading-none tracking-[-0.04em] ${stat.accent ? "ember-text" : ""}`}>
          {stat.value}
        </p>
        <p className="mt-2 text-sm text-muted">{stat.caption}</p>
      </div>
    </Tile>
  );
}

export function HeroBento({ onAsk }: { onAsk: (question: string) => void }) {
  const [experience, scale] = profile.heroStats;

  return (
    <section id="top" aria-labelledby="hero-title" className="scroll-mt-24">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          variant="ink"
          index={0}
          className="flex min-h-[300px] flex-col justify-between gap-8 sm:col-span-2 sm:p-7 lg:row-span-2"
        >
          <div className="relative">
            <Avatar size="lg" />
            <p className="mt-6 text-sm font-medium text-zinc-400">{profile.name}</p>
            <h1
              id="hero-title"
              className="mt-1 text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[44px]"
            >
              {profile.headline.before}
              <AccentText>{profile.headline.accent}</AccentText>
              {profile.headline.after}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">{profile.intro}</p>
          </div>
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
              <span aria-hidden className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              {profile.availability}
            </span>
            <div className="flex flex-wrap gap-2">
              <a href={profile.resumeUrl} download={profile.resumeFileName} className={onInkPrimaryClass}>
                <Download className="size-4" aria-hidden />
                Résumé
              </a>
              <a href={`mailto:${profile.email}`} className={onInkSecondaryClass}>
                <Mail className="size-4" aria-hidden />
                Email
              </a>
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile" className={onInkSecondaryClass}>
                  <GitHubIcon className="size-4" />
                </a>
              )}
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className={onInkSecondaryClass}>
                  <LinkedInIcon className="size-4" />
                </a>
              )}
            </div>
          </div>
        </Tile>

        <StatTile stat={experience} index={1} />
        <StatTile stat={scale} index={2} />
        <AskTile onAsk={onAsk} index={3} />

        <Tile index={4} className="sm:col-span-2">
          <TileLabel>Now</TileLabel>
          <p className="mt-2 text-[15px] font-semibold tracking-tight">{profile.now.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{profile.now.detail}</p>
        </Tile>

        <Tile index={5}>
          <TileLabel>Stack</TileLabel>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STACK.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        </Tile>

        <Tile variant="ink" index={6} className="flex flex-col justify-between gap-4">
          <TileLabel className="text-zinc-400">This site is a RAG system</TileLabel>
          <p className="font-mono text-[11px] leading-6 text-zinc-400">
            ROUTER → <span className="text-orange-300">RESUME AGENT</span>
            <br />→ PGVECTOR · NEON
            <br />→ LLAMA 3.3 70B
          </p>
          <Link to="/chat" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-300 hover:text-orange-200">
            Try it <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Tile>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run src/components/home`
Expected: PASS (6 tests).

- [ ] **Step 6: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 6: Work, Projects, Skills, How-it-works and footer CTA sections

**Files:**
- Create: `frontend/src/components/home/parts.tsx`, `WorkSection.tsx`, `ProjectsSection.tsx`, `SkillsSection.tsx`, `HowItWorksSection.tsx`, `FooterCTA.tsx`
- Test: `frontend/src/components/home/sections.test.tsx`

**Interfaces:**
- Consumes: Task 1 primitives; `resume` (with Task 2 `highlights`, `tagline`); `profile.heroStats`, `profile.email`; `ingestionFlow`, `queryFlow`, `techStack`, `roadmap` from `project.ts`.
- Produces:
  - `Highlights({ items: string[] })`, `AskLink({ topic, question, onAsk })` (button, accessible name `Ask AI about ${topic}`, text "✦ Ask AI about this").
  - `WorkSection({ onAsk })` → `<section id="work">`, h2 "Where I've worked".
  - `ProjectsSection({ onAsk })` → `<section id="projects">`, h2 "Selected projects".
  - `SkillsSection()` → `<section id="skills">`, h2 "Skills & education".
  - `HowItWorksSection()` → `<section id="how-it-works">`, h2 "How this site works", lists "Offline ingestion steps", "Live query steps", "Roadmap".
  - `FooterCTA()` → h2 "Have a role in mind?", mailto link, "Ask my AI" link to `/chat`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/home/sections.test.tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { profile } from "../../data/profile";
import { FooterCTA } from "./FooterCTA";
import { HowItWorksSection } from "./HowItWorksSection";
import { ProjectsSection } from "./ProjectsSection";
import { SkillsSection } from "./SkillsSection";
import { WorkSection } from "./WorkSection";

function renderAll(onAsk = vi.fn()) {
  const view = render(
    <MemoryRouter>
      <WorkSection onAsk={onAsk} />
      <ProjectsSection onAsk={onAsk} />
      <SkillsSection />
      <HowItWorksSection />
      <FooterCTA />
    </MemoryRouter>,
  );
  return { onAsk, ...view };
}

describe("home sections", () => {
  it("renders each section with its anchor and accent heading", () => {
    const { container } = renderAll();
    for (const [id, name] of [
      ["work", "Where I've worked"],
      ["projects", "Selected projects"],
      ["skills", "Skills & education"],
      ["how-it-works", "How this site works"],
    ]) {
      const section = container.querySelector(`section#${id}`);
      expect(section).not.toBeNull();
      expect(within(section as HTMLElement).getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("offsets every section below the sticky nav", () => {
    const { container } = renderAll();
    const sections = container.querySelectorAll("section[id]");
    expect(sections.length).toBe(4);
    sections.forEach((s) => expect(s).toHaveClass("scroll-mt-24"));
  });

  it("asks the AI about a job or project", async () => {
    const { onAsk } = renderAll();
    await userEvent.click(screen.getByRole("button", { name: "Ask AI about C-GEM" }));
    expect(onAsk).toHaveBeenLastCalledWith("How did Sagar build C-GEM for 1,000–2,000 concurrent users?");
    await userEvent.click(screen.getByRole("button", { name: "Ask AI about SDLC Corp" }));
    expect(onAsk).toHaveBeenLastCalledWith("What did Sagar do during his internship at SDLC Corp?");
    await userEvent.click(screen.getByRole("button", { name: "Ask AI about MPIDC Single Window System" }));
    expect(onAsk).toHaveBeenLastCalledWith("What was Sagar's role in architecting the MPIDC Single Window System?");
  });

  it("shows highlights, education and the pipeline", () => {
    renderAll();
    expect(screen.getByText("Real-time group chat for 1,000–2,000 concurrent users")).toBeInTheDocument();
    expect(screen.getAllByText("Dayalbagh Educational Institute, Agra")).toHaveLength(2);
    expect(within(screen.getByRole("list", { name: "Offline ingestion steps" })).getByText("pgvector on Neon")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Live query steps" })).getByText("LLM router")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Roadmap" })).getAllByRole("listitem")).toHaveLength(6);
  });

  it("ends with a contact call to action", () => {
    renderAll();
    expect(screen.getByRole("heading", { level: 2, name: "Have a role in mind?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(profile.email) })).toHaveAttribute("href", `mailto:${profile.email}`);
    const askLinks = screen.getAllByRole("link", { name: /ask my ai/i });
    expect(askLinks.at(-1)).toHaveAttribute("href", "/chat");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/home/sections.test.tsx`
Expected: FAIL — cannot resolve the section modules.

- [ ] **Step 3: Create `src/components/home/parts.tsx`**

```tsx
interface AskLinkProps {
  topic: string;
  question: string;
  onAsk: (question: string) => void;
}

export function AskLink({ topic, question, onAsk }: AskLinkProps) {
  return (
    <button
      type="button"
      onClick={() => onAsk(question)}
      aria-label={`Ask AI about ${topic}`}
      className="no-print group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ember"
    >
      <span aria-hidden className="transition group-hover:translate-x-0.5 group-hover:rotate-12 motion-reduce:transform-none">
        ✦
      </span>
      Ask AI about this
    </button>
  );
}

export function Highlights({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-[13px] leading-relaxed text-fg-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span aria-hidden className="ember-bg mt-2 size-1.5 shrink-0 rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Create `src/components/home/WorkSection.tsx`**

```tsx
import { resume } from "../../data/resume";
import { SectionHeader } from "../ui/SectionHeader";
import { Tile } from "../ui/Tile";
import { AskLink, Highlights } from "./parts";

export function WorkSection({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-24">
      <SectionHeader id="work-title" before="Where I've " accent="worked" meta="2023 → present" />
      <div className="grid gap-3 lg:grid-cols-3">
        {resume.experience.map((job, i) => (
          <Tile key={job.company} index={i} className={job.projects ? "lg:col-span-2" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold tracking-tight">{job.role}</h3>
                <p className="text-sm text-muted">
                  {job.company} · {job.location}
                </p>
              </div>
              <span className="rounded-full border border-line bg-tile-2 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                {job.period}
              </span>
            </div>

            {job.projects ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {job.projects.map((project) => (
                  <Tile key={project.name} variant="sub">
                    <h4 className="text-sm font-semibold">{project.name}</h4>
                    <Highlights items={project.highlights} />
                    <AskLink topic={project.name.replace(/ \(.*\)$/, "")} question={project.ask} onAsk={onAsk} />
                  </Tile>
                ))}
              </div>
            ) : (
              <>
                <Highlights items={job.highlights ?? []} />
                <AskLink topic={job.company} question={job.ask} onAsk={onAsk} />
              </>
            )}
          </Tile>
        ))}
      </div>
    </section>
  );
}
```

(The `replace` turns "MPIDC (Single Window System)" into the topic "MPIDC", so its accessible name differs from the Projects tile's "MPIDC Single Window System".)

- [ ] **Step 5: Create `src/components/home/ProjectsSection.tsx`**

```tsx
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import { resume } from "../../data/resume";
import { SectionHeader } from "../ui/SectionHeader";
import { Tag } from "../ui/Tag";
import { Tile, TileLabel } from "../ui/Tile";
import { AskLink, Highlights } from "./parts";

export function ProjectsSection({ onAsk }: { onAsk: (question: string) => void }) {
  const professional = resume.projects.find((p) => p.kind === "Professional")!;
  const personal = resume.projects.find((p) => p.kind === "Personal")!;
  const cgem = resume.experience[0].projects?.find((p) => p.name === "C-GEM");
  const scale = profile.heroStats.find((s) => s.accent)!;

  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
      <SectionHeader id="projects-title" before="Selected " accent="projects" meta={`${resume.projects.length + 1} projects`} />
      <div className="grid gap-3 lg:grid-cols-3">
        <Tile index={0} className="lg:row-span-2">
          <TileLabel>{professional.kind} · Government</TileLabel>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{professional.name}</h3>
          <p className="mt-1 text-sm text-muted">{professional.tagline}</p>
          <Highlights items={professional.bullets} />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {professional.stack.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
          <AskLink topic={professional.name} question={professional.ask} onAsk={onAsk} />
        </Tile>

        <Tile index={1} className="flex flex-col justify-between">
          <TileLabel>Real-time · C-GEM</TileLabel>
          <div>
            <p className="ember-text mt-6 text-[34px] font-bold leading-none tracking-[-0.04em]">{scale.value}</p>
            <p className="mt-2 text-sm text-muted">concurrent users on Flask-SocketIO</p>
            {cgem && <AskLink topic="C-GEM scale" question={cgem.ask} onAsk={onAsk} />}
          </div>
        </Tile>

        <Tile variant="ink" index={2} className="flex flex-col justify-between gap-4">
          <div>
            <TileLabel className="text-zinc-400">{personal.kind} · AI</TileLabel>
            <h3 className="mt-3 text-base font-semibold">{personal.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">{personal.tagline}</p>
          </div>
          <Link to="/chat" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-300 hover:text-orange-200">
            Try it <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Tile>

        <Tile index={3} className="lg:col-span-2">
          <TileLabel>Notable</TileLabel>
          <p className="mt-3 text-[15px] leading-relaxed text-fg-2">{resume.accomplishments[0]}</p>
        </Tile>
      </div>
    </section>
  );
}
```

(The C-GEM stat tile's ask link uses topic "C-GEM scale" so it doesn't clash with the Work section's "Ask AI about C-GEM".)

- [ ] **Step 6: Create `src/components/home/SkillsSection.tsx`**

```tsx
import { resume } from "../../data/resume";
import { SectionHeader } from "../ui/SectionHeader";
import { Tag } from "../ui/Tag";
import { Tile, TileLabel } from "../ui/Tile";

export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24">
      <SectionHeader id="skills-title" before="Skills & " accent="education" />
      <div className="grid gap-3 lg:grid-cols-2">
        <Tile index={0}>
          <TileLabel>Technical skills</TileLabel>
          <dl className="mt-3 space-y-3">
            {resume.skills.map((group) => (
              <div key={group.label}>
                <dt className="text-xs text-muted">{group.label}</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Tile>

        <Tile index={1}>
          <TileLabel>Core competencies</TileLabel>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {resume.competencies.map((c) => (
              <Tag key={c}>{c}</Tag>
            ))}
          </div>
        </Tile>

        <Tile index={2}>
          <TileLabel>Education</TileLabel>
          <ul className="mt-3 space-y-4">
            {resume.education.map((edu) => (
              <li key={edu.degree}>
                <p className="text-sm font-semibold">
                  {edu.degree} · {edu.field}
                </p>
                <p className="text-xs text-muted">{edu.institute}</p>
                <p className="text-xs text-muted">{edu.period}</p>
              </li>
            ))}
          </ul>
        </Tile>

        <Tile index={3}>
          <TileLabel>Certifications</TileLabel>
          <ul className="mt-3 space-y-2 text-sm text-fg-2">
            {resume.certifications.map((cert) => (
              <li key={cert} className="flex gap-2">
                <span aria-hidden className="text-ember">
                  ✦
                </span>
                {cert}
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/home/HowItWorksSection.tsx`**

```tsx
import { Fragment } from "react";
import { ingestionFlow, queryFlow, roadmap, techStack, type FlowStep } from "../../data/project";
import { SectionHeader } from "../ui/SectionHeader";
import { Tile, TileLabel } from "../ui/Tile";

function Flow({ title, caption, label, steps }: { title: string; caption: string; label: string; steps: FlowStep[] }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted">{caption}</p>
      </div>
      <ol aria-label={label} className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {steps.map((step, i) => (
          <Fragment key={step.title}>
            <li className="flex-1 rounded-[14px] border border-line bg-tile-2 p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ember">Step {i + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step.title}</p>
              <p className="mt-0.5 text-xs text-muted">{step.detail}</p>
            </li>
            {i < steps.length - 1 && (
              // Arrow connector: a hidden list item keeps the <ol> markup valid.
              <li aria-hidden className="flex items-center justify-center font-mono text-soft">
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24">
      <SectionHeader id="how-title" before="How this site " accent="works" meta="architecture · stack · roadmap" />
      <div className="grid gap-3">
        <Tile index={0} className="space-y-8 sm:p-7">
          <Flow title="Offline ingestion" caption="Run once with scripts/ingest_resume.py" label="Offline ingestion steps" steps={ingestionFlow} />
          <Flow title="Live question answering" caption="Every message you send" label="Live query steps" steps={queryFlow} />
        </Tile>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech, i) => (
            <li key={tech.name}>
              <Tile index={i + 1} className="h-full">
                <p className="text-sm font-semibold">{tech.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{tech.role}</p>
              </Tile>
            </li>
          ))}
        </ul>

        <Tile index={9}>
          <TileLabel>Coming next</TileLabel>
          <ol aria-label="Roadmap" className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item, i) => (
              <li key={item.title} className="flex gap-3">
                <span className="ember-bg flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Tile>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Create `src/components/home/FooterCTA.tsx`**

```tsx
import { Mail, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import { onInkPrimaryClass, onInkSecondaryClass } from "../ui";
import { AccentText } from "../ui/AccentText";

export function FooterCTA() {
  return (
    <section
      aria-labelledby="cta-title"
      className="ink-glow relative flex flex-col gap-6 overflow-hidden rounded-[22px] bg-ink-tile p-7 text-white sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="relative">
        <h2 id="cta-title" className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          Have a role in <AccentText>mind?</AccentText>
        </h2>
        <p className="mt-1 text-sm text-zinc-400">Ask my AI first — or just email me.</p>
      </div>
      <div className="relative flex flex-wrap gap-2">
        <a href={`mailto:${profile.email}`} className={onInkPrimaryClass}>
          <Mail className="size-4" aria-hidden />
          {profile.email}
        </a>
        <Link to="/chat" className={onInkSecondaryClass}>
          <Sparkles className="size-4" aria-hidden />
          Ask my AI
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Run to verify it passes**

Run: `npx vitest run src/components/home`
Expected: PASS (11 tests: 6 hero/ask + 5 sections).

- [ ] **Step 10: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 7: Home page, routes, redirects and scroll handling

**Files:**
- Create: `frontend/src/pages/HomePage.tsx`
- Replace: `frontend/src/App.tsx`, `frontend/src/App.test.tsx`
- Modify: `frontend/src/test/setup.ts` (stub `window.scrollTo`)
- Test: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: Task 5–6 sections, `SiteNav` (Task 4), `Footer` (Task 4), existing `ChatPage({ chat, health })`, `useChat`, `useHealth`, `PreferencesProvider`.
- Produces: `HomePage()` — asks navigate to `/chat` with `{ state: { ask } }`; `AppShell()` routes per Global Constraints, `SiteNav` hidden on `/chat`, scroll effect (hash → `scrollIntoView` on that id, else `window.scrollTo(0, 0)`).

- [ ] **Step 1: Stub `window.scrollTo` in `src/test/setup.ts`** — add after the imports:

```ts
// jsdom does not implement scrolling; App calls window.scrollTo on every route change.
window.scrollTo = (() => {}) as typeof window.scrollTo;
```

- [ ] **Step 2: Replace `src/App.test.tsx` with the failing tests**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHealth, sendChat } from "./api/client";
import { AppShell } from "./App";
import { PreferencesProvider } from "./hooks/usePreferences";

vi.mock("./api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/client")>()),
  getHealth: vi.fn(),
  sendChat: vi.fn(),
}));

const scrollIntoView = vi.fn();

beforeEach(() => {
  vi.mocked(getHealth).mockResolvedValue(true);
  vi.mocked(sendChat).mockResolvedValue({ answer: "C-GEM is a chat platform.", source: "resume", chunks_used: 8 });
  scrollIntoView.mockReset();
  Element.prototype.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

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
  it("opens on the bento home page with the site nav", async () => {
    renderApp();
    expect(screen.getByRole("heading", { level: 1, name: "Backend & AI engineer." })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Where I've worked" })).toBeInTheDocument();
    expect(await screen.findByText("AI online")).toBeInTheDocument();
  });

  it("scrolls to the #work section after the /resume redirect", async () => {
    renderApp("/resume");
    expect(screen.getByRole("heading", { level: 1, name: "Backend & AI engineer." })).toBeInTheDocument();
    await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.contexts.at(-1)).toHaveAttribute("id", "work");
  });

  it("scrolls to #how-it-works after the /about redirect", async () => {
    renderApp("/about");
    await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView.mock.contexts.at(-1)).toHaveAttribute("id", "how-it-works");
  });

  it("redirects unknown URLs home", () => {
    renderApp("/does-not-exist");
    expect(screen.getByRole("heading", { level: 1, name: "Backend & AI engineer." })).toBeInTheDocument();
  });

  it("sends a question from the Ask tile to the chat exactly once", async () => {
    renderApp();
    await userEvent.type(screen.getByLabelText("Ask my AI a question"), "How was C-GEM built?{Enter}");
    expect(await screen.findByText("How was C-GEM built?")).toBeInTheDocument();
    expect(vi.mocked(sendChat)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendChat)).toHaveBeenCalledWith("How was C-GEM built?");
    expect(screen.queryByRole("navigation", { name: "Sections" })).not.toBeInTheDocument();
  });

  it("never shows the phone number on the home or chat page", () => {
    const home = renderApp();
    expect(home.container.textContent).not.toMatch(/7078636216/);
    home.unmount();
    const chat = renderApp("/chat");
    expect(chat.container.textContent).not.toMatch(/7078636216/);
  });

  it("toggles dark mode", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement).toHaveClass("dark");
  });

  it("shows offline status when the API is down", async () => {
    vi.mocked(getHealth).mockResolvedValue(false);
    renderApp();
    expect(await screen.findByText("AI offline")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — no "Backend & AI engineer." heading (App still renders the old Chat page).

- [ ] **Step 4: Create `src/pages/HomePage.tsx`**

```tsx
import { useNavigate } from "react-router";
import { Footer } from "../components/Footer";
import { FooterCTA } from "../components/home/FooterCTA";
import { HeroBento } from "../components/home/HeroBento";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { ProjectsSection } from "../components/home/ProjectsSection";
import { SkillsSection } from "../components/home/SkillsSection";
import { WorkSection } from "../components/home/WorkSection";

export function HomePage() {
  const navigate = useNavigate();
  const ask = (question: string) => navigate("/chat", { state: { ask: question } });

  return (
    <>
      <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-14 px-4 py-6 sm:px-6 sm:py-8">
        <HeroBento onAsk={ask} />
        <WorkSection onAsk={ask} />
        <ProjectsSection onAsk={ask} />
        <SkillsSection />
        <HowItWorksSection />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Replace `src/App.tsx`**

```tsx
import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { SiteNav } from "./components/layout/SiteNav";
import { useChat } from "./hooks/useChat";
import { useHealth } from "./hooks/useHealth";
import { PreferencesProvider } from "./hooks/usePreferences";
import { ChatPage } from "./pages/ChatPage";
import { HomePage } from "./pages/HomePage";

/** Routes + app-wide state. Chat state lives here so a pending answer survives switching pages. */
export function AppShell() {
  const chat = useChat();
  const health = useHealth();
  const { pathname, hash } = useLocation();

  // A hash (e.g. from the /resume redirect) jumps to that section; any other navigation starts at the top.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView?.();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col">
      {pathname !== "/chat" && <SiteNav health={health} />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage chat={chat} health={health} />} />
        <Route path="/resume" element={<Navigate to={{ pathname: "/", hash: "#work" }} replace />} />
        <Route path="/about" element={<Navigate to={{ pathname: "/", hash: "#how-it-works" }} replace />} />
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

- [ ] **Step 6: Run to verify it passes**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (8 tests).

- [ ] **Step 7: Checkpoint** — `npm test` and `npx tsc --noEmit` green. (Old `Header`, `ResumePage`, `AboutPage` are no longer routed but their own tests still pass; they are removed in Task 10.)

---

### Task 8: Restyled answer card, badges, pipeline and message list

**Files:**
- Replace: `frontend/src/components/RouteBadge.tsx`, `frontend/src/components/chat/UserMessage.tsx`, `frontend/src/components/chat/AssistantMessage.tsx`, `frontend/src/components/chat/MessageList.tsx`
- Modify: `frontend/src/components/PipelineView.tsx` (classes only)
- Test: `frontend/src/components/chat/AssistantMessage.test.tsx` (add tests), create `frontend/src/components/chat/MessageList.test.tsx`

**Interfaces:**
- Consumes: `Message`, `PipelineView`, `ROUTE_META` names unchanged.
- Produces: same component props as before (`AssistantMessage({ message, showDetails, onRetry })`, `MessageList({ messages, showDetails, onRetry })`, `UserMessage({ content })`). Pending card shows "Routing your question → searching my résumé…". Markdown links get `target="_blank" rel="noreferrer"`; tables are wrapped in `div.overflow-x-auto`. A finished last answer is scrolled into view with `block: "start"`.

- [ ] **Step 1: Add failing tests** — append inside the `describe` in `AssistantMessage.test.tsx`:

```tsx
  it("opens links in a new tab and lets wide tables scroll", () => {
    render(
      <AssistantMessage
        message={{ ...done, content: "See [docs](https://example.com)\n\n| a | b |\n|---|---|\n| 1 | 2 |" }}
        showDetails={false}
        onRetry={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: "docs" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByRole("table").parentElement).toHaveClass("overflow-x-auto");
  });

  it("explains what is happening while pending", () => {
    render(
      <AssistantMessage
        message={{ id: "a9", role: "assistant", content: "", status: "pending", query: "q" }}
        showDetails={false}
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByText("Routing your question → searching my résumé…")).toBeInTheDocument();
  });
```

Create `src/components/chat/MessageList.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Message } from "../../types";
import { MessageList } from "./MessageList";

const scrollIntoView = vi.fn();
beforeEach(() => {
  scrollIntoView.mockReset();
  Element.prototype.scrollIntoView = scrollIntoView;
});
afterEach(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

const question: Message = { id: "u1", role: "user", content: "Q", status: "done" };
const pending: Message = { id: "a1", role: "assistant", content: "", status: "pending", query: "Q" };

describe("MessageList", () => {
  it("scrolls a finished answer to its start", () => {
    const { rerender } = render(<MessageList messages={[question, pending]} showDetails={false} onRetry={vi.fn()} />);
    scrollIntoView.mockReset();
    rerender(
      <MessageList
        messages={[question, { ...pending, status: "done", content: "Long answer", route: "resume" }]}
        showDetails={false}
        onRetry={vi.fn()}
      />,
    );
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(scrollIntoView.mock.contexts.at(-1)).toHaveAttribute("data-message-id", "a1");
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/chat/AssistantMessage.test.tsx src/components/chat/MessageList.test.tsx`
Expected: FAIL — link has no `target`, no "Routing your question" text, no `data-message-id` / `block: "start"` scroll.

- [ ] **Step 3: Replace `src/components/RouteBadge.tsx`**

```tsx
import { CloudSun, FileText, MessageCircle, type LucideIcon } from "lucide-react";
import type { Route } from "../types";

export const ROUTE_META: Record<Route, { label: string; className: string; Icon: LucideIcon }> = {
  resume: {
    label: "Resume",
    className:
      "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30",
    Icon: FileText,
  },
  weather: {
    label: "Weather",
    className: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
    Icon: CloudSun,
  },
  general: {
    label: "General",
    className: "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-500/30",
    Icon: MessageCircle,
  },
};

export function RouteBadge({ route }: { route: Route }) {
  const { label, className, Icon } = ROUTE_META[route];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {label} agent
    </span>
  );
}
```

- [ ] **Step 4: Restyle `src/components/PipelineView.tsx`** — make exactly these three class edits:

1. Pending tone string → `"pipeline-pending-node border-ask-line bg-tile text-ember"`.
2. `<figure className=...>` → `className="rounded-[14px] border border-line bg-tile-2 p-3"`.
3. `<figcaption className=...>` → `className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-xs font-medium text-fg-2"`, its inner span → `className="font-normal text-soft"`; node label div → `className="font-mono text-[11px] font-medium"`; node detail div → `className="text-[11px] opacity-75"`; arrow → `className="size-3.5 shrink-0 text-soft"`.

- [ ] **Step 5: Replace `src/components/chat/UserMessage.tsx`**

```tsx
export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[16px_16px_4px_16px] bg-fg px-4 py-2.5 text-sm leading-relaxed text-canvas">
        {content}
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Replace `src/components/chat/AssistantMessage.tsx`**

```tsx
import { Check, ChevronDown, Copy, RotateCcw, Sparkles, TriangleAlert, Workflow } from "lucide-react";
import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types";
import { PipelineView } from "../PipelineView";
import { RouteBadge } from "../RouteBadge";
import { ghostButtonClass } from "../ui";

interface Props {
  message: Message;
  showDetails: boolean;
  onRetry: (id: string) => void;
}

const MARKDOWN_COMPONENTS: Components = {
  a: (props) => {
    const { node, ...rest } = props;
    void node;
    return <a {...rest} target="_blank" rel="noreferrer" />;
  },
  table: (props) => {
    const { node, ...rest } = props;
    void node;
    return (
      <div className="overflow-x-auto">
        <table {...rest} />
      </div>
    );
  },
};

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
  // null = follow the global "Show details" toggle until the visitor opens/closes this one.
  const [pipelineOverride, setPipelineOverride] = useState<boolean | null>(null);
  const pipelineOpen = pipelineOverride ?? showDetails;

  return (
    <div className="flex gap-3">
      <span aria-hidden className="ember-bg mt-1 flex size-8 shrink-0 items-center justify-center rounded-[10px] text-white">
        <Sparkles className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {message.status === "pending" && (
          <div className="ask-surface space-y-3 rounded-[4px_18px_18px_18px] border p-4" role="status">
            <p className="text-[13px] font-medium text-ember">Routing your question → searching my résumé…</p>
            <div className="shimmer w-3/5" aria-hidden />
            <PipelineView pending />
          </div>
        )}

        {message.status === "error" && (
          <div className="rounded-[4px_18px_18px_18px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
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
              className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30 dark:hover:bg-rose-500/20"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Try again
            </button>
          </div>
        )}

        {message.status === "done" && (
          <div className="rounded-[4px_18px_18px_18px] border border-line bg-tile p-4 sm:p-5">
            <div className="prose prose-sm prose-zinc max-w-none break-words dark:prose-invert prose-p:leading-relaxed prose-a:text-ember prose-strong:text-fg">
              <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {message.content}
              </Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-xs text-muted">
              <RouteBadge route={message.route ?? "general"} />
              {showDetails && message.chunksUsed !== undefined && message.chunksUsed > 0 && (
                <span>{message.chunksUsed} chunks</span>
              )}
              {showDetails && message.latencyMs !== undefined && <span>{(message.latencyMs / 1000).toFixed(1)}s</span>}
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

- [ ] **Step 7: Replace `src/components/chat/MessageList.tsx`**

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
  const lastRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // A new question: bring the newest message and the composer into view.
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // An answer arrived: show its first line, not its last.
  useEffect(() => {
    if (last?.role === "assistant" && last.status === "done") {
      lastRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [last?.id, last?.role, last?.status]);

  return (
    <div aria-live="polite" className="space-y-6">
      {messages.map((m, i) => (
        <div
          key={m.id}
          data-message-id={m.id}
          ref={i === messages.length - 1 ? lastRef : undefined}
          className="scroll-mt-24"
        >
          {m.role === "user" ? (
            <UserMessage content={m.content} />
          ) : (
            <AssistantMessage message={m} showDetails={showDetails} onRetry={onRetry} />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src/components`
Expected: PASS (all component tests, including the 2 new AssistantMessage tests and the MessageList test).

- [ ] **Step 9: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 9: Chat workspace — top bar, sidebar, empty state, composer, page layout

**Files:**
- Create: `frontend/src/components/chat/ChatTopBar.tsx`, `frontend/src/components/chat/ChatSidebar.tsx`
- Replace: `frontend/src/components/chat/EmptyState.tsx`, `EmptyState.test.tsx`, `Composer.tsx`, `Composer.test.tsx`, `frontend/src/pages/ChatPage.tsx`, `frontend/src/pages/ChatPage.test.tsx`

**Interfaces:**
- Consumes: `chatSuggestions`, `profile`, `howItAnswers` (Task 2); `Tile`, `TileLabel`, `AccentText`, `Avatar`, class strings (Task 1); `HealthDot`, `ThemeToggle`; `MessageList` (Task 8); `OfflineBanner` (existing); `UseChat`, `HealthStatus`, `usePreferences`.
- Produces:
  - `ChatTopBar({ health, showDetails, onToggleDetails, onClear, canClear })` — link "Profile" → `/`, switch "Show details", button "Clear chat".
  - `ChatSidebar({ onAsk })` — ink mini-profile, "Try asking" buttons for every `chatSuggestions` entry (name includes hint), "How it answers" tile.
  - `EmptyState({ onAsk })` — h1 "Ask me anything about Sagar's work", greeting, 4 question cards (suggestions without hint).
  - `Composer({ value, onChange, onSubmit, busy })` — label "Ask a question about Sagar", button "Send", hint text.
  - `ChatPage({ chat, health })` — same ask/prefill logic as before; sidebar in `<aside aria-label="Chat help">`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/chat/Composer.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Composer } from "./Composer";

function Harness({ onSubmit, busy = false }: { onSubmit: (v: string) => void; busy?: boolean }) {
  const [value, setValue] = useState("");
  return <Composer value={value} onChange={setValue} onSubmit={() => onSubmit(value)} busy={busy} />;
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

  it("reminds visitors that AI answers can be imperfect", () => {
    render(<Harness onSubmit={vi.fn()} />);
    expect(screen.getByText(/AI answers can be imperfect/)).toBeInTheDocument();
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
  it("greets the visitor with an accent headline", () => {
    render(<EmptyState onAsk={vi.fn()} />);
    const heading = screen.getByRole("heading", { level: 1, name: "Ask me anything about Sagar's work" });
    expect(heading.querySelector("em")).toHaveTextContent("work");
    expect(screen.getByText("Hi, I'm Sagar's AI assistant. Ask me about his work.")).toBeInTheDocument();
  });

  it("offers four résumé questions", async () => {
    const onAsk = vi.fn();
    render(<EmptyState onAsk={onAsk} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
    await userEvent.click(screen.getByRole("button", { name: /kafka and redis/i }));
    expect(onAsk).toHaveBeenCalledWith("Has he worked with Kafka and Redis?");
  });
});
```

```tsx
// src/pages/ChatPage.test.tsx
import { render, screen, within } from "@testing-library/react";
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
        <MemoryRouter initialEntries={[{ pathname: "/chat", state: ask ? { ask } : null }]}>
          <ChatPage chat={chat} health={health} />
        </MemoryRouter>
      </PreferencesProvider>
    </StrictMode>,
  );
}

const conversation = [
  { id: "u1", role: "user" as const, content: "Hello there", status: "done" as const },
  { id: "a1", role: "assistant" as const, content: "Hi!", status: "done" as const, route: "general" as const, query: "Hello there" },
];

describe("ChatPage", () => {
  it("shows the empty state, top bar and sidebar before the first question", () => {
    renderPage(fakeChat());
    expect(screen.getByRole("heading", { name: /ask me anything about sagar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Clear chat" })).toBeDisabled();
    expect(screen.getByRole("complementary", { name: "Chat help" })).toBeInTheDocument();
  });

  it("sends typed questions and clears the input", async () => {
    const chat = fakeChat();
    renderPage(chat);
    const box = screen.getByLabelText("Ask a question about Sagar");
    await userEvent.type(box, "What is C-GEM?{Enter}");
    expect(chat.send).toHaveBeenCalledWith("What is C-GEM?");
    expect(box).toHaveValue("");
  });

  it("sends a question passed from the home page exactly once", () => {
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

  it("asks a sidebar suggestion", async () => {
    const chat = fakeChat();
    renderPage(chat);
    const sidebar = screen.getByRole("complementary", { name: "Chat help" });
    await userEvent.click(within(sidebar).getByRole("button", { name: /weather in delhi\? · tool agent/i }));
    expect(chat.send).toHaveBeenCalledWith("What's the weather in Delhi?");
  });

  it("renders the conversation and lets the visitor clear it", async () => {
    const chat = fakeChat({ messages: conversation });
    renderPage(chat);
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("General agent")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /ask me anything/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Clear chat" }));
    expect(chat.clear).toHaveBeenCalledTimes(1);
  });

  it("toggles details from the top bar", async () => {
    renderPage(fakeChat());
    const toggle = screen.getByRole("switch", { name: /show details/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("shows a dismissible banner when the backend is offline", async () => {
    renderPage(fakeChat(), { health: "offline" });
    expect(screen.getByRole("alert")).toHaveTextContent("Backend offline");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/chat src/pages/ChatPage.test.tsx`
Expected: FAIL — Composer still renders the switch/clear and has no hint; EmptyState renders tabs; ChatPage has no top bar/sidebar.

- [ ] **Step 3: Replace `src/components/chat/Composer.tsx`**

```tsx
import { ArrowUp, LoaderCircle } from "lucide-react";
import { useLayoutEffect, useRef, type KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

const MAX_HEIGHT_PX = 200;

export function Composer({ value, onChange, onSubmit, busy }: Props) {
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
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className="ember-glow flex items-end gap-2 rounded-[18px] border border-line bg-tile p-2 pl-3 transition focus-within:border-ask-line"
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
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-5 outline-none placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-fg text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <ArrowUp className="size-4" aria-hidden />
          )}
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-soft">
        Enter to send · Shift+Enter for a new line · AI answers can be imperfect — check the résumé
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/components/chat/EmptyState.tsx`**

```tsx
import { ArrowUpRight } from "lucide-react";
import { chatSuggestions, profile } from "../../data/profile";
import { Avatar } from "../Avatar";
import { cardClass } from "../ui";
import { AccentText } from "../ui/AccentText";

const QUESTIONS = chatSuggestions.filter((s) => !s.hint).slice(0, 4);

export function EmptyState({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section className="flex flex-col items-center pt-6 text-center sm:pt-14">
      <Avatar size="lg" />
      <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Ask me anything about {profile.firstName}'s <AccentText>work</AccentText>
      </h1>
      <p className="mt-3 max-w-lg text-pretty text-muted">Hi, I'm Sagar's AI assistant. Ask me about his work.</p>
      <div className="mt-8 grid w-full gap-2.5 text-left sm:grid-cols-2">
        {QUESTIONS.map((s, i) => (
          <button
            key={s.question}
            type="button"
            onClick={() => onAsk(s.question)}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`${cardClass} tile-interactive tile-enter group flex items-start gap-3 p-4 text-sm font-medium text-fg-2`}
          >
            <span className="flex-1">{s.question}</span>
            <ArrowUpRight className="size-4 shrink-0 text-soft transition group-hover:text-ember" aria-hidden />
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/chat/ChatTopBar.tsx`**

```tsx
import { ArrowLeft, SlidersHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import type { HealthStatus } from "../../hooks/useHealth";
import { Avatar } from "../Avatar";
import { HealthDot } from "../layout/HealthDot";
import { ThemeToggle } from "../layout/ThemeToggle";
import { ghostButtonClass } from "../ui";

interface Props {
  health: HealthStatus;
  showDetails: boolean;
  onToggleDetails: () => void;
  onClear: () => void;
  canClear: boolean;
}

export function ChatTopBar({ health, showDetails, onToggleDetails, onClear, canClear }: Props) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-tile/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Profile
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">Ask {profile.firstName}'s AI</p>
            <p className="truncate text-xs text-muted max-sm:hidden">answers grounded in my résumé</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="max-sm:hidden">
            <HealthDot status={health} />
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showDetails}
            onClick={onToggleDetails}
            className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition hover:text-fg"
          >
            <span
              aria-hidden
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${showDetails ? "ember-bg" : "bg-line"}`}
            >
              <span
                className={`inline-block size-3 rounded-full bg-white shadow transition ${showDetails ? "translate-x-3.5" : "translate-x-0.5"}`}
              />
            </span>
            <SlidersHorizontal className="size-3.5 max-sm:hidden" aria-hidden />
            <span className="max-sm:sr-only">Show details</span>
          </button>
          <button type="button" onClick={onClear} disabled={!canClear} aria-label="Clear chat" className={ghostButtonClass}>
            <Trash2 className="size-3.5" aria-hidden />
            <span className="max-sm:hidden">Clear</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Create `src/components/chat/ChatSidebar.tsx`**

```tsx
import { Download, Mail } from "lucide-react";
import { chatSuggestions, profile } from "../../data/profile";
import { howItAnswers } from "../../data/project";
import { Avatar } from "../Avatar";
import { Tile, TileLabel } from "../ui/Tile";

const ROLE = `${profile.headline.before}${profile.headline.accent}${profile.headline.after}`.replace(/\.$/, "");
const onInkSmall =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2 py-1.5 text-xs font-semibold transition";

export function ChatSidebar({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="space-y-5 p-5">
      <Tile variant="ink" className="p-4">
        <div className="relative flex items-center gap-3">
          <Avatar size="md" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="text-xs text-zinc-400">{ROLE}</p>
          </div>
        </div>
        <div className="relative mt-4 flex gap-2">
          <a href={profile.resumeUrl} download={profile.resumeFileName} className={`${onInkSmall} bg-white text-zinc-900 hover:bg-zinc-100`}>
            <Download className="size-3.5" aria-hidden />
            Résumé
          </a>
          <a href={`mailto:${profile.email}`} className={`${onInkSmall} border border-white/15 bg-white/10 text-white hover:bg-white/15`}>
            <Mail className="size-3.5" aria-hidden />
            Email
          </a>
        </div>
      </Tile>

      <div>
        <TileLabel>Try asking</TileLabel>
        <ul className="mt-2 space-y-1.5">
          {chatSuggestions.map((s) => (
            <li key={s.question}>
              <button
                type="button"
                onClick={() => onAsk(s.question)}
                className="w-full rounded-[10px] border border-line bg-tile px-3 py-2 text-left text-[13px] text-fg-2 transition hover:border-ask-line hover:text-fg"
              >
                {s.question}
                {s.hint && <span className="text-soft"> · {s.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Tile className="p-4">
        <TileLabel>How it answers</TileLabel>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{howItAnswers}</p>
      </Tile>
    </div>
  );
}
```

- [ ] **Step 7: Replace `src/pages/ChatPage.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatTopBar } from "../components/chat/ChatTopBar";
import { Composer } from "../components/chat/Composer";
import { EmptyState } from "../components/chat/EmptyState";
import { MessageList } from "../components/chat/MessageList";
import { OfflineBanner } from "../components/chat/OfflineBanner";
import { chatSuggestions } from "../data/profile";
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
  const showQuickChips = hasMessages && chat.messages.length <= 4;

  return (
    <div className="flex min-h-dvh flex-col">
      <ChatTopBar
        health={health}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        onClear={chat.clear}
        canClear={hasMessages && !chat.isPending}
      />
      <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Chat help" className="hidden border-r border-line lg:block">
          <div className="sticky top-[61px] max-h-[calc(100dvh-61px)] overflow-y-auto">
            <ChatSidebar onAsk={askNow} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col px-4 sm:px-8">
          {health === "offline" && !bannerDismissed && <OfflineBanner onDismiss={() => setBannerDismissed(true)} />}
          <div className="mx-auto w-full max-w-[760px] flex-1 py-8">
            {hasMessages ? (
              <MessageList messages={chat.messages} showDetails={showDetails} onRetry={chat.retry} />
            ) : (
              <EmptyState onAsk={askNow} />
            )}
          </div>
          <div className="no-print sticky bottom-0 -mx-4 bg-gradient-to-t from-canvas via-canvas to-transparent px-4 pb-4 pt-6 sm:-mx-8 sm:px-8">
            <div className="mx-auto w-full max-w-[760px]">
              {showQuickChips && (
                <div className="mb-3 flex gap-1.5 overflow-x-auto lg:hidden">
                  {chatSuggestions.map((s) => (
                    <button
                      key={s.question}
                      type="button"
                      onClick={() => askNow(s.question)}
                      className="shrink-0 rounded-full border border-line bg-tile px-3 py-1 text-xs text-fg-2"
                    >
                      {s.question}
                    </button>
                  ))}
                </div>
              )}
              <Composer value={draft} onChange={setDraft} onSubmit={submit} busy={chat.isPending} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run to verify it passes**

Run: `npx vitest run src/components/chat src/pages/ChatPage.test.tsx src/App.test.tsx`
Expected: PASS (Composer 5, EmptyState 2, ChatPage 8, App 8, plus the Task 8 chat tests).

- [ ] **Step 9: Checkpoint** — `npm test` and `npx tsc --noEmit` green.

---

### Task 10: Remove the old pages, tidy data, verify in the browser

**Files:**
- Delete: `frontend/src/components/resume/` (all), `frontend/src/components/about/` (all), `frontend/src/pages/ResumePage.tsx`, `ResumePage.test.tsx`, `AboutPage.tsx`, `AboutPage.test.tsx`, `frontend/src/components/chat/SuggestionChips.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/components/SocialLinks.tsx`
- Modify: `frontend/src/data/profile.ts` (remove `Stat`, `stats`, `SuggestionGroup`, `suggestionGroups`, `AgentDemo`, `agentDemos`), `frontend/src/data/data.test.ts`, `frontend/README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: no dead code; full suite and build green; manual visual sign-off.

- [ ] **Step 1: Delete the obsolete files**

```bash
rm -r src/components/resume src/components/about
rm src/pages/ResumePage.tsx src/pages/ResumePage.test.tsx src/pages/AboutPage.tsx src/pages/AboutPage.test.tsx
rm src/components/chat/SuggestionChips.tsx src/components/layout/Header.tsx src/components/SocialLinks.tsx
grep -rn "ResumePage\|AboutPage\|SuggestionChips\|layout/Header\|SocialLinks\|components/resume\|components/about" src || echo "no references"
```

Expected: `no references`.

- [ ] **Step 2: Update `src/data/data.test.ts` first (failing)** — replace the import line with `import { chatSuggestions, profile } from "./profile";`, replace the phone test's stringify with `JSON.stringify({ profile, chatSuggestions, resume })`, and replace the test `"has suggestion questions for all four topics"` with:

```ts
  it("has chat suggestions with no blanks and the old suggestion data is gone", async () => {
    for (const s of chatSuggestions) expect(s.question.trim()).not.toBe("");
    const mod: Record<string, unknown> = await import("./profile");
    expect(mod.suggestionGroups).toBeUndefined();
    expect(mod.agentDemos).toBeUndefined();
    expect((profile as unknown as Record<string, unknown>).stats).toBeUndefined();
  });
```

Run: `npx vitest run src/data`
Expected: FAIL — `suggestionGroups` still defined.

- [ ] **Step 3: Remove the unused data** from `src/data/profile.ts`: delete `interface Stat`, the `stats: Stat[];` field from `Profile`, the `stats: [...]` value, and the `SuggestionGroup`/`suggestionGroups` and `AgentDemo`/`agentDemos` declarations.

Run: `npx vitest run src/data`
Expected: PASS.

- [ ] **Step 4: Update `frontend/README.md`** — replace the `## Editing content` section with:

```markdown
## Editing content

- Name, headline, intro, availability, hero stats, chat suggestions, links: `src/data/profile.ts` (add your GitHub/LinkedIn URLs there)
- Résumé content and home-page highlights: `src/data/resume.ts`
- "How it works" (pipeline steps, tech stack, roadmap): `src/data/project.ts`
- Design tokens (colors, fonts, motion): `src/index.css`
- Downloadable PDF: `public/resume.pdf`

## Pages

- `/` — bento home: hero, work, projects, skills & education, how it works
- `/chat` — the AI workspace (old `/resume` and `/about` links redirect to home sections)
```

- [ ] **Step 5: Full verification**

Run: `npm test` → all files pass, no warnings in output.
Run: `npm run build` → succeeds.
Run (in `resume_rag/`): `find . -path ./frontend -prune -o -path ./resumenv -prune -o -path ./docs -prune -o -path ./.superpowers -prune -o -name __pycache__ -prune -o -type f -newer docs/superpowers/specs/2026-10-01-bento-redesign-design.md -print` → no output.

- [ ] **Step 6: Visual check in Chrome** (dev servers running: uvicorn on :8000, `npm run dev`)

- [ ] Home at 1440 px, light: bento hero matches `design-home.html` (ink identity tile with ember glow, 2,000 in gradient, Ask tile, Now/Stack/RAG row); sections Work → Projects → Skills → How it works → CTA; tiles fade up once on load; hovering an interactive tile lifts it.
- [ ] Nav anchor clicks scroll smoothly and the section heading is not hidden under the nav; active link follows scrolling.
- [ ] Dark mode: canvas near-black, tiles `#18181B`, text readable everywhere, identity tile still stands out.
- [ ] Ask tile → Enter → `/chat` opens and sends once; chat matches `design-chat.html` (top bar, sidebar, ember pending state with shimmer, answer card with badge and pipeline).
- [ ] 360 px (iframe check from the previous build's Task 12): no horizontal overflow on `/` and `/chat`; hero stacks; chat sidebar hidden, quick chips appear after the first answer.
- [ ] `/resume` and `/about` land on Work and How it works.
- [ ] Console has no errors.

- [ ] **Step 7: Checkpoint** — report test count, build size, and screenshots of home (light, dark) and chat.
