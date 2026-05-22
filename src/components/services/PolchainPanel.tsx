"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { Collapsible } from "@coinbase/cds-web/collapsible";
import { Icon } from "@coinbase/cds-web/icons";
import { useToast } from "@coinbase/cds-web/overlays/useToast";
import { Box, Grid, HStack, VStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextDisplay3,
  TextLabel2,
  TextTitle1,
  TextTitle3,
} from "@coinbase/cds-web/typography";

// ---------------------------------------------------------------------------
// Static content — every fact below is grounded in the real ~/polchain repo.
// Sources: contracts/POLToken.sol, contracts/TaskManager.sol,
// contracts/Verifier.sol (Halo2Verifier), zk/model.py, zk/aggregate.py,
// zk/server/server.py, scripts/{miningLoop,autoMiner}.js, package.json,
// frontend/src/index.css (miner colors), frontend/src/views/Chain.jsx.
// ---------------------------------------------------------------------------

const HERO_STATS: { value: string; label: string }[] = [
  { value: "4", label: "Miners" },
  { value: "3", label: "Smart Contracts" },
  { value: "Base Sepolia", label: "Testnet · chainId 84532" },
];

const PROBLEM_STATS: { headline: string; sub: string }[] = [
  {
    headline: "OpenAI 2024",
    sub: "$3.0B training cost  vs  $3.7B revenue",
  },
  {
    headline: "Anthropic 2024",
    sub: "$1.5B training cost  vs  $2.55B revenue",
  },
];

type IconName =
  | "checkmark"
  | "arrowRight"
  | "key"
  | "gear"
  | "lock"
  | "chartLine"
  | "apiPlug"
  | "computerChip"
  | "sparkle"
  | "nodeProduct";

const SOLUTION_BULLETS: { icon: IconName; text: string }[] = [
  {
    icon: "checkmark",
    text: "Distributed compute paid out in protocol tokens, not corporate burn.",
  },
  {
    icon: "checkmark",
    text: "Halo2 zero-knowledge proofs bind score to actual inference — not claims.",
  },
  {
    icon: "checkmark",
    text: "Federated aggregation makes a shared global model a side effect of mining.",
  },
];

type LifecycleStep = { num: number; title: string; body: string };

const LIFECYCLE: LifecycleStep[] = [
  {
    num: 1,
    title: "Task Posted",
    body: "Owner calls postTask — POL reward escrowed in TaskManager.",
  },
  {
    num: 2,
    title: "Miners Train",
    body: "Each of 4 miners trains its MNIST shard locally.",
  },
  {
    num: 3,
    title: "ZK Proof Generated",
    body: "EZKL + Halo2 prove the forward pass without leaking weights.",
  },
  {
    num: 4,
    title: "Proof Submitted On-Chain",
    body: "submitWithProof invokes the Halo2Verifier contract.",
  },
  {
    num: 5,
    title: "Winner Selected",
    body: "finalizeTask picks the highest score — ties go to first submitter.",
  },
  {
    num: 6,
    title: "FedAvg Applied",
    body: "aggregate.py blends the winning shard into the global model.",
  },
  {
    num: 7,
    title: "POL Rewarded",
    body: "Escrowed POL transferred from contract to winner's wallet.",
  },
];

type ArchCard = { icon: IconName; title: string; body: string };

const ARCH_CARDS: ArchCard[] = [
  {
    icon: "key",
    title: "Smart Contracts",
    body: "POLToken ERC-20 (1M fixed supply) + TaskManager + Halo2Verifier on Base Sepolia (chainId 84532). Owner posts tasks; reward escrowed until finalize.",
  },
  {
    icon: "gear",
    title: "Mining System",
    body: "Four miners (Alpha / Beta / Gamma / Delta) sharing one wallet. Each owns a different MNIST shard and augmentation strategy.",
  },
  {
    icon: "lock",
    title: "ZK Pipeline",
    body: "ONNX export → EZKL compiles arithmetic circuit → KZG SRS → Halo2 proves the forward pass. Weights stay private.",
  },
  {
    icon: "chartLine",
    title: "Federated Aggregation",
    body: "After every block, winning shard merges into global model. 50/50 blend if it beats the current global; 80/20 toward global otherwise.",
  },
  {
    icon: "apiPlug",
    title: "Flask Proving Server",
    body: "Async proof generation on port 5001. Miners prove ahead of the next block window so submission is just a verifier call.",
  },
];

type MinerCard = {
  name: string;
  color: string;
  augLabel: string;
  augDesc: string;
};

