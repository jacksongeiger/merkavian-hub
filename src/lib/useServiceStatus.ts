"use client";

import { useEffect, useState } from "react";

type ProxyOk = { ok: true; data: unknown; fetchedAt: string };
type ProxyFail = { ok: false; reason: string; fetchedAt: string };
export type ServiceStatus = "loading" | "ok" | "down";

/** Lightweight poller that only resolves the status (not the full data) — used
 * by the TopNav status dots so we don't double-render full payloads in two
 * places. ServiceStatusCard does its own (richer) poll. */
export function useServiceStatus(endpoint: string, pollMs = 30_000): ServiceStatus {
  const [status, setStatus] = useState<ServiceStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const body: ProxyOk | ProxyFail = await res.json();
        if (!cancelled) setStatus(body.ok ? "ok" : "down");
      } catch {
        if (!cancelled) setStatus("down");
      }
    }

    void tick();
    const id = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [endpoint, pollMs]);

  return status;
}
