import { profile } from "../data/profile";

const SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
  lg: "size-12 text-base",
} as const;

export function Avatar({ size }: { size: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-fg font-semibold tracking-tight text-canvas ${SIZES[size]}`}
    >
      {profile.initials}
    </span>
  );
}
