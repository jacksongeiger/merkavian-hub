"use client";

import type { ReactNode } from "react";
import { HubSidebar } from "./HubSidebar";
import { HubTopNav } from "./HubTopNav";

export function HubShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "var(--color-bg)",
        color: "var(--color-fg)",
      }}
    >
      <HubSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <HubTopNav />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "32px",
            background: "var(--color-bgSecondary)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
