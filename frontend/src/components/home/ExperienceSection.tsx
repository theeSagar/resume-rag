import { ArrowDown } from "lucide-react";
import { resume } from "../../data/resume";
import { Bullets, EntryHeader, Section } from "../ui/Section";
import { AskLink } from "./AskLink";

export function ExperienceSection({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <Section id="experience" title="Experience">
      <ol className="space-y-12">
        {resume.experience.map((job) => (
          <li key={job.company}>
            <EntryHeader
              title={job.role}
              subtitle={`${job.company} · ${job.location}`}
              meta={job.period}
            />
            <Bullets items={job.bullets} />

            {/* Shipped projects link down to Projects rather than being described twice. */}
            {job.shipped && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                Shipped
                {job.shipped.map((id) => {
                  const project = resume.projects.find((p) => p.id === id);
                  return project ? (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="group inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 font-medium text-fg transition hover:border-fg"
                    >
                      {project.name}
                      <ArrowDown className="no-print size-3.5 transition group-hover:translate-y-px" aria-hidden />
                    </a>
                  ) : null;
                })}
              </p>
            )}

            <AskLink topic={job.company} question={job.ask} onAsk={onAsk} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
