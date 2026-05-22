"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ContentCard } from "@coinbase/cds-web/cards";
import { HStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextTitle2,
} from "@coinbase/cds-web/typography";

/**
 * Today's Crypto Brief — fallback variant.
 *
 * The upstream crypto-tracker app renders briefs server-side (RSC) and does
 * not expose a public JSON endpoint for them. Probing the standard candidate
 * paths returned 404 for every `/api/*` route. Rather than blocking on a
 * scraper, we surface a clean fallback that funnels the user into the full
 * brief inside the Hub's iframe tab.
 */
export function CryptoBriefCard({ index = 0 }: { index?: number }) {
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
        }}
      >
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          TODAY&apos;S BRIEF
        </TextCaption>
        <TextTitle2 as="h2" style={{ color: "var(--color-fg)" }}>
          Today&apos;s crypto brief is ready
        </TextTitle2>
        <TextBody
          as="p"
          style={{
            color: "var(--color-fgMuted)",
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          The latest editorial brief, conviction-scored themes, and corroborated
          source map are rendered inside the Crypto Tracker tab.
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
