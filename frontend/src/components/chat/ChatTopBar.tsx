import { ArrowLeft, SlidersHorizontal, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { profile } from "../../data/profile";
import type { HealthStatus } from "../../hooks/useHealth";
import { Avatar } from "../Avatar";
import { HealthDot } from "./HealthDot";
import { ThemeToggle } from "../layout/ThemeToggle";
import { ghostButtonClass } from "../ui";

interface Props {
  health: HealthStatus;
  showDetails: boolean;
  onToggleDetails: () => void;
  onClear: () => void;
  canClear: boolean;
}

export function ChatTopBar({ health, showDetails, onToggleDetails, onClear, canClear }: Props) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] font-medium text-muted transition hover:text-fg"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Profile
        </Link>
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">Ask {profile.firstName}'s AI</p>
            <p className="truncate text-xs text-muted max-sm:hidden">Answers grounded in my résumé</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="max-sm:hidden">
            <HealthDot status={health} />
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={showDetails}
            onClick={onToggleDetails}
            className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-xs font-medium text-muted transition hover:text-fg"
          >
            <span
              aria-hidden
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition ${showDetails ? "bg-fg" : "bg-line"}`}
            >
              <span
                className={`inline-block size-3 rounded-full bg-canvas shadow transition ${showDetails ? "translate-x-3.5" : "translate-x-0.5"}`}
              />
            </span>
            <SlidersHorizontal className="size-3.5 max-sm:hidden" aria-hidden />
            <span className="max-sm:sr-only">Show details</span>
          </button>
          <button type="button" onClick={onClear} disabled={!canClear} aria-label="Clear chat" className={ghostButtonClass}>
            <Trash2 className="size-3.5" aria-hidden />
            <span className="max-sm:hidden">Clear</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
