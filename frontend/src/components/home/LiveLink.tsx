import { ExternalLink } from "lucide-react";

/** "Visit live site" link; prints as the bare URL so it survives on paper. */
export function LiveLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-fg transition hover:text-accent"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
      <span className="print:hidden">Visit live site</span>
      <span className="hidden print:inline">{url}</span>
      <ExternalLink className="no-print size-3.5" aria-hidden />
    </a>
  );
}
