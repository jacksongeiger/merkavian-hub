"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "@coinbase/cds-web/navigation";
import { TextTitle3 } from "@coinbase/cds-web/typography";

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

export function HubTopNav() {
  const pathname = usePathname() ?? "/";
  return (
    <div
      style={{
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-bgLine)",
      }}
    >
      <NavigationBar accessibilityLabel="Hub primary navigation">
        <TextTitle3 as="h1">{titleFor(pathname)}</TextTitle3>
      </NavigationBar>
    </div>
  );
}
