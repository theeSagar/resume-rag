import { CloudSun, FileText, MessageCircle, type LucideIcon } from "lucide-react";
import type { Route } from "../types";

// Routes differ by icon and label only; colour stays neutral to match the rest of the site.
const NEUTRAL = "bg-tile text-fg-2 ring-line";

export const ROUTE_META: Record<Route, { label: string; className: string; Icon: LucideIcon }> = {
  resume: {
    label: "Resume",
    className: NEUTRAL,
    Icon: FileText,
  },
  weather: {
    label: "Weather",
    className: NEUTRAL,
    Icon: CloudSun,
  },
  general: {
    label: "General",
    className: NEUTRAL,
    Icon: MessageCircle,
  },
};

export function RouteBadge({ route }: { route: Route }) {
  const { label, className, Icon } = ROUTE_META[route];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${className}`}>
      <Icon className="size-3.5" aria-hidden />
      {label} agent
    </span>
  );
}
