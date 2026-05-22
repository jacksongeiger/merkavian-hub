"use client";

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

export function QuickLinks({ baseIndex = 0 }: { baseIndex?: number }) {
  return (
    <Grid
      gap={3}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      {TILES.map((tile, i) => (
        <motion.div
          key={tile.href}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
            delay: (baseIndex + i) * 0.05,
          }}
          style={{ width: "100%" }}
        >
          <Link
            href={tile.href}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "block",
              borderRadius: 16,
            }}
          >
            <ContentCard
              padding={4}
              gap={2}
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-bgLine)",
                borderRadius: 16,
                cursor: "pointer",
                transition:
                  "border-color 0.15s ease-out, transform 0.15s ease-out",
              }}
            >
              <VStack gap={2}>
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
      ))}
    </Grid>
  );
}
