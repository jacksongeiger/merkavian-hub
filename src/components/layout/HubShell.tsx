"use client";

import type { ReactNode } from "react";
import { HubSidebar } from "./HubSidebar";
import { HubTopNav } from "./HubTopNav";

export function HubShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <HubSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <HubTopNav />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            padding: "24px",
            background: "var(--cds-color-backgroundBase, rgb(10,11,13))",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
