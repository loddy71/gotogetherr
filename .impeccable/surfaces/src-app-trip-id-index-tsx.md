---
version: 1
slug: "src-app-trip-id-index-tsx"
primary_target: "src/app/trip/[id]/index.tsx"
related_targets: ["src/app/trip/[id]/[city].tsx","src/app/index.tsx","src/app/new-trip.tsx","src/app/join.tsx"]
---

Scope: the whole GoTogether app (home, trip form, results, city detail, join). Visitor mode: Operate. Audience: an organiser and the friends they invite by link, on phones and laptops equally. Job: agree on a city where the trip is cheap and the cost falls fairly. Proof on hand: the 50-city dataset and calibrated estimates; no testimonials. Constraints: Expo (web + iOS + Android) with standard controls; the name GoTogether, the route-arcs mark and fairness as the pitch are binding.

## Direction contract

THESIS: Every friend holds their own boarding pass to the same city; fairness is read pass by pass, not as one group total. Refuses the category's hero-photo destination cards and the incumbent cream-and-serif editorial look.

OWN-WORLD: Airport-grey ground, white pass stock, near-black ink, one signal orange reserved for the best match, selection and the primary path; each traveler owns a saturated livery colour that bands their pass and their route. Condensed bold grotesk for IATA codes, city names and big figures; the platform sans for everything else; tabular figures throughout. Square-shouldered 12 px stock with perforations, no pills except chips.

STORY: Open the trip, see the best city and what each person pays, switch Cheapest/Balanced/Fairest, open a city, read each friend's pass, rule out or book.

FIRST VIEWPORT: Results: back/share/edit bar; trip name and travelers; route map with every friend's livery arc landing on the orange point; Cheapest/Balanced/Fairest tabs; first rows of the ranking as code-led rows (IST, Istanbul, $986 each, split). City: flag, city, summary line, then the pass stack.

FORM: Boarding pass, position 1 of 7 on the grounded list (IMPECCABLE’S PICK). seed:700a2dd50a1050ad. Signature move: "Who pays what" is a stack of boarding passes, one per friend, FROM and TO codes, flight time, nights, a perforation and a stub holding that person's total.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
