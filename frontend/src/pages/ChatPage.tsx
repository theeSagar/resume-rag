import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChatSidebar } from "../components/chat/ChatSidebar";
import { ChatTopBar } from "../components/chat/ChatTopBar";
import { Composer } from "../components/chat/Composer";
import { EmptyState } from "../components/chat/EmptyState";
import { MessageList } from "../components/chat/MessageList";
import { OfflineBanner } from "../components/chat/OfflineBanner";
import { chatSuggestions } from "../data/profile";
import type { UseChat } from "../hooks/useChat";
import type { HealthStatus } from "../hooks/useHealth";
import { usePreferences } from "../hooks/usePreferences";

interface Props {
  chat: UseChat;
  health: HealthStatus;
}

export function ChatPage({ chat, health }: Props) {
  const { showDetails, setShowDetails } = usePreferences();
  const [draft, setDraft] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Remembers which navigation's question was already handled (StrictMode runs effects twice).
  const handledKey = useRef<string | null>(null);
  const { send } = chat;

  useEffect(() => {
    const ask = (location.state as { ask?: unknown } | null)?.ask;
    if (typeof ask !== "string" || handledKey.current === location.key) return;
    handledKey.current = location.key;
    if (!send(ask)) setDraft(ask);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, send, navigate]);

  const askNow = (question: string) => {
    if (!send(question)) setDraft(question);
  };

  const submit = () => {
    if (send(draft)) setDraft("");
  };

  const hasMessages = chat.messages.length > 0;
  // Mobile has no sidebar: offer suggestions (incl. the agent demos) while the conversation is empty or short.
  const showQuickChips = chat.messages.length <= 4;

  return (
    <div className="flex min-h-dvh flex-col">
      <ChatTopBar
        health={health}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        onClear={chat.clear}
        canClear={hasMessages && !chat.isPending}
      />
      <div className="mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Chat help" className="hidden border-r border-line lg:block">
          <div className="sticky top-[61px] max-h-[calc(100dvh-61px)] overflow-y-auto">
            <ChatSidebar onAsk={askNow} />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col px-4 sm:px-8">
          {health === "offline" && !bannerDismissed && <OfflineBanner onDismiss={() => setBannerDismissed(true)} />}
          <div className="mx-auto w-full max-w-[760px] flex-1 py-8">
            {hasMessages && <h1 className="sr-only">Chat with Sagar's AI</h1>}
            {hasMessages ? (
              <MessageList messages={chat.messages} showDetails={showDetails} onRetry={chat.retry} />
            ) : (
              <EmptyState onAsk={askNow} />
            )}
          </div>
          <div className="no-print sticky bottom-0 -mx-4 bg-gradient-to-t from-canvas via-canvas to-transparent px-4 pb-4 pt-6 sm:-mx-8 sm:px-8">
            <div className="mx-auto w-full max-w-[760px]">
              {showQuickChips && (
                <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto lg:hidden">
                  {chatSuggestions.map((s) => (
                    <button
                      key={s.question}
                      type="button"
                      onClick={() => askNow(s.question)}
                      className="shrink-0 rounded-full border border-line bg-tile px-3 py-1 text-xs text-fg-2 focus-visible:outline-offset-[-2px]"
                    >
                      {s.question}
                    </button>
                  ))}
                </div>
              )}
              <Composer value={draft} onChange={setDraft} onSubmit={submit} busy={chat.isPending} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
