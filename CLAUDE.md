# Merkavian Hub — Project CLAUDE.md

## What This Project Is

Personal AI Hub on ARM server `192.18.128.170`, deployed at `hub.192-18-128-170.nip.io` on port `3002` via PM2 and Caddy basic_auth. Built as Coinbase APM internship prep using the real open source Coinbase Design System (CDS). Central interface for all projects with closeable sidebar panels.

## Stack

- Next.js 14 App Router
- TypeScript
- `@coinbase/cds-web` + `framer-motion@^10` (CDS requires framer-motion as peer dep)
- `@coinbase/cds-icons`
- **NO Tailwind** — CDS has its own styling system via StyleProps and CSS Variables
- Node managed via Homebrew (no nvm)

## CDS Setup

Install:

```bash
npm install @coinbase/cds-web framer-motion@^10 @coinbase/cds-icons
```

Entry point must import in this order:

```ts
import '@coinbase/cds-icons/fonts/web/icon-font.css';
import '@coinbase/cds-web/defaultFontStyles';
import '@coinbase/cds-web/globalStyles';
```

Root wrapper: `MediaQueryProvider` wrapping `ThemeProvider`. The `ThemeProvider` takes a `theme` prop (value: `defaultTheme` from `@coinbase/cds-web/themes/defaultTheme`) and `activeColorScheme="light"` always. **Light mode only** — matches Coinbase consumer aesthetic; dark mode is not supported.

Key light mode CSS Variables (active scheme is exposed as `--color-*`; pinned-light is `--lightColor-*`):

| Token | Value | Purpose |
|---|---|---|
| `--color-bg` | `rgb(255,255,255)` | Page background |
| `--color-bgSecondary` | `rgb(238,240,243)` | Light gray canvas under cards |
| `--color-bgPrimary` | `rgb(0,82,255)` | Coinbase blue fill (buttons, badges) |
| `--color-bgPrimaryWash` | `rgb(245,248,255)` | Pale blue (sidebar selected, info ribbons) |
| `--color-fg` | `rgb(10,11,13)` | Body text / values |
| `--color-fgMuted` | `rgb(91,97,110)` | Labels / secondary copy |
| `--color-fgPrimary` | `rgb(0,82,255)` | Primary blue text / links / active indicator |
| `--color-fgPositive` | `rgb(9,133,81)` | Positive (online, gains) |
| `--color-fgNegative` | `rgb(207,32,47)` | Negative (errors, losses) |
| `--color-fgWarning` | `rgb(207,71,14)` | Warning (stale, retries) |
| `--color-bgLine` | `rgba(91,97,110,0.2)` | Hairline borders |

⚠️ **Naming gotcha:** the CSS var prefix is **`--color-*`** (active scheme) — *not* `--cds-color-*` as some examples imply. Tokens use short names (`fg`, `bg`, `fgPrimary`, `bgSecondary`), not full `foreground`/`background`. Get this wrong and your fallback `rgb()` defaults will silently render instead of the theme value.

Spacing (8px base scale):

```
--space-1=8px
--space-2=16px
--space-3=24px
--space-4=32px
--space-6=48px
```

Border radius:

```
--borderRadius-200=8px
--borderRadius-300=12px
--borderRadius-400=16px
```

## Component Rules

Always check CDS before writing any custom component.

Available CDS components: `Button`, `IconButton`, `Sidebar`, `SidebarItem`, `NavigationBar` (use this — `TopNavBar` does not exist), `Text` + variants (`TextTitle1`/`TextTitle3`/`TextBody`/`TextCaption`/`TextLabel2`/etc.), `Box`, `HStack`, `VStack`, `Grid`, `ContentCard`, `Toast`, `Modal`, `Spinner`, `ProgressBar`, `Table`, `Tabs`, `SegmentedTabs`, `Tooltip`, `Banner`, `Dropdown`, `Switch`, `TextInput`, `SearchInput`, `Icon`, `Avatar`, `Tag` (colorScheme: `blue|green|red|yellow|purple|gray`), `Divider`, `Collapsible`.

`DataCard` lives at `@coinbase/cds-web/alpha/data-card` and is alpha — prefer `ContentCard` (a styled polymorphic VStack) plus typography components for metric cards.

Import pattern:

