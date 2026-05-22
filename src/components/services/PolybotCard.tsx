"use client";

import { ServiceStatusCard } from "./ServiceStatusCard";

export function PolybotCard({ index = 0 }: { index?: number }) {
  return <ServiceStatusCard name="Polybot" endpoint="/api/polybot" index={index} />;
}