const MINERS: MinerCard[] = [
  {
    name: "Alpha",
    color: "#00f5ff",
    augLabel: "Random rotation ±15°",
    augDesc: "Trains rotation invariance so the model survives off-axis digits.",
  },
  {
    name: "Beta",
    color: "#ffd84d",
    augLabel: "Gaussian noise σ=0.1",
    augDesc: "Builds robustness to noisy or corrupted sensor inputs.",
  },
  {
    name: "Gamma",
    color: "#4ade80",
    augLabel: "Random erasing 10–20%",
    augDesc: "Forces the model to classify partially occluded digits.",
  },
  {
    name: "Delta",
    color: "#c084fc",
    augLabel: "Clean baseline",
    augDesc: "No augmentation — pure gradient descent for comparison.",
  },
];

const ZK_STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "sparkle",
    title: "ONNX Export",
    body: "MNISTNet serialised from PyTorch into a portable ONNX graph.",
  },
  {
    icon: "computerChip",
    title: "EZKL Quantization",
    body: "Float weights mapped to integers inside a finite-field arithmetic circuit.",
  },
  {
    icon: "lock",
    title: "Halo2 Circuit",
    body: "KZG trusted setup + Halo2 generate a succinct proof of the forward pass.",
  },
  {
    icon: "checkmark",
    title: "On-Chain Verifier",
    body: "Halo2Verifier.verifyProof is called by submitWithProof — reverts on a bad proof.",
  },
];

const LIMITATIONS: { title: string; body: string }[] = [
  {
    title: "Gradient gap",
    body: "Quantisation to integers creates measurable discrepancy from the float reference model. Small for MNIST; compounds at billion-parameter scale.",
  },
  {
    title: "Proof time",
    body: "Halo2 proof generation is computationally expensive. Limits block frequency; GPU acceleration not yet integrated.",
  },
  {
    title: "Scale",
    body: "109K-parameter toy model vs frontier models at billions. ZK proving circuits don't exist at that scale today — open research.",
  },
];

