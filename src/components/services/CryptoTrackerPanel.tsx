"use client";

import { IframePanel } from "./IframePanel";

const SRC = process.env.NEXT_PUBLIC_CRYPTO_TRACKER_URL ?? "https://192-18-128-170.nip.io";

export function CryptoTrackerPanel() {
  return <IframePanel name="Crypto Tracker" src={SRC} />;
}
