"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar, SidebarItem } from "@coinbase/cds-web/navigation";
import { IconButton } from "@coinbase/cds-web/buttons";
import type { IconName } from "@coinbase/cds-icons";

type NavItem = { title: string; icon: IconName; href: string };

const NAV_ITEMS: NavItem[] = [
  { title: "Overview", icon: "dashboard", href: "/" },
  { title: "Crypto Tracker", icon: "chartLine", href: "/crypto-tracker" },
  { title: "Rapid Drafter", icon: "document", href: "/rapid-drafter" },
  { title: "Merkavian HQ", icon: "laptop", href: "/merkavian-hq" },
  { title: "PoLChain", icon: "blockchain", href: "/polchain" },
];

const WIDTH_OPEN = 248;
const WIDTH_COLLAPSED = 72;

function isActive(currentPath: string, href: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(href + "/");
}

export function HubSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  return (
    <motion.div
      animate={{ width: collapsed ? WIDTH_COLLAPSED : WIDTH_OPEN }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: "100vh",
        flexShrink: 0,
        overflow: "hidden",
        borderRight: "1px solid var(--color-bgLine)",
        background: "var(--color-bg)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        variant="default"
        renderEnd={(isCollapsed) => (
          <IconButton
            name={isCollapsed ? "caretRight" : "caretLeft"}
            variant="secondary"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
        )}
      >
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            title={item.title}
            active={isActive(pathname, item.href)}
            onClick={() => router.push(item.href)}
          />
        ))}
      </Sidebar>
    </motion.div>
  );
}
