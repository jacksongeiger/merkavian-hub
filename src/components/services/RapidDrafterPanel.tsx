"use client";

import { IframePanel } from "./IframePanel";

const SRC =
  process.env.NEXT_PUBLIC_RAPID_DRAFTER_URL ??
  "https://rapid-drafter.192-18-128-170.nip.io";

export function RapidDrafterPanel() {
  return <IframePanel name="Rapid Drafter" src={SRC} />;
}
