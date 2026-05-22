"use client";

import { usePathname, useRouter } from "next/navigation";
import { HStack } from "@coinbase/cds-web/layout";
import {
  TextCaption,
  TextLabel1,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import { IconButton } from "@coinbase/cds-web/buttons";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tooltip } from "@/components/ui/Tooltip";
import { useServiceStatus, type ServiceStatus } from "@/lib/useServiceStatus";
import { useHubSettings } from "@/lib/use-hub-settings";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/crypto-tracker": "Crypto Tracker",
  "/rapid-drafter": "Rapid Drafter",
  "/merkavian-trading": "Merkavian Trading",
  "/admin": "Admin",
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

export function HubTopNav() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { settings } = useHubSettings();
  const cryptobot = useServiceStatus("/api/cryptobot", settings.pollingMs || 30_000);
  const polybot = useServiceStatus("/api/polybot", settings.pollingMs || 30_000);
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/");

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
          {settings.hubTitle || "MERKAVIAN HUB"}
        </TextLabel1>
      </HStack>

      {/* CENTER — current page title */}
      <TextTitle3 as="h1" style={{ textAlign: "center", whiteSpace: "nowrap" }}>
        {titleFor(pathname)}
      </TextTitle3>

      {/* RIGHT — bot status dots + admin gear */}
      <HStack alignItems="center" gap={3} justifyContent="flex-end">
        <Tooltip content="Cryptobot status — Coinbase Advanced Trade bot running on ARM">
          <HStack alignItems="center" gap={1}>
            <StatusDot status={dotKind(cryptobot)} size={8} ariaLabel={`Crypto Bot ${cryptobot}`} />
            <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
              CRYPTO
            </TextCaption>
          </HStack>
        </Tooltip>
        <Tooltip content="Polybot status — Polymarket prediction market bot running on ARM">
          <HStack alignItems="center" gap={1}>
            <StatusDot status={dotKind(polybot)} size={8} ariaLabel={`Polybot ${polybot}`} />
            <TextCaption as="span" style={{ color: "var(--color-fgMuted)" }}>
              POLY
            </TextCaption>
          </HStack>
        </Tooltip>
        <span
          style={{
            width: 1,
            height: 20,
            background: "var(--color-bgLine)",
            display: "inline-block",
          }}
          aria-hidden
        />
        <Tooltip content="Hub settings and administration">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              padding: 2,
              background: adminActive ? "var(--color-bgPrimaryWash)" : "transparent",
              transition: "background 160ms ease",
            }}
          >
            <IconButton
              name="gear"
              variant="secondary"
              active={adminActive}
              onClick={() => router.push("/admin")}
              aria-label="Open admin"
            />
          </span>
        </Tooltip>
      </HStack>
    </header>
  );
}
