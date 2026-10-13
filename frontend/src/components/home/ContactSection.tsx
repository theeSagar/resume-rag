import { Download } from "lucide-react";
import { profile } from "../../data/profile";
import { secondaryButtonClass } from "../ui";
import { Section } from "../ui/Section";

export function ContactSection() {
  return (
    <Section id="contact" title="Contact">
      <p className="text-2xl font-semibold tracking-tight sm:text-[28px]">Have a role in mind?</p>
      <p className="mt-2 text-[15px] text-muted">Open to backend, Python and AI engineering roles. Email is the quickest way to reach me.</p>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${profile.email}`}
          className="text-lg font-medium text-fg underline decoration-line decoration-1 underline-offset-[6px] transition hover:decoration-fg"
        >
          {profile.email}
        </a>
        <a href={profile.resumeUrl} download={profile.resumeFileName} className={`no-print ${secondaryButtonClass}`}>
          <Download className="size-4" aria-hidden />
          Résumé PDF
        </a>
      </div>
    </Section>
  );
}
