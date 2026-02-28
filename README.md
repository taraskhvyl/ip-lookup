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
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The `/api/geo` endpoint is proxied to ip-api.com during development via Vite middleware.

## Build

```bash
npm run build
```

## Tests

```bash
# Unit tests
npm run test

# E2E tests (requires Playwright browsers: npx playwright install)
npm run test:e2e
```

## Deployment (Vercel)

1. Push to GitHub and connect the repo to Vercel
2. Vercel will auto-detect the Vite project
3. The `api/` folder is deployed as serverless functions
4. Production uses the `/api/geo` proxy to ip-api.com with rate limiting

### Vercel GitHub Integration

- **Preview deployments**: Every PR gets a preview URL
- **Production**: Deploys from the default branch on merge
- **CI**: GitHub Actions runs lint, typecheck, unit tests, and e2e on push/PR

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
