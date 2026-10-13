import type { ReactNode } from "react";

interface Props {
  id: string;
  title: string;
  children: ReactNode;
}

/** A résumé section: small label in the left column, content on the right (stacked on mobile). */
export function Section({ id, title, children }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-20 border-t border-line py-10 sm:grid sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-8 sm:py-12"
    >
      <h2 id={`${id}-title`} className="mb-6 text-sm font-medium text-muted sm:mb-0 sm:pt-0.5">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

/** Title row shared by experience, project and education entries: name on the left, meta on the right. */
export function EntryHeader({ title, subtitle, meta }: { title: ReactNode; subtitle?: ReactNode; meta?: ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h3 className="text-[15px] font-medium text-fg">{title}</h3>
        {meta && <p className="text-sm tabular-nums text-muted">{meta}</p>}
      </div>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-[15px] leading-relaxed text-fg-2">
      {items.map((item) => (
        <li key={item} className="relative pl-4">
          <span aria-hidden className="absolute left-0 top-0 text-soft">
            –
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
