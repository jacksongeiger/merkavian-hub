"use client";

import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Tag } from "@coinbase/cds-web/tag";
import { VStack, HStack } from "@coinbase/cds-web/layout";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
} from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";

// merkavian-dashboard runs on the user's Mac at :5055. From the Hub (served
// from ARM), the Mac is not reachable across the network, and HTTPS Hub
// iframing HTTP Mac would be blocked as mixed content anyway. So this panel
// is fallback-first: tell the user to open it directly.
const LOCAL_URL = "http://localhost:5055";

export function MerkavianHQPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ maxWidth: 720 }}
    >
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
          <StatusDot status="warning" />
          <TextTitle1 as="h2">Merkavian HQ</TextTitle1>
          <Tag colorScheme="yellow">LOCAL ONLY</Tag>
        </HStack>

        <TextBody as="p" style={{ color: "var(--color-fgMuted)", lineHeight: 1.55 }}>
          Merkavian HQ is the unified control-plane dashboard for the bots
          (cryptobot, polybot, historical trainer). It runs on your Mac at port
          5055 and is not reachable from the Hub running on ARM — the Mac is
          behind your local network, and mixed-content (HTTPS Hub iframing HTTP
          Mac) would be blocked by the browser regardless.
        </TextBody>

        <VStack gap={2} style={{ padding: 20, background: "var(--color-bgPrimaryWash)", borderRadius: 12 }}>
          <TextLabel2 as="span" style={{ color: "var(--color-fgPrimary)", fontWeight: 600, letterSpacing: "0.08em" }}>
            TO ACCESS HQ
          </TextLabel2>
          <TextBody as="p" style={{ color: "var(--color-fg)" }}>
            Open <code style={{ background: "var(--color-bg)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--color-bgLine)" }}>http://localhost:5055</code> in a browser on your Mac.
          </TextBody>
          <Button as="a" href={LOCAL_URL} target="_blank" rel="noopener noreferrer" variant="primary">
            Open Merkavian HQ
          </Button>
        </VStack>

        <VStack gap={1} style={{ paddingTop: 8 }}>
          <TextCaption as="span" style={{ color: "var(--color-fgMuted)", letterSpacing: "0.08em" }}>
            V2 MIGRATION
          </TextCaption>
          <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
            The planned next step is migrating HQ to ARM so it can be embedded directly here. Until then, this panel exists to surface the dashboard&apos;s presence and how to reach it.
          </TextBody>
        </VStack>
      </ContentCard>
    </motion.div>
  );
}
