import { resume } from "../../data/resume";
import { EntryHeader, Section } from "../ui/Section";

export function EducationSection() {
  return (
    <Section id="education" title="Education">
      <ul className="space-y-6">
        {resume.education.map((edu) => (
          <li key={edu.degree}>
            <EntryHeader title={`${edu.degree}, ${edu.field}`} subtitle={edu.institute} meta={edu.period} />
          </li>
        ))}
      </ul>
      <h3 className="mt-10 text-sm font-medium text-muted">Certifications</h3>
      <ul className="mt-3 space-y-1.5 text-[15px] text-fg-2">
        {resume.certifications.map((cert) => (
          <li key={cert}>{cert}</li>
        ))}
      </ul>
    </Section>
  );
}
