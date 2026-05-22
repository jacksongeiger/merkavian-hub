import { CryptoTrackerPanel } from "@/components/services/CryptoTrackerPanel";

export default function CryptoTrackerPage() {
  return (
    <div style={{ height: "calc(100vh - 60px - 64px)", minHeight: 400 }}>
      <CryptoTrackerPanel />
    </div>
  );
}
