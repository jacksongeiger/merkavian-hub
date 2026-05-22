"use client";

import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { Banner } from "@coinbase/cds-web/banner";
import { Spinner } from "@coinbase/cds-web/loaders";
import { Box, Grid, HStack, VStack } from "@coinbase/cds-web/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@coinbase/cds-web/tables";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";
import { usePolledJson, type PolledResult } from "@/lib/usePolledJson";

type CryptobotPortfolio = {
  cash: number;
  losses: number;
  positions: Array<unknown>;
  starting_balance: number;
  total_pnl: number;
  total_pnl_pct: number;
  total_trades: number;
  total_value: number;
  trade_history: Array<{
    action: string;
    entry_price: number;
    entry_time: string;
    exit_price: number;
    exit_reason: string;
    exit_time: string;
    hold_duration: string;
    pair: string;
    pnl_dollars: number;
    pnl_pct: number;
  }>;
};

type PolybotPortfolio = {
  bankroll_start: number;
  closed_recent: unknown[];
  open: unknown[];
  stats: {
    cash: number;
    closed_trades: number;
    open_positions: number;
    total_pnl: number;
    total_pnl_pct: number;
    total_value: number;
    win_rate: number;
  };
};

function formatUSD(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatPct(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isFresh<T>(s: PolledResult<T>): s is Extract<PolledResult<T>, { kind: "ok" } | { kind: "stale" }> {
  return s.kind === "ok" || s.kind === "stale";
}

export function MerkavianTradingPanel() {
  const crypto = usePolledJson<CryptobotPortfolio>("/api/cryptobot/portfolio");
  const poly = usePolledJson<PolybotPortfolio>("/api/polybot/portfolio");

  if (crypto.kind === "loading" && poly.kind === "loading") {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" padding={6}>
        <Spinner size={28} />
      </Box>
    );
  }

  const cryptoData = isFresh(crypto) ? crypto.data : null;
  const polyData = isFresh(poly) ? poly.data : null;

  const cryptoOnline = crypto.kind === "ok";
  const polyOnline = poly.kind === "ok";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <VStack gap={4}>
        {/* HEADER */}
        <HStack alignItems="center" gap={2}>
          <TextTitle1 as="h2">Bots overview</TextTitle1>
          <Tag colorScheme="blue">LIVE</Tag>
        </HStack>
        <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
          Aggregated P&amp;L, positions, and recent activity from cryptobot and polybot
          on ARM. Polls every 30 seconds.
        </TextBody>

        {/* STATUS STRIP */}
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={2}>
          <StatusStripCard
            name="Crypto Bot"
            online={cryptoOnline}
            stat={cryptoData ? `${cryptoData.total_trades} lifetime trades` : "awaiting data"}
          />
          <StatusStripCard
            name="Polybot"
            online={polyOnline}
            stat={polyData ? `${polyData.stats.closed_trades} closed · ${polyData.stats.open_positions} open` : "awaiting data"}
          />
        </Grid>

        {/* PNL METRIC CARDS */}
        <SectionHeader title="P&L" />
        <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
          <MetricTile
            label="Crypto Bot — total value"
            value={cryptoData ? formatUSD(cryptoData.total_value) : "—"}
            sub={cryptoData ? `started ${formatUSD(cryptoData.starting_balance)}` : "awaiting data"}
            tone={cryptoData ? "default" : "muted"}
          />
          <MetricTile
            label="Crypto Bot — P&L"
            value={cryptoData ? formatUSD(cryptoData.total_pnl) : "—"}
            sub={cryptoData ? formatPct(cryptoData.total_pnl_pct) : "awaiting data"}
            tone={cryptoData ? (cryptoData.total_pnl >= 0 ? "positive" : "negative") : "muted"}
          />
          <MetricTile
            label="Polybot — total value"
            value={polyData ? formatUSD(polyData.stats.total_value) : "—"}
            sub={polyData ? `bankroll ${formatUSD(polyData.bankroll_start)}` : "awaiting data"}
            tone={polyData ? "default" : "muted"}
          />
          <MetricTile
            label="Polybot — win rate"
            value={polyData ? `${polyData.stats.win_rate}%` : "—"}
            sub={polyData ? `${polyData.stats.closed_trades} closed` : "awaiting data"}
            tone={polyData ? "primary" : "muted"}
          />
        </Grid>

        {/* RECENT TRADES */}
        <SectionHeader title="Recent crypto bot trades" />
        <ContentCard
          padding={0}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {cryptoData && cryptoData.trade_history.length > 0 ? (
            <Table accessibilityLabel="Recent crypto bot trades" variant="ruled">
              <TableHeader>
                <TableRow>
                  <TableCell>Pair</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entry</TableCell>
                  <TableCell>Exit</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell justifyContent="flex-end">P&amp;L</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cryptoData.trade_history.slice(-8).reverse().map((t, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <TextLabel2 as="span" style={{ fontWeight: 500 }}>{t.pair}</TextLabel2>
                    </TableCell>
                    <TableCell>
                      <Tag colorScheme={t.action === "BUY" ? "green" : "red"} emphasis="low">{t.action}</Tag>
                    </TableCell>
                    <TableCell>
                      <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
                        {formatTime(t.entry_time)}
                      </TextCaption>
                    </TableCell>
                    <TableCell>
                      <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
                        {formatTime(t.exit_time)}
                      </TextCaption>
                    </TableCell>
                    <TableCell>
                      <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
                        {t.exit_reason}
                      </TextCaption>
                    </TableCell>
                    <TableCell justifyContent="flex-end">
                      <TextLabel2
                        as="span"
                        style={{
                          color: t.pnl_dollars >= 0 ? "var(--color-fgPositive)" : "var(--color-fgNegative)",
                          fontVariantNumeric: "tabular-nums",
                          fontWeight: 500,
                        }}
                      >
                        {formatUSD(t.pnl_dollars)} ({formatPct(t.pnl_pct)})
                      </TextLabel2>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box padding={4}>
              <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
                {crypto.kind === "down" ? "Cannot reach crypto bot." : "No closed trades yet."}
              </TextBody>
            </Box>
          )}
        </ContentCard>

        {/* BOT CONTROLS — disabled for V1 */}
        <SectionHeader title="Bot controls" />
        <ContentCard
          padding={4}
          gap={3}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
          }}
        >
          <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
            Start / stop controls require token-authenticated POST endpoints on each bot.
            Polybot exposes <code style={{ background: "var(--color-bgSecondary)", padding: "1px 6px", borderRadius: 4 }}>POLYBOT_API_TOKEN</code> for kill-switch; cryptobot needs equivalent auth before mutation is safe.
            Disabled in V1 — view-only.
          </TextBody>
          <HStack gap={2} flexWrap="wrap">
            <Button variant="secondary" disabled>Start Crypto Bot</Button>
            <Button variant="secondary" disabled>Stop Crypto Bot</Button>
            <Button variant="secondary" disabled>Start Polybot</Button>
            <Button variant="secondary" disabled>Stop Polybot</Button>
          </HStack>
        </ContentCard>

        {/* FOOTER BANNER */}
        <Banner variant="informational" startIcon="laptop" title="More on your Mac">
          Full dashboard with logs, trainer status, and per-pair history available at
          <code style={{ margin: "0 4px", background: "var(--color-bg)", padding: "1px 6px", borderRadius: 4, border: "1px solid var(--color-bgLine)" }}>http://localhost:5055</code>
          on your Mac.
        </Banner>
      </VStack>
    </motion.div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <HStack alignItems="center" gap={2} style={{ marginTop: 8 }}>
      <TextTitle3 as="h3">{title}</TextTitle3>
      <span style={{ flex: 1, height: 1, background: "var(--color-bgLine)" }} aria-hidden />
    </HStack>
  );
}

