"use client";

import { useEffect, useState } from "react";

type ProxyOk = { ok: true; data: unknown; fetchedAt: string };
type ProxyFail = { ok: false; reason: string; fetchedAt: string };

export type PolledResult<T> =
  | { kind: "loading" }
  | { kind: "ok"; data: T; fetchedAt: string }
  | { kind: "stale"; data: T; lastFetchedAt: string; reason: string }
  | { kind: "down"; reason: string };

/** Generic polling JSON fetch helper used by panels that need richer data
 * than useServiceStatus exposes. Wraps the Hub /api/* proxy responses. */
export function usePolledJson<T>(endpoint: string, pollMs = 30_000): PolledResult<T> {
  const [state, setState] = useState<PolledResult<T>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    let lastGood: { data: T; fetchedAt: string } | null = null;

    async function tick() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const body: ProxyOk | ProxyFail = await res.json();
        if (cancelled) return;
        if (body.ok) {
          lastGood = { data: body.data as T, fetchedAt: body.fetchedAt };
          setState({ kind: "ok", data: body.data as T, fetchedAt: body.fetchedAt });
        } else if (lastGood) {
          setState({
            kind: "stale",
            data: lastGood.data,
            lastFetchedAt: lastGood.fetchedAt,
            reason: body.reason,
          });
        } else {
          setState({ kind: "down", reason: body.reason });
        }
      } catch {
        if (cancelled) return;
        if (lastGood) {
          setState({
            kind: "stale",
            data: lastGood.data,
            lastFetchedAt: lastGood.fetchedAt,
            reason: "network",
          });
        } else {
          setState({ kind: "down", reason: "network" });
        }
      }
    }

    void tick();
    const id = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [endpoint, pollMs]);

  return state;
}