```ts
import { Button } from '@coinbase/cds-web/buttons';
```

Rules:

- Use CDS `Text` component for all typography — never raw HTML `h1`/`p`/`span` with manual font styles
- Use `Box`, `HStack`, `VStack`, `Grid` for all layout — these use the CDS spacing scale
- Use Framer Motion for all animations — never CSS transitions for anything animated
- Never hardcode hex colors — always use CDS CSS Variables (`--color-*`) or CDS StyleProps
- Check `21st.dev` before building any complex component from scratch
- For numeric/metric displays (PnL, trade counts, win rates): use CDS `Text` with `font="title1"` or `font="display3"`

## Project Structure

```
src/
  app/
    layout.tsx                 # CDS side-effect imports + Providers + HubShell
    providers.tsx              # "use client" — MediaQueryProvider + ThemeProvider (light)
    page.tsx                   # Hub overview / home
    crypto-tracker/page.tsx    # iframe tab
    rapid-drafter/page.tsx     # iframe tab
    merkavian-trading/page.tsx # Mac:5055 fallback panel (renamed from merkavian-hq)
    polchain/page.tsx          # placeholder + V2 plan
    api/
      cryptobot/route.ts       # server-side proxy to 127.0.0.1:5050/api/bot/status
      polybot/route.ts         # server-side proxy to 127.0.0.1:5001/api/bot/status
  components/
    layout/
      HubShell.tsx             # flex layout: sidebar + topnav + scrollable main
      HubSidebar.tsx           # CDS Sidebar + SidebarItem, Framer Motion width transition
      HubTopNav.tsx            # CDS NavigationBar with pathname-driven title
    services/
      CryptoTrackerPanel.tsx   # iframe wrapper
      RapidDrafterPanel.tsx    # iframe wrapper
      CryptoBotCard.tsx        # thin wrapper → ServiceStatusCard
      PolybotCard.tsx          # thin wrapper → ServiceStatusCard
      ServiceStatusCard.tsx    # shared 30s polling + 4-state machine
      IframePanel.tsx          # shared iframe + load-timeout fallback
      MerkavianTradingPanel.tsx # local-only fallback (cannot iframe Mac from ARM)
      PolchainPanel.tsx        # COMING SOON panel with project facts + repo link
    ui/
      StatusDot.tsx            # online/offline/warning indicator + Framer pulse
      MetricCard.tsx           # ContentCard-based reusable metric tile
  lib/
    proxyService.ts            # timeout-bounded fetch helper used by API routes
```

## Services Map

| Service | Type | ARM Port | V1? | How Hub connects |
|---|---|---|---|---|
| crypto-tracker | Next.js | 3000 | Yes | iframe via HTTPS |
| rapid-drafter | Next.js | 3001 | Yes | iframe via HTTPS (auth handling required) |
| cryptobot | Flask JSON API | 5050 | Yes | Hub API route server-side proxy |
| polybot | FastAPI | 5001 | Yes | Hub API route server-side proxy |
| polchain | Not on ARM | — | V2 | Deploy to ARM first |
| merkavian-dashboard | Mac only :5055 | — | V2 | Migrate to ARM first |

## Iframe Embedding

- **crypto-tracker** embeds via `https://192-18-128-170.nip.io` — public, no auth
- **rapid-drafter** embeds via `https://rapid-drafter.192-18-128-170.nip.io` — has Caddy `basic_auth`. Use basic auth URL format `https://user:pass@rapid-drafter.192-18-128-170.nip.io`, or create a separate unauthenticated internal Caddy route. Document chosen approach in `CHANGELOG.md`.
- No `X-Frame-Options` headers on any service — iframes work today
- If adding CSP later: set `frame-ancestors 'self' https://*.192-18-128-170.nip.io` — **never `'none'`** or you will break Hub embedding

## Caddy Config to Add

Add this block to `/etc/caddy/Caddyfile` on ARM:

```caddy
hub.192-18-128-170.nip.io {
    encode gzip
    basic_auth {
        jackson <bcrypt-hash>
    }
    reverse_proxy 127.0.0.1:3002
}
```

Generate hash:

```bash
caddy hash-password --plaintext yourpassword
```

Reload after changes:

```bash
sudo systemctl reload caddy
```

## Running Locally (on ARM)

