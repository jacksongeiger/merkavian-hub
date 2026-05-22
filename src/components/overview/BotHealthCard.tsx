"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ContentCard } from "@coinbase/cds-web/cards";
import { HStack, VStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextTitle1,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tooltip } from "@/components/ui/Tooltip";
import { useHubSettings } from "@/lib/use-hub-settings";

type Service = "cryptobot" | "polybot";

type Props = {
  service: Service;
  index?: number;
};

type ProxyOk = { ok: true; data: unknown; fetchedAt: string };
type ProxyFail = { ok: false; reason: string; status?: number; fetchedAt: string };
type ProxyBody = ProxyOk | ProxyFail;

const TITLES: Record<Service, string> = {
  cryptobot: "Crypto Bot",
  polybot: "Polybot",
};

const STATUS_ENDPOINTS: Record<Service, string> = {
  cryptobot: "/api/cryptobot",
  polybot: "/api/polybot",
};

const PORTFOLIO_ENDPOINTS: Record<Service, string> = {
  cryptobot: "/api/cryptobot/portfolio",
  polybot: "/api/polybot/portfolio",
};

// --- KPI extraction ---------------------------------------------------------

type CryptoKpi = {
  totalPnl: number;
  totalPnlPct: number;
  totalTrades: number;
};

type PolyKpi = {
  winRate: number;
  closedTrades: number;
  openPositions: number;
};

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

function asNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function extractCryptoKpi(data: unknown): CryptoKpi | null {
  if (!isObj(data)) return null;
  const totalPnl = asNum(data.total_pnl);
  const totalPnlPct = asNum(data.total_pnl_pct);
  const totalTrades = asNum(data.total_trades);
  if (totalPnl === null || totalPnlPct === null || totalTrades === null) return null;
  return { totalPnl, totalPnlPct, totalTrades };
}

function extractPolyKpi(data: unknown): PolyKpi | null {
  if (!isObj(data)) return null;
  const stats = isObj(data.stats) ? data.stats : null;
  if (!stats) return null;
  const winRate = asNum(stats.win_rate);
  const closedTrades = asNum(stats.closed_trades);
  const openPositions = asNum(stats.open_positions);
  if (winRate === null || closedTrades === null || openPositions === null) return null;
  return { winRate, closedTrades, openPositions };
}

// --- formatting -------------------------------------------------------------

function formatSignedUsd(n: number): string {
  const abs = Math.abs(n).toFixed(2);
  return `${n >= 0 ? "+" : "-"}$${abs}`;
}

function formatSignedPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function formatClockTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

// --- component --------------------------------------------------------------

type ServiceState =
  | { kind: "loading" }
  | { kind: "online"; kpi: { c: CryptoKpi | null; p: PolyKpi | null }; fetchedAt: string }
  | { kind: "offline" };

async function fetchProxy(endpoint: string): Promise<ProxyBody | null> {
  try {
    const res = await fetch(endpoint, { cache: "no-store" });
    const body = (await res.json()) as ProxyBody;
    return body;
  } catch {
    return null;
  }
}

