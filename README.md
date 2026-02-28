# IP Lookup

A Vue 3 + TypeScript web application that translates IP addresses into countries with real-time local clocks.

[![CI](https://github.com/taraskhvyl/ip-lookup/actions/workflows/ci.yml/badge.svg)](https://github.com/taraskhvyl/ip-lookup/actions/workflows/ci.yml)

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

## Deployment

### Automatic CI/CD with GitHub Actions

Every push to any branch triggers:
1. ✅ Linting (`yarn lint`)
2. ✅ Unit tests (`yarn test`)
3. ✅ Type checking + Build (`yarn build`)
4. 🚀 Auto-deploy to Vercel (if tests pass)

**Deployment targets:**
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

### Setup Required

Add these secrets to GitHub repo (Settings → Secrets and variables → Actions):

1. **VERCEL_TOKEN** - Get from https://vercel.com/account/tokens
2. **VERCEL_ORG_ID** - From Vercel team/account settings
3. **VERCEL_PROJECT_ID** - From Vercel project settings

### Vercel Configuration

- **Build**: `yarn build`
- **Output**: `dist/` directory
- **API Functions**: `api/**/*.ts` (serverless functions with rate limiting)

## Project Structure

```
├── api/
│   ├── geo.ts              # Vercel serverless function
│   └── geo.test.ts
├── lib/
│   ├── geo-lookup.ts       # Shared geolocation logic
│   ├── geo-lookup.test.ts
│   ├── rate-limiter.ts     # Rate limiting (10 req/min)
│   ├── rate-limiter.test.ts
│   ├── security.ts         # Origin validation & IP extraction
│   └── security.test.ts
├── src/
│   ├── api/
│   │   ├── geoClient.ts    # Frontend API client with caching
│   │   └── geoClient.test.ts
│   ├── components/
│   │   ├── IpLookupRow.vue
│   │   ├── IpLookupRow.spec.ts
│   │   └── ZonedClockDisplay.vue
│   ├── composables/
│   │   ├── useIpLookup.ts
│   │   ├── useIpLookup.test.ts
│   │   ├── useZonedClock.ts # Single shared timer for all clocks
│   │   └── useZonedClock.test.ts
│   ├── utils/
│   │   ├── ip.ts           # IP validation utilities
│   │   └── ip.test.ts
│   ├── App.vue
│   ├── App.spec.ts
│   └── main.ts
├── vite/
│   └── dev-proxy.ts        # Vite dev server API proxy
└── .github/workflows/
    └── ci.yml              # CI/CD pipeline
```
