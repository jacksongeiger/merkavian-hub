"use client";

import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { VStack, HStack, Grid } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
} from "@coinbase/cds-web/typography";

const FACT_ITEMS: Array<{ label: string; value: string }> = [
  { label: "PROTOCOL", value: "Proof of Learning" },
  { label: "CHAIN", value: "Base Sepolia (84532)" },
  { label: "STACK", value: "Hardhat 2 · Solidity 0.8.24 · React" },
  { label: "TOKEN SUPPLY", value: "1,000,000 POL" },
  { label: "LAST COMMIT", value: "April 8, 2026" },
  { label: "STATUS", value: "Dormant" },
];

export function PolchainPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ maxWidth: 720 }}
    >
      <VStack gap={3}>
        <ContentCard
          padding={5}
          gap={4}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
          }}
        >
          <HStack alignItems="center" gap={2}>
            <TextTitle1 as="h2">PoLChain</TextTitle1>
            <Tag colorScheme="blue">COMING SOON</Tag>
          </HStack>

          <TextBody as="p" style={{ color: "var(--color-fgMuted)", lineHeight: 1.6 }}>
            PoLChain is a Proof of Learning mining protocol on Base Sepolia. Miners
            submit gradient hashes and performance scores to compete for POL token
            rewards. The owner posts tasks with thresholds, rewards, and deadlines;
            the highest-scoring submission above threshold wins.
          </TextBody>

          <TextBody as="p" style={{ color: "var(--color-fgMuted)", lineHeight: 1.6 }}>
            The frontend is a Vite + React dashboard that connects via the Coinbase
            Wallet SDK and ethers v6. It is not yet deployed to ARM — V1 of the Hub
            scopes this in as a V2 milestone.
          </TextBody>

          <Grid
            templateColumns="repeat(auto-fit, minmax(180px, 1fr))"
            gap={2}
            style={{ paddingTop: 8 }}
          >
            {FACT_ITEMS.map((item) => (
              <VStack
                key={item.label}
                gap={0.5}
                style={{
                  padding: 14,
                  background: "var(--color-bgSecondary)",
                  borderRadius: 10,
                }}
              >
                <TextCaption
                  as="span"
                  style={{ color: "var(--color-fgMuted)", letterSpacing: "0.08em", fontSize: 10 }}
                >
                  {item.label}
                </TextCaption>
                <TextLabel2 as="span" style={{ color: "var(--color-fg)", fontWeight: 500 }}>
                  {item.value}
                </TextLabel2>
              </VStack>
            ))}
          </Grid>

          <HStack gap={2} style={{ paddingTop: 8 }}>
            <Button
              as="a"
              href="https://github.com/jacksongeiger/polchain"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              View repo
            </Button>
            <Button variant="primary" disabled>
              Deploy to ARM
            </Button>
          </HStack>

          <TextBody
            as="p"
            style={{
              color: "var(--color-fgMuted)",
              fontSize: 12,
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            &ldquo;Deploy to ARM&rdquo; is disabled in V1. When PoLChain is brought online,
            the frontend will be served from ARM:30XX behind Caddy and embedded
            in this panel as an iframe, mirroring Crypto Tracker and Rapid Drafter.
          </TextBody>
        </ContentCard>
      </VStack>
    </motion.div>
  );
}
