import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { resume } from "../../data/resume";
import { Bullets, EntryHeader, Section } from "../ui/Section";
import { AskLink } from "./AskLink";

export function ProjectsSection({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <Section id="projects" title="Projects">
      <ul className="space-y-12">
        {resume.projects.map((project) => (
          <li key={project.name}>
            <EntryHeader title={project.name} subtitle={project.tagline} meta={project.kind} />
            <Bullets items={project.bullets} />
            <p className="mt-3 font-mono text-xs text-muted">{project.stack.join("  ·  ")}</p>
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
          </li>
        ))}
      </ul>
    </Section>
  );
}
