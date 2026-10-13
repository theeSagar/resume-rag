import { resume } from "../../data/resume";
import { Section } from "../ui/Section";

export function SkillsSection() {
  return (
    <Section id="skills" title="Skills">
      <dl className="grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-[180px_minmax(0,1fr)]">
        {resume.skills.map((group) => (
          <div key={group.label} className="contents">
            <dt className="text-muted max-sm:text-sm">{group.label}</dt>
            <dd className="text-fg-2 max-sm:mb-2">{group.items.join(", ")}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-8 text-sm leading-relaxed text-muted">
        <span className="text-fg-2">Focus areas: </span>
        {resume.competencies.join(" · ")}
      </p>
    </Section>
  );
}
