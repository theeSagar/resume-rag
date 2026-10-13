# app/rate_limit.py
"""In-memory, per-IP sliding-window limits for /chat, so one visitor or script can't run up LLM costs.

State lives in this process: it resets on restart and isn't shared between workers.
That is enough for a single-instance portfolio deployment; use Redis if you scale out.
"""
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.config import settings

MINUTE = 60
DAY = 24 * 60 * 60

# ip -> timestamps of that IP's accepted requests within the last day
_hits: dict[str, deque[float]] = defaultdict(deque)
_last_sweep = 0.0


def _client_ip(request: Request) -> str:
    # Behind a host's proxy, run uvicorn with --proxy-headers so request.client is the visitor,
    # not the proxy. Trusting X-Forwarded-For directly would let anyone spoof a fresh IP.
    return request.client.host if request.client else "unknown"


def _sweep(now: float) -> None:
    """Drop IPs with no hits in the last day so memory doesn't grow forever."""
    global _last_sweep
    if now - _last_sweep < MINUTE:
        return
    _last_sweep = now
    for ip in [ip for ip, hits in _hits.items() if not hits or now - hits[-1] > DAY]:
        del _hits[ip]


def enforce_chat_rate_limit(request: Request) -> None:
    """FastAPI dependency: raise 429 when this IP is over its per-minute or per-day limit."""
    now = time.monotonic()
    _sweep(now)
    hits = _hits[_client_ip(request)]
    while hits and now - hits[0] > DAY:
        hits.popleft()

    last_minute = sum(1 for t in hits if now - t <= MINUTE)
    if last_minute >= settings.rate_limit_per_minute:
        oldest_in_window = next(t for t in hits if now - t <= MINUTE)
        retry_after = int(MINUTE - (now - oldest_in_window)) + 1
        raise HTTPException(429, "Too many questions. Please wait a minute.", headers={"Retry-After": str(retry_after)})
    if len(hits) >= settings.rate_limit_per_day:
        retry_after = int(DAY - (now - hits[0])) + 1
        raise HTTPException(429, "Daily question limit reached. Please come back tomorrow.", headers={"Retry-After": str(retry_after)})

    hits.append(now)
