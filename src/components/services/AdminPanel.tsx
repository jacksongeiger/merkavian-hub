"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@coinbase/cds-web/buttons";
import { ContentCard } from "@coinbase/cds-web/cards";
import { Collapsible } from "@coinbase/cds-web/collapsible";
import { Switch, TextInput } from "@coinbase/cds-web/controls";
import { Box, HStack, VStack } from "@coinbase/cds-web/layout";
import { Alert } from "@coinbase/cds-web/overlays";
import {
  TextBody,
  TextCaption,
  TextLabel2,
  TextTitle1,
  TextTitle3,
} from "@coinbase/cds-web/typography";
import {
  DEFAULT_HUB_SETTINGS,
  useHubSettings,
  type HubSettings,
} from "@/lib/use-hub-settings";
import pkg from "../../../package.json";

const TABS: ReadonlyArray<{ title: string; href: string }> = [
  { title: "Overview", href: "/" },
  { title: "Crypto Tracker", href: "/crypto-tracker" },
  { title: "Rapid Drafter", href: "/rapid-drafter" },
  { title: "PoLChain", href: "/polchain" },
  { title: "Merkavian Trading", href: "/merkavian-trading" },
];

const POLLING_OPTIONS: ReadonlyArray<{
  value: HubSettings["pollingMs"];
  label: string;
}> = [
  { value: 15000, label: "15 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "60 seconds" },
  { value: 0, label: "Manual only" },
];

const TIMEZONE_OPTIONS: ReadonlyArray<{
  value: HubSettings["timezone"];
  label: string;
}> = [
  { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
  { value: "America/New_York", label: "Eastern (New York)" },
  { value: "UTC", label: "UTC" },
];

const SERVICES: ReadonlyArray<{ name: string; endpoint: string }> = [
  { name: "cryptobot", endpoint: "/api/cryptobot" },
  { name: "polybot", endpoint: "/api/polybot" },
];

export default function AdminPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <VStack gap={4}>
        <VStack gap={1}>
          <TextTitle1 as="h2">Admin</TextTitle1>
          <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
            Hub configuration, service diagnostics, and deployment info. All
            settings persist to localStorage on this device.
          </TextBody>
        </VStack>

        <TabVisibilitySection />
        <HubSettingsSection />
        <ServiceStatusSection />
        <DeploymentSection version={pkg.version} />
        <DangerZoneSection />
      </VStack>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* shared building blocks                                              */
/* ------------------------------------------------------------------ */

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
      gap={3}
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

function RowDivider() {
  return (
    <span
      aria-hidden
      style={{
        height: 1,
        background: "var(--color-bgLine)",
        width: "100%",
        display: "block",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 1. Tab Visibility                                                   */
/* ------------------------------------------------------------------ */

function TabVisibilitySection() {
  const { settings, setSettings } = useHubSettings();
  const hidden = new Set(settings.hiddenTabs);

  const toggle = (href: string, visible: boolean) => {
    const next = new Set(settings.hiddenTabs);
    if (visible) {
      next.delete(href);
    } else {
      next.add(href);
    }
    setSettings({ hiddenTabs: Array.from(next) });
  };

  return (
    <>
      <SectionHeader title="Tab Visibility" />
      <PanelCard>
        <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
          Hide tabs from the sidebar. Hidden tabs remain accessible by URL.
        </TextBody>
        <VStack gap={0}>
          {TABS.map((tab, i) => {
            const isVisible = !hidden.has(tab.href);
            return (
              <Box key={tab.href}>
                {i > 0 && <RowDivider />}
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  style={{ padding: "12px 0", width: "100%" }}
                >
                  <VStack gap={0}>
                    <TextLabel2 as="span" style={{ fontWeight: 500 }}>
                      {tab.title}
                    </TextLabel2>
                    <TextCaption
                      as="span"
                      style={{
                        color: "var(--color-fgMuted)",
                        textTransform: "none",
                        letterSpacing: 0,
                        fontFamily:
                          'ui-monospace, "SF Mono", Menlo, Monaco, monospace',
                      }}
                    >
                      {tab.href}
                    </TextCaption>
                  </VStack>
                  <Switch
                    checked={isVisible}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      toggle(tab.href, e.target.checked)
                    }
                    accessibilityLabel={`Toggle visibility for ${tab.title}`}
                  />
                </HStack>
              </Box>
            );
          })}
        </VStack>
        <HStack gap={2} flexWrap="wrap" style={{ marginTop: 8 }}>
          <Button
            variant="secondary"
            onClick={() =>
              setSettings({ hiddenTabs: ["/merkavian-trading", "/admin"] })
            }
          >
            Presentation Mode
          </Button>
          <Button
            variant="tertiary"
            onClick={() => setSettings({ hiddenTabs: [] })}
          >
            Reset to Default
          </Button>
        </HStack>
      </PanelCard>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Hub Settings                                                     */
/* ------------------------------------------------------------------ */

function HubSettingsSection() {
  const { settings, setSettings } = useHubSettings();

  // Local input state so the user can type without each keystroke racing
  // through localStorage; commit on blur (smoother UX than debounce).
  const [titleDraft, setTitleDraft] = useState(settings.hubTitle);
  const lastCommittedRef = useRef(settings.hubTitle);

  // Re-sync the draft if settings change from elsewhere (other tab, reset).
  useEffect(() => {
    if (settings.hubTitle !== lastCommittedRef.current) {
      setTitleDraft(settings.hubTitle);
      lastCommittedRef.current = settings.hubTitle;
    }
  }, [settings.hubTitle]);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    const next = trimmed.length > 0 ? trimmed : DEFAULT_HUB_SETTINGS.hubTitle;
    if (next !== settings.hubTitle) {
      setSettings({ hubTitle: next });
    }
    setTitleDraft(next);
    lastCommittedRef.current = next;
  };

  return (
    <>
      <SectionHeader title="Hub Settings" />
      <PanelCard>
        <VStack gap={3}>
          <VStack gap={1}>
            <TextLabel2 as="label" style={{ fontWeight: 500 }}>
              Hub title (topnav wordmark)
            </TextLabel2>
            <TextInput
              value={titleDraft}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitleDraft(e.target.value)
              }
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder={DEFAULT_HUB_SETTINGS.hubTitle}
              accessibilityLabel="Hub title"
            />
            <TextCaption
              as="span"
              style={{
                color: "var(--color-fgMuted)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              Saved on blur. Empty resets to default.
            </TextCaption>
          </VStack>

          <RowDivider />

          <VStack gap={1}>
            <TextLabel2 as="span" style={{ fontWeight: 500 }}>
              Polling interval
            </TextLabel2>
            <NativeSelect
              value={String(settings.pollingMs)}
              onChange={(v) =>
                setSettings({
                  pollingMs: Number(v) as HubSettings["pollingMs"],
                })
              }
              ariaLabel="Polling interval"
              options={POLLING_OPTIONS.map((o) => ({
                value: String(o.value),
                label: o.label,
              }))}
            />
            <TextCaption
              as="span"
              style={{
                color: "var(--color-fgMuted)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              How often live cards refetch. &quot;Manual only&quot; disables polling.
            </TextCaption>
          </VStack>

          <RowDivider />

          <VStack gap={1}>
            <TextLabel2 as="span" style={{ fontWeight: 500 }}>
              Timezone
            </TextLabel2>
            <NativeSelect
              value={settings.timezone}
              onChange={(v) =>
                setSettings({ timezone: v as HubSettings["timezone"] })
              }
              ariaLabel="Timezone"
              options={TIMEZONE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
            />
          </VStack>
        </VStack>
      </PanelCard>
    </>
  );
}

/**
 * A minimal native <select> styled to match CDS. The CDS `Select`/`Dropdown`
 * components are deprecated (v9/v10 removal) and require a portal stack;
 * a native select is more robust, fully accessible, and matches the visual
 * idiom of TextInput closely enough for admin use.
 */
function NativeSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        padding: "10px 14px",
        background: "var(--color-bg)",
        color: "var(--color-fg)",
        border: "1px solid var(--color-bgLine)",
        borderRadius: 12,
        font: "inherit",
        fontSize: 14,
        lineHeight: "20px",
        cursor: "pointer",
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, var(--color-fgMuted) 50%), linear-gradient(135deg, var(--color-fgMuted) 50%, transparent 50%)",
        backgroundPosition:
          "calc(100% - 18px) 50%, calc(100% - 13px) 50%",
        backgroundSize: "5px 5px, 5px 5px",
        backgroundRepeat: "no-repeat",
        paddingRight: 36,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Service Status                                                   */
/* ------------------------------------------------------------------ */

type FetchState = {
  status: "idle" | "loading" | "ok" | "error";
  lastPing: string | null;
  lastBody: unknown;
  error: string | null;
};

function ServiceStatusSection() {
  return (
    <>
      <SectionHeader title="Service Status" />
      <PanelCard>
        <VStack gap={0}>
          {SERVICES.map((svc, i) => (
            <Box key={svc.name}>
              {i > 0 && <RowDivider />}
              <Box style={{ padding: "12px 0" }}>
                <ServiceRow name={svc.name} endpoint={svc.endpoint} />
              </Box>
            </Box>
          ))}
        </VStack>
      </PanelCard>
    </>
  );
}

function ServiceRow({ name, endpoint }: { name: string; endpoint: string }) {
  const { settings } = useHubSettings();
  const [rawOpen, setRawOpen] = useState(false);
  const [state, setState] = useState<FetchState>({
    status: "idle",
    lastPing: null,
    lastBody: null,
    error: null,
  });

  const fetchOnce = async () => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const body: unknown = await res.json();
      setState({
        status: res.ok ? "ok" : "error",
        lastPing: new Date().toISOString(),
        lastBody: body,
        error: res.ok ? null : `HTTP ${res.status}`,
      });
    } catch (err) {
      setState({
        status: "error",
        lastPing: new Date().toISOString(),
        lastBody: null,
        error: err instanceof Error ? err.message : "fetch failed",
      });
    }
  };

  // Initial fetch + polling per the user's pollingMs setting.
  useEffect(() => {
    void fetchOnce();
    if (settings.pollingMs === 0) return;
    const id = setInterval(() => void fetchOnce(), settings.pollingMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, settings.pollingMs]);

  const dotColor =
    state.status === "ok"
      ? "var(--color-fgPositive)"
      : state.status === "error"
      ? "var(--color-fgNegative)"
      : state.status === "loading"
      ? "var(--color-fgWarning)"
      : "var(--color-fgMuted)";

  const lastPingLabel = state.lastPing
    ? formatHms(state.lastPing, settings.timezone)
    : "—";

  return (
    <VStack gap={2}>
      <HStack
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <HStack alignItems="center" gap={2}>
          <span
            aria-label={`${name} status: ${state.status}`}
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: 5,
              background: dotColor,
            }}
          />
          <TextLabel2 as="span" style={{ fontWeight: 500 }}>
            {name}
          </TextLabel2>
        </HStack>
        <HStack alignItems="center" gap={2}>
          <TextCaption
            as="span"
            style={{
              color: "var(--color-fgMuted)",
              textTransform: "none",
              letterSpacing: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            Last ping {lastPingLabel}
          </TextCaption>
          <Button
            variant="secondary"
            compact
            onClick={() => void fetchOnce()}
            loading={state.status === "loading"}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      <HStack
        justifyContent="space-between"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={() => setRawOpen((o) => !o)}
      >
        <TextCaption
          as="span"
          style={{ color: "var(--color-fgMuted)", textTransform: "none" }}
        >
          {state.error
            ? `Error: ${state.error}`
            : state.status === "ok"
            ? "Last response captured below"
            : "Awaiting response"}
        </TextCaption>
        <TextCaption
          as="span"
          style={{ color: "var(--color-fgPrimary)", textTransform: "none" }}
        >
          {rawOpen ? "Hide raw response" : "Show raw response"}
        </TextCaption>
      </HStack>

      <Collapsible collapsed={!rawOpen}>
        <Box
          style={{
            background: "var(--color-bgSecondary)",
            border: "1px solid var(--color-bgLine)",
            borderRadius: 10,
            maxHeight: 280,
            overflow: "auto",
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: 12,
              fontFamily:
                'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Mono", monospace',
              fontSize: 12,
              lineHeight: 1.6,
              color: "var(--color-fg)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {state.lastBody !== null
              ? safeStringify(state.lastBody)
              : "(no response yet)"}
          </pre>
        </Box>
      </Collapsible>
    </VStack>
  );
}

function formatHms(iso: string, tz: HubSettings["timezone"]): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: tz,
    });
  } catch {
    return iso;
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Deployment                                                       */
/* ------------------------------------------------------------------ */

function DeploymentSection({ version }: { version: string }) {
  const [env, setEnv] = useState<{ label: string; href: string }>(() => ({
    label: "Unknown",
    href: "",
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.host;
    let label = "Unknown";
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      label = "Local";
    } else if (host.includes("192-18-128-170.nip.io")) {
      label = "ARM production";
    }
    setEnv({ label, href: window.location.href });
  }, []);

  return (
    <>
      <SectionHeader title="Deployment" />
      <PanelCard>
        <VStack gap={0}>
          <InfoRow label="Hub version" value={`v${version}`} mono />
          <RowDivider />
          <InfoRow
            label="Node version"
            value="client build"
            hint="Node version is only available on the server; this panel is client-rendered."
          />
          <RowDivider />
          <InfoRow label="Environment" value={env.label} />
          <RowDivider />
          <InfoRow
            label="Current URL"
            value={env.href || "(client only)"}
            mono
            wrap
          />
        </VStack>
        <HStack gap={2} flexWrap="wrap" style={{ marginTop: 12 }}>
          <Button
            as="a"
            href="https://github.com/jacksongeiger/merkavian-hub"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            merkavian-hub repo
          </Button>
          <Button
            as="a"
            href="https://github.com/jacksongeiger/Claude_Upgrade"
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            Claude_Upgrade repo
          </Button>
        </HStack>
      </PanelCard>
    </>
  );
}

function InfoRow({
  label,
  value,
  hint,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="flex-start"
      gap={3}
      flexWrap="wrap"
      style={{ padding: "10px 0", width: "100%" }}
    >
      <VStack gap={0} style={{ minWidth: 140 }}>
        <TextLabel2
          as="span"
          style={{ color: "var(--color-fgMuted)", fontWeight: 400 }}
        >
          {label}
        </TextLabel2>
        {hint && (
          <TextCaption
            as="span"
            style={{
              color: "var(--color-fgMuted)",
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            {hint}
          </TextCaption>
        )}
      </VStack>
      <TextBody
        as="span"
        style={{
          color: "var(--color-fg)",
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
          fontFamily: mono
            ? 'ui-monospace, "SF Mono", Menlo, Monaco, monospace'
            : undefined,
          textAlign: "right",
          wordBreak: wrap ? "break-all" : "normal",
          maxWidth: "100%",
        }}
      >
        {value}
      </TextBody>
    </HStack>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Danger Zone                                                      */
/* ------------------------------------------------------------------ */

function DangerZoneSection() {
  const { reset } = useHubSettings();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <SectionHeader title="Danger Zone" />
      <ContentCard
        padding={4}
        gap={3}
        style={{
          background: "var(--color-bgNegativeWash)",
          border: "1px solid var(--color-fgNegative)",
          borderRadius: 16,
        }}
      >
        <VStack gap={2}>
          <TextLabel2 as="span" style={{ fontWeight: 500 }}>
            Clear all Hub settings
          </TextLabel2>
          <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
            Wipes tab visibility, hub title, polling interval, and timezone
            back to defaults. The page will reload.
          </TextBody>
          <HStack>
            <Button
              variant="negative"
              onClick={() => setConfirmOpen(true)}
            >
              Clear all settings
            </Button>
          </HStack>
        </VStack>
      </ContentCard>

      <Alert
        visible={confirmOpen}
        title="Clear all Hub settings?"
        body="This will reset tab visibility, hub title, polling interval, and timezone to defaults. The page will reload."
        preferredActionLabel="Clear and reload"
        preferredActionVariant="negative"
        onPreferredActionPress={() => {
          reset();
          setConfirmOpen(false);
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
        dismissActionLabel="Cancel"
        onDismissActionPress={() => setConfirmOpen(false)}
        onRequestClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
