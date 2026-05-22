"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { Collapsible } from "@coinbase/cds-web/collapsible";
import { useToast } from "@coinbase/cds-web/overlays/useToast";
import { Box, Grid, HStack, VStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
  TextTitle3,
} from "@coinbase/cds-web/typography";

type StackItem = { name: string; version?: string };
type TimelineItem = { date: string; title: string; body: string };

const STACK: StackItem[] = [
  { name: "Solidity", version: "0.8.24" },
  { name: "Hardhat", version: "2" },
  { name: "React", version: "19" },
  { name: "Vite", version: "8" },
  { name: "ethers", version: "v6" },
  { name: "Flask", version: "ZK server" },
  { name: "recharts", version: "3" },
  { name: "Coinbase Wallet SDK", version: "4" },
];

const TIMELINE: TimelineItem[] = [
  {
    date: "Late Mar 2026",
    title: "Project kickoff",
    body: "POL token contract drafted (ERC-20, fixed 1M supply). TaskManager escrow logic written and unit-tested under Hardhat.",
  },
  {
    date: "Early Apr 2026",
    title: "Testnet deployment",
    body: "Deployed to Base Sepolia (chainId 84532). Wallet connect + miner submission flow wired through the React frontend.",
  },
  {
    date: "Mid Apr 2026",
    title: "ZK proof system",
    body: "Flask ZK-prove server brought online on port 5001 for verifiable gradient submissions. AI training loop integrated.",
  },
  {
    date: "Apr 8 2026",
    title: "Dormant",
    body: "Last commit. Hub V2 plan is to redeploy the frontend to ARM behind Caddy and embed it in this tab.",
  },
];

const LAUNCH_COMMANDS = `# Terminal 1 — Hardhat + Vite
cd ~/polchain
npm install
npm run dev

# Terminal 2 — Flask ZK prove server
cd ~/polchain/zk/server
python3 server.py`;

export function PolchainPanel() {
  const [launchOpen, setLaunchOpen] = useState(false);
  const toast = useToast();

  const handleLaunch = () => {
    setLaunchOpen(true);
    toast.show("Copy the commands above and run them in your terminal");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <VStack gap={4}>
        {/* HERO */}
        <ContentCard
          padding={5}
          gap={3}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
          }}
        >
          <HStack alignItems="center" gap={2}>
            <TextTitle1 as="h2">PoLChain</TextTitle1>
            <Tag colorScheme="yellow">DORMANT</Tag>
            <Tag colorScheme="blue" emphasis="low">V2</Tag>
          </HStack>
          <TextBody as="p" style={{ color: "var(--color-fgMuted)", fontSize: 16 }}>
            Proof of Learning Protocol on Base Sepolia. AI models earn POL tokens by
            completing learning tasks under threshold and submitting verifiable gradient hashes
            on-chain — escrow is released to the highest-scoring miner after each round&apos;s deadline.
          </TextBody>
          <HStack gap={2} flexWrap="wrap" alignItems="center">
            <Button
              as="a"
              href="https://github.com/jacksongeiger/polchain"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              View repo on GitHub
            </Button>
            <Button variant="primary" onClick={handleLaunch}>
              How to launch locally
            </Button>
            <TextLabel2
              as="span"
              style={{
                color: "var(--color-fgMuted)",
                marginLeft: "auto",
                textTransform: "none",
                fontWeight: 400,
              }}
            >
              Last commit · April 8, 2026
            </TextLabel2>
          </HStack>
        </ContentCard>

        {/* LAUNCH COLLAPSIBLE */}
        <ContentCard
          padding={0}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <HStack
            justifyContent="space-between"
            alignItems="center"
            style={{
              padding: 16,
              cursor: "pointer",
              borderBottom: launchOpen ? "1px solid var(--color-bgLine)" : "none",
            }}
            onClick={() => setLaunchOpen((o) => !o)}
          >
            <TextLabel2 as="span" style={{ fontWeight: 500 }}>
              Launch locally — terminal commands
            </TextLabel2>
            <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
              {launchOpen ? "Hide" : "Show"}
            </TextCaption>
          </HStack>
          <Collapsible collapsed={!launchOpen}>
            <Box padding={3} style={{ background: "var(--color-bgSecondary)" }}>
              <pre
                style={{
                  margin: 0,
                  fontFamily:
                    'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
                  fontSize: 12.5,
                  lineHeight: 1.65,
                  color: "var(--color-fg)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {LAUNCH_COMMANDS}
              </pre>
            </Box>
          </Collapsible>
        </ContentCard>

        {/* TECH STACK GRID */}
        <SectionHeader title="Tech stack" />
        <Grid templateColumns="repeat(auto-fill, minmax(170px, 1fr))" gap={1.5}>
          {STACK.map((s) => (
            <StackTile key={s.name} {...s} />
          ))}
        </Grid>

        {/* TIMELINE */}
        <SectionHeader title="Timeline" />
        <ContentCard
          padding={4}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
          }}
        >
          <VStack gap={3}>
            {TIMELINE.map((t, i) => (
              <HStack key={i} gap={3} alignItems="flex-start">
                <Box style={{ width: 110, flexShrink: 0, paddingTop: 2 }}>
                  <TextCaption as="span" style={{ color: "var(--color-fgMuted)", letterSpacing: "0.06em" }}>
                    {t.date.toUpperCase()}
                  </TextCaption>
                </Box>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: i === TIMELINE.length - 1 ? "var(--color-fgWarning)" : "var(--color-fgPrimary)",
                    flexShrink: 0,
                    marginTop: 4,
                    border: "2px solid var(--color-bg)",
                    boxShadow: "0 0 0 1px var(--color-bgLine)",
                  }}
                  aria-hidden
                />
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <TextLabel2 as="span" style={{ fontWeight: 500 }}>{t.title}</TextLabel2>
                  <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>{t.body}</TextBody>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </ContentCard>
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

function StackTile({ name, version }: StackItem) {
  return (
    <Box
      style={{
        padding: "12px 14px",
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <TextLabel2 as="span" style={{ fontWeight: 500 }}>{name}</TextLabel2>
      {version && (
        <TextLabel2
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            textTransform: "none",
            fontWeight: 400,
            fontSize: 12,
            letterSpacing: 0,
          }}
        >
          {version}
        </TextLabel2>
      )}
    </Box>
  );
}
