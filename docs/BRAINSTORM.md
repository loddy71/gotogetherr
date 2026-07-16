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
| 2 | Live flight quotes via Amadeus Self-Service / Kiwi Tequila behind a server proxy, cached per route+month | stub in `src/lib/pricing/amadeus-provider.ts` |
| 3 | Hotel quotes (Amadeus Hotel Search / Booking.com affiliate) + deep links to book | planned |

Lessons baked into the provider interface:

- The engine fires ~50 cities × N travelers of quote lookups per trip — live
  APIs must be cached hard (route+month key, ~24h TTL) and rate-limit safe.
- Estimates and live prices coexist: every quote carries a `source` label so
  the UI can mark "estimate" vs "live".
- API keys never ship in the client bundle → quotes go through a tiny proxy
  (Expo API routes or a Cloudflare Worker).

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
- Shareable trip link; friends open it and drop in their own city + budget
- Voting/vetoes on the shortlist ("no beach cities", "must have nightlife")
- Vibe filters powered by the existing tags (beach, nightlife, food, nature…)

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
