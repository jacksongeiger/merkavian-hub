"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hub-wide user settings persisted to localStorage.
 *
 * Storage key: "merkavian-hub-settings-v1"
 *
 * Read defaults synchronously on first render (SSR-safe — does not touch
 * localStorage during render). After mount, the hook syncs from localStorage
 * and subscribes to two events:
 *   - "hub-settings-changed": same-tab broadcast on every write
 *   - "storage": browser-native cross-tab sync
 */

export type HubSettings = {
  hubTitle: string;
  pollingMs: 15000 | 30000 | 60000 | 0;
  timezone: "America/Los_Angeles" | "America/New_York" | "UTC";
  hiddenTabs: string[];
};

export const DEFAULT_HUB_SETTINGS: HubSettings = {
  hubTitle: "MERKAVIAN HUB",
  pollingMs: 30000,
  timezone: "America/Los_Angeles",
  hiddenTabs: [],
};

export const HUB_SETTINGS_STORAGE_KEY = "merkavian-hub-settings-v1";
export const HUB_SETTINGS_EVENT = "hub-settings-changed";

const ALLOWED_POLLING: ReadonlyArray<HubSettings["pollingMs"]> = [
  15000,
  30000,
  60000,
  0,
];
const ALLOWED_TIMEZONES: ReadonlyArray<HubSettings["timezone"]> = [
  "America/Los_Angeles",
  "America/New_York",
  "UTC",
];

function isPollingMs(v: unknown): v is HubSettings["pollingMs"] {
  return (
    typeof v === "number" &&
    (ALLOWED_POLLING as ReadonlyArray<number>).includes(v)
  );
}

function isTimezone(v: unknown): v is HubSettings["timezone"] {
  return (
    typeof v === "string" &&
    (ALLOWED_TIMEZONES as ReadonlyArray<string>).includes(v)
  );
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function parseStored(raw: string | null): HubSettings {
  if (!raw) return DEFAULT_HUB_SETTINGS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_HUB_SETTINGS;
    const p = parsed as Record<string, unknown>;
    return {
      hubTitle:
        typeof p.hubTitle === "string" && p.hubTitle.length > 0
          ? p.hubTitle
          : DEFAULT_HUB_SETTINGS.hubTitle,
      pollingMs: isPollingMs(p.pollingMs)
        ? p.pollingMs
        : DEFAULT_HUB_SETTINGS.pollingMs,
      timezone: isTimezone(p.timezone)
        ? p.timezone
        : DEFAULT_HUB_SETTINGS.timezone,
      hiddenTabs: isStringArray(p.hiddenTabs)
        ? p.hiddenTabs
        : DEFAULT_HUB_SETTINGS.hiddenTabs,
    };
  } catch {
    return DEFAULT_HUB_SETTINGS;
  }
}

function readFromStorage(): HubSettings {
  if (typeof window === "undefined") return DEFAULT_HUB_SETTINGS;
  try {
    return parseStored(window.localStorage.getItem(HUB_SETTINGS_STORAGE_KEY));
  } catch {
    return DEFAULT_HUB_SETTINGS;
  }
}

function writeToStorage(next: HubSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      HUB_SETTINGS_STORAGE_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(new Event(HUB_SETTINGS_EVENT));
  } catch {
    // localStorage may be disabled (private mode / quota). Fail silently —
    // settings will still apply for the current tab via the dispatched event,
    // but won't persist. Best-effort.
    try {
      window.dispatchEvent(new Event(HUB_SETTINGS_EVENT));
    } catch {
      /* noop */
    }
  }
}

export function useHubSettings(): {
  settings: HubSettings;
  setSettings: (partial: Partial<HubSettings>) => void;
  reset: () => void;
} {
  // SSR-safe: defaults on first render, then sync after mount.
  const [settings, setLocal] = useState<HubSettings>(DEFAULT_HUB_SETTINGS);

  useEffect(() => {
    // Initial sync from localStorage (post-mount only — never during render).
    setLocal(readFromStorage());

    const refresh = () => setLocal(readFromStorage());

    const onCustom: EventListener = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === HUB_SETTINGS_STORAGE_KEY) refresh();
    };

    window.addEventListener(HUB_SETTINGS_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(HUB_SETTINGS_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setSettings = useCallback((partial: Partial<HubSettings>) => {
    // Merge against latest persisted value to avoid races between subscribers.
    const current = readFromStorage();
    const next: HubSettings = { ...current, ...partial };
    writeToStorage(next);
    setLocal(next);
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(HUB_SETTINGS_STORAGE_KEY);
      } catch {
        /* noop */
      }
      try {
        window.dispatchEvent(new Event(HUB_SETTINGS_EVENT));
      } catch {
        /* noop */
      }
    }
    setLocal(DEFAULT_HUB_SETTINGS);
  }, []);

  return { settings, setSettings, reset };
}
