# GoTogether ✈️

**Find the best city for friends in different countries to meet up.**

Add your friends, their home cities and budgets — GoTogether ranks ~50 cities
worldwide by what the get-together actually costs *each person* (return flight
+ shared hotel + daily costs), and lets you trade off **cheapest overall**
against **fairest for everyone**.

One codebase, three targets: it runs as a web app and as a native **iOS**
(and Android) app via [Expo](https://expo.dev).

| Home | Ranked results | Per-person breakdown |
|---|---|---|
| ![Home](docs/screenshots/01-home.png) | ![Results](docs/screenshots/03-results.png) | ![Detail](docs/screenshots/04-detail.png) |

## How the ranking works

For every candidate city, each traveler gets an estimated cost:

```
return flight (seasonal, distance & hub adjusted)
+ hotel share (mid-range, double occupancy)
+ food & local transport × nights
```

Cities are then scored on a blend you control:

- **Cheapest** — minimise the group's total spend
- **Fairest** — minimise how unevenly the cost falls across the group
  (measured as 1 − coefficient of variation)
- Cities that blow someone's stated budget are penalised and flagged

Prices come from a deterministic estimator today (`src/lib/pricing/`), behind
a `PriceProvider` interface designed to be swapped for live Amadeus/Kiwi
quotes — see [docs/BRAINSTORM.md](docs/BRAINSTORM.md) for the full product
brainstorm and roadmap.

## Getting started

```bash
npm install
npx expo start
```

- **Web** — press `w`, or `npm run web`
- **iOS** — press `i` for the iOS Simulator (macOS), or scan the QR code with
  [Expo Go](https://expo.dev/go) on an iPhone
- **Android** — press `a`, or scan the QR code with Expo Go

To ship a standalone iOS app, use [EAS Build](https://docs.expo.dev/build/introduction/):
`npx eas build -p ios`. The web app is a static export (`npm run build:web` →
`dist/`) deployable to any static host.

## Development

```bash
npx tsc --noEmit     # typecheck
npm run lint         # eslint (expo lint)
npm run build:web    # static web export into dist/
npm run e2e          # Playwright smoke test against dist/
```

### Project layout

```
src/
  app/                  expo-router screens
    index.tsx           trip list (home)
    new-trip.tsx        create/edit trip (modal)
    trip/[id]/index.tsx ranked destinations for a trip
    trip/[id]/[city].tsx  per-person cost breakdown
  components/           shared UI (buttons, city picker, result cards…)
  lib/
    data/cities.ts      candidate city dataset (prices, coords, vibes)
    pricing/            PriceProvider interface + estimator + Amadeus stub
    scoring.ts          the ranking engine (cost × fairness × budget)
    store.tsx           trips state, persisted via AsyncStorage
```

Trips are stored on-device (AsyncStorage → localStorage on web); there is no
backend and the app works offline.
