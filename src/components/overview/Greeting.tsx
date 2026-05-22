"use client";

import { useEffect, useState } from "react";
import { VStack } from "@coinbase/cds-web/layout";
import { TextBody, TextDisplay3 } from "@coinbase/cds-web/typography";

const NAME = "Jackson";

function greetingFor(hour: number): string {
  if (hour >= 5 && hour <= 11) return `Good morning, ${NAME}`;
  if (hour >= 12 && hour <= 17) return `Good afternoon, ${NAME}`;
  return `Good evening, ${NAME}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Greeting() {
  // Render placeholder on server to avoid hydration mismatch; populate on mount.
  const [text, setText] = useState<string>("");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    setText(greetingFor(now.getHours()));
    setDate(formatDate(now));
  }, []);

  return (
    <VStack gap={1}>
      <TextBody
        as="p"
        style={{
          color: "var(--color-fgMuted)",
          textTransform: "none",
          letterSpacing: 0,
        }}
      >
        {text || " "}
      </TextBody>
      <TextDisplay3 as="h1" style={{ color: "var(--color-fg)" }}>
        {date || " "}
      </TextDisplay3>
    </VStack>
  );
}
