import { ArrowUpRight } from "lucide-react";
import { chatSuggestions, profile } from "../../data/profile";
import { Avatar } from "../Avatar";

const QUESTIONS = chatSuggestions.filter((s) => !s.hint).slice(0, 4);

export function EmptyState({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <section className="flex flex-col items-center pt-6 text-center sm:pt-16">
      <Avatar size="lg" />
      <h1 className="mt-6 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        Ask me anything about {profile.firstName}'s work
      </h1>
      <p className="mt-2 max-w-md text-pretty text-[15px] text-muted">
        I'm an AI assistant that answers from {profile.firstName}'s résumé.
      </p>
      <div className="mt-10 grid w-full gap-2 text-left sm:grid-cols-2">
        {QUESTIONS.map((s, i) => (
          <button
            key={s.question}
            type="button"
            onClick={() => onAsk(s.question)}
            style={{ animationDelay: `${i * 60}ms` }}
            className="fade-up group flex items-start gap-3 rounded-xl border border-line bg-tile p-4 text-sm text-fg-2 transition hover:border-soft hover:text-fg"
          >
            <span className="flex-1">{s.question}</span>
            <ArrowUpRight className="size-4 shrink-0 text-soft transition group-hover:text-fg" aria-hidden />
          </button>
        ))}
      </div>
    </section>
  );
}
