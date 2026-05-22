"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { Banner } from "@coinbase/cds-web/banner";
import { Collapsible } from "@coinbase/cds-web/collapsible";
import { useToast } from "@coinbase/cds-web/overlays/useToast";
import { Box, Grid, HStack, VStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
  TextTitle2,
  TextTitle3,
} from "@coinbase/cds-web/typography";

// ---------------------------------------------------------------------------
// Static content — every fact below is grounded in the actual ~/polchain repo.
// See zk/README.md, contracts/TaskManager.sol, zk/model.py, zk/aggregate.py,
// scripts/{miningLoop,autoMiner}.js, package.json scripts.
// ---------------------------------------------------------------------------

type ArchCard = { title: string; body: string };

const ARCH_CARDS: ArchCard[] = [
  {
    title: "Smart contracts",
    body:
      "POLToken (ERC-20, fixed 1,000,000 supply) and TaskManager — the mining protocol. Owner posts tasks with a description, score threshold, POL reward and deadline; reward is escrowed via transferFrom until finalizeTask pays the highest scorer.",
  },
  {
    title: "Miners (autoMiner.js)",
    body:
      "Four named miners — Alpha, Beta, Gamma, Delta — sharing one wallet on Base Sepolia. Each owns a different MNIST shard and augmentation strategy. The script starts a real Halo2 proof for the current block while submitting last block's completed proof on-chain.",
  },
  {
    title: "ZK pipeline (EZKL + Halo2)",
    body:
      "ONNX export of MNISTNet → EZKL compiles it into an arithmetic circuit → KZG trusted-setup SRS → Halo2 generates the proof. Public inputs are the feature vector and logit; model weights stay private. A Solidity Halo2Verifier is deployed and TaskManager.submitWithProof calls it on-chain.",
  },
  {
    title: "FedAvg aggregator (zk/aggregate.py)",
    body:
      "After every block, miningLoop.js spawns aggregate.py which trains the winning shard for one epoch and merges it into the global model. Adaptive blend: 50/50 if the new shard beats the current global, 80/20 toward the global otherwise so a bad shard cannot regress the model.",
  },
  {
    title: "Flask ZK server (zk/server/server.py)",
    body:
      "Local API on port 5001 exposing /train, /prove (sync SSE), /prove/async + /prove/status, /jobs, /accuracy, /accuracy_by_class and /predict. Drives the React frontend's live inference canvas and serves real proof jobs to the auto-miners.",
  },
];

type LifecycleStep = { num: number; title: string; body: string };

const LIFECYCLE: LifecycleStep[] = [
  {
    num: 1,
    title: "Owner posts a task",
    body:
      "postTask(description, threshold, reward, deadline) on TaskManager. miningLoop.js cycles 60-second blocks with a 100 POL reward and threshold 20.",
  },
  {
    num: 2,
    title: "POL escrowed",
    body:
      "transferFrom pulls `reward` POL from the owner into the TaskManager contract. The deadline is recorded on-chain and a TaskPosted event fires.",
  },
  {
    num: 3,
    title: "Miners train their shard",
    body:
      "Each of the four miners trains its assigned MNIST shard locally (rotation / noise / erasing / clean). The score is round(test_accuracy × 100), clamped to [0, 100].",
  },
  {
    num: 4,
    title: "Submit gradientHash + score",
    body:
      "submitWork(taskId, gradientHash, score) for fast/basic mode, or submitWithProof(taskId, gradientHash, score, proof, instances) for ZK mode — the Halo2Verifier is called on-chain and reverts on a bad proof.",
  },
  {
    num: 5,
    title: "Finalize after deadline",
    body:
      "finalizeTask(taskId) scans submissions for the highest score (ties go to the first submitter), transfers the escrowed POL to the winner, then aggregate.py blends the winning shard into the global FedAvg model.",
  },
];

type StackItem = { name: string; version?: string };

const STACK_CONTRACTS: StackItem[] = [
  { name: "Solidity", version: "0.8.24" },
  { name: "Hardhat", version: "^2.28" },
  { name: "OpenZeppelin Contracts", version: "^5.6" },
  { name: "ethers", version: "^6.16" },
];