export function BotHealthCard({ service, index = 0 }: Props) {
  const [state, setState] = useState<ServiceState>({ kind: "loading" });
  const cancelledRef = useRef(false);
  const { settings } = useHubSettings();
  const pollMs = settings.pollingMs ?? 30_000;

  useEffect(() => {
    cancelledRef.current = false;

    async function tick() {
      const statusBody = await fetchProxy(STATUS_ENDPOINTS[service]);
      if (cancelledRef.current) return;

      if (!statusBody || !statusBody.ok) {
        setState({ kind: "offline" });
        return;
      }

      // Status OK — now try the portfolio. If it fails, render online with no KPI.
      const portfolioBody = await fetchProxy(PORTFOLIO_ENDPOINTS[service]);
      if (cancelledRef.current) return;

      let cKpi: CryptoKpi | null = null;
      let pKpi: PolyKpi | null = null;
      if (portfolioBody && portfolioBody.ok) {
        if (service === "cryptobot") cKpi = extractCryptoKpi(portfolioBody.data);
        else pKpi = extractPolyKpi(portfolioBody.data);
      }

      setState({
        kind: "online",
        kpi: { c: cKpi, p: pKpi },
        fetchedAt: statusBody.fetchedAt,
      });
    }

    void tick();
    const id = pollMs > 0 ? setInterval(() => void tick(), pollMs) : undefined;
    return () => {
      cancelledRef.current = true;
      if (id !== undefined) clearInterval(id);
    };
  }, [service, pollMs]);

  const isOnline = state.kind === "online";

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
        minHeight={170}
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-bgLine)",
          width: "100%",
          height: "100%",
          borderRadius: 16,
        }}
      >
        {/* Top row: dot + title + status tag */}
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          <HStack alignItems="center" gap={2}>
            <StatusDot
              status={isOnline ? "online" : "offline"}
              ariaLabel={`${TITLES[service]} ${isOnline ? "online" : "offline"}`}
            />
            <TextTitle3 as="h3">{TITLES[service]}</TextTitle3>
          </HStack>
          <Tooltip content="Service is reachable and returning data from ARM server">
            <TextCaption
              as="span"
              style={{
                color: isOnline ? "var(--color-fgPrimary)" : "var(--color-fgMuted)",
                letterSpacing: "0.08em",
                fontWeight: 600,
              }}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </TextCaption>
          </Tooltip>
        </HStack>

        {/* Middle: KPI */}
        <Kpi service={service} state={state} />

        {/* Bottom: last updated */}
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            textTransform: "none",
            letterSpacing: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {state.kind === "online"
            ? `last updated · ${formatClockTime(state.fetchedAt)}`
            : state.kind === "loading"
              ? "loading..."
              : "service unreachable"}
        </TextCaption>
      </ContentCard>
    </motion.div>
  );
}

function Kpi({ service, state }: { service: Service; state: ServiceState }) {
  if (state.kind === "loading") {
    return (
      <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
        &nbsp;
      </TextBody>
    );
  }

  if (state.kind === "offline") {
    return (
      <TextTitle1 as="span" style={{ color: "var(--color-fgMuted)" }}>
        Service offline
      </TextTitle1>
    );
  }

  if (service === "cryptobot") {
    const c = state.kpi.c;
    if (!c) {
      return (
        <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
          ONLINE · Awaiting data
        </TextBody>
      );
    }
    const positive = c.totalPnl >= 0;
    const valueColor = positive ? "var(--color-fgPositive)" : "var(--color-fgNegative)";
    return (
      <VStack gap={1}>
        <Tooltip content="Total profit and loss across all trades since bot deployment">
          <TextTitle1
            as="span"
            style={{
              color: valueColor,
              fontVariantNumeric: "tabular-nums",
              fontWeight: 600,
            }}
          >
            {formatSignedUsd(c.totalPnl)}
          </TextTitle1>
        </Tooltip>
        <Tooltip content="Total number of completed trades executed by the bot">
          <TextBody
            as="span"
            style={{
              color: "var(--color-fgMuted)",
              textTransform: "none",
              letterSpacing: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatSignedPct(c.totalPnlPct)} · {c.totalTrades} lifetime trades
          </TextBody>
        </Tooltip>
      </VStack>
    );
  }

  // polybot
  const p = state.kpi.p;
  if (!p) {
    return (
      <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
        ONLINE · Awaiting data
      </TextBody>
    );
  }
  if (p.winRate === 0 && p.closedTrades === 0) {
    return (
      <VStack gap={1}>
        <TextTitle1 as="span" style={{ color: "var(--color-fgMuted)" }}>
          Awaiting first trade
        </TextTitle1>
        <TextBody
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            textTransform: "none",
            letterSpacing: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {p.openPositions} open
        </TextBody>
      </VStack>
    );
  }
  return (
    <VStack gap={1}>
      <Tooltip content="Percentage of closed positions that were profitable">
        <TextTitle1
          as="span"
          style={{
            color: "var(--color-fg)",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
          }}
        >
          Win rate · {p.winRate}%
        </TextTitle1>
      </Tooltip>
      <TextBody
        as="span"
        style={{
          color: "var(--color-fgMuted)",
          textTransform: "none",
          letterSpacing: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {p.closedTrades} closed · {p.openPositions} open
      </TextBody>
    </VStack>
  );
}
