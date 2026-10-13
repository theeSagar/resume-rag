import { Download, Mail } from "lucide-react";
import { chatSuggestions, profile } from "../../data/profile";
import { howItAnswers } from "../../data/project";
import { Avatar } from "../Avatar";

const smallButton =
  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-medium transition";

export function ChatSidebar({ onAsk }: { onAsk: (question: string) => void }) {
  return (
    <div className="space-y-8 p-6">
      <div>
        <div className="flex items-center gap-3">
          <Avatar size="md" />
          <div className="leading-tight">
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="text-xs text-muted">{profile.headline}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <a
            href={profile.resumeUrl}
            download={profile.resumeFileName}
            className={`${smallButton} bg-fg text-canvas hover:opacity-85`}
          >
            <Download className="size-3.5" aria-hidden />
            Résumé
          </a>
          <a href={`mailto:${profile.email}`} className={`${smallButton} border border-line text-fg hover:border-soft`}>
            <Mail className="size-3.5" aria-hidden />
            Email
          </a>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted">Try asking</p>
        <ul className="mt-2 -mx-2">
          {chatSuggestions.map((s) => (
            <li key={s.question}>
              <button
                type="button"
                onClick={() => onAsk(s.question)}
                className="w-full rounded-lg px-2 py-1.5 text-left text-[13px] text-fg-2 transition hover:bg-tile-2 hover:text-fg"
              >
                {s.question}
                {s.hint && <span className="text-muted"> · {s.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium text-muted">How it answers</p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{howItAnswers}</p>
      </div>
    </div>
  );
}
