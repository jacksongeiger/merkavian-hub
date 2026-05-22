"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { Spinner } from "@coinbase/cds-web/loaders";
import { VStack, Box } from "@coinbase/cds-web/layout";
import { TextBody, TextTitle2 } from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";

type Props = {
  name: string;
  src: string;
  /** ms to wait for the iframe to fire `load` before showing the fallback. */
  loadTimeoutMs?: number;
};

type State = "loading" | "loaded" | "failed";

export function IframePanel({ name, src, loadTimeoutMs = 12_000 }: Props) {
  const [state, setState] = useState<State>("loading");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setState((current) => (current === "loading" ? "failed" : current));
    }, loadTimeoutMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadTimeoutMs]);

  const handleLoad = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setState("loaded");
  };

  if (state === "failed") {
    return <IframeFallback name={name} src={src} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {state === "loading" && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{ position: "absolute", inset: 0 }}
        >
          <Spinner size={28} />
        </Box>
      )}
      <iframe
        src={src}
        title={name}
        onLoad={handleLoad}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "var(--color-bg)",
          opacity: state === "loaded" ? 1 : 0,
          transition: "opacity 220ms ease-out",
        }}
      />
    </motion.div>
  );
}

function IframeFallback({ name, src }: { name: string; src: string }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      style={{
        height: "100%",
        width: "100%",
        background: "var(--color-bg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 16,
      }}
    >
      <VStack gap={3} alignItems="center" style={{ maxWidth: 480, textAlign: "center", padding: 32 }}>
        <StatusDot status="warning" size={14} />
        <TextTitle2 as="h2">{name} unavailable</TextTitle2>
        <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
          The {name} service did not respond in time. It may be offline or restarting. Try opening it directly in a new tab.
        </TextBody>
        <Button as="a" href={src} target="_blank" rel="noopener noreferrer" variant="primary">
          Open in new tab
        </Button>
      </VStack>
    </Box>
  );
}
