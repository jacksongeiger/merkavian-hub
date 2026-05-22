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
import { Tooltip } from "@/components/ui/Tooltip";

// ---------------------------------------------------------------------------
// Static content — every fact below is grounded in the real ~/polchain repo.
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
    text: "Distributed compute paid in protocol tokens.",
  },
  {
    icon: "checkmark",
    text: "Cryptographic proof of training, not just claims.",
  },
  {
    icon: "checkmark",
    text: "Federated aggregation produces a shared model as a side effect.",
  },
];

type LifecycleStep = {
  num: number;
  title: string;
  body: string;
  tooltip: string;
};

const LIFECYCLE: LifecycleStep[] = [
  {
    num: 1,
    title: "Task Posted",
    body: "Reward escrowed in TaskManager.",
    tooltip:
      "The protocol owner calls postTask() on the TaskManager smart contract, setting the reward (100 $POL), score threshold, and 30-second deadline.",
  },
  {
    num: 2,
    title: "Miners Train",
    body: "Each of 4 miners trains MNISTNet locally.",
    tooltip:
      "Each of the 4 miners trains MNISTNet on their local data shard. Alpha uses rotation, Beta uses noise, Gamma uses erasing, Delta uses clean data.",
  },
  {
    num: 3,
    title: "ZK Proof Generated",
    body: "EZKL + Halo2 prove the forward pass.",
    tooltip:
      "The Flask proving server exports the training computation as ONNX, compiles it through EZKL into a Halo2 circuit, and generates a cryptographic proof.",
  },
  {
    num: 4,
    title: "Proof Submitted On-Chain",
    body: "submitWork invokes the Halo2Verifier.",
    tooltip:
      "The miner calls submitWork() on TaskManager with their gradient hash, accuracy score (0-100), and ZK proof. Invalid proofs are rejected.",
  },
  {
    num: 5,
    title: "Winner Selected",
    body: "finalizeTask picks the highest score.",
    tooltip:
      "TaskManager finalizes the block by selecting the miner with the highest verified score. Tied scores go to earliest submission.",
  },
  {
    num: 6,
    title: "FedAvg Applied",
    body: "Winning shard merges into global model.",
    tooltip:
      "The winning gradient is tested against a held-out validation set. If the updated model beats the minimum accuracy threshold, FedAvg merges it into the global model.",
  },
  {
    num: 7,
    title: "$POL Rewarded",
    body: "Escrowed POL transferred to winner.",
    tooltip:
      "The winner receives $POL tokens via transferFrom. The winning gradient hash is recorded on-chain as the anchor for the next block.",
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

type ZKStep = { icon: IconName; title: string; body: string; tooltip: string };

const ZK_STEPS: ZKStep[] = [
  {
    icon: "sparkle",
    title: "ONNX Export",
    body: "MNISTNet serialised into a portable ONNX graph.",
    tooltip:
      "The neural network training computation is serialized as an ONNX graph — a standard format that captures the exact mathematical operations performed.",
  },
  {
    icon: "computerChip",
    title: "EZKL Quantization",
    body: "Float weights mapped to integers in a finite field.",
    tooltip:
      "EZKL converts floating-point operations into integer arithmetic over a finite field. This is necessary because ZK circuits cannot natively handle decimals.",
  },
  {
    icon: "lock",
    title: "Halo2 Circuit",
    body: "KZG setup + Halo2 generate a succinct proof.",
    tooltip:
      "The quantized computation is compiled into a Halo2 ZK circuit that can generate a cryptographic proof of the computation without revealing the inputs.",
  },
  {
    icon: "checkmark",
    title: "On-Chain Verifier",
    body: "Halo2Verifier.verifyProof reverts on bad proofs.",
    tooltip:
      "The auto-generated Solidity Verifier contract checks the proof on Base Sepolia. If valid, the submission is accepted. If invalid, it is rejected entirely.",
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
    title: "Toy scale",
    body: "109K-parameter toy model vs frontier models at billions. ZK proving circuits don't exist at that scale today — open research.",
  },
];

const MODEL_FACTS: { label: string; value: string }[] = [
  { label: "Architecture", value: "784 → 128 → 64 → 10" },
  { label: "Parameters", value: "~109,386" },
  { label: "Shards", value: "4 × 10,000" },
  { label: "Test set", value: "2,000" },
  { label: "Score", value: "round(acc × 100)" },
];

type MnistLayer = { label: string; size: number; tooltip: string };

const MNIST_LAYERS: MnistLayer[] = [
  {
    label: "Input (784)",
    size: 4,
    tooltip:
      "784 neurons — one per pixel of a 28×28 grayscale MNIST image. Each value is a normalized pixel intensity 0-1.",
  },
  {
    label: "Hidden (128)",
    size: 5,
    tooltip:
      "First hidden layer — 128 neurons with ReLU activation. Learns low-level features like edges and curves.",
  },
  {
    label: "Hidden (64)",
    size: 4,
    tooltip:
      "Second hidden layer — 64 neurons with ReLU activation. Combines features into higher-level digit patterns.",
  },
  {
    label: "Output (10)",
    size: 10,
    tooltip:
      "Output layer — 10 neurons, one per digit class (0-9). Softmax activation produces a probability distribution. Highest probability = predicted digit.",
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

type TabKey = "overview" | "architecture" | "model" | "limitations" | "launch";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "architecture", label: "Architecture" },
  { key: "model", label: "Model" },
  { key: "limitations", label: "Limitations" },
  { key: "launch", label: "Launch" },
];

export function PolchainPanel() {
  const [tab, setTab] = useState<TabKey>("overview");
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
      <VStack gap={4}>
        {/* ───────── Tab strip ───────── */}
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            background: "var(--color-bg)",
            paddingTop: 4,
            paddingBottom: 4,
          }}
        >
          <HStack gap={1} flexWrap="wrap">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  style={{
                    appearance: "none",
                    background: active
                      ? "var(--color-bgPrimaryWash)"
                      : "var(--color-bg)",
                    border: active
                      ? "1px solid var(--color-fgPrimary)"
                      : "1px solid var(--color-bgLine)",
                    color: active
                      ? "var(--color-fgPrimary)"
                      : "var(--color-fg)",
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </HStack>
        </Box>

        {tab === "overview" && (
          <OverviewTab />
        )}
        {tab === "architecture" && <ArchitectureTab />}
        {tab === "model" && <ModelTab />}
        {tab === "limitations" && <LimitationsTab />}
        {tab === "launch" && (
          <LaunchTab
            launchOpen={launchOpen}
            copied={copied}
            onLaunch={handleLaunch}
            onCopy={handleCopy}
          />
        )}
      </VStack>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function OverviewTab() {
  return (
    <VStack gap={4}>
      {/* HERO */}
      <PanelCard>
        <VStack gap={3}>
          <VStack gap={1}>
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
              Sepolia
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
      </PanelCard>

      {/* PROBLEM & SOLUTION */}
      <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={3}>
        {/* LEFT */}
        <VStack gap={2}>
          {PROBLEM_STATS.map((p) => (
            <Box
              key={p.headline}
              style={{
                padding: 18,
                background: "var(--color-bg)",
                border: "1px solid var(--color-bgLine)",
                borderRadius: 14,
              }}
            >
              <VStack gap={0.5}>
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
                    fontSize: 16,
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
              color: "var(--color-fgMuted)",
              textTransform: "none",
              letterSpacing: 0,
              fontWeight: 400,
              marginTop: 4,
            }}
          >
            Training costs consumed 81% of OpenAI&apos;s revenue and 59% of
            Anthropic&apos;s in 2024.
          </TextBody>
        </VStack>

        {/* RIGHT */}
        <Box
          style={{
            padding: 20,
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

      {/* LIFECYCLE */}
      <SectionHeader title="Block lifecycle" accent="The centerpiece flow" />
      <Box
        style={{
          padding: 20,
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
              <Tooltip content={step.tooltip}>
                <Box style={{ display: "inline-block" }}>
                  <LifecyclePill step={step} />
                </Box>
              </Tooltip>
              {i < LIFECYCLE.length - 1 && (
                <Box
                  style={{
                    flexShrink: 0,
                    width: 22,
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
    </VStack>
  );
}

function ArchitectureTab() {
  return (
    <VStack gap={4}>
      {/* SYSTEM ARCHITECTURE */}
      <SectionHeader title="System architecture" accent="Five moving parts" />
      <Grid templateColumns="repeat(auto-fit, minmax(240px, 1fr))" gap={2}>
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
                  fontSize: 13,
                }}
              >
                {c.body}
              </TextBody>
            </VStack>
          </PanelCard>
        ))}
      </Grid>

      {/* ZK PIPELINE */}
      <SectionHeader title="ZK pipeline" accent="EZKL → Halo2 → chain" />
      <Box
        style={{
          padding: 20,
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
              <Tooltip content={s.tooltip}>
                <Box
                  style={{
                    display: "inline-block",
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
              </Tooltip>
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
          padding: 16,
          background: "var(--color-bgPrimaryWash)",
          border: "1px solid var(--color-bgLine)",
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
            fontSize: 14,
            fontStyle: "italic",
          }}
        >
          &ldquo;Floating point → integer arithmetic over a finite field is
          what makes cryptographic proof of ML inference possible.&rdquo;
        </TextBody>
      </Box>

      {/* FOUR MINERS */}
      <SectionHeader title="The four miners" accent="Specialised shards" />
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
        {MINERS.map((m) => (
          <Box
            key={m.name}
            style={{
              position: "relative",
              padding: "16px 16px 16px 20px",
              background: "var(--color-bg)",
              border: "1px solid var(--color-bgLine)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
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
            <VStack gap={1}>
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
                  fontSize: 12.5,
                }}
              >
                {m.augDesc}
              </TextBody>
            </VStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
}

function ModelTab() {
  return (
    <VStack gap={4}>
      <SectionHeader title="MNISTNet" accent="The model being trained" />
      <PanelCard>
        <VStack gap={3}>
          <Box style={{ width: "100%", overflowX: "auto" }}>
            <NeuralNetSVG />
          </Box>
          <Grid templateColumns="repeat(4, 1fr)" gap={2}>
            {MNIST_LAYERS.map((l) => (
              <VStack key={l.label} gap={0.5} alignItems="center">
                <HStack gap={1} alignItems="center" justifyContent="center">
                  <TextLabel2
                    as="span"
                    style={{
                      fontWeight: 600,
                      textTransform: "none",
                      letterSpacing: 0,
                      fontSize: 13,
                    }}
                  >
                    {l.label}
                  </TextLabel2>
                  <Tooltip content={l.tooltip} showIcon />
                </HStack>
              </VStack>
            ))}
          </Grid>
        </VStack>
      </PanelCard>

      <SectionHeader title="Model facts" accent="The numbers behind it" />
      <Grid templateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap={2}>
        {MODEL_FACTS.map((f) => (
          <Box
            key={f.label}
            style={{
              padding: 16,
              background: "var(--color-bg)",
              border: "1px solid var(--color-bgLine)",
              borderRadius: 12,
            }}
          >
            <VStack gap={0.5}>
              <TextCaption
                as="span"
                style={{
                  color: "var(--color-fgMuted)",
                  letterSpacing: "0.14em",
                }}
              >
                {f.label.toUpperCase()}
              </TextCaption>
              <TextLabel2
                as="span"
                style={{
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily:
                    'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
                }}
              >
                {f.value}
              </TextLabel2>
            </VStack>
          </Box>
        ))}
      </Grid>
    </VStack>
  );
}

function LimitationsTab() {
  return (
    <VStack gap={4}>
      <SectionHeader title="Limitations" accent="What this does not solve" />
      <Grid templateColumns="repeat(auto-fit, minmax(260px, 1fr))" gap={2}>
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
                  fontSize: 13,
                }}
              >
                {l.body}
              </TextBody>
            </VStack>
          </PanelCard>
        ))}
      </Grid>

      <Box
        style={{
          padding: 18,
          background: "var(--color-bgSecondary)",
          border: "1px solid var(--color-bgLine)",
          borderRadius: 14,
        }}
      >
        <HStack gap={2} alignItems="center" flexWrap="wrap">
          <Tag colorScheme="gray">STATUS</Tag>
          <TextBody
            as="p"
            style={{
              color: "var(--color-fgMuted)",
              textTransform: "none",
              letterSpacing: 0,
              fontSize: 14,
            }}
          >
            Currently dormant — last commit April 8, 2026.
          </TextBody>
        </HStack>
      </Box>
    </VStack>
  );
}

function LaunchTab({
  launchOpen,
  copied,
  onLaunch,
  onCopy,
}: {
  launchOpen: boolean;
  copied: boolean;
  onLaunch: () => void;
  onCopy: () => void;
}) {
  return (
    <VStack gap={4}>
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
          <Button variant="primary" onClick={onLaunch}>
            {launchOpen ? "Hide commands" : "Launch PoLChain Locally"}
          </Button>
        </HStack>
        <Collapsible collapsed={!launchOpen}>
          <Box padding={3} style={{ background: "var(--color-bgSecondary)" }}>
            <VStack gap={2}>
              <HStack justifyContent="flex-end">
                <Button variant="secondary" onClick={onCopy}>
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
  );
}

// ---------------------------------------------------------------------------
// Internal building blocks
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  accent,
}: {
  title: string;
  accent?: string;
}) {
  return (
    <HStack alignItems="baseline" gap={2}>
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
        padding: 16,
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
    <VStack gap={1} style={{ width: 130, flexShrink: 0 }} alignItems="center">
      <Box
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
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
            fontSize: 14,
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
          fontSize: 12.5,
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

// Inline SVG diagram of MNISTNet's 4 layers.
function NeuralNetSVG() {
  const layers = MNIST_LAYERS;

  const width = 640;
  const height = 280;
  const padX = 60;
  const padY = 44;
  const colXs = layers.map(
    (_, i) => padX + (i * (width - 2 * padX)) / (layers.length - 1)
  );

  const yFor = (count: number, idx: number) => {
    const usable = height - 2 * padY;
    if (count === 1) return height / 2;
    const step = usable / (count - 1);
    return padY + step * idx;
  };

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let li = 0; li < layers.length - 1; li++) {
    const a = layers[li];
    const b = layers[li + 1];
    for (let ai = 0; ai < a.size; ai++) {
      for (let bi = 0; bi < b.size; bi++) {
        edges.push({
          x1: colXs[li],
          y1: yFor(a.size, ai),
          x2: colXs[li + 1],
          y2: yFor(b.size, bi),
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
      {layers.map((layer, li) => (
        <g key={li}>
          {Array.from({ length: layer.size }).map((_, ni) => {
            const isEdgeLayer = li === 0 || li === layers.length - 1;
            return (
              <circle
                key={ni}
                cx={colXs[li]}
                cy={yFor(layer.size, ni)}
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
        </g>
      ))}
    </svg>
  );
}
