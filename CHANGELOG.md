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

### V1 implementations (this push)
- `HubShell.tsx` — flex layout (sidebar + topnav + scrollable main).
- `HubSidebar.tsx` — CDS `Sidebar` + `SidebarItem`s for Overview / Crypto Tracker / Rapid Drafter; Framer Motion width transition (240 ↔ 64 px, 220 ms `cubic-bezier(0.4,0,0.2,1)`); collapse toggled by `IconButton` in `renderEnd`.
- `HubTopNav.tsx` — CDS `NavigationBar` with page title derived from the current pathname (uses `usePathname`).
- `StatusDot.tsx` — three states (online / offline / warning); online has a Framer Motion ring-pulse expanding outward.
- `MetricCard.tsx` — built on `ContentCard` + `VStack`/`HStack` + `TextTitle1` for the metric value, with a `tone` prop that maps to CDS color CSS vars.
- `lib/proxyService.ts` — shared timeout-bounded fetch that returns a typed `ProxyResult` (`ok` or `{reason: timeout | unreachable | non-2xx | non-json}`); 5 s timeout default driven by `SERVICE_FETCH_TIMEOUT_MS`.
- `app/api/cryptobot/route.ts`, `app/api/polybot/route.ts` — `force-dynamic` server routes that call the shared proxy with `CRYPTOBOT_URL` / `POLYBOT_URL`.
- `ServiceStatusCard.tsx` — shared base for bot status cards: 30 s polling, four states (loading / ok / stale / down), Spinner while loading, CDS `Banner` (`variant="warning"`) for down/stale, stale shows last-known values muted, Framer Motion fade-in with `index * 50ms` stagger.
- `CryptoBotCard.tsx`, `PolybotCard.tsx` — thin wrappers around `ServiceStatusCard`.
- `IframePanel.tsx` — generic iframe panel with Spinner overlay until `onLoad` fires; 8 s fallback timer that swaps to an "open in new tab" fallback with `StatusDot` warning.
- `CryptoTrackerPanel.tsx`, `RapidDrafterPanel.tsx` — wrap `IframePanel` with the public service URLs (from `NEXT_PUBLIC_*` env). Lazy by virtue of being on dedicated routes (Next.js only mounts on navigation).
- `app/page.tsx` — Overview grid (auto-fit minmax 320px) with both bot status cards.
- `app/crypto-tracker/page.tsx`, `app/rapid-drafter/page.tsx` — full-height iframe panel pages.

### Notes / deviations from the CLAUDE.md template
- **`TopNavBar` does not exist in CDS.** Used `NavigationBar` from `@coinbase/cds-web/navigation` instead.
- **`DataCard` is in `@coinbase/cds-web/alpha/data-card`** and is marked alpha. Did not end up using it — built `MetricCard` on top of `ContentCard` instead, which is stable.
- **`ThemeProvider` prop is `theme` (not `defaultTheme`)** — `defaultTheme` is the *value* passed in. Wired as `theme={defaultTheme}`.
- **Color CSS variables are `--cds-color-*`, not `--darkColor-*`.** Used the `--cds-color-foregroundPositive` / `foregroundNegative` / `foregroundWarning` / `foregroundMuted` / `foregroundPrimary` family in `StatusDot` and `MetricCard`, with rgb fallbacks matching the CLAUDE.md table values.
- All three side-effect imports specified by CLAUDE.md (`icon-font.css`, `defaultFontStyles`, `globalStyles`) verified to resolve correctly.

### Verified
- `npx tsc --noEmit` clean.
- `npm run build` clean. 5 routes generated: `/`, `/crypto-tracker`, `/rapid-drafter`, `/api/cryptobot`, `/api/polybot`. First Load JS ≈ 190 KB.

## 2026-05-21 — Production deploy + end-to-end verification

### Deployed
- Cloned repo to ARM at `~/merkavian-hub`, `npm install`, `npm run build`.
- Started under PM2 as `hub`: `pm2 start npm --name "hub" -- start -- -p 3002 -H 127.0.0.1`. `pm2 save`d.
- Added Caddy block for `hub.192-18-128-170.nip.io` with `basic_auth` (user `jackson`, bcrypt hash); reloaded Caddy; Let's Encrypt cert obtained automatically via tls-alpn-01.
- `.env` on ARM contains: `NEXT_PUBLIC_CRYPTO_TRACKER_URL`, `NEXT_PUBLIC_RAPID_DRAFTER_URL`, `CRYPTOBOT_URL` (with `/api/bot/status` path), `POLYBOT_URL` (with `/api/bot/status` path), `HUB_PASSWORD`. Mode `600`. Gitignored.
- Repo flipped to **public** on GitHub so ARM could `git clone` over HTTPS without auth setup. Reversible.

### Real findings from browser verification
- **Iframe-of-basic_auth works.** Both `crypto-tracker` (public) and `rapid-drafter` (Caddy `basic_auth`) iframes render their full content inside the Hub shell. Earlier skeptic-review concern about nested credential prompts: invalidated in practice — Chromium carries the cached basic_auth session into same-host subresource loads.
- **URL-embedded creds (`https://user:pass@host/`) break in-page `fetch()`.** When the page is loaded with creds in the URL, Chromium injects them into `Request` construction for same-origin fetches, which the Fetch spec then rejects (`Failed to execute 'fetch' on 'Window': Request cannot be constructed from a URL that includes credentials`). Bot status cards showed "Hub API unreachable" in this mode.
  - **Workaround:** load the bare URL (no creds), let Chromium use the native HTTP auth dialog. The browser caches the credentials in the regular auth cache (not URL-derived), which doesn't get injected into `Request` constructors. Verified working.
- **`CRYPTOBOT_URL` / `POLYBOT_URL` must include the `/api/bot/status` path.** The root paths (`:5050/` and `:5001/`) serve Flask SocketIO HTML dashboards, not JSON; `proxyService` correctly rejected them as `non-json`. Updated `.env.example` to make the right path obvious.

### Verified end-to-end
- ✅ `curl -I https://hub.192-18-128-170.nip.io` returns `HTTP/2 401` with `WWW-Authenticate: Basic realm="restricted"` (Caddy auth wall live).
- ✅ With auth, `/api/cryptobot` and `/api/polybot` return real JSON from the bots.
- ✅ Overview page renders both bot status cards with live data (12 active pairs, "Neutral — full trading", `ai_healthy: yes`, `ollama_online`, etc.).
- ✅ Crypto Tracker tab loads the full daily brief iframe.
- ✅ Rapid Drafter tab loads the full decision list iframe.
- ⚠️ Console shows 6 preserved `503` errors from the period before `CRYPTOBOT_URL`/`POLYBOT_URL` paths were fixed in `.env`. Current state is clean.

### Open
- The 4-state machine in `ServiceStatusCard` (loading / ok / stale / down) has no automated test. The bot polling is the only thing that exercises it, so a regression would only be visible during an outage.
- `MetricCard` is still unreferenced in V1 — either delete it or migrate the bot cards to use it.
- `polchain` and `merkavian-dashboard` are V2; not deployed.
