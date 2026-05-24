"use client";

import { IframePanel } from "./IframePanel";

// Point at the merkavian.com host so the iframe is SAME-SITE as the hub
// (app.merkavian.com). The SameSite=Lax council_session cookie can't flow
// across the registrable-domain boundary, which is why the login silently
// looped on the old rapid-drafter.192-18-128-170.nip.io host.
const SRC =
  process.env.NEXT_PUBLIC_RAPID_DRAFTER_URL ??
  "https://rapid-drafter.merkavian.com";

export function RapidDrafterPanel() {
  return <IframePanel name="Rapid Drafter" src={SRC} />;
}
