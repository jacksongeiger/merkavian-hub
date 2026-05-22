"use client";

import { BotHealthCard } from "@/components/overview/BotHealthCard";

export function CryptoBotCard({ index = 0 }: { index?: number }) {
  return <BotHealthCard service="cryptobot" index={index} />;
}
