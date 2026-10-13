import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, ERROR_MESSAGES, sendChat } from "../api/client";
import { toRoute, type Message } from "../types";

export const CHAT_STORAGE_KEY = "resume-rag:chat";
export const MAX_STORED_MESSAGES = 50;
export const INTERRUPTED_MESSAGE = "This answer was interrupted when the page reloaded. Try again.";

export interface UseChat {
  messages: Message[];
  isPending: boolean;
  /** Returns false when ignored: empty input or a request already in flight. */
  send: (text: string) => boolean;
  retry: (assistantId: string) => void;
  clear: () => void;
}

let idCounter = 0;
function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${idCounter}`;
}

function isStoredMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    (m.status === "pending" || m.status === "done" || m.status === "error")
  );
}

function finiteOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/** Stored data may come from an older/newer build or be hand-edited: never trust optional fields. */
function normalise(m: Message): Message {
  const raw = m as unknown as Record<string, unknown>;
  const error = raw.error as Record<string, unknown> | undefined;
  const base: Message = {
    id: m.id,
    role: m.role,
    content: m.content,
    status: m.status,
    query: typeof raw.query === "string" ? raw.query : undefined,
    route: typeof raw.route === "string" ? toRoute(raw.route) : undefined,
    chunksUsed: finiteOrUndefined(raw.chunksUsed),
    latencyMs: finiteOrUndefined(raw.latencyMs),
  };
  if (m.status === "pending") return { ...base, status: "error", error: { message: INTERRUPTED_MESSAGE } };
  if (m.status === "error") {
    return {
      ...base,
      error: {
        message: typeof error?.message === "string" ? error.message : ERROR_MESSAGES.bad_response,
        status: finiteOrUndefined(error?.status),
      },
    };
  }
  return base;
}

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredMessage).map(normalise);
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  } catch {
    // Storage full or blocked: the chat still works, it just isn't saved.
  }
}

export function useChat(): UseChat {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isPending, setIsPending] = useState(false);
  // A ref (not state) guards in-flight requests so two sends in the same tick can't both pass.
  const pendingRef = useRef(false);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    saveMessages(messages);
  }, [messages]);

  const patch = useCallback((id: string, changes: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }, []);

  const run = useCallback(
    async (assistantId: string, query: string) => {
      pendingRef.current = true;
      setIsPending(true);
      const started = performance.now();
      try {
        const res = await sendChat(query);
        patch(assistantId, {
          status: "done",
          content: res.answer,
          route: toRoute(res.source),
          chunksUsed: res.chunks_used,
          latencyMs: Math.round(performance.now() - started),
          error: undefined,
        });
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("bad_response");
        patch(assistantId, { status: "error", error: { message: apiError.message, status: apiError.status } });
      } finally {
        pendingRef.current = false;
        setIsPending(false);
      }
    },
    [patch],
  );

  const send = useCallback(
    (text: string) => {
      const query = text.trim();
      if (!query || pendingRef.current) return false;
      pendingRef.current = true;
      const assistantId = newId();
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "user", content: query, status: "done" },
        { id: assistantId, role: "assistant", content: "", status: "pending", query },
      ]);
      void run(assistantId, query);
      return true;
    },
    [run],
  );

  const retry = useCallback(
    (assistantId: string) => {
      if (pendingRef.current) return;
      const target = messagesRef.current.find((m) => m.id === assistantId);
      if (!target || target.role !== "assistant" || !target.query) return;
      pendingRef.current = true;
      patch(assistantId, { status: "pending", content: "", error: undefined });
      void run(assistantId, target.query);
    },
    [patch, run],
  );

  const clear = useCallback(() => {
    if (pendingRef.current) return;
    setMessages([]);
  }, []);

  return { messages, isPending, send, retry, clear };
}
