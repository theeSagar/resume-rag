import { useEffect, useState } from "react";
import { getHealth } from "../api/client";

export type HealthStatus = "checking" | "online" | "offline";
export const HEALTH_POLL_MS = 30_000;

export function useHealth(intervalMs: number = HEALTH_POLL_MS): HealthStatus {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const ok = await getHealth();
      if (!cancelled) setStatus(ok ? "online" : "offline");
    };
    void check();
    const id = setInterval(() => void check(), intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}
