# Merkavian Hub

Personal AI Hub on ARM server `192.18.128.170`, deployed at `hub.192-18-128-170.nip.io` on port `3002` via PM2 and Caddy `basic_auth`. Central interface for all Merkavian projects with closeable sidebar panels.

Built with Next.js 14 (App Router) + TypeScript + Coinbase Design System (CDS) + Framer Motion. **No Tailwind** — CDS provides its own design tokens via CSS variables and StyleProps.

## Status

V1 scaffold in progress. See `CHANGELOG.md` for the running log.

## Current state

- ☑ Next.js 14 scaffolded with TypeScript, App Router, no Tailwind, `src/` layout
- ☑ CDS installed (`@coinbase/cds-web@9` + `@coinbase/cds-icons@5` + `framer-motion@^10`)
- ☑ `MediaQueryProvider` + `ThemeProvider` wired in `src/app/providers.tsx`, dark mode forced
- ☑ Stub files exist for every V1 component
- ☐ V1 components implemented
- ☐ Deployed to ARM behind Caddy `basic_auth`

## Architecture

See `CLAUDE.md` for the full architectural reference (stack, services map, error states, animations, port reservations, auth rules, V1 vs V2 scope).

## Setup (local dev)

```bash
npm install
cp .env.example .env  # adjust values
npm run dev -- --port 3002
```

## Deploying to ARM (production)

```bash
ssh arm
cd ~/merkavian-hub
git pull
npm install
npm run build
pm2 restart hub
sudo systemctl reload caddy   # only after Caddyfile changes
```

## Services this Hub connects to

| Service | ARM port | How Hub connects |
|---|---|---|
| crypto-tracker | 3000 | iframe via HTTPS |
| rapid-drafter | 3001 | iframe via HTTPS |
| cryptobot | 5050 | server-side proxy through `/api/cryptobot` |
| polybot | 5001 | server-side proxy through `/api/polybot` |

`polchain` and `merkavian-dashboard` are V2 — not deployed to ARM yet.

## Key decisions

- **CDS over Tailwind:** matches Coinbase APM internship context and gives a real component library out of the box.
- **Server-side proxying for bot APIs:** keeps cryptobot/polybot (which have no auth) localhost-only on ARM.
- **Iframe embedding for full-page services:** the cheapest path to a unified shell; no rebuild of crypto-tracker or rapid-drafter needed.
- **Dark mode only:** matches the rest of the Merkavian visual language.

See `DEAD_ENDS.md` for ideas that were investigated and ruled out.
