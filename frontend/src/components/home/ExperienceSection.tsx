import { resume } from "../../data/resume";
import { Bullets, EntryHeader, Section } from "../ui/Section";
import { AskLink } from "./AskLink";
import { LiveLink } from "./LiveLink";

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

            {job.projects && job.bullets && <Bullets items={job.bullets} />}

            {job.projects ? (
              <div className="mt-6 space-y-6">
                {job.projects.map((project) => (
                  <div key={project.name}>
                    <h4 className="text-sm font-medium text-fg">{project.name}</h4>
                    <Bullets items={project.bullets} />
                    <div className="flex flex-wrap items-center gap-x-5">
                      {project.liveUrl && <LiveLink url={project.liveUrl} />}
                      <AskLink topic={project.name.replace(/ \(.*\)$/, "")} question={project.ask} onAsk={onAsk} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Bullets items={job.bullets ?? []} />
                <AskLink topic={job.company} question={job.ask} onAsk={onAsk} />
              </>
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
