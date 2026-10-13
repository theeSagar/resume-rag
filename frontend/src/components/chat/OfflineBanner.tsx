import { TriangleAlert, X } from "lucide-react";

export function OfflineBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="flex-1">
        Backend offline. Run{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs dark:bg-amber-500/20">
          uvicorn app.main:app --reload
        </code>{" "}
        from the resume_rag folder.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-md p-0.5 transition hover:bg-amber-100 dark:hover:bg-amber-500/20"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
