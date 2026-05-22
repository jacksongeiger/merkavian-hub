import { Grid, VStack } from "@coinbase/cds-web/layout";
import { TextBody, TextTitle1 } from "@coinbase/cds-web/typography";
import { CryptoBotCard } from "@/components/services/CryptoBotCard";
import { PolybotCard } from "@/components/services/PolybotCard";

export default function OverviewPage() {
  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <TextTitle1 as="h2">Live services</TextTitle1>
        <TextBody as="p" style={{ color: "var(--color-fgMuted)" }}>
          Real-time status from each running bot. Updates every 30 seconds.
        </TextBody>
      </VStack>
      <Grid templateColumns="repeat(auto-fit, minmax(340px, 1fr))" gap={3}>
        <CryptoBotCard index={0} />
        <PolybotCard index={1} />
      </Grid>
    </VStack>
  );
}
