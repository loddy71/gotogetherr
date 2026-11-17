# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Friend groups scattered across countries, used two ways in the same flow:

- **The organiser**: one friend sets up a trip (name, month, nights, where
  everyone flies from, optional budgets), sees which cities work, and shares
  a link to the group.
- **The rest of the group**: friends open that link from a group chat,
  usually on a phone, save their own copy, add themselves or tweak budgets,
  and rule out cities they won't go to ("I'm out on Vegas").

Both phone and desktop matter equally: the organiser may plan on a laptop,
the group mostly arrives on phones.

## Product Purpose

Answer "where should we all meet?" for people who live in different
countries. GoTogether prices about 50 candidate cities per person (return
flight, a share of a mid-range room, daily food and transport) and ranks
them. Success: the group agrees on a city quickly, and nobody feels they are
quietly subsidising everyone else.

## Positioning

Fairness, not just cheapness. Flight search tools find the cheapest fare for
one traveller; GoTogether weighs the whole group's total against how evenly
the cost falls on each person, and lets the group slide between "cheapest
overall" and "fairest for everyone". It works with no account and no backend:
the whole trip travels in the share link.

## Operating Context

- Started from a group chat; the share link is the main way people arrive.
- Decisions happen over days: people return to the same trip, change the
  month, add a friend, veto a city.
- After choosing, people leave for real booking sites (Kayak, Google,
  Booking.com links with suggested dates).

## Capabilities and Constraints

- Ranking modes: Cheapest, Balanced, Fairest (a cost/fairness blend).
- Refine: vibes (beach, nightlife, culture, nature, warm), longest flight for
  anyone, skip bad-weather cities; per-person vetoes; "When's cheapest?"
  12-month comparison; per-person cost breakdown; live-price hand-off links.
- Prices are calibrated estimates (September 2026), not live quotes; a live
  pricing proxy is optional. Figures must always read as estimates.
- One Expo codebase: static web export on GitHub Pages (primary today), plus
  iOS and Android builds. Trips are stored on the device; works offline.
- Undecided: accounts and synced trips; currencies other than USD.

## Brand Commitments

- The name **GoTogether**.
- The route-arcs mark: flight arcs landing on one meeting point (may be
  redrawn, concept stays).
- Fairness is the core idea and the main pitch.

## Evidence on Hand

- 50-city dataset with sourced hotel rates, seasons and climate
  (`src/lib/data/cities.ts`, sources in `docs/DATA_SOURCES.md`).
- Fare calibration against seven published benchmark routes (`npm run
  check:data`).
- No users, testimonials, press or partners yet: never invent them.

## Product Principles

1. Fair beats cheap: always show what each person pays, not only the total.
2. Honest numbers: estimates are labelled as estimates; no fake precision.
3. Zero friction to join: a link is enough; no sign-up.
4. The group decides: vetoes and modes are for the group, not just the
   organiser.

## Accessibility & Inclusion

Text contrast at least 4.5:1 in light and dark, 44 pt touch targets,
headings exposed to screen readers, reduced motion respected (current floor).
