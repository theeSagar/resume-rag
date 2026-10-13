import { Check, ChevronDown, Copy, RotateCcw, Sparkles, TriangleAlert, Workflow } from "lucide-react";
import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types";
import { PipelineView } from "../PipelineView";
import { RouteBadge } from "../RouteBadge";
import { ghostButtonClass } from "../ui";

interface Props {
  message: Message;
  showDetails: boolean;
  onRetry: (id: string) => void;
}

const MARKDOWN_COMPONENTS: Components = {
  a: (props) => {
    const { node, ...rest } = props;
    void node;
    return <a {...rest} target="_blank" rel="noreferrer" />;
  },
  table: (props) => {
    const { node, ...rest } = props;
    void node;
    return (
      <div className="overflow-x-auto">
        <table {...rest} />
      </div>
    );
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or permissions): nothing else to do.
    }
  };
  return (
    <button type="button" onClick={copy} className={ghostButtonClass} aria-label={copied ? "Copied" : "Copy answer"}>
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="max-sm:sr-only">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function AssistantMessage({ message, showDetails, onRetry }: Props) {
  // null = follow the global "Show details" toggle until the visitor opens/closes this one.
  const [pipelineOverride, setPipelineOverride] = useState<boolean | null>(null);
  const pipelineOpen = pipelineOverride ?? showDetails;

  return (
    <div className="flex gap-3">
      <span aria-hidden className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-tile text-fg-2">
        <Sparkles className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {message.status === "pending" && (
          <div className="space-y-3 rounded-2xl border border-line bg-tile p-4" role="status">
            <p className="text-[13px] text-muted">Routing your question → searching my résumé…</p>
            <div className="shimmer w-3/5" aria-hidden />
            <PipelineView pending />
          </div>
        )}

        {message.status === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <div className="flex items-start gap-2.5">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="flex-1">
                <p>{message.error?.message}</p>
                {showDetails && message.error?.status !== undefined && (
                  <p className="mt-1 font-mono text-xs opacity-75">HTTP {message.error.status}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30 dark:hover:bg-rose-500/20"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Try again
            </button>
          </div>
        )}

        {message.status === "done" && (
          <div className="pt-1">
            <div className="prose prose-sm prose-zinc max-w-none break-words dark:prose-invert prose-p:leading-relaxed prose-a:text-accent prose-strong:text-fg">
              <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {message.content}
              </Markdown>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-xs text-muted">
              <RouteBadge route={message.route ?? "general"} />
              {showDetails && message.chunksUsed !== undefined && message.chunksUsed > 0 && (
                <span>{message.chunksUsed} chunks</span>
              )}
              {showDetails && message.latencyMs !== undefined && <span>{(message.latencyMs / 1000).toFixed(1)}s</span>}
              <div className="ml-auto flex items-center gap-1">
                <CopyButton text={message.content} />
                <button
                  type="button"
                  onClick={() => setPipelineOverride(!pipelineOpen)}
                  aria-expanded={pipelineOpen}
                  className={ghostButtonClass}
                >
                  <Workflow className="size-3.5" aria-hidden />
                  How it was answered
                  <ChevronDown className={`size-3.5 transition ${pipelineOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
              </div>
            </div>

            {pipelineOpen && (
              <div className="mt-3">
                <PipelineView route={message.route ?? "general"} chunksUsed={message.chunksUsed} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
