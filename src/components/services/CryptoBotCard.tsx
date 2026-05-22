"use client";

import { ServiceStatusCard } from "./ServiceStatusCard";

export function CryptoBotCard({ index = 0 }: { index?: number }) {
  return <ServiceStatusCard name="Crypto Bot" endpoint="/api/cryptobot" index={index} />;
}