// Pulled verbatim from ~/polchain/package.json `scripts`.
const LAUNCH_COMMANDS = `# 0. one-time setup
cd ~/polchain
npm install
cp .env.example .env   # fill in PRIVATE_KEY + BASE_SEPOLIA_RPC_URL

# 1. compile + deploy contracts to Base Sepolia
npm run compile
npm run deploy:baseSepolia

# 2. start the Flask ZK prove server  (port 5001)
npm run prove-server

# 3. start the React frontend  (Vite dev server)
npm run frontend

# 4. run the block producer + 4 auto-miners + admin API
npm run mining`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PolchainPanel() {
  const [launchOpen, setLaunchOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleLaunch = () => {
    setLaunchOpen(true);
    toast.show("Commands ready — paste into Terminal");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LAUNCH_COMMANDS);
      setCopied(true);
      toast.show("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.show("Couldn't copy — select the commands manually");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <VStack gap={5}>
        {/* ───────────────────── 1. HERO ───────────────────── */}
        <Section>
          <VStack gap={3}>
            <VStack gap={2}>
              <TextDisplay3 as="h2">PoLChain</TextDisplay3>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 16,
                  maxWidth: 640,
                }}
              >
                Proof-of-Learning Protocol — Decentralized AI Training on Base
                Sepolia.
              </TextBody>
            </VStack>

            <Grid templateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap={2}>
              {HERO_STATS.map((s) => (
                <StatTile key={s.label} value={s.value} label={s.label} />
              ))}
            </Grid>

            <HStack gap={1} flexWrap="wrap">
              <Tag colorScheme="yellow">RESEARCH PROTOTYPE</Tag>
              <Tag colorScheme="gray">DORMANT · APRIL 2026</Tag>
            </HStack>

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
            </HStack>
          </VStack>
        </Section>

        {/* ───────────────── 2. THE PROBLEM ───────────────── */}
        <SectionHeader title="The problem" accent="The economics of training" />
        <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={3}>
          {/* LEFT — stark stats */}
          <VStack gap={2}>
            {PROBLEM_STATS.map((p) => (
              <Box
                key={p.headline}
                style={{
                  padding: 20,
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-bgLine)",
                  borderRadius: 14,
                }}
              >
                <VStack gap={1}>
                  <TextCaption
                    as="span"
                    style={{
                      color: "var(--color-fgMuted)",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {p.headline.toUpperCase()}
                  </TextCaption>
                  <TextLabel2
                    as="span"
                    style={{
                      textTransform: "none",
                      letterSpacing: 0,
                      fontSize: 18,
                      fontWeight: 500,
                      fontFamily:
                        'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
                    }}
                  >
                    {p.sub}
                  </TextLabel2>
                </VStack>
              </Box>
            ))}
            <TextBody
              as="p"
              style={{
                color: "var(--color-fgNegative)",
                textTransform: "none",
                letterSpacing: 0,
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Profitability is structurally impossible under the current model.
            </TextBody>
          </VStack>

          {/* RIGHT — solution bullets */}
          <Box
            style={{
              padding: 24,
              background: "var(--color-bgPrimaryWash)",
              border: "1px solid var(--color-bgLine)",
              borderRadius: 14,
            }}
          >
            <VStack gap={2}>
              <TextCaption
                as="span"
                style={{
                  color: "var(--color-fgPrimary)",
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                }}
              >
                THE PROTOCOL ANSWER
              </TextCaption>
              <VStack gap={2}>
                {SOLUTION_BULLETS.map((b, i) => (
                  <HStack key={i} gap={2} alignItems="flex-start">
                    <Box
                      style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-fgPrimary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 2,
                      }}
                      aria-hidden
                    >
                      <Icon
                        name={b.icon}
                        size="xs"
                        styles={{ icon: { color: "var(--color-fgPrimary)" } }}
                      />
                    </Box>
                    <TextBody
                      as="p"
                      style={{
                        color: "var(--color-fg)",
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      {b.text}
                    </TextBody>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Box>
        </Grid>

        {/* ─────────── 3. BLOCK LIFECYCLE (centerpiece flow) ─────────── */}
        <SectionHeader title="How it works" accent="Block lifecycle" />
        <Box
          style={{
            padding: 24,
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
            overflowX: "auto",
          }}
        >
          <HStack
            gap={1}
            alignItems="flex-start"
            flexWrap="wrap"
            justifyContent="flex-start"
          >
            {LIFECYCLE.map((step, i) => (
              <HStack
                key={step.num}
                gap={1}
                alignItems="flex-start"
                style={{ flex: "0 0 auto" }}
              >
                <LifecyclePill step={step} />
                {i < LIFECYCLE.length - 1 && (
                  <Box
                    style={{
                      flexShrink: 0,
                      width: 24,
                      paddingTop: 14,
                      color: "var(--color-fgPrimary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden
                  >
                    <Icon
                      name="arrowRight"
                      size="s"
                      styles={{ icon: { color: "var(--color-fgPrimary)" } }}
                    />
                  </Box>
                )}
              </HStack>
            ))}
          </HStack>
        </Box>

        {/* ───────────────── 4. SYSTEM ARCHITECTURE ───────────────── */}
        <SectionHeader title="System architecture" accent="Five moving parts" />
        <Grid templateColumns="repeat(auto-fit, minmax(260px, 1fr))" gap={2}>
          {ARCH_CARDS.map((c) => (
            <PanelCard key={c.title}>
              <VStack gap={1.5}>
                <Box
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--color-bgPrimaryWash)",
                    border: "1px solid var(--color-bgLine)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden
                >
                  <Icon
                    name={c.icon}
                    size="s"
                    styles={{ icon: { color: "var(--color-fgPrimary)" } }}
                  />
                </Box>
                <TextTitle3 as="h4">{c.title}</TextTitle3>
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

        {/* ───────────────── 5. THE FOUR MINERS ───────────────── */}
        <SectionHeader title="The four miners" accent="Specialised shards" />
        <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2}>
          {MINERS.map((m) => (
            <Box
              key={m.name}
              style={{
                position: "relative",
                padding: "18px 18px 18px 22px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-bgLine)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {/* color accent stripe */}
              <Box
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: m.color,
                }}
                aria-hidden
              />
              <VStack gap={1.5}>
                <HStack gap={1} alignItems="center">
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      background: m.color,
                      boxShadow: `0 0 8px ${m.color}99`,
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <TextTitle3 as="h4">{m.name}</TextTitle3>
                </HStack>
                <TextLabel2
                  as="span"
                  style={{
                    color: "var(--color-fgPrimary)",
                    textTransform: "none",
                    letterSpacing: 0,
                    fontWeight: 500,
                    fontSize: 13,
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

        {/* ───────────────── 6. NEURAL NETWORK DIAGRAM ───────────────── */}
        <SectionHeader title="MNISTNet" accent="The model being trained" />
        <PanelCard>
          <VStack gap={3}>
            <Box style={{ width: "100%", overflowX: "auto" }}>
              <NeuralNetSVG />
            </Box>
            <VStack gap={0.5}>
              <TextCaption
                as="span"
                style={{
                  color: "var(--color-fgMuted)",
                  letterSpacing: "0.14em",
                }}
              >
                MNISTNET · ~109,386 PARAMETERS
              </TextCaption>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                2-layer MLP that classifies 28×28 digit images. Raw logits —
                softmax applied externally.
              </TextBody>
            </VStack>
          </VStack>
        </PanelCard>

        {/* ───────────────── 7. ZK PROOF PIPELINE ───────────────── */}
        <SectionHeader title="ZK proof pipeline" accent="EZKL → Halo2 → chain" />
        <Box
          style={{
            padding: 24,
            background: "var(--color-bg)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 16,
            overflowX: "auto",
          }}
        >
          <HStack gap={1} alignItems="flex-start" flexWrap="wrap">
            {ZK_STEPS.map((s, i) => (
              <HStack
                key={s.title}
                gap={1}
                alignItems="flex-start"
                style={{ flex: "0 0 auto" }}
              >
                <Box
                  style={{
                    width: 200,
                    padding: 14,
                    background: "var(--color-bgPrimaryWash)",
                    border: "1px solid var(--color-bgLine)",
                    borderRadius: 12,
                  }}
                >
                  <VStack gap={1}>
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-fgPrimary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-hidden
                    >
                      <Icon
                        name={s.icon}
                        size="xs"
                        styles={{
                          icon: { color: "var(--color-fgPrimary)" },
                        }}
                      />
                    </Box>
                    <TextLabel2
                      as="span"
                      style={{
                        fontWeight: 600,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      {s.title}
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
                      {s.body}
                    </TextBody>
                  </VStack>
                </Box>
                {i < ZK_STEPS.length - 1 && (
                  <Box
                    style={{
                      flexShrink: 0,
                      width: 22,
                      paddingTop: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-hidden
                  >
                    <Icon
                      name="arrowRight"
                      size="s"
                      styles={{ icon: { color: "var(--color-fgPrimary)" } }}
                    />
                  </Box>
                )}
              </HStack>
            ))}
          </HStack>
        </Box>

        <Box
          style={{
            padding: 20,
            background: "var(--color-bgPrimaryWash)",
            border: "1px solid var(--color-fgPrimary)",
            borderRadius: 14,
          }}
        >
          <TextBody
            as="p"
            style={{
              color: "var(--color-fgPrimary)",
              textTransform: "none",
              letterSpacing: 0,
              fontWeight: 500,
              fontSize: 15,
              fontStyle: "italic",
            }}
          >
            “Floating-point → integer arithmetic over a finite field is what
            makes cryptographic proof of ML inference possible.”
          </TextBody>
        </Box>

        {/* ───────────────── 8. LIMITATIONS ───────────────── */}
        <SectionHeader title="Limitations" accent="What this does not solve" />
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={2}>
          {LIMITATIONS.map((l) => (
            <PanelCard key={l.title}>
              <VStack gap={1}>
                <TextTitle3 as="h4">{l.title}</TextTitle3>
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

        {/* ───────────────── 9. LAUNCH LOCALLY ───────────────── */}
        <SectionHeader title="Launch locally" accent="Five terminal commands" />
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
            flexWrap="wrap"
            style={{
              padding: 20,
              borderBottom: launchOpen
                ? "1px solid var(--color-bgLine)"
                : "none",
            }}
          >
            <VStack gap={0.5} style={{ minWidth: 0 }}>
              <TextTitle3 as="h4">Launch PoLChain Locally</TextTitle3>
              <TextBody
                as="p"
                style={{
                  color: "var(--color-fgMuted)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 13,
                  maxWidth: 560,
                }}
              >
                Reveals the exact commands to run on your local machine —
                contracts, ZK prove server, frontend, and the mining loop.
              </TextBody>
            </VStack>
            <Button variant="primary" onClick={handleLaunch}>
              {launchOpen ? "Hide commands" : "Launch PoLChain Locally"}
            </Button>
          </HStack>
          <Collapsible collapsed={!launchOpen}>
            <Box
              padding={3}
              style={{ background: "var(--color-bgSecondary)" }}
            >
              <VStack gap={2}>
                <HStack justifyContent="flex-end">
                  <Button variant="secondary" onClick={handleCopy}>
                    {copied ? "Copied" : "Copy all"}
                  </Button>
                </HStack>
                <Box
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-bgLine)",
                    borderRadius: 10,
                    padding: 16,
                    overflowX: "auto",
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontFamily:
                        'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
                      fontSize: 12.5,
                      lineHeight: 1.7,
                      color: "var(--color-fg)",
                      whiteSpace: "pre",
                    }}
                  >
                    {LAUNCH_COMMANDS}
                  </pre>
                </Box>
              </VStack>
            </Box>
          </Collapsible>
        </ContentCard>
      </VStack>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Internal building blocks
// ---------------------------------------------------------------------------

function Section({ children }: { children: React.ReactNode }) {
  return (
    <ContentCard
      padding={5}
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

function SectionHeader({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  return (
    <HStack alignItems="baseline" gap={2} style={{ marginTop: 8 }}>
      <TextTitle3 as="h3">{title}</TextTitle3>
      {accent && (
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {accent}
        </TextCaption>
      )}
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
        height: "100%",
      }}
    >
      {children}
    </ContentCard>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <Box
      style={{
        padding: 18,
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 12,
      }}
    >
      <VStack gap={0.5}>
        <TextTitle1
          as="span"
          style={{
            color: "var(--color-fgPrimary)",
            letterSpacing: 0,
          }}
        >
          {value}
        </TextTitle1>
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            letterSpacing: "0.12em",
          }}
        >
          {label.toUpperCase()}
        </TextCaption>
      </VStack>
    </Box>
  );
}

function LifecyclePill({ step }: { step: LifecycleStep }) {
  return (
    <VStack gap={1} style={{ width: 140, flexShrink: 0 }} alignItems="center">
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "var(--color-bg)",
          border: "1.5px solid var(--color-fgPrimary)",
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
            fontSize: 15,
          }}
        >
          {step.num}
        </TextLabel2>
      </Box>
      <TextLabel2
        as="span"
        style={{
          fontWeight: 600,
          textTransform: "none",
          letterSpacing: 0,
          textAlign: "center",
          fontSize: 13,
        }}
      >
        {step.title}
      </TextLabel2>
      <TextCaption
        as="span"
        style={{
          color: "var(--color-fgMuted)",
          textTransform: "none",
          letterSpacing: 0,
          textAlign: "center",
          fontSize: 11,
          lineHeight: 1.45,
        }}
      >
        {step.body}
      </TextCaption>
    </VStack>
  );
}

// Inline SVG diagram of MNISTNet's 4 layers — small dot per neuron sample,
// labelled with the actual layer width.
function NeuralNetSVG() {
  const layers = [
    { count: 4,  label: "784",  caption: "input" },
    { count: 5,  label: "128",  caption: "hidden 1" },
    { count: 4,  label: "64",   caption: "hidden 2" },
    { count: 10, label: "10",   caption: "output" },
  ];

  // Layout grid
  const width  = 640;
  const height = 320;
  const padX   = 60;
  const padY   = 48;
  const colXs  = layers.map(
    (_, i) => padX + (i * (width - 2 * padX)) / (layers.length - 1)
  );

  // y coordinates per layer (centered vertically)
  const yFor = (count: number, idx: number) => {
    const usable = height - 2 * padY;
    if (count === 1) return height / 2;
    const step = usable / (count - 1);
    return padY + step * idx;
  };

  // Build edges between consecutive layers
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const a = layers[li];
    const b = layers[li + 1];
    for (let ai = 0; ai < a.count; ai++) {
      for (let bi = 0; bi < b.count; bi++) {
        edges.push({
          x1: colXs[li],
          y1: yFor(a.count, ai),
          x2: colXs[li + 1],
          y2: yFor(b.count, bi),
        });
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 720, display: "block", margin: "0 auto" }}
      role="img"
      aria-label="Diagram of MNISTNet — four layers of neurons connected by weights"
    >
      {/* Edges */}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="var(--color-bgLine)"
          strokeWidth={0.6}
        />
      ))}
      {/* Neurons + labels */}
      {layers.map((layer, li) => (
        <g key={li}>
          {Array.from({ length: layer.count }).map((_, ni) => {
            const isEdgeLayer = li === 0 || li === layers.length - 1;
            return (
              <circle
                key={ni}
                cx={colXs[li]}
                cy={yFor(layer.count, ni)}
                r={6}
                fill={
                  isEdgeLayer
                    ? "var(--color-fgPrimary)"
                    : "var(--color-bg)"
                }
                stroke="var(--color-fgPrimary)"
                strokeWidth={1.5}
              />
            );
          })}
          {/* layer label below */}
          <text
            x={colXs[li]}
            y={height - 18}
            textAnchor="middle"
            fontFamily="ui-monospace, SF Mono, Menlo, monospace"
            fontSize={13}
            fontWeight={600}
            fill="var(--color-fg)"
          >
            {layer.label}
          </text>
          <text
            x={colXs[li]}
            y={height - 2}
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize={11}
            fill="var(--color-fgMuted)"
          >
            {layer.caption}
          </text>
        </g>
      ))}
    </svg>
  );
}
