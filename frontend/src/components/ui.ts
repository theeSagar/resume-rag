// Shared Tailwind class strings built on the Paper + Ink tokens in index.css.
export const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-tile-2 hover:text-fg";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-canvas transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-tile px-4 py-2 text-sm font-medium text-fg transition hover:border-soft";

export const ghostButtonClass =
  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted transition hover:bg-tile-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

/** Quiet inline text link (underline appears on hover). */
export const textLinkClass =
  "text-fg underline decoration-line decoration-1 underline-offset-4 transition hover:decoration-fg";
