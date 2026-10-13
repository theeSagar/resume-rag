import { Link } from "react-router";
import { profile } from "../../data/profile";
import { useScrollSpy } from "../../hooks/useScrollSpy";
import { ThemeToggle } from "./ThemeToggle";

export const HOME_SECTIONS = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

const SECTION_IDS = HOME_SECTIONS.map((s) => s.id);

export function SiteNav() {
  const active = useScrollSpy(SECTION_IDS);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[760px] items-center gap-4 px-5 sm:px-8">
        <a href="#top" className="text-sm font-semibold tracking-tight">
          {profile.name}
        </a>

        <nav aria-label="Sections" className="ml-auto flex gap-1 max-sm:hidden">
          {HOME_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`rounded-full px-3 py-1.5 text-[13px] transition focus-visible:outline-offset-[-2px] ${
                active === s.id ? "bg-tile-2 font-medium text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 max-sm:ml-auto">
          <ThemeToggle />
          <Link
            to="/chat"
            className="ml-1 inline-flex items-center rounded-full bg-fg px-3.5 py-1.5 text-[13px] font-medium text-canvas transition hover:opacity-85"
          >
            Ask my AI
          </Link>
        </div>
      </div>
    </header>
  );
}
