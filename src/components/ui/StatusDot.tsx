"use client";

import { motion } from "framer-motion";

export type StatusKind = "online" | "offline" | "warning";

type Props = {
  status: StatusKind;
  size?: number;
  ariaLabel?: string;
};

const COLORS: Record<StatusKind, string> = {
  online: "var(--color-fgPositive)",
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
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      {pulse && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0.45, scale: 1 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: color,
            pointerEvents: "none",
          }}
        />
      )}
    </span>
  );
}
