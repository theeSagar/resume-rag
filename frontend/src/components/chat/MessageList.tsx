import { useEffect, useRef } from "react";
import type { Message } from "../../types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface Props {
  messages: Message[];
  showDetails: boolean;
  onRetry: (id: string) => void;
}

export function MessageList({ messages, showDetails, onRetry }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<HTMLDivElement>(null);
  const last = messages[messages.length - 1];

  // A new question: bring the newest message and the composer into view.
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  // An answer arrived: show its first line, not its last.
  useEffect(() => {
    if (last?.role === "assistant" && last.status === "done") {
      lastRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  }, [last?.id, last?.role, last?.status]);

  return (
    <div aria-live="polite" className="space-y-6">
      {messages.map((m, i) => (
        <div
          key={m.id}
          data-message-id={m.id}
          ref={i === messages.length - 1 ? lastRef : undefined}
          className="scroll-mt-24"
        >
          {m.role === "user" ? (
            <UserMessage content={m.content} />
          ) : (
            <AssistantMessage message={m} showDetails={showDetails} onRetry={onRetry} />
          )}
        </div>
      ))}
      <div ref={endRef} className="scroll-mb-40" />
    </div>
  );
}
