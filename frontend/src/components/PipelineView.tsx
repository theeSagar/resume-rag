import {
  ArrowRight,
  Bot,
  CloudSun,
  Cpu,
  Database,
  Layers,
  MessageSquare,
  Route as RouteIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "../types";
import { ROUTE_META } from "./RouteBadge";

export interface PipelineNode {
  id: string;
  label: string;
  detail: string;
  Icon: LucideIcon;
}

const QUESTION: PipelineNode = { id: "question", label: "Question", detail: "from you", Icon: MessageSquare };
const ROUTER: PipelineNode = { id: "router", label: "Router", detail: "LLM classifier", Icon: RouteIcon };
const LLM: PipelineNode = { id: "llm", label: "Llama 3.3 70B", detail: "writes the answer", Icon: Cpu };
const ANSWER: PipelineNode = { id: "answer", label: "Answer", detail: "shown here", Icon: Sparkles };

/** Mirrors app/agents/dispatcher.py: which steps each route goes through. */
export function pipelineFor(route: Route, chunksUsed?: number): PipelineNode[] {
  switch (route) {
    case "resume":
      return [
        QUESTION,
        ROUTER,
        { id: "agent", label: "Resume agent", detail: "retrieval-augmented", Icon: Bot },
        { id: "embed", label: "Embed", detail: "nomic-embed-text", Icon: Layers },
        {
          id: "vector",
          label: "pgvector · Neon",
          detail: chunksUsed === undefined ? "similarity search" : `${chunksUsed} chunks retrieved`,
          Icon: Database,
        },
        LLM,
        ANSWER,
      ];
    case "weather":
      return [
        QUESTION,
        ROUTER,
        { id: "agent", label: "Weather agent", detail: "tool calling", Icon: Bot },
        { id: "tool", label: "Open-Meteo", detail: "live weather API", Icon: CloudSun },
        LLM,
        ANSWER,
      ];
    case "general":
      return [QUESTION, ROUTER, { id: "agent", label: "General agent", detail: "direct chat", Icon: Bot }, LLM, ANSWER];
  }
}

export const PENDING_PIPELINE: PipelineNode[] = [
  QUESTION,
  ROUTER,
  { id: "agent", label: "Agent", detail: "picked by the router", Icon: Bot },
  LLM,
];

interface Props {
  route?: Route;
  chunksUsed?: number;
  pending?: boolean;
}

export function PipelineView({ route, chunksUsed, pending = false }: Props) {
  const inProgress = pending || !route;
  const nodes = route && !pending ? pipelineFor(route, chunksUsed) : PENDING_PIPELINE;
  const nodeTone =
    route && !pending
      ? `ring-1 ring-inset border-transparent ${ROUTE_META[route].className}`
      : "pipeline-pending-node border-line bg-tile text-fg-2";

  return (
    <figure
      aria-label={inProgress ? "Answer pipeline, in progress" : "How this answer was produced"}
      className="rounded-xl border border-line bg-tile-2 p-3"
    >
      <figcaption className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-xs font-medium text-fg-2">
        {inProgress ? (
          <>
            Thinking…
            <span className="font-normal text-muted">typical stages, not live progress</span>
          </>
        ) : (
          "How this answer was produced"
        )}
      </figcaption>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {nodes.map((node, i) => (
          <li key={node.id} className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${nodeTone}`}
              style={inProgress ? { animationDelay: `${i * 0.6}s` } : undefined}
            >
              <node.Icon className="size-3.5 shrink-0" aria-hidden />
              <div className="leading-tight">
                <div className="font-mono text-[11px] font-medium">{node.label}</div>
                <div className="text-[11px] opacity-75">{node.detail}</div>
              </div>
            </div>
            {i < nodes.length - 1 && <ArrowRight className="size-3.5 shrink-0 text-soft" aria-hidden />}
          </li>
        ))}
      </ol>
    </figure>
  );
}
