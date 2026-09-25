# Travel data: sources, accuracy, and going live

*Last verified: 25 September 2026.*

GoTogether ranks 50 cities using a calibrated estimator, not live quotes.
This page records what the numbers are based on, how far to trust them,
and what it would take to replace them with live prices.

## What the estimator models

| Input | Model | Where |
|---|---|---|
| Return flight | Great-circle distance → banded per-km fare, × airport competitiveness (both ends), × global demand by month, × destination season, × a North America–East Asia premium, ± 8% stable route jitter | `src/lib/pricing/mock-provider.ts` |
| Hotel | Annual-average mid-range double, **including taxes and mandatory fees**, × peak / low season for that city; shared two to a room | `src/lib/data/cities.ts` |
| Daily costs | Meals, local transport and one paid sight, per person per day | `src/lib/data/cities.ts` |
| Weather | Average daily high: January and July normals, interpolated along a cosine that peaks in late July (late January in the south), so August and September stay hot as they do in reality. Plus seasonal hazards: monsoon, hurricane and typhoon seasons, rainy seasons, extreme heat (38°C+) | `src/lib/data/cities.ts` |
| Flight time | Great-circle distance ÷ 820 km/h + 0.6 h, i.e. time in the air on a direct routing | `src/lib/pricing/mock-provider.ts` |

## Calibration (September 2026)

`npm run check:data` (also run in CI) fails if any benchmark route drifts
more than ±30% from its published typical return economy fare:

