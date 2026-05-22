"use client";

import { BotHealthCard } from "@/components/overview/BotHealthCard";

export function PolybotCard({ index = 0 }: { index?: number }) {
  return <BotHealthCard service="polybot" index={index} />;
}
