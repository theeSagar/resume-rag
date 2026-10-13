import type { ApiErrorKind, ChatRequest, ChatResponse } from "../types";

export const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";
export const CHAT_TIMEOUT_MS = 60_000;
const HEALTH_TIMEOUT_MS = 5_000;

export const ERROR_MESSAGES: Record<ApiErrorKind, string> = {
  network: "Can't reach the assistant. Is the API running on :8000?",
  server: "Something went wrong on the server for this question.",
  timeout: "This is taking longer than usual. Please try again.",
  bad_response: "Received an unexpected response from the server.",
  rate_limited: "You've asked a lot of questions in a short time. Please wait a minute and try again.",
};

/** Gateway statuses: the dev proxy (vite.config.ts) and hosting platforms return these when the API is down. */
const UNREACHABLE_STATUSES = new Set([502, 503, 504]);

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, status?: number) {
    super(ERROR_MESSAGES[kind]);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function isChatResponse(data: unknown): data is ChatResponse {
  if (typeof data !== "object" || data === null) return false;
  const body = data as Record<string, unknown>;
  return (
    typeof body.answer === "string" &&
    typeof body.source === "string" &&
    typeof body.chunks_used === "number"
  );
}

export async function sendChat(
  query: string,
  timeoutMs: number = CHAT_TIMEOUT_MS,
): Promise<ChatResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const body: ChatRequest = { query };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(controller.signal.aborted ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }

  if (UNREACHABLE_STATUSES.has(res.status)) throw new ApiError("network", res.status);
  if (res.status === 429) throw new ApiError("rate_limited", res.status);
  if (res.status >= 500) throw new ApiError("server", res.status);
  if (!res.ok) throw new ApiError("bad_response", res.status);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new ApiError("bad_response", res.status);
  }
  if (!isChatResponse(data)) throw new ApiError("bad_response", res.status);
  return data;
}

export async function getHealth(timeoutMs: number = HEALTH_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    return (data as { status?: unknown } | null)?.status === "ok";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
