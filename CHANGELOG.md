# CHANGELOG

## [unreleased] — 2026-05-21

### Added
- Initial scaffold: Next.js 14 (App Router, TypeScript, src dir, no Tailwind, `@/*` import alias).
- Installed `@coinbase/cds-web@9.0.0`, `@coinbase/cds-icons@5.16.0`, `framer-motion@^10`.
- `src/app/layout.tsx`: side-effect imports for CDS icon font, `defaultFontStyles`, `globalStyles`, and project `globals.css`.
- `src/app/providers.tsx`: client-side `MediaQueryProvider` + `ThemeProvider` wrapper, `defaultTheme` from `@coinbase/cds-web/themes/defaultTheme`, `activeColorScheme="dark"` always.
- Component stubs for the full V1 + V2 file tree (HubSidebar, HubTopNav, StatusDot, MetricCard, CryptoBotCard, PolybotCard, CryptoTrackerPanel, RapidDrafterPanel, PolchainPanel, MerkavianPanel).
- API route stubs: `/api/cryptobot` and `/api/polybot`.
- `.env` / `.env.example` with sections for server config, ARM service endpoints, public iframe URLs, and optional rapid-drafter basic_auth creds.
- `.gitignore` updated to ignore `.env` and `.env.*` (allowlist `.env.example`).
- README, CHANGELOG, DEAD_ENDS docs.

### Notes / deviations from the CLAUDE.md template
- **`TopNavBar` does not exist in CDS.** The closest equivalent is `NavigationBar` from `@coinbase/cds-web/navigation`. `HubTopNav.tsx` will use that instead.
- **`DataCard` is in `@coinbase/cds-web/alpha/data-card`** (marked alpha). Imports adjusted accordingly.
- **`ThemeProvider` prop is `theme` (not `defaultTheme`)** — `defaultTheme` is the *value* passed in. Wired up as `theme={defaultTheme}`.
- All three side-effect imports specified by CLAUDE.md (`icon-font.css`, `defaultFontStyles`, `globalStyles`) verified to resolve correctly.
