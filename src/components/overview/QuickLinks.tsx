"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { IconName } from "@coinbase/cds-icons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Grid, VStack } from "@coinbase/cds-web/layout";
import { Icon } from "@coinbase/cds-web/icons";
import { TextBody, TextLabel2 } from "@coinbase/cds-web/typography";

type Tile = {
  title: string;
  description: string;
  icon: IconName;
  href: string;
};

const TILES: Tile[] = [
  {
    title: "Crypto Tracker",
    description: "Daily editorial brief, conviction-scored themes",
    icon: "chartLine",
    href: "/crypto-tracker",
  },
  {
    title: "Rapid Drafter",
    description: "Decision drafting via four-agent jury",
    icon: "document",
    href: "/rapid-drafter",
  },
  {
    title: "PoLChain",
    description: "Proof-of-Learning protocol on Base Sepolia",
    icon: "blockchain",
    href: "/polchain",
  },
  {
    title: "Merkavian Trading",
    description: "Aggregate dashboard for cryptobot + polybot",
    icon: "laptop",
    href: "/merkavian-trading",
  },
];

function QuickLinkTile({
  tile,
  delay,
}: {
  tile: Tile;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        ease: "easeOut",
        delay,
      }}
      style={{ width: "100%", height: "100%", display: "flex" }}
    >
      <Link
        href={tile.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          width: "100%",
          borderRadius: 16,
        }}
      >
        <ContentCard
          padding={3}
          gap={2}
          style={{
            background: hovered
              ? "var(--color-bgPrimaryWash)"
              : "var(--color-bg)",
            border: `1px solid ${
              hovered ? "var(--color-fgPrimary)" : "var(--color-bgLine)"
            }`,
            borderRadius: 16,
            cursor: "pointer",
            width: "100%",
            minHeight: 152,
            transition:
              "border-color 150ms ease-out, background-color 150ms ease-out",
          }}
        >
          <VStack gap={2} style={{ height: "100%" }}>
            <Icon
              name={tile.icon}
              size="m"
              styles={{ icon: { color: "var(--color-fgPrimary)" } }}
            />
            <TextLabel2
              as="span"
              style={{ color: "var(--color-fg)", fontWeight: 600 }}
            >
              {tile.title}
            </TextLabel2>
            <TextBody
              as="span"
              style={{
                color: "var(--color-fgMuted)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              {tile.description}
            </TextBody>
          </VStack>
        </ContentCard>
      </Link>
    </motion.div>
  );
}

export function QuickLinks({ baseIndex = 0 }: { baseIndex?: number }) {
  return (
    <Grid
      gap={3}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        alignItems: "stretch",
      }}
    >
      {TILES.map((tile, i) => (
        <QuickLinkTile
          key={tile.href}
          tile={tile}
          delay={(baseIndex + i) * 0.05}
        />
      ))}
    </Grid>
  );
}