function StatusStripCard({ name, online, stat }: { name: string; online: boolean; stat: string }) {
  return (
    <ContentCard
      padding={3}
      gap={1}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 12,
      }}
    >
      <HStack alignItems="center" gap={2}>
        <StatusDot status={online ? "online" : "offline"} />
        <TextTitle3 as="h4">{name}</TextTitle3>
        <Tag colorScheme={online ? "green" : "gray"} emphasis="low">
          {online ? "ONLINE" : "OFFLINE"}
        </Tag>
      </HStack>
      <TextCaption as="span" style={{ color: "var(--color-fgMuted)", textTransform: "none", letterSpacing: 0 }}>{stat}</TextCaption>
    </ContentCard>
  );
}

function MetricTile({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "positive" | "negative" | "muted" | "primary";
}) {
  const VALUE_COLORS: Record<typeof tone, string> = {
    default: "var(--color-fg)",
    positive: "var(--color-fgPositive)",
    negative: "var(--color-fgNegative)",
    muted: "var(--color-fgMuted)",
    primary: "var(--color-fgPrimary)",
  };
  return (
    <ContentCard
      padding={3}
      gap={1}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 12,
      }}
    >
      <TextCaption as="span" style={{ color: "var(--color-fgMuted)", letterSpacing: "0.08em" }}>
        {label.toUpperCase()}
      </TextCaption>
      <TextTitle1
        as="span"
        style={{
          color: VALUE_COLORS[tone],
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </TextTitle1>
      {sub && (
        <TextCaption as="span" style={{ color: "var(--color-fgMuted)", textTransform: "none", letterSpacing: 0 }}>{sub}</TextCaption>
      )}
    </ContentCard>
  );
}
