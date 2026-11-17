# GoTogether

**Find the best city for friends in different countries to meet up.**

Add your friends, their home cities and budgets — GoTogether ranks ~50 cities
worldwide by what the get-together actually costs *each person* (return flight
+ shared hotel + daily costs), and lets you trade off **cheapest overall**
against **fairest for everyone**.

One codebase, three targets: it runs as a web app and as a native **iOS**
(and Android) app via [Expo](https://expo.dev).

| Home | Ranked results | Who pays what |
|---|---|---|
| ![Home](docs/screenshots/01-home.png) | ![Results](docs/screenshots/03-results.png) | ![Detail](docs/screenshots/04-detail.png) |

| Refine | When's cheapest? | Dark mode |
|---|---|---|
| ![Refine](docs/screenshots/09-refine-sheet.png) | ![Months](docs/screenshots/10-months.png) | ![Dark](docs/screenshots/06-dark-results.png) |

## Design

**The boarding-pass world.** Every friend holds their own pass to the same
city, so fairness is read pass by pass, not as one group total. The look was
chosen through [Impeccable](https://impeccable.style)'s redesign flow
(product interview, a seeded direction roll, a separate finish review); the
system is recorded in [DESIGN.md](DESIGN.md) and the product brief in
[PRODUCT.md](PRODUCT.md).

- **Palette:** airport-grey ground, white pass stock, near-black ink. One
  signal orange is reserved for the best match, selection and the primary
  action. Each traveler owns a saturated livery colour that bands their pass
  and their route on the map. Night-flight dark mode.
- **Type:** Sofia Sans Condensed sets airport codes (LON, IST), city names
  and big figures; the platform sans does everything else, with tabular
  figures. Tracked caps appear only as data labels printed on a pass.
- **Signature:** "Who pays what" is a stack of boarding passes: carrier
  strip, FROM/TO codes, ruled FLIGHT/NIGHTS/DATES cells, a perforation and a
  stub holding what that person pays. On wide screens the stub tears off to
  the side. First run opens on a live-priced specimen stack.
- **Layout:** one column on phones (ranking before the month chart), two
  columns from 1024 px. Flags are SVG, so they render on Windows too.

The mark (three travelers' routes landing on one orange point) is drawn once
in `scripts/icon/mark.svg`; `node scripts/gen-icons.mjs` renders the app
icon, Android adaptive layers, splash and favicon from it.

Accessibility floor: text ≥ 4.5:1 contrast in both themes, 44 pt touch
targets, headings exposed to screen readers, a visible keyboard focus ring
and themed selection on the web, and reduced motion respected (including
the static web export's first paint).

**Motion.** One set of springs and curves in
`src/constants/theme.ts` (`Motion`) drives everything:

- Switching Cheapest / Balanced / Fairest slides the segmented thumb,
  glides each result card into its new position, rolls the prices to their
  new values, and re-routes the map to the new top pick.
- The route map pans and zooms to frame everyone and draws each traveller's
  arc into the meeting city.
- Screens stagger in, large titles collapse into the header as you scroll,
  and the city picker is a drag-to-dismiss sheet.
- Every tap target sinks on a spring and, on iOS and Android, gives a light
  haptic. On iOS 26 the floating action bar is Liquid Glass.
- Reduced-motion settings are respected.

Shared primitives: `PressableScale`, `Card`, `Button`, `Chip`, `Avatar`,
`Segmented`, `Sheet`, `WorldMap`, `CostBar`, `AnimatedNumber`,
`ScreenHeader`, `BrandMark`, `PageTitle`, `BoardingPass`, `SpecimenPasses`,
`Flag`.

## How the ranking works

For every candidate city, each traveler gets an estimated cost:

```
return flight (distance-calibrated, airport, month & destination season)
+ share of a mid-range double room (taxes and resort fees included, seasonal)
+ food & local transport × nights
```

Each destination also shows the expected weather for the trip month, with
monsoon, hurricane, rainy-season and extreme-heat warnings, plus its hotel
season and each traveler's time in the air.

Then **Refine** narrows the list to places the group would actually go.
Every change re-sorts the list behind the sheet live:

- **Vibes:** beach (only in beach weather, 23°C+ that month), nightlife,
  culture, nature, or warm (25°C+ in the trip month, from climate data).
  Pick several and a city must have them all.
- **Longest flight for anyone:** ≤ 5, 8 or 12 hours in the air.
- **Skip bad-weather cities** (on by default): monsoon, hurricane and
  typhoon seasons, or 38°C+.

Filters are saved with the trip and travel with its share link.

**Anyone out?** Any friend can veto a city from its detail screen ("I'm
out on Vegas"). It drops out of the ranking, the map and the month chart for
everyone, travels in the share link, and can be restored from Refine.

**Check live prices.** Every destination suggests concrete dates (the second
Friday of the trip month, for the chosen number of nights) and hands off to
real searches: Kayak and Google for each traveler's flights, and Booking.com
for the group's rooms, sized two to a room. No API keys needed; this is the
bridge until live pricing is wired in.

**When's cheapest?** Under the filters, a 12-month chart shows what the best
city would cost each person in every month, with the same mode and filters
(the weather filters change month to month). Tap a month to preview it:
"September: Athens, $1,200 each, $137 less than October". Tap **Plan for
September** to move the trip.

Cities are then scored on a blend you control:

- **Cheapest** — minimise the group's total spend
- **Fairest** — minimise how unevenly the cost falls across the group
  (measured as 1 − coefficient of variation)
- Cities that blow someone's stated budget are penalised and flagged

## Sharing a trip

Every trip has a **Share** action that produces a link with the whole trip
encoded in the URL — no accounts, no backend. Friends who open it land on the
`/join` screen, get a local copy saved to their device, and can add themselves
or tweak budgets.

## Pricing: calibrated estimates, live quotes when you want them

Pricing and scoring are separate steps (`src/lib/scoring.ts`): a trip's
cost grid is priced once per month, nights, origins and budgets, then cached;
switching mode, filtering or vetoing only re-scores it, which is synchronous
and takes under a millisecond. Live quotes are fetched in parallel (8 at a
time, 4 s timeout), and after three failures in a row the app stops asking
the proxy for a minute and uses estimates.

Prices come from a deterministic estimator (`src/lib/pricing/`) calibrated
in September 2026 against published fares and hotel rates. On seven
benchmark routes it lands within ±11% of the typical return fare, and
`npm run check:data` keeps it that way in CI. Same inputs give the same
prices, fully offline.

For live quotes, point the app at a pricing proxy that implements two
endpoints (contract in `src/lib/pricing/proxy-provider.ts`):

```bash
EXPO_PUBLIC_PRICE_PROXY_URL=https://your-proxy.example npx expo start
```

Any route the proxy can't price falls back to the estimator automatically
(`FallbackProvider`). **Amadeus Self-Service, which the previous proxy
wrapped, shut down on 17 July 2026.** See
[docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) for sources, known limitations
and the recommended replacement stack (Travelpayouts, Duffel, LiteAPI).
[docs/BRAINSTORM.md](docs/BRAINSTORM.md) has the product roadmap.

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
`dist/`) deployable to any static host. Every push to `main` deploys it to
GitHub Pages at https://loddy71.github.io/gotogetherr/
(`.github/workflows/pages.yml`).

## Development

```bash
npm run typecheck    # tsc
npm run lint         # eslint (expo lint)
npm run check:data   # dataset sanity + fare calibration against benchmarks
npm run build:web    # static web export into dist/
npm run e2e          # Playwright smoke test against dist/ (light + dark)
node scripts/gen-icons.mjs   # re-render icons/splash/favicon from the mark
node scripts/gen-flags.mjs   # regenerate SVG flags after adding a country
```

The project enables the [Impeccable](https://github.com/pbakaus/impeccable)
design plugin in `.claude/settings.json`; Claude Code sessions on this repo
can run `/impeccable audit`, `/impeccable polish` and friends.

### Project layout

```
src/
  app/                  expo-router screens
    index.tsx           trip list (home)
    new-trip.tsx        create/edit trip (modal)
    trip/[id]/index.tsx ranked destinations for a trip
    trip/[id]/[city].tsx  per-person cost breakdown
  components/           shared UI (cards, sheet, map, segmented, result cards…)
  lib/
    data/cities.ts      50-city dataset: prices, seasons, climate, coords
    data/land-dots.ts   dotted world map (generated: scripts/gen-land-dots.mjs)
    pricing/            PriceProvider interface, estimator, live-proxy client
    scoring.ts          the ranking engine (cost × fairness × budget)
    store.tsx           trips state, persisted via AsyncStorage
```

Trips are stored on-device (AsyncStorage → localStorage on web); there is no
backend and the app works offline.
