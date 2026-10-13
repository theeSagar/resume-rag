import type { HealthStatus } from "../../hooks/useHealth";

const META: Record<HealthStatus, { label: string; dot: string; title: string }> = {
  checking: { label: "Checking", dot: "bg-soft", title: "Checking whether the AI backend is reachable…" },
  online: { label: "AI online", dot: "bg-emerald-500", title: "The AI backend is reachable" },
  offline: { label: "AI offline", dot: "bg-rose-500", title: "The AI backend is not reachable. Start uvicorn on :8000." },
};

export function HealthDot({ status }: { status: HealthStatus }) {
  const meta = META[status];
  return (
    <span role="status" title={meta.title} className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden className={`size-1.5 rounded-full ${meta.dot}`} />
      <span className="max-sm:sr-only">{meta.label}</span>
    </span>
  );
}
