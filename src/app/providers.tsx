"use client";

import { MediaQueryProvider, ThemeProvider } from "@coinbase/cds-web/system";
import { defaultTheme } from "@coinbase/cds-web/themes/defaultTheme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MediaQueryProvider defaultValues={{ colorScheme: "light" }}>
      <ThemeProvider theme={defaultTheme} activeColorScheme="light">
        {children}
      </ThemeProvider>
    </MediaQueryProvider>
  );
}