const STACK_FRONTEND: StackItem[] = [
  { name: "React", version: "19.2" },
  { name: "Vite", version: "^8.0" },
  { name: "recharts", version: "^3.8" },
  { name: "Coinbase Wallet SDK", version: "^4.3" },
];

const STACK_ZK: StackItem[] = [
  { name: "Python", version: "3" },
  { name: "PyTorch", version: "MNISTNet" },
  { name: "EZKL", version: "Halo2 prover" },
  { name: "Flask", version: "port 5001" },
];

type MinerCard = {
  name: string;
  color: string;
  augLabel: string;
  augDesc: string;
  base: number;
};

// Colors lifted verbatim from frontend/src/index.css (--miner-alpha…delta)
// and miner descriptions from frontend/src/views/Chain.jsx MINER_PROFILES.
const MINERS: MinerCard[] = [
  {
    name: "Miner Alpha",
    color: "#00f5ff",
    augLabel: "Random Rotation ±15°",
    augDesc:
      "Rotates each digit image by a random angle up to ±15° every epoch — trains the model to be rotation-invariant.",
    base: 82,
  },
  {
    name: "Miner Beta",
    color: "#ffd84d",
    augLabel: "Gaussian Noise σ=0.1",
    augDesc:
      "Adds Gaussian noise (σ=0.1) to pixel values each epoch — improves robustness to noisy or corrupted inputs.",
    base: 50,
  },
  {
    name: "Miner Gamma",
    color: "#4ade80",
    augLabel: "Random Erasing 10–20%",
    augDesc:
      "Zeros out a random rectangular patch covering 10–20% of pixels each epoch — trains the model to handle occlusion.",
    base: 92,
  },
  {
    name: "Miner Delta",
    color: "#c084fc",
    augLabel: "Clean Training",
    augDesc:
      "No augmentation — pure gradient descent on the MNIST shard. Provides a clean baseline for comparison.",
    base: 83,
  },
];

// From zk/README.md — limitations the project itself acknowledges.
// Note: the README lists "no on-chain verifier" as a limitation, but
// TaskManager.submitWithProof + Verifier.sol now exist — so we list only
// the limitations that are still true in the current code.
const LIMITATIONS: { title: string; body: string }[] = [
  {
    title: "Score is still self-reported in basic mode",
    body:
      "submitWork (non-ZK path) accepts a score with no cryptographic check. Only submitWithProof binds the score to a Halo2 proof of the actual forward pass.",
  },
  {
    title: "Proof covers one inference, not training",
    body:
      "EZKL proves a single forward pass with a fixed evaluation input. Proving that the model was actually trained (not just run) requires recursive SNARKs like Nova and is an open research problem.",
  },
  {
    title: "Toy-scale model",
    body:
      "MNISTNet is a 2-layer MLP (784→128→64→10) over MNIST. Quantisation forces all weights below ~0.4 in absolute value so EZKL fixed-point math doesn't overflow — production models would not fit these constraints today.",
  },
  {
    title: "One wallet, four miner identities",
    body:
      "Alpha/Beta/Gamma/Delta all share a single Base Sepolia wallet. The frontend reconstructs identities by matching score proximity to each miner's base score — fine for a demo, not Sybil-resistant.",
  },
];

