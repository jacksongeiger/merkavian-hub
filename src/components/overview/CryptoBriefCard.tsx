"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ContentCard } from "@coinbase/cds-web/cards";
import { HStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextTitle2,
} from "@coinbase/cds-web/typography";

type BriefTheme = {
  title: string;
  summary: string;
  convictionScore: number | null;
};

type BriefData = {
  date: string;
  tldr: string;
  model: string;
  signalCount: number;
  themes: BriefTheme[];
};

type ProxyResponse =
  | { ok: true; data: BriefData; fetchedAt: string }
  | { ok: false; reason: string; fetchedAt: string };

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatHumanDate(iso: string): string {
  // Parse as local date to avoid TZ rollback
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function truncate(text: string, max = 280): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Today's Crypto Brief — surfaces the latest brief's TL;DR via the
 * `/api/crypto-brief` Hub proxy, which fronts crypto-tracker's
 * `/api/brief` JSON endpoint. Silently falls back to the original
 * "brief is ready" copy on any error.
 */
export function CryptoBriefCard({ index = 0 }: { index?: number }) {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/crypto-brief", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as ProxyResponse;
        if (cancelled) return;
        if (json.ok && json.data) {
          setBrief(json.data);
        } else {
          setErrored(true);
        }
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isToday = brief ? brief.date === todayISO() : true;
  const eyebrow = brief
    ? `${isToday ? "TODAY'S BRIEF" : "YESTERDAY'S BRIEF"} · ${brief.model} · ${brief.signalCount} SIGNALS`
    : "TODAY'S BRIEF";

  const title =
    loading && !errored
      ? "Loading today's brief…"
      : brief
        ? formatHumanDate(brief.date)
        : "Today's crypto brief is ready";

  const body = brief
    ? truncate(brief.tldr, 280)
    : "The latest editorial brief, conviction-scored themes, and corroborated source map are rendered inside the Crypto Tracker tab.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.05 }}
      style={{ width: "100%" }}
    >
      <ContentCard
        padding={4}
        gap={2}
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-bgLine)",
          borderRadius: 16,
          opacity: loading && !brief ? 0.85 : 1,
          transition: "opacity 200ms ease-out",
        }}
      >
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgPrimary)",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </TextCaption>
        <TextTitle2 as="h2" style={{ color: "var(--color-fg)" }}>
          {title}
        </TextTitle2>
        <TextBody
          as="p"
          style={{
            color: "var(--color-fgMuted)",
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {body}
        </TextBody>
        <HStack justifyContent="flex-start" alignItems="center" width="100%">
          <Link
            href="/crypto-tracker"
            style={{
              color: "var(--color-fgPrimary)",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Read full brief →
          </Link>
        </HStack>
      </ContentCard>
    </motion.div>
  );
}
