# GoTogether — brainstorm & product notes

*The problem: five friends, four countries, one group chat that has been trying
to pick a reunion city for three months.*

## The core insight

Picking a meetup city is a **multi-origin optimisation problem** that humans are
bad at and spreadsheets make miserable:

- Flight prices are wildly asymmetric — the "obvious middle" city is often the
  most expensive option for half the group.
- "Cheapest overall" and "fair for everyone" are different answers. A city next
  door to one friend minimises the total but makes someone else pay 3× more.
- Budgets differ. A city that's a steal for the London friend can quietly blow
  the Bogotá friend's budget.

The product's job is to make that trade-off visible and rank cities by it.

## Who it's for

- Friend groups scattered by university, emigration, or remote work.
- Distributed teams planning offsites (same math, bigger budgets — a natural
  B2B upsell later).
- Long-distance families picking a neutral holiday spot.

## The ranking model (implemented)

For each candidate city, for each traveler:

```
cost(traveler) = return flight (origin → city, seasonal)
              + hotel share (double occupancy, mid-range, seasonal)
              + daily costs (food + local transport) × nights
```

Then per city:

- **Total** — sum of everyone's cost.
- **Fairness** — `1 − coefficient of variation` of individual costs
  (1.0 = everyone pays exactly the same).
- **Budget fit** — each traveler over their stated budget multiplies the score
  by 0.7 (over-budget cities sink but stay visible, since budgets are soft).
- **Score** — `(1−w)·costScore + w·fairness`, where `w` is the user's
  "Cheapest / Balanced / Fairest" preference.

Why fairness matters as a first-class axis: it's the thing group chats actually
argue about. Nobody says "the total is too high"; they say "why do I pay $900
when you pay $200?".

## Pricing data: staged plan

| Stage | Source | Status |
|---|---|---|
| 1 | Deterministic estimator (distance-banded fares, hub factor, seasonality, city hotel/food indices) | ✅ shipped — free, offline, stable rankings |
| 1b | Estimator calibrated to 2026 benchmark fares and hotel rates; per-destination seasons, climate and hazards | ✅ shipped. `npm run check:data` guards it in CI |
| 2 | Live quotes behind a server-side proxy with per-route fallback. Amadeus Self-Service was used first but **shut down 17 July 2026**; next up is Travelpayouts month prices for ranking, Duffel to verify the shortlist, LiteAPI for hotels | client + fallback shipped; upstream to replace (see `docs/DATA_SOURCES.md`) |
| 3 | "Live" vs "estimate" labels in the UI, booking deep links (affiliate) | planned |

Lessons baked into the provider interface:

- The engine fires ~50 cities × N travelers of quote lookups per trip — live
  APIs must be cached hard (route+month key, ~24h TTL) and rate-limit safe.
- Estimates and live prices coexist: every quote carries a `source` label so
  the UI can mark "estimate" vs "live".
- API keys never ship in the client bundle → quotes go through a tiny proxy
  (Expo API routes or a Cloudflare Worker).

## Design direction

**v3 (current): paper and ink, softened, with motion.** Feedback on v2 was
to make it smoother. The identity stays (paper, ink, serif, one accent), but
surfaces are rounded cards, and everything moves on one shared set of
springs: results glide when re-ranked, the map re-routes, figures roll,
sheets drag. A route map shows where everyone flies from, which does more to
explain "meet in the middle" than any copy.

**v2: printed travel guide.**

First pass looked like every other generated app: violet gradients, emoji as
iconography, medal circles, pill badges, drop-shadowed cards. It read as
templated, which is death for a product whose whole pitch is taste and
judgement about travel.

The current direction is a **printed travel guide**:

- Warm paper stock and ink, not white-on-grey chrome. One accent (stamp red),
  rationed to the top-ranked city, selected tabs and links.
- Instrument Serif for display type against a plain system sans for body and
  small-caps labels — the magazine pairing, not the SaaS one.
- Hairline rules do the grouping; no shadows, near-square corners.
- Data gets typographic treatment: tabular figures, rank numerals set in the
  margin, dot leaders on the per-person bill, thin cost bars in a muted
  travel-stamp palette that also identifies each traveller elsewhere.
- No decorative emoji. Flags stay, because a flag is data.

## Why Expo (web + iOS from one codebase)

- One React Native codebase → native iOS app (App Store via EAS Build), 
  Android for free, and a static web app (`expo export -p web`) that can be
  hosted anywhere and installed as a PWA.
- expo-router gives file-based routing with real URLs on web — trips are
  shareable links later (`/trip/abc123`).
- No backend required for the MVP: trips persist locally via AsyncStorage
  (localStorage on web).

## Feature roadmap

**MVP (this repo):**
- Trips with month, nights, travelers (name, home city, optional budget)
- 50-city candidate set, ranked with cost/fairness blend
- Per-person breakdown per destination, over/under-budget flags
- Local persistence, works fully offline

**v1.1 — the social loop:**
- ✅ Shareable trip link (trip encoded in the URL, zero-backend `/join` flow);
  friends open it and drop in their own city + budget
- ✅ Refine: vibe filters (beach, nightlife, culture, nature, warm), a limit
  on the longest flight anyone takes, and skipping monsoon/hurricane/
  extreme-heat cities. Saved with the trip and carried in share links
- Voting/vetoes on the shortlist, per person ("I'm out on Vegas")

**v1.2 — real money:**
- Live flight prices (stage 2 above), "book" deep links (affiliate revenue)
- Date-range search: "cheapest weekend in March" instead of a fixed month
- Multi-currency display (quotes stay USD internally, FX at render time)

**v2 — the moat:**
- Accounts + synced trips (Supabase or similar)
- Price-drop alerts on a saved shortlist ("Lisbon just dropped 18% for June")
- Group offsite mode: per-company budgets, invoicing, flight policy rules
- "Surprise me" mode: hide prices, show only fairness + vibes

## Monetisation ideas (in order of realism)

1. Flight/hotel affiliate deep links (Kiwi, Booking, Expedia) — zero friction.
2. Pro tier: alerts, unlimited trips, date-range optimisation.
3. B2B offsite planner (distributed teams have real budgets).

## Open questions

- Candidate set: fixed 50 cities is opinionated and fast. Later: filter by max
  flight time per traveler, or generate candidates from actual route networks.
- Fairness definition: coefficient of variation vs. max/min ratio vs. "nobody
  pays more than X% above the median" — worth A/B-ing with real groups.
- Should home-city meetups (one friend hosts, flight = $0) be boosted or
  penalised? Currently neutral: it helps fairness ranking naturally.
