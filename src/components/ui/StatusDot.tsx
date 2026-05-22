"use client";

import { motion } from "framer-motion";

export type StatusKind = "online" | "offline" | "warning";

type Props = {
  status: StatusKind;
  size?: number;
  ariaLabel?: string;
};

const COLORS: Record<StatusKind, string> = {
  online: "var(--color-fgPrimary)",
  offline: "var(--color-fgMuted)",
  warning: "var(--color-fgWarning)",
};

export function StatusDot({ status, size = 10, ariaLabel }: Props) {
  const color = COLORS[status];
  const pulse = status === "online";

  return (
    <span
      role="status"
      aria-label={ariaLabel ?? `Service ${status}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {pulse ? (
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      ) : (
        <span
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      )}
    </span>
  );
}
