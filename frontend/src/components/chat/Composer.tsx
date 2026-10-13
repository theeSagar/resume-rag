import { ArrowUp, LoaderCircle } from "lucide-react";
import { useLayoutEffect, useRef, type KeyboardEvent } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy: boolean;
}

const MAX_HEIGHT_PX = 200;

export function Composer({ value, onChange, onSubmit, busy }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !busy;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) onSubmit();
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSubmit();
        }}
        className="flex items-end gap-2 rounded-2xl border border-line bg-tile p-2 pl-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition focus-within:border-soft focus-within:ring-2 focus-within:ring-fg/10"
      >
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about Sagar
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          maxLength={1000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Sagar's projects, skills or experience…"
          className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm leading-5 outline-none placeholder:text-soft"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-fg text-canvas transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : (
            <ArrowUp className="size-4" aria-hidden />
          )}
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted">
        Enter to send · Shift+Enter for a new line · AI answers can be imperfect
      </p>
    </div>
  );
}
