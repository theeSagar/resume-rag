import { ArrowUpRight } from "lucide-react";

interface Props {
  topic: string;
  question: string;
  onAsk: (question: string) => void;
}

export function AskLink({ topic, question, onAsk }: Props) {
  return (
    <button
      type="button"
      onClick={() => onAsk(question)}
      className="no-print group mt-3 inline-flex items-center gap-1 text-sm text-muted transition hover:text-fg"
    >
      Ask AI about this{" "}
      {/* The visible label stays the start of the accessible name (WCAG 2.5.3); the topic disambiguates. */}
      <span className="sr-only">({topic})</span>
      <ArrowUpRight
        className="size-3.5 transition group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none"
        aria-hidden
      />
    </button>
  );
}
