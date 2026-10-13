// Mirrors app/schemas.py on the backend.
export interface ChatRequest {
  query: string;
}

export interface ChatResponse {
  answer: string;
  source: string;
  chunks_used: number;
}

export type Route = "resume" | "weather" | "general";

/** The backend may add agents later; anything unknown is shown as "general". */
export function toRoute(source: string): Route {
  return source === "resume" || source === "weather" ? source : "general";
}

/** Reserved for Phase 2.3 (citations). The backend does not send these yet. */
export interface Citation {
  content: string;
  page: number | null;
  similarity: number;
}

export type ApiErrorKind = "network" | "server" | "timeout" | "bad_response" | "rate_limited";

export interface MessageError {
  message: string;
  status?: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "pending" | "done" | "error";
  /** Assistant messages only: the question being answered (used by Retry). */
  query?: string;
  route?: Route;
  chunksUsed?: number;
  latencyMs?: number;
  error?: MessageError;
  citations?: Citation[];
}
