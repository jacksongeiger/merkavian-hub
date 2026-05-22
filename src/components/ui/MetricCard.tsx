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
  tone?: "default" | "positive" | "negative" | "warning" | "muted" | "primary";
};

const VALUE_COLORS: Record<NonNullable<Props["tone"]>, string> = {
  default: "var(--color-fg)",
  positive: "var(--color-fgPositive)",
  negative: "var(--color-fgNegative)",
  warning: "var(--color-fgWarning)",
  muted: "var(--color-fgMuted)",
  primary: "var(--color-fgPrimary)",
};

export function MetricCard({ label, value, sub, accessory, tone = "default" }: Props) {
  return (
    <ContentCard
      padding={3}
      gap={2}
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 12,
      }}
    >
      <HStack justifyContent="space-between" alignItems="center" width="100%">
        <TextCaption as="span" style={{ color: "var(--color-fgMuted)", letterSpacing: "0.08em" }}>
          {label.toUpperCase()}
        </TextCaption>
        {accessory}
      </HStack>
      <VStack gap={1}>
        <TextTitle1 as="span" style={{ color: VALUE_COLORS[tone] }}>
          {value}
        </TextTitle1>
        {sub ? (
          <TextBody as="span" style={{ color: "var(--color-fgMuted)" }}>
            {sub}
          </TextBody>
        ) : null}
      </VStack>
    </ContentCard>
  );
}
