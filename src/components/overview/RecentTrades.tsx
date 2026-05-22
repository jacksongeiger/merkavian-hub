"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ContentCard } from "@coinbase/cds-web/cards";
import { HStack, VStack } from "@coinbase/cds-web/layout";
import { Tag } from "@coinbase/cds-web/tag";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { useHubSettings } from "@/lib/use-hub-settings";

// --- shared fetch -----------------------------------------------------------

type ProxyOk = { ok: true; data: unknown; fetchedAt: string };
type ProxyFail = { ok: false; reason: string; status?: number; fetchedAt: string };
type ProxyBody = ProxyOk | ProxyFail;

async function fetchProxy(endpoint: string): Promise<ProxyBody | null> {
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    return (await res.json()) as ProxyBody;
  } catch {
    return null;
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// --- crypto trades ----------------------------------------------------------

type CryptoTrade = {
  pair: string;
  action: string; // "BUY" | "SELL" | other
  pnlDollars: number | null;
  exitTime: string | null;
};

function parseCryptoTrades(data: unknown): CryptoTrade[] {
  if (!isObj(data)) return [];
  const hist = data.trade_history;
  if (!Array.isArray(hist)) return [];
  const rows: CryptoTrade[] = [];
  for (const row of hist) {
    if (!isObj(row)) continue;
    const pair = asStr(row.pair);
    if (!pair) continue;
    const action = (asStr(row.action) ?? "").toUpperCase() || "—";
    const pnlDollars = asNum(row.pnl_dollars);
    const exitTime =
      asStr(row.exit_time) ?? asStr(row.entry_time) ?? null;
    rows.push({ pair, action, pnlDollars, exitTime });
  }
  // Latest first.
  return rows.slice().reverse().slice(0, 5);
}

// --- polybot trades ---------------------------------------------------------

type PolyTrade = {
  label: string;
  side: string;
  pnlUsd: number | null;
  exitedAt: number | null;
};

function parsePolyTrades(data: unknown): PolyTrade[] {
  if (!isObj(data)) return [];
  const closed = data.closed_recent;
  if (!Array.isArray(closed)) return [];
  const rows: PolyTrade[] = [];
  for (const row of closed) {
    if (!isObj(row)) continue;
    const label =
      asStr(row.market_question) ?? asStr(row.market_id) ?? "Market";
    const side = (asStr(row.side) ?? "").toUpperCase() || "—";
    const pnlUsd = asNum(row.pnl_usd);
    const exitedAt = asNum(row.exited_at);
    rows.push({ label, side, pnlUsd, exitedAt });
  }
  return rows.slice(0, 5);
}

// --- formatting -------------------------------------------------------------

function formatTradeTime(input: string | number | null): string {
  if (input === null) return "—";
  try {
    const d =
      typeof input === "number"
        ? // polybot stores seconds-since-epoch in `exited_at`
          new Date(input * 1000)
        : new Date(input);
    if (Number.isNaN(d.getTime())) return "—";
    const month = d.toLocaleDateString(undefined, { month: "short" });
    const day = d.toLocaleDateString(undefined, { day: "2-digit" });
    const time = d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${month} ${day}, ${time}`;
  } catch {
    return "—";
  }
}

function formatPnl(n: number | null): { text: string; tone: "pos" | "neg" | "muted" } {
  if (n === null) return { text: "—", tone: "muted" };
  const sign = n >= 0 ? "+" : "-";
  return {
    text: `${sign}$${Math.abs(n).toFixed(2)}`,
    tone: n >= 0 ? "pos" : "neg",
  };
}

function actionScheme(action: string): "green" | "red" | "gray" {
  if (action === "BUY" || action === "YES") return "green";
  if (action === "SELL" || action === "NO") return "red";
  return "gray";
}

// --- shared card shell ------------------------------------------------------

function TradeCard({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.05 }}
      style={{ width: "100%", height: "100%", display: "flex" }}
    >
      <ContentCard
        padding={4}
        gap={3}
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-bgLine)",
          borderRadius: 16,
          width: "100%",
          height: "100%",
        }}
      >
        <TextTitle3 as="h3">{title}</TextTitle3>
        {children}
      </ContentCard>
    </motion.div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <TextBody
      as="span"
      style={{
        color: "var(--color-fgMuted)",
        textTransform: "none",
        letterSpacing: 0,
      }}
    >
      {message}
    </TextBody>
  );
}

// --- CryptoBot trades column ------------------------------------------------

export function CryptoBotTradesCard({ index = 0 }: { index?: number }) {
  const [trades, setTrades] = useState<CryptoTrade[] | null>(null);
  const [errored, setErrored] = useState(false);
  const { settings } = useHubSettings();
  const pollMs = settings.pollingMs ?? 30_000;

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const body = await fetchProxy("/api/cryptobot/portfolio");
      if (cancelled) return;
      if (!body || !body.ok) {
        setErrored(true);
        setTrades([]);
        return;
      }
      setErrored(false);
      setTrades(parseCryptoTrades(body.data));
    }
    void tick();
    const id = pollMs > 0 ? setInterval(() => void tick(), pollMs) : undefined;
    return () => {
      cancelled = true;
      if (id !== undefined) clearInterval(id);
    };
  }, [pollMs]);

  return (
    <TradeCard title="Recent Crypto Bot trades" index={index}>
      {trades === null && <EmptyRow message="Loading..." />}
      {trades !== null && errored && <EmptyRow message="Service offline" />}
      {trades !== null && !errored && trades.length === 0 && (
        <EmptyRow message="No recent trades" />
      )}
      {trades !== null && !errored && trades.length > 0 && (
        <VStack gap={2}>
          {trades.map((t, i) => {
            const pnl = formatPnl(t.pnlDollars);
            return (
              <HStack
                key={`${t.pair}-${i}`}
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                gap={2}
                style={{
                  paddingBottom: 8,
                  borderBottom:
                    i < trades.length - 1
                      ? "1px solid var(--color-bgLine)"
                      : "none",
                }}
              >
                <HStack
                  alignItems="center"
                  gap={2}
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <TextLabel2
                    as="span"
                    style={{
                      color: "var(--color-fg)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.pair}
                  </TextLabel2>
                  <span
                    style={{
                      display: "inline-flex",
                      minWidth: 56,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Tag
                      intent="informational"
                      emphasis="low"
                      colorScheme={actionScheme(t.action)}
                    >
                      {t.action}
                    </Tag>
                  </span>
                </HStack>
                <HStack
                  alignItems="center"
                  gap={2}
                  style={{ flexShrink: 0 }}
                >
                  <TextLabel2
                    as="span"
                    style={{
                      color:
                        pnl.tone === "pos"
                          ? "var(--color-fgPositive)"
                          : pnl.tone === "neg"
                            ? "var(--color-fgNegative)"
                            : "var(--color-fgMuted)",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      textAlign: "right",
                      minWidth: 72,
                      display: "inline-block",
                    }}
                  >
                    {pnl.text}
                  </TextLabel2>
                  <TextCaption
                    as="span"
                    style={{
                      color: "var(--color-fgMuted)",
                      textTransform: "none",
                      letterSpacing: 0,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTradeTime(t.exitTime)}
                  </TextCaption>
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      )}
    </TradeCard>
  );
}

// --- Polybot trades column --------------------------------------------------

export function PolybotTradesCard({ index = 0 }: { index?: number }) {
  const [trades, setTrades] = useState<PolyTrade[] | null>(null);
  const [errored, setErrored] = useState(false);
  const { settings } = useHubSettings();
  const pollMs = settings.pollingMs ?? 30_000;

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const body = await fetchProxy("/api/polybot/portfolio");
      if (cancelled) return;
      if (!body || !body.ok) {
        setErrored(true);
        setTrades([]);
        return;
      }
      setErrored(false);
      setTrades(parsePolyTrades(body.data));
    }
    void tick();
    const id = pollMs > 0 ? setInterval(() => void tick(), pollMs) : undefined;
    return () => {
      cancelled = true;
      if (id !== undefined) clearInterval(id);
    };
  }, [pollMs]);

  return (
    <TradeCard title="Recent Polybot trades" index={index}>
      {trades === null && <EmptyRow message="Loading..." />}
      {trades !== null && errored && <EmptyRow message="Service offline" />}
      {trades !== null && !errored && trades.length === 0 && (
        <EmptyRow message="No recent trades" />
      )}
      {trades !== null && !errored && trades.length > 0 && (
        <VStack gap={2}>
          {trades.map((t, i) => {
            const pnl = formatPnl(t.pnlUsd);
            return (
              <HStack
                key={`${t.label}-${i}`}
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                gap={2}
                style={{
                  paddingBottom: 8,
                  borderBottom:
                    i < trades.length - 1
                      ? "1px solid var(--color-bgLine)"
                      : "none",
                }}
              >
                <HStack
                  alignItems="center"
                  gap={2}
                  style={{ minWidth: 0, flex: 1 }}
                >
                  <TextLabel2
                    as="span"
                    style={{
                      color: "var(--color-fg)",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 220,
                    }}
                  >
                    {t.label}
                  </TextLabel2>
                  <span
                    style={{
                      display: "inline-flex",
                      minWidth: 56,
                      justifyContent: "flex-start",
                    }}
                  >
                    <Tag
                      intent="informational"
                      emphasis="low"
                      colorScheme={actionScheme(t.side)}
                    >
                      {t.side}
                    </Tag>
                  </span>
                </HStack>
                <HStack
                  alignItems="center"
                  gap={2}
                  style={{ flexShrink: 0 }}
                >
                  <TextLabel2
                    as="span"
                    style={{
                      color:
                        pnl.tone === "pos"
                          ? "var(--color-fgPositive)"
                          : pnl.tone === "neg"
                            ? "var(--color-fgNegative)"
                            : "var(--color-fgMuted)",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 600,
                      textAlign: "right",
                      minWidth: 72,
                      display: "inline-block",
                    }}
                  >
                    {pnl.text}
                  </TextLabel2>
                  <TextCaption
                    as="span"
                    style={{
                      color: "var(--color-fgMuted)",
                      textTransform: "none",
                      letterSpacing: 0,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatTradeTime(t.exitedAt)}
                  </TextCaption>
                </HStack>
              </HStack>
            );
          })}
        </VStack>
      )}
    </TradeCard>
  );
}
