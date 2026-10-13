import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { resume } from "../../data/resume";
import { Bullets, EntryHeader, Section } from "../ui/Section";
import { AskLink } from "./AskLink";
import { LiveLink } from "./LiveLink";

export function ProjectsSection({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <Section id="projects" title="Projects">
      <ul className="space-y-14">
        {resume.projects.map((project) => (
          <li key={project.name}>
            {project.image && project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.name} live site`}
                className="no-print group mb-5 block overflow-hidden rounded-xl border border-line bg-line/40 shadow-sm"
              >
                <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
                  <span aria-hidden className="size-2 rounded-full bg-soft/60" />
                  <span aria-hidden className="size-2 rounded-full bg-soft/60" />
                  <span aria-hidden className="size-2 rounded-full bg-soft/60" />
                  <span className="ml-2 truncate font-mono text-[11px] text-muted">
                    {new URL(project.liveUrl).host}
                  </span>
                </div>
                <img
                  src={project.image}
                  alt={`${project.name} homepage`}
                  loading="lazy"
                  width={1440}
                  height={900}
                  className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
                />
              </a>
            )}
            <EntryHeader title={project.name} subtitle={project.tagline} meta={project.kind} />
            <Bullets items={project.bullets} />
            <p className="mt-3 font-mono text-xs text-muted">{project.stack.join("  ·  ")}</p>
            <div className="flex flex-wrap items-center gap-x-5">
              {project.liveUrl && <LiveLink url={project.liveUrl} />}
              {project.kind === "Personal" ? (
                <Link
                  to="/chat"
                  className="no-print group mt-3 inline-flex items-center gap-1 text-sm font-medium text-fg transition hover:text-accent"
                >
                  Try the live demo
                  <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
                </Link>
              ) : (
                <AskLink topic={project.name} question={project.ask} onAsk={onAsk} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