| Route | Model (annual avg) | Benchmark | Source |
|---|---|---|---|
| London – Barcelona | $133 | $68–175 typical | [momondo](https://www.momondo.com/flights/london/barcelona) |
| New York – Los Angeles | $383 | $385 12-month average | [Kayak](https://www.kayak.com/flight-routes/New-York-NYC/Los-Angeles-LAX) |
| London – New York | $621 | $494–799 typical | [momondo](https://www.momondo.com/flights/london/new-york-city), [FareCompare](https://www.farecompare.com/flights/London-LON/New_York-NYC/market.html) |
| London – Bangkok | $839 | $928 average | [FareCompare](https://www.farecompare.com/flights/London-LON/Bangkok-BKK/market.html) |
| New York – Tokyo | $1,163 | $1,265 average ($1,060–1,535) | [FareCompare](https://www.farecompare.com/flights/New_York-NYC/Tokyo-TYO/market.html) |
| London – Sydney | $1,288 | £772–1,169 typical | [momondo](https://www.momondo.co.uk/flights/london/sydney) |
| Los Angeles – Sydney | $1,076 | $852–1,168 typical | [momondo](https://www.momondo.com/flights/los-angeles/sydney) |

Before this calibration the model under-priced long-haul by 33–53%, which
over-rewarded "near one friend" cities for intercontinental groups.

### Hotel rates re-checked for 2026

| City | Change | Why |
|---|---|---|
| New York | $300 → $360, swing ±45% | 2025 ADR $334 before ~15% hotel taxes; Jan $196 vs Dec $541 ([NYC Tourism](https://www.business.nyctourism.com/press-media/press-releases/NYC-Tourism-Annual-Report-March-2026)) |
| Amsterdam | $200 → $240 | VAT on rooms rose 9% → 21% on 1 Jan 2026, on top of the 12.5% city tax ([City of Amsterdam](https://www.amsterdam.nl/en/municipal-taxes/tourist-tax/)) |
| Las Vegas | $150 → $185 | Strip resort fees average ~$49/night before 13.38% tax ([Las Vegas resort fee list](https://www.lasvegasjaunt.com/resort-fees/)) |
| Tokyo | $150 → $180 | ADR reached ¥33,168 in May 2026 ([Seoul Economic Daily](https://en.sedaily.com/international/2026/07/02/japan-hotel-rates-climb-as-tokyo-hits-320000-won-a-night)) |
| Istanbul | $95 → $120 | Mid-range 3–4★ now $84–160 ([GlobalStay](https://globalstay.co.uk/istanbul-hotel-prices-2026/)) |
| London | $210 → $240 | Mid-range ~$247 ([Oysterlink](https://oysterlink.com/spotlight/average-daily-hotel-room-rates/)) |
| Buenos Aires | unchanged, now seasonal | 4★ ~$125 high season (Oct–Mar), ~$70 low ([Secrets of Buenos Aires](https://secretsofbuenosaires.com/is-argentina-expensive-to-travel/)) |

Smaller adjustments (Lisbon, Rome, Dublin, Reykjavík, Singapore, Bangkok,
Sydney, and others) follow the same sources and 2026 inflation.

### Other corrections

- **Seasonality is per destination now.** Previously one global curve made
  Buenos Aires, Sydney and Cape Town *pricier* in their winter, and ignored
  that Dubai and Doha hotels crash in summer (40 °C+) while Madrid empties in
  August.
- Edinburgh uses 🇬🇧: the Scottish tag-sequence flag renders as a plain
  black flag on Android and Windows.
- "UAE" is spelled out as United Arab Emirates for consistency.
- Blurbs that had gone stale were updated: Istanbul is no longer a bargain,
  Vegas rooms carry resort fees, and Amsterdam has the steepest hotel taxes in
  Europe.

### Known limitations

- Fares are **typical** fares, not the fare you can book today. Actual prices
  move with lead time, day of week and events, and can easily differ by ±30%.
- Transpacific routes into Oceania (e.g. Los Angeles – Sydney) price like any
  long-haul; routes to North and East Asia get a 20% premium. Everything else
  is distance-driven, so unusual monopoly routes will be off.
- Flight time is time in the air on a direct routing; connections add hours.
- Temperatures are interpolated from January and July normals with a
  seasonal lag. Checked against published normals for Dubai, London, Sydney,
  Buenos Aires and New York: within about 2°C in every month. Less accurate
  where the year isn't a simple wave, e.g. pre-monsoon Mumbai (May peaks
  around 34°C).
- The "Beach" filter only counts a beach city in beach weather (23°C+ that
  month): Athens in January is not a beach trip.
- Visa rules, which depend on each traveler's passport, are not modelled.

## Going live: the tools you'd need

**Amadeus Self-Service, which the previous live-pricing proxy used, was shut
down on 17 July 2026.** API keys stopped working and new sign-ups closed
earlier in the spring ([PhocusWire](https://www.phocuswire.com/amadeus-shut-down-self-service-apis-portal-developers)).
The Amadeus-specific proxy has been removed. The app keeps a backend-agnostic
`ProxyPriceProvider` (contract in `src/lib/pricing/proxy-provider.ts`) with
per-route fallback to the estimator.

### Recommended stack

| Need | Tool | Cost / access (Sept 2026) | Why |
|---|---|---|---|
| Flight prices for ranking | **[Travelpayouts / Aviasales Data API](https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API)** | Free with affiliate sign-up; earns ~1.1–1.5% commission; ~300 req/min on the price calendar | Cached prices from real searches, grouped by **month**, which matches how trips are planned here. Cheap enough to price all 50 cities. |
| Verify the shortlist live | **[Duffel](https://duffel.com/pricing)** | Searches free up to a 1,500:1 search-to-book ratio, then $0.005 each; $3 per booking | Real bookable offers. Use for the top ~5 cities only, and later for in-app booking. |
| Alternative live check | [SerpApi Google Flights](https://serpapi.com/google-flights-api) | 100–250 free searches/month, then from $25 per 1,000 | Google Flights results with no partnership needed; too small a quota to rank 50 cities. |
| Hotel rates | **[LiteAPI](https://docs.liteapi.travel/)** | Free sandbox; commission model in production | Real-time rates across 2M+ hotels with a self-serve key. |
| Climate normals | [Open-Meteo](https://open-meteo.com/en/docs/climate-api) | Free for non-commercial use (10k calls/day); data CC BY 4.0 | Replace hand-entered temperatures with computed monthly normals at build time. |
| Currency display | [Frankfurter](https://www.frankfurter.app/) | Free, no key (ECB reference rates) | For showing costs in each traveler's currency. |
| Proxy hosting | Cloudflare Workers + KV, or Expo API routes on EAS Hosting | Free tiers cover an MVP | Keeps API keys server-side and caches quotes per route+month. |

**Not viable:** Kiwi Tequila (invite-only since May 2024), Skyscanner
(partners only), Booking.com Demand API (managed affiliates only, and its
terms require written approval before any AI-based use).

**Suggested architecture:** rank all 50 cities with Travelpayouts month
prices (falling back to the estimator per route), then re-price only the top
five with Duffel or SerpApi. That stays inside free or cheap tiers even for
large groups.

### To build and test this from a Claude Code cloud session

The session's network policy currently blocks these hosts:
`api.travelpayouts.com`, `api.duffel.com`, `serpapi.com`,
`api.liteapi.travel`, `*.open-meteo.com`, `api.frankfurter.app`, and
`docs.expo.dev`. Add them under the environment's **Network access**
settings, and store keys as environment variables, never in the repo:
`TRAVELPAYOUTS_TOKEN`, `DUFFEL_ACCESS_TOKEN`, `LITEAPI_KEY`.

## Live-price hand-off links

Until a live pricing proxy exists, each destination links out to real
searches for the suggested dates. Formats were checked in September 2026:

| Link | Format | Source |
|---|---|---|
| Kayak flights | `kayak.com/flights/LON-BCN/2026-10-09/2026-10-12/` (metro codes such as LON and NYC work) | [Apify Kayak scraper docs](https://apify.com/moving_beacon-owner1/kayak-flight-scraper) |
| Booking.com hotels | `booking.com/searchresults.html?ss=…&checkin=…&checkout=…&group_adults=…&no_rooms=…` | [Browserless Booking.com skill](https://www.browserless.io/skills/booking.com/search-booking-hotel-prices) |
| Google | a plain web search, `google.com/search?q=flights from London to Barcelona 2026-10-09 to 2026-10-12` | Google Flights now uses an opaque encoded `tfs` link ([HasData](https://hasdata.com/blog/how-to-scrape-google-flights)), so a search is the stable option |

These are ordinary public URLs, not affiliate links. Swapping in
Travelpayouts or Booking.com affiliate links later would earn commission on
bookings.

## Refreshing the data

1. Re-check the benchmark fares in `scripts/check-data.ts` and the hotel
   sources above. Update `hotelNight` / `foodDay` in `src/lib/data/cities.ts`.
2. Run `npm run check:data` until it passes.
3. Update the "Last verified" date at the top of this page and in
   `cities.ts`.
