import { Grid } from "@coinbase/cds-web/layout";
import { CryptoBotCard } from "@/components/services/CryptoBotCard";
import { PolybotCard } from "@/components/services/PolybotCard";

export default function OverviewPage() {
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(320px, 1fr))" gap={3}>
      <CryptoBotCard index={0} />
      <PolybotCard index={1} />
    </Grid>
  );
}
