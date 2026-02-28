# IP Lookup

A Vue 3 + TypeScript web application that translates IP addresses into countries with real-time local clocks.

## Features

- Add multiple IP lookup rows
- Lookup on blur (search runs when you leave the input)
- Simultaneous lookups across rows
- Input disabled while searching
- Client-side validation (IPv4/IPv6)
- Real-time local clock (HH:MM:SS) per result that updates every second
- Country flag display
- Friendly error handling
- Response caching (successful results and permanent errors)

## Tech Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS
- ip-api.com (via Vercel API proxy)

## Development

```bash
yarn install
yarn dev
```

The app runs at `http://localhost:5173`. The `/api/geo` endpoint is proxied to ip-api.com during development via Vite middleware.

## Build

```bash
yarn build
```

## Tests

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Linting
yarn lint
```

## Deployment Workflow

This project uses a **CI-first deployment strategy** to ensure code quality:

### 1. GitHub Actions CI (Automatic)

Every push and PR triggers CI that runs:
- ✅ Linting (`yarn lint`)
- ✅ Unit tests (`yarn test`)
- ✅ Type checking + Build (`yarn build`)

### 2. Vercel Deployment (Manual)

Vercel's automatic GitHub deployments are **disabled** (`git.deploymentEnabled: false` in `vercel.json`).

**To deploy:**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Why manual deployment?**
- Ensures CI passes before deploying
- Prevents broken code from reaching production
- Gives you control over when to deploy
- Vercel's TypeScript checking can differ from local/CI

### Vercel Configuration

- **Build**: `yarn build` (no linting/testing in Vercel)
- **Output**: `dist/` directory
- **API Functions**: `api/**/*.ts` (serverless functions with rate limiting)
- **GitHub Integration**: Disabled for manual control

## Project Structure

```
├── api/
│   └── geo.ts              # Vercel serverless function (IP lookup proxy with rate limiting)
├── lib/
│   └── geo-lookup.ts       # Shared geolocation logic (server & dev proxy)
├── src/
│   ├── api/
│   │   └── geoClient.ts    # Frontend API client with caching
│   ├── components/
│   │   ├── IpLookupRow.vue
│   │   └── ZonedClockDisplay.vue
│   ├── composables/
│   │   ├── useIpLookup.ts
│   │   └── useZonedClock.ts
│   ├── utils/
│   │   └── ip.ts           # IP validation utilities
│   ├── App.vue
│   └── main.ts
├── vite/
│   └── dev-proxy.ts        # Vite dev server API proxy
├── e2e/                    # Playwright e2e tests
└── .github/workflows/      # CI pipeline
```