const LAUNCH_COMMANDS = `# 0. one-time setup
cd ~/polchain
npm install
cp .env.example .env   # fill in PRIVATE_KEY + BASE_SEPOLIA_RPC_URL

# 1. compile + deploy contracts to Base Sepolia
npm run compile
npm run deploy:baseSepolia

# 2. start the Flask ZK prove server (port 5001)
npm run prove-server

# 3. start the React frontend (Vite dev server)
npm run frontend

# 4. run the infinite mining loop (block producer + 4 auto-miners + admin API)
npm run mining`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PolchainPanel() {
  const [launchOpen, setLaunchOpen] = useState(false);
  const toast = useToast();

  const handleLaunch = () => {
    setLaunchOpen(true);
    toast.show("Copy the commands above and run them in your terminal.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <VStack gap={4}>
        {/* ───────────────────────── HERO ───────────────────────── */}
        <ContentCard
          padding={5}
          gap={3}
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
          }}
        >
          <VStack gap={2}>
            <TextTitle1 as="h2">PoLChain</TextTitle1>
            <TextBody
              as="p"
              style={{
                color: "var(--color-fgMuted)",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 16,
              }}
            >
              Proof-of-Learning Protocol — Decentralized AI Training on Base Sepolia
            </TextBody>
            <HStack gap={1} flexWrap="wrap">
              <Tag colorScheme="yellow">RESEARCH PROTOTYPE</Tag>
              <Tag colorScheme="gray">DORMANT SINCE APRIL 2026</Tag>
            </HStack>
          </VStack>

          <HStack gap={2} flexWrap="wrap" alignItems="center">
            <Button
              as="a"
              href="https://github.com/jacksongeiger/polchain"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
            >
              View on GitHub
            </Button>
            <Button variant="primary" disabled>
              Read Paper
            </Button>
            <TextLabel2
              as="span"
              style={{
                color: "var(--color-fgMuted)",
                marginLeft: "auto",
                textTransform: "none",
                letterSpacing: 0,
                fontWeight: 400,
              }}
            >
              Last commit · April 8, 2026
            </TextLabel2>
          </HStack>
        </ContentCard>

        {/* ───────────────── PROBLEM & VISION ───────────────── */}
        <SectionHeader title="Problem &amp; vision" />
        <Grid
          templateColumns="repeat(auto-fit, minmax(280px, 1fr))"
          gap={2}
        >
          <PanelCard>
            <VStack gap={1.5}>
              <TextTitle3 as="h4">The problem</TextTitle3>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                On-chain submission of a model score (
                <Mono>submitWork</Mono>) is trust-based — the miner self-reports the
                number with no cryptographic guarantee that any real
                computation took place. A miner can claim 100/100 and walk off
                with the escrow.
              </TextBody>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                Worse: publishing the weights to prove the score would let
                competitors free-ride on the miner&apos;s GPU compute and data
                curation, eliminating the incentive to train.
              </TextBody>
            </VStack>
          </PanelCard>

          <PanelCard>
            <VStack gap={1.5}>
              <TextTitle3 as="h4">The solution</TextTitle3>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                ZK inference. Miners run their private model through EZKL,
                producing a Halo2 proof that pins the score to the actual
                weights — without ever revealing them.{" "}
                <Mono>submitWithProof</Mono> calls the on-chain Halo2Verifier
                and reverts unless the proof checks out.
              </TextBody>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                After each block the winning shard is merged into a global
                FedAvg model so the protocol incrementally improves a shared
                MNIST classifier as a side effect of mining.
              </TextBody>
            </VStack>
          </PanelCard>
        </Grid>

        {/* ───────────────── SYSTEM ARCHITECTURE ───────────────── */}
        <SectionHeader title="System architecture" />
        <Grid
          templateColumns="repeat(auto-fit, minmax(260px, 1fr))"
          gap={2}
        >
          {ARCH_CARDS.map((c) => (
            <PanelCard key={c.title}>
              <VStack gap={1}>
                <TextLabel2
                  as="span"
                  style={{ fontWeight: 600, textTransform: "none", letterSpacing: 0 }}
                >
                  {c.title}
                </TextLabel2>
                <TextBody
                  as="p"
                  style={{
                    color: "var(--color-fgMuted)",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {c.body}
                </TextBody>
              </VStack>
            </PanelCard>
          ))}
        </Grid>

        {/* ───────────────── BLOCK LIFECYCLE ───────────────── */}
        <SectionHeader title="Block lifecycle" />
        <PanelCard>
          <VStack gap={3}>
            {LIFECYCLE.map((step, i) => (
              <HStack key={step.num} gap={3} alignItems="flex-start">
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: 16,
                    background: "var(--color-bgPrimaryWash)",
                    border: "1px solid var(--color-fgPrimary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <TextLabel2
                    as="span"
                    style={{
                      color: "var(--color-fgPrimary)",
                      fontWeight: 600,
                      letterSpacing: 0,
                    }}
                  >
                    {step.num}
                  </TextLabel2>
                </Box>
                <VStack gap={0.5} style={{ flex: 1, minWidth: 0 }}>
                  <TextLabel2
                    as="span"
                    style={{
                      fontWeight: 600,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {step.title}
                  </TextLabel2>
                  <TextBody
                    as="p"
                    style={{
                      color: "var(--color-fgMuted)",
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {step.body}
                  </TextBody>
                </VStack>
                {i < LIFECYCLE.length - 1 && null}
              </HStack>
            ))}
          </VStack>
        </PanelCard>

        {/* ───────────────── TECH STACK ───────────────── */}
        <SectionHeader title="Tech stack" />
        <VStack gap={2}>
          <StackGroup label="Contracts" items={STACK_CONTRACTS} />
          <StackGroup label="Frontend" items={STACK_FRONTEND} />
          <StackGroup label="ZK + ML" items={STACK_ZK} />
        </VStack>

        {/* ───────────────── MODEL + MINERS ───────────────── */}
        <SectionHeader title="Model &amp; miners" />
        <PanelCard>
          <VStack gap={3}>
            <HStack
              gap={3}
              flexWrap="wrap"
              alignItems="flex-end"
              justifyContent="space-between"
            >
              <VStack gap={0.5}>
                <TextCaption
                  as="span"
                  style={{ color: "var(--color-fgMuted)", letterSpacing: "0.14em" }}
                >
                  GLOBAL FEDERATED MODEL
                </TextCaption>
                <TextTitle2 as="h4">MNISTNet</TextTitle2>
                <TextBody
                  as="p"
                  style={{
                    color: "var(--color-fgMuted)",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  2-layer MLP, raw logits — softmax applied externally.
                </TextBody>
              </VStack>
              <HStack gap={1} flexWrap="wrap">
                <SpecChip label="Architecture" value="784 → 128 → 64 → 10" />
                <SpecChip label="Shards" value="4 × 10,000 MNIST" />
                <SpecChip label="Test set" value="2,000 samples" />
                <SpecChip label="Score" value="round(acc × 100)" />
              </HStack>
            </HStack>

            <Box
              style={{
                height: 1,
                background: "var(--color-bgLine)",
                width: "100%",
              }}
              aria-hidden
            />

            <Grid
              templateColumns="repeat(auto-fit, minmax(220px, 1fr))"
              gap={1.5}
            >
              {MINERS.map((m) => (
                <Box
                  key={m.name}
                  style={{
                    padding: 14,
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-bgLine)",
                    borderRadius: 12,
                  }}
                >
                  <VStack gap={1}>
                    <HStack gap={1} alignItems="center">
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          background: m.color,
                          boxShadow: `0 0 8px ${m.color}80`,
                          flexShrink: 0,
                        }}
                        aria-hidden
                      />
                      <TextLabel2
                        as="span"
                        style={{
                          fontWeight: 600,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        {m.name}
                      </TextLabel2>
                      <TextLabel2
                        as="span"
                        style={{
                          marginLeft: "auto",
                          color: "var(--color-fgMuted)",
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: 0,
                          fontSize: 11,
                        }}
                      >
                        base {m.base}/100
                      </TextLabel2>
                    </HStack>
                    <TextLabel2
                      as="span"
                      style={{
                        color: "var(--color-fgPrimary)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {m.augLabel}
                    </TextLabel2>
                    <TextBody
                      as="p"
                      style={{
                        color: "var(--color-fgMuted)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 13,
                      }}
                    >
                      {m.augDesc}
                    </TextBody>
                  </VStack>
                </Box>
              ))}
            </Grid>
          </VStack>
        </PanelCard>

        {/* ───────────────── LIMITATIONS ───────────────── */}
        <SectionHeader title="Limitations" />
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={2}>
          {LIMITATIONS.map((l) => (
            <PanelCard key={l.title}>
              <VStack gap={1}>
                <TextLabel2
                  as="span"
                  style={{
                    fontWeight: 600,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {l.title}
                </TextLabel2>
                <TextBody
                  as="p"
                  style={{
                    color: "var(--color-fgMuted)",
                    textTransform: "none",
                    letterSpacing: 0,
                  }}
                >
                  {l.body}
                </TextBody>
              </VStack>
            </PanelCard>
          ))}
        </Grid>

        {/* ───────────────── STATUS / FUTURE ───────────────── */}
        <SectionHeader title="Status" />
        <Banner
          variant="informational"
          startIcon="clock"
          title="Currently dormant"
        >
          Last commit landed on April 8, 2026. No public roadmap is checked in;
          the open thread in the codebase is the on-chain Halo2Verifier — which
          is already wired up but only exercised by the optional ZK path.
        </Banner>

        {/* ───────────────── LAUNCH LOCALLY ───────────────── */}
        <SectionHeader title="Launch locally" />
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
            gap={2}
            style={{
              padding: 16,
              borderBottom: launchOpen ? "1px solid var(--color-bgLine)" : "none",
            }}
          >
            <VStack gap={0.25} style={{ minWidth: 0 }}>
              <TextLabel2
                as="span"
                style={{
                  fontWeight: 600,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                How to launch locally
              </TextLabel2>
              <TextLabel2
                as="span"
                style={{
                  color: "var(--color-fgMuted)",
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 12,
                }}
              >
                Contracts on Base Sepolia, Flask ZK server, Vite frontend, then{" "}
                <Mono>npm run mining</Mono>.
              </TextLabel2>
            </VStack>
            <Button variant="primary" onClick={handleLaunch}>
              {launchOpen ? "Hide commands" : "Show commands"}
            </Button>
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
      </VStack>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Small internal building blocks
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <HStack alignItems="center" gap={2} style={{ marginTop: 8 }}>
      <TextTitle3 as="h3">{title}</TextTitle3>
      <span
        style={{ flex: 1, height: 1, background: "var(--color-bgLine)" }}
        aria-hidden
      />
    </HStack>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return (
    <ContentCard
      padding={4}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 16,
      }}
    >
      {children}
    </ContentCard>
  );
}

function StackGroup({
  label,
  items,
}: {
  label: string;
  items: StackItem[];
}) {
  return (
    <VStack gap={1}>
      <TextCaption
        as="span"
        style={{ color: "var(--color-fgMuted)", letterSpacing: "0.14em" }}
      >
        {label.toUpperCase()}
      </TextCaption>
      <Grid templateColumns="repeat(auto-fill, minmax(170px, 1fr))" gap={1.5}>
        {items.map((s) => (
          <Box
            key={s.name}
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
            <TextLabel2
              as="span"
              style={{
                fontWeight: 500,
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              {s.name}
            </TextLabel2>
            {s.version && (
              <TextLabel2
                as="span"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontWeight: 400,
                  fontSize: 12,
                }}
              >
                {s.version}
              </TextLabel2>
            )}
          </Box>
        ))}
      </Grid>
    </VStack>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <Box
      style={{
        padding: "6px 10px",
        background: "var(--color-bgPrimaryWash)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <TextCaption
        as="span"
        style={{ color: "var(--color-fgMuted)", letterSpacing: "0.12em" }}
      >
        {label.toUpperCase()}
      </TextCaption>
      <TextLabel2
        as="span"
        style={{
          color: "var(--color-fg)",
          fontWeight: 500,
          textTransform: "none",
          letterSpacing: 0,
          fontSize: 12.5,
          fontFamily:
            'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
        }}
      >
        {value}
      </TextLabel2>
    </Box>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily:
          'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
        fontSize: "0.92em",
        background: "var(--color-bgSecondary)",
        padding: "1px 6px",
        borderRadius: 4,
        color: "var(--color-fg)",
      }}
    >
      {children}
    </code>
  );
}
