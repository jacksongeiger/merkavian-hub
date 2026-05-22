"use client";

import type { ReactNode } from "react";
import { ContentCard } from "@coinbase/cds-web/cards";
import { VStack, HStack } from "@coinbase/cds-web/layout";
import { TextBody, TextCaption, TextTitle1 } from "@coinbase/cds-web/typography";

type Props = {
  label: string;
  value: ReactNode;
  sub?: string;
  accessory?: ReactNode;
  tone?: "default" | "positive" | "negative" | "warning" | "muted";
};

const VALUE_COLORS: Record<NonNullable<Props["tone"]>, string> = {
  default: "var(--cds-color-foregroundPrimary, rgb(255,255,255))",
  positive: "var(--cds-color-foregroundPositive, rgb(39,173,117))",
  negative: "var(--cds-color-foregroundNegative, rgb(240,97,109))",
  warning: "var(--cds-color-foregroundWarning, rgb(248,150,86))",
  muted: "var(--cds-color-foregroundMuted, rgb(138,145,158))",
};

export function MetricCard({ label, value, sub, accessory, tone = "default" }: Props) {
  return (
    <ContentCard padding={3} gap={2}>
      <HStack justifyContent="space-between" alignItems="center" width="100%">
        <TextCaption as="span">{label.toUpperCase()}</TextCaption>
        {accessory}
      </HStack>
      <VStack gap={1}>
        <TextTitle1 as="span" style={{ color: VALUE_COLORS[tone] }}>
          {value}
        </TextTitle1>
        {sub ? <TextBody as="span">{sub}</TextBody> : null}
      </VStack>
    </ContentCard>
  );
}
