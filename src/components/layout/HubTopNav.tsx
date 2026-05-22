"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HStack } from "@coinbase/cds-web/layout";
import {
  TextCaption,
  TextLabel1,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { StatusDot } from "@/components/ui/StatusDot";
import { useServiceStatus, type ServiceStatus } from "@/lib/useServiceStatus";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/crypto-tracker": "Crypto Tracker",
  "/rapid-drafter": "Rapid Drafter",
  "/merkavian-hq": "Merkavian HQ",
  "/polchain": "PoLChain",
};

function titleFor(path: string): string {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path];
  for (const key of Object.keys(PAGE_TITLES)) {
    if (key !== "/" && path.startsWith(key + "/")) return PAGE_TITLES[key];
  }
  return "Merkavian Hub";
}

function dotKind(s: ServiceStatus): "online" | "offline" | "warning" {
  return s === "ok" ? "online" : s === "down" ? "offline" : "warning";
}

function useLiveClock(): string {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function HubTopNav() {
  const pathname = usePathname() ?? "/";
  const cryptobot = useServiceStatus("/api/cryptobot");
  const polybot = useServiceStatus("/api/polybot");
  const clock = useLiveClock();

  return (
    <header
      style={{
        height: 64,
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-bgLine)",
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 24px",
        gap: 24,
      }}
    >
      {/* LEFT — wordmark */}
      <HStack alignItems="center" gap={1}>
        <TextLabel1
          as="span"
          style={{
            color: "var(--color-fgPrimary)",
            letterSpacing: "0.18em",
            fontWeight: 600,
          }}
        >
          MERKAVIAN HUB
        </TextLabel1>
      </HStack>

      {/* CENTER — current page title */}
      <TextTitle3 as="h1" style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        {titleFor(pathname)}
      </TextTitle3>

      {/* RIGHT — clock + bot status dots */}
      <HStack alignItems="center" gap={3} justifyContent="flex-end">
        <HStack alignItems="center" gap={1.5}>
          <StatusDot status={dotKind(cryptobot)} size={8} ariaLabel={`Crypto Bot ${cryptobot}`} />
          <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
            CRYPTO
          </TextCaption>
        </HStack>
        <HStack alignItems="center" gap={1.5}>
          <StatusDot status={dotKind(polybot)} size={8} ariaLabel={`Polybot ${polybot}`} />
          <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
            POLY
          </TextCaption>
        </HStack>
        <span
          style={{
            width: 1,
            height: 20,
            background: "var(--color-bgLine)",
            display: "inline-block",
          }}
          aria-hidden
        />
        <TextCaption
          as="span"
          style={{
            color: "var(--color-fgMuted)",
            fontVariantNumeric: "tabular-nums",
            minWidth: 70,
            textAlign: "right",
          }}
        >
          {clock || "—"}
        </TextCaption>
      </HStack>
    </header>
  );
}
