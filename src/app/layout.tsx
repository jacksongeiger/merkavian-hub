import type { Metadata } from "next";
import "@coinbase/cds-icons/fonts/web/icon-font.css";
import "@coinbase/cds-web/defaultFontStyles";
import "@coinbase/cds-web/globalStyles";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Merkavian Hub",
  description: "Central interface for all Merkavian projects",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
