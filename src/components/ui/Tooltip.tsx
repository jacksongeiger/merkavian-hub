"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Tooltip — a small, dark "card" tooltip with a triangular arrow.
 *
 * Style (intentionally distinct from the default CDS tooltip):
 *   - background #0a0b0d, text #ffffff, 12px font
 *   - padding 8px 10px, border-radius 8px, max-width 280px
 *   - 150ms fade in/out via Framer Motion
 *
 * Two usage modes:
 *
 *   1. Wrap mode (default):
 *      <Tooltip content="...">
 *        <button>Trigger</button>
 *      </Tooltip>
 *      Children render unchanged. Hover/focus on the wrapping span
 *      (which contains the children) shows the tooltip.
 *
 *   2. showIcon mode:
 *      <Tooltip content="..." showIcon>Polling interval</Tooltip>
 *      Renders the children inline followed by a small "?" icon.
 *      Hover/focus on the "?" icon (only) opens the tooltip — this is
 *      useful for label rows where the trigger should be discreet.
 *
 * The tooltip is positioned with `position: fixed` driven by the
 * trigger's getBoundingClientRect, so it can escape clipped/overflow
 * parents. It defaults to placing itself above the trigger; if the
 * trigger is within ~120px of the viewport top it flips below.
 */

const VIEWPORT_FLIP_THRESHOLD = 120;
const TOOLTIP_GAP = 8; // px between trigger and tooltip bubble
const ARROW_SIZE = 6;
const MAX_WIDTH = 280;

type TooltipProps = {
  content: ReactNode;
  children?: ReactNode;
  /**
   * If true, renders `children` inline followed by a small "?" icon.
   * Only the "?" icon acts as the tooltip trigger.
   */
  showIcon?: boolean;
};

type Placement = "top" | "bottom";

type Position = {
  left: number;
  top: number;
  placement: Placement;
  arrowLeft: number;
};

export function Tooltip({ content, children, showIcon }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const tooltipId = useId();

  const close = useCallback(() => setOpen(false), []);
  const openTip = useCallback(() => setOpen(true), []);

  // Compute position whenever opened (and on scroll/resize while open).
  useEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const placement: Placement =
        rect.top < VIEWPORT_FLIP_THRESHOLD ? "bottom" : "top";

      // Horizontally center the tooltip over the trigger, clamped to viewport.
      const centerX = rect.left + rect.width / 2;
      const halfWidth = Math.min(MAX_WIDTH, window.innerWidth - 16) / 2;
      const clampedLeft = Math.max(
        8,
        Math.min(window.innerWidth - 8 - halfWidth * 2, centerX - halfWidth),
      );

      // Arrow horizontal offset relative to tooltip left
      const arrowLeft = centerX - clampedLeft;

      const top =
        placement === "top"
          ? rect.top - TOOLTIP_GAP
          : rect.bottom + TOOLTIP_GAP;

      setPos({ left: clampedLeft, top, placement, arrowLeft });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Escape to dismiss
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Escape") close();
  };

  // Common handlers attached to whichever element acts as the trigger.
  const triggerHandlers = {
    onMouseEnter: openTip,
    onMouseLeave: close,
    onFocus: openTip,
    onBlur: close,
    onKeyDown: onTriggerKeyDown,
  };

  const tooltipNode = (
    <AnimatePresence>
      {open && pos && (
        <motion.span
          role="tooltip"
          id={tooltipId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={tooltipBubbleStyle(pos)}
        >
          {content}
          <span style={arrowStyle(pos)} aria-hidden />
        </motion.span>
      )}
    </AnimatePresence>
  );

  if (showIcon) {
    // Render children inline as a label, then the "?" icon as the trigger.
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {children}
        <span
          ref={triggerRef}
          tabIndex={0}
          role="button"
          aria-label="More info"
          aria-describedby={open ? tooltipId : undefined}
          {...triggerHandlers}
          style={questionIconStyle(open)}
        >
          ?
        </span>
        {tooltipNode}
      </span>
    );
  }

  return (
    <span
      ref={triggerRef}
      tabIndex={0}
      aria-describedby={open ? tooltipId : undefined}
      {...triggerHandlers}
      style={{ display: "inline-flex", alignItems: "center", outline: "none" }}
    >
      {children}
      {tooltipNode}
    </span>
  );
}

/* ---------- styles ---------- */

function tooltipBubbleStyle(pos: Position): CSSProperties {
  return {
    position: "fixed",
    left: pos.left,
    top: pos.top,
    transform:
      pos.placement === "top" ? "translateY(-100%)" : "translateY(0)",
    background: "#0a0b0d",
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 1.4,
    padding: "8px 10px",
    borderRadius: 8,
    maxWidth: MAX_WIDTH,
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    zIndex: 9999,
    pointerEvents: "none",
    whiteSpace: "normal",
  };
}

function arrowStyle(pos: Position): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    left: Math.max(ARROW_SIZE, Math.min(MAX_WIDTH - ARROW_SIZE, pos.arrowLeft)),
    transform: "translateX(-50%)",
    borderLeft: `${ARROW_SIZE}px solid transparent`,
    borderRight: `${ARROW_SIZE}px solid transparent`,
  };
  if (pos.placement === "top") {
    return {
      ...base,
      bottom: -ARROW_SIZE,
      borderTop: `${ARROW_SIZE}px solid #0a0b0d`,
    };
  }
  return {
    ...base,
    top: -ARROW_SIZE,
    borderBottom: `${ARROW_SIZE}px solid #0a0b0d`,
  };
}

function questionIconStyle(active: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "var(--color-fgMuted)",
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 600,
    lineHeight: 1,
    cursor: "help",
    opacity: active ? 1 : 0.6,
    transition: "opacity 150ms ease",
    flexShrink: 0,
    userSelect: "none",
    outline: "none",
  };
}
