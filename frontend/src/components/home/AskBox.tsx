import { ArrowUp, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "../../data/profile";

export function AskBox({ onAsk }: { onAsk: (question: string) => void }) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const question = value.trim();
    if (!question) return;
    onAsk(question);
    setValue("");
  };

  return (
    <div className="no-print">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-2xl border border-line bg-tile p-1.5 pl-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition focus-within:border-soft focus-within:ring-2 focus-within:ring-fg/10"
      >
        <Sparkles className="size-4 shrink-0 text-soft" aria-hidden />
        <label htmlFor="ask-input" className="sr-only">
          Ask my AI a question
        </label>
        <input
          id="ask-input"
          maxLength={1000}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask my AI about my work…"
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Ask"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-fg text-canvas transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-25"
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-x-1 gap-y-1.5 text-sm">
        <span className="py-1 pr-1 text-muted">Try</span>
        {profile.heroQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="rounded-full border border-line px-3 py-1 text-fg-2 transition hover:border-soft hover:text-fg"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
