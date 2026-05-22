"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Banner } from "@coinbase/cds-web/banner";
import { Spinner } from "@coinbase/cds-web/loaders";
import { HStack, VStack, Box } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";

type ProxyOk = { ok: true; data: unknown; fetchedAt: string };
type ProxyFail = { ok: false; reason: string; status?: number; fetchedAt: string };

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: unknown; fetchedAt: string }
  | { kind: "stale"; lastData: unknown; lastFetchedAt: string; reason: string }
  | { kind: "down"; reason: string };

type Props = {
  name: string;
  endpoint: string;
  pollMs?: number;
  index?: number;
};

const FAILURE_LABEL: Record<string, string> = {
  timeout: "Timed out after 5s",
  unreachable: "Could not reach service",
  "non-2xx": "Service returned an error response",
  "non-json": "Service returned unexpected format",
};

function reasonLabel(r: string): string {
  return FAILURE_LABEL[r] ?? r;
}

function formatScalar(v: unknown): string {
  if (v === null) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(3);
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function topLevelScalars(data: unknown, max = 6): Array<[string, string]> {
  if (!data || typeof data !== "object") return [];
  const entries: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (entries.length >= max) break;
    if (v == null || typeof v === "object") continue;
    entries.push([k, formatScalar(v)]);
  }
  return entries;
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function ServiceStatusCard({ name, endpoint, pollMs = 30_000, index = 0 }: Props) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const lastDataRef = useRef<{ data: unknown; fetchedAt: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        const body: ProxyOk | ProxyFail = await res.json();
        if (cancelled) return;
        if (body.ok) {
          lastDataRef.current = { data: body.data, fetchedAt: body.fetchedAt };
          setState({ kind: "ok", data: body.data, fetchedAt: body.fetchedAt });
        } else {
          const reason = reasonLabel(body.reason);
          if (lastDataRef.current) {
            setState({
              kind: "stale",
              lastData: lastDataRef.current.data,
              lastFetchedAt: lastDataRef.current.fetchedAt,
              reason,
            });
          } else {
            setState({ kind: "down", reason });
          }
        }
      } catch {
        if (cancelled) return;
        if (lastDataRef.current) {
          setState({
            kind: "stale",
            lastData: lastDataRef.current.data,
            lastFetchedAt: lastDataRef.current.fetchedAt,
            reason: "Hub API unreachable",
          });
        } else {
          setState({ kind: "down", reason: "Hub API unreachable" });
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

  const statusKind =
    state.kind === "ok" ? "online" : state.kind === "stale" ? "warning" : "offline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.05 }}
    >
      <ContentCard
        padding={4}
        gap={3}
        minHeight={220}
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-bgLine)",
          borderRadius: 16,
        }}
      >
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          <HStack alignItems="center" gap={2}>
            <StatusDot status={statusKind} ariaLabel={`${name} status: ${state.kind}`} />
            <TextTitle3 as="h3">{name}</TextTitle3>
          </HStack>
          {(state.kind === "ok" || state.kind === "stale") && (
            <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
              {formatTimestamp(state.kind === "ok" ? state.fetchedAt : state.lastFetchedAt)}
            </TextCaption>
          )}
        </HStack>

        {state.kind === "loading" && (
          <Box display="flex" justifyContent="center" alignItems="center" padding={4}>
            <Spinner size={20} />
          </Box>
        )}

        {state.kind === "down" && (
          <Banner variant="warning" startIcon="warning" title="Service offline">
            {state.reason}
          </Banner>
        )}

        {state.kind === "stale" && (
          <VStack gap={2}>
            <Banner variant="warning" startIcon="warning" title="Stale data">
              {state.reason}. Showing last known values.
            </Banner>
            <MetricList entries={topLevelScalars(state.lastData)} muted />
          </VStack>
        )}

        {state.kind === "ok" && <MetricList entries={topLevelScalars(state.data)} />}
      </ContentCard>
    </motion.div>
  );
}

function MetricList({
  entries,
  muted = false,
}: {
  entries: Array<[string, string]>;
  muted?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
        Connected. No metrics reported.
      </TextBody>
    );
  }
  const labelColor = muted ? "var(--color-fgMuted)" : "var(--color-fgMuted)";
  const valueColor = muted ? "var(--color-fgMuted)" : "var(--color-fg)";
  return (
    <VStack gap={1.5}>
      {entries.map(([k, v]) => (
        <HStack
          key={k}
          justifyContent="space-between"
          alignItems="baseline"
          width="100%"
          style={{
            paddingBottom: 6,
            borderBottom: "1px solid var(--color-bgLine)",
          }}
        >
          <TextLabel2 as="span" style={{ color: labelColor, fontWeight: 400 }}>
            {k}
          </TextLabel2>
          <TextBody
            as="span"
            style={{
              color: valueColor,
              fontVariantNumeric: "tabular-nums",
              fontWeight: 500,
            }}
          >
            {v}
          </TextBody>
        </HStack>
      ))}
    </VStack>
  );
}
