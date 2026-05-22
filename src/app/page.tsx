import { Grid, VStack } from "@coinbase/cds-web/layout";
import { Greeting } from "@/components/overview/Greeting";
import { BotHealthCard } from "@/components/overview/BotHealthCard";
import { CryptoBriefCard } from "@/components/overview/CryptoBriefCard";
import {
  CryptoBotTradesCard,
  PolybotTradesCard,
} from "@/components/overview/RecentTrades";
import { QuickLinks } from "@/components/overview/QuickLinks";

export default function OverviewPage() {
  return (
    <VStack gap={4}>
      <Greeting />

      <Grid
        gap={3}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "stretch",
        }}
      >
        <BotHealthCard service="cryptobot" index={0} />
        <BotHealthCard service="polybot" index={1} />
      </Grid>

      <CryptoBriefCard index={2} />

      <Grid
        gap={3}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "stretch",
        }}
      >
        <CryptoBotTradesCard index={3} />
        <PolybotTradesCard index={4} />
      </Grid>

      <QuickLinks baseIndex={5} />
    </VStack>
  );
}