```bash
# SSH into ARM
ssh arm

# Dev server
npm run dev -- --port 3002

# Test from Mac (tunnel)
ssh -L 3002:localhost:3002 arm
# then open http://localhost:3002

# Production
npm run build && pm2 restart hub

# Logs
pm2 logs hub

# Caddy reload
sudo systemctl reload caddy
```

## Port Reservation

Port **3002** is reserved for Hub. Do not use any other port without checking first.

Existing ports in use on ARM:

| Port | Service |
|---|---|
| 3000 | crypto-tracker |
| 3001 | rapid-drafter |
| 5001 | polybot |
| 5050 | cryptobot |
| 11434 | ollama |
| 5432 | postgres |

## Auth and Security Rules

- cryptobot (`:5050`) and polybot (`:5001`) have **NO auth** — safe only because they are localhost-only
- Hub API routes must **NEVER** expose these services publicly — always proxy server-side only, never route raw ARM ports through Caddy
- Hub itself must always be behind Caddy `basic_auth` — never deploy without auth
- Never commit credentials — store in `.env`, reference via `process.env`
- `.env` must be in `.gitignore` before any other work begins

## Error States

Every service card and iframe panel must handle these states:

- **Loading:** CDS `Spinner` centered in the card
- **Service down / API error:** CDS `Banner` with `variant="warning"` and "Service offline" message — never blank card or crash
- **Partial data:** show last known values with stale indicator (`fgMuted` text + timestamp)
- **Network timeout:** treat as service down after 5 seconds
- **Iframe load failure:** show fallback div with service name, status dot, and link to open in new tab

## Animations (Framer Motion)

- Sidebar open/close: width transition `cubic-bezier(0.4,0,0.2,1)` 220ms
- Panel/page transitions: opacity + `translateY(4px)` to `translateY(0)`, 200ms ease
- Status dots: pulse animation for online services
- Card reveals on mount: staggered fade-in with 50ms delay between cards
- Use Framer Motion for all animations — never raw CSS transitions for layout or visibility changes

## Performance

- Bot metrics poll every **30 seconds** — no WebSocket for V1
- Iframe panels load **lazily** — do not load until user clicks the tab
- Target Lighthouse score **90+** on performance before V1 is considered done

## Known Quirks

- `polymarket` and `ollama-keepalive` PM2 services are in crash-restart loops — do not include in Hub V1, do not attempt to restart without investigation
- Port mapping confirmed via Caddyfile: `:3000` = crypto-tracker, `:3001` = rapid-drafter (earlier investigation had these reversed)
- ARM is `aarch64` — if any npm package fails with a native module error, find an arm64-compatible version before trying workarounds
- merkavian-dashboard runs only on Mac at `:5055` — **NOT** on ARM, cannot be iframed from Hub in V1

## Sidebar tabs (V1)

| Tab | Route | What it shows |
|---|---|---|
| Overview | `/` | cryptobot + polybot status cards (30s polling) |
| Crypto Tracker | `/crypto-tracker` | iframe of `https://192-18-128-170.nip.io` (public) |
| Rapid Drafter | `/rapid-drafter` | iframe of `https://rapid-drafter.192-18-128-170.nip.io` (basic_auth) |
| Merkavian Trading | `/merkavian-trading` | Fallback-only panel — cannot be iframed (Mac:5055, mixed-content + LAN-only). Shows `Open localhost:5055` CTA. |
| PoLChain | `/polchain` | "Coming Soon" placeholder with project facts + repo link. Becomes an iframe once polchain is deployed to ARM. |

## V1 Scope

1. Hub shell: Sidebar + TopNav + main content area with Framer Motion transitions
2. Overview page: status cards for cryptobot + polybot with live polling
3. Crypto Tracker tab: full iframe embed
4. Rapid Drafter tab: full iframe embed
5. Merkavian Trading tab: fallback-only panel pointing at Mac:5055
6. PoLChain tab: placeholder + project facts
7. Caddy config update + PM2 deployment on ARM

## V2 (do not build until V1 is live and tested)

- Migrate merkavian-dashboard to ARM (then the Merkavian Trading tab becomes a real iframe panel)
- Deploy polchain frontend to ARM and swap the PoLChain placeholder for an iframe
- Add Ollama chat interface tab
- Add unified log viewer across all services
