import { Download, Mail } from "lucide-react";
import type { CSSProperties } from "react";
import { profile } from "../../data/profile";
import { GitHubIcon, LinkedInIcon } from "../BrandIcons";
import { iconButtonClass, primaryButtonClass, secondaryButtonClass } from "../ui";
import { AskBox } from "./AskBox";

/** Staggers the fade-in of hero rows. */
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="scroll-mt-20 pb-14 pt-14 sm:pb-16 sm:pt-24">
      <p className="fade-up inline-flex items-center gap-2 text-sm text-muted" style={stagger(0)}>
        <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
        {profile.availability}
      </p>

      <div className="fade-up" style={stagger(1)}>
        <h1 id="hero-title" className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-[52px] sm:leading-[1.05]">
          {profile.name}
        </h1>
        <p className="mt-3 text-lg text-fg-2 sm:text-xl">
          {profile.headline}
          <span className="text-soft"> · </span>
          <span className="text-muted">{profile.tagline}</span>
        </p>
      </div>

      <p
        className="fade-up mt-6 max-w-[58ch] text-[16px] leading-7 text-muted"
        style={stagger(2)}
      >
        {profile.intro}
      </p>

      <div
        className="fade-up no-print mt-8 flex flex-wrap items-center gap-2"
        style={stagger(3)}
      >
        <a href={profile.resumeUrl} download={profile.resumeFileName} className={primaryButtonClass}>
          <Download className="size-4" aria-hidden />
          Download résumé
        </a>
        <a href={`mailto:${profile.email}`} className={secondaryButtonClass}>
          <Mail className="size-4" aria-hidden />
          Email me
        </a>
        {profile.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className={iconButtonClass}>
            <LinkedInIcon className="size-4" />
          </a>
        )}
        {profile.github && (
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile" className={iconButtonClass}>
            <GitHubIcon className="size-4" />
          </a>
        )}
      </div>

      {/* On paper the buttons vanish, so contact details print as plain text. */}
      <p className="hidden text-sm print:block">
        {profile.email} · {profile.location}
      </p>

      <dl
        className="fade-up mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6 sm:gap-6"
        style={stagger(4)}
      >
        {profile.heroStats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">{stat.value}</dd>
            <dd className="mt-0.5 text-sm text-muted">{stat.caption}</dd>
          </div>
        ))}
      </dl>

      <div className="fade-up mt-12" style={stagger(5)}>
        <AskBox onAsk={onAsk} />
      </div>
    </section>
  );
}
