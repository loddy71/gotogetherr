---
name: GoTogether
description: Every friend holds their own boarding pass to the same city; fairness is read pass by pass.
colors:
  airport-grey: "#E7EAEE"
  pass-stock: "#FFFFFF"
  sunken-grey: "#ECEEF1"
  hairline: "#D5DAE0"
  hairline-strong: "#AEB5BE"
  ink: "#111418"
  ink-secondary: "#59616C"
  signal-orange: "#FF5A1F"
  on-signal: "#111418"
  hazard-ink: "#8A5A00"
  hazard-surface: "#FFF1D6"
  danger: "#C42B1C"
  on-danger: "#FFFFFF"
  success: "#1F7A4D"
  cost-room: "#8B939D"
  cost-daily: "#C9CED5"
  land-dot: "#B9C0C9"
  chart-mark: "#8B939D"
  night-ground: "#0E1116"
  night-stock: "#181C23"
  night-sunken: "#222833"
  night-hairline: "#2A303A"
  night-hairline-strong: "#3D4552"
  night-ink: "#EEF1F5"
  night-ink-secondary: "#A3ABB7"
  night-signal-orange: "#FF7A45"
  night-on-signal: "#0E1116"
  night-hazard-ink: "#F2B54A"
  night-hazard-surface: "#2E2410"
  night-danger: "#FF7B6B"
  night-on-danger: "#0E1116"
  night-success: "#5BD08F"
  night-cost-daily: "#4A525E"
  night-land-dot: "#46505D"
  night-chart-mark: "#6B7480"
  livery-cobalt: "#2F5BEA"
  livery-teal: "#0B7A6E"
  livery-amber: "#E5A000"
  livery-violet: "#7A4FD6"
  livery-magenta: "#C53A8F"
  livery-green: "#2F7D32"
  livery-ocean: "#0570A8"
  livery-tan: "#8D6748"
typography:
  display:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "46px"
    fontWeight: 800
    lineHeight: "46px"
    letterSpacing: "-0.6px"
  title:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.3px"
  headline:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "26px"
    letterSpacing: "-0.1px"
  iata-code:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: "32px"
    letterSpacing: "0.4px"
  price-large:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "40px"
    fontFeature: "tnum"
  price:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: "28px"
    fontFeature: "tnum"
  numeral:
    fontFamily: "Sofia Sans Condensed, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "22px"
    fontFeature: "tnum"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  body-compact:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "21px"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
  small:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  caption:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  pass-field:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
    lineHeight: "13px"
    letterSpacing: "0.8px"
rounded:
  sm: "6px"
  md: "10px"
  lg: "12px"
  pill: "999px"
spacing:
  half: "2px"
  one: "4px"
  two: "8px"
  three: "16px"
  four: "24px"
  five: "32px"
  six: "64px"
components:
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "54px"
  button-primary-small:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "54px"
  button-destructive:
    backgroundColor: "transparent"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "54px"
  card:
    backgroundColor: "{colors.pass-stock}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip-neutral:
    backgroundColor: "{colors.sunken-grey}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-accent:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  chip-warning:
    backgroundColor: "{colors.hazard-surface}"
    textColor: "{colors.hazard-ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  segmented-track:
    backgroundColor: "{colors.sunken-grey}"
    rounded: "{rounded.md}"
    padding: "3px"
    height: "44px"
  segmented-thumb-selected:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.on-signal}"
    typography: "{typography.label}"
  input-field:
    backgroundColor: "{colors.sunken-grey}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  boarding-pass-carrier:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.pass-stock}"
    typography: "{typography.pass-field}"
    padding: "8px 16px"
  header-icon-button:
    backgroundColor: "{colors.pass-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
---

# Design System: GoTogether

## Overview

**Creative North Star: "The Departure Board"**

GoTogether is printed travel stock laid out on an airport-grey concourse. Every surface is a piece of white pass stock with square shoulders; every friend in a trip is a livery colour that follows them from avatar to route arc to the band across the top of their pass. The app's one loud colour, signal orange, marks the place everyone lands: the best match, the selected mode, the primary action, the meeting point on the map. Everything else is near-black ink and cool greys.

The voice is the pass's own. A condensed bold grotesk (Sofia Sans Condensed, 700 and 800) sets three-letter airport codes, city names, trip names and prices; the platform sans carries all reading text. Ranking rows lead with the IATA code the way a departure board does, and the per-person breakdown is a literal stack of boarding passes with a perforated stub holding what each friend pays. Density is moderate: one 640 px column on phones, a two-column working layout from 1024 px.

Dark mode is the same system under cabin lights, not a different mood: the ground goes to near-black navy, stock to a lifted slate, orange warms a step to stay vivid. The world explicitly rejects hero-photo destination cards and the cream-and-serif editorial look it replaced.

**Key Characteristics:**
- Airport-grey ground, white pass stock, near-black ink; one signal orange.
- A fixed livery colour per traveler, carried through every mark that represents them.
- Condensed bold grotesk for codes, names and figures; platform sans for everything else; tabular figures on every price.
- Square-shouldered 12 px stock; perforations and punched notches on passes.
- One elevation per card: soft shadow in light, hairline edge in dark.
- Springs for anything that moves under the finger; a single motion set app-wide.

## Colors

A cool, near-neutral concourse with one hot signal and a ring of saturated traveler liveries.

### Primary
- **Signal Orange** (signal-orange; night-signal-orange in dark): the meeting point. Fills the primary button, the selected segment, the "Best match" chip, the 2 px border on the top-ranked city, the destination dot and halo on the route map, the month you are previewing in the cost chart, the web focus ring, caret and text selection. Text placed on it is ink (on-signal), never white.

### Secondary
- **Traveler Liveries** (livery-cobalt, livery-teal, livery-amber, livery-violet, livery-magenta, livery-green, livery-ocean, livery-tan, assigned by traveler index and cycled): each friend's identity colour. It fills their avatar (ink initials on amber, white on the rest), the 4 px band under their pass's carrier strip, their route track and plane glyph on the pass, their arc and origin dot on the map, and their segment in the split bar. The same eight values draw the three arcs of the brand mark (cobalt, amber, teal).

### Neutral
- **Airport Grey** (airport-grey / night-ground): the page ground every card sits on; also the colour punched out of perforation notches, so the notch reads as a hole.
- **Pass Stock** (pass-stock / night-stock): cards, passes, header icon buttons, the toggle thumb.
- **Sunken Grey** (sunken-grey / night-sunken): fields, segmented track, neutral chips, skeletons, unselected veto pills, the home-row arrow well.
- **Ink** (ink / night-ink): all primary text, the cheapest month's column, the map's city-label tag. The boarding-pass carrier strip is ink #111418 in both themes.
- **Ink Secondary** (ink-secondary / night-ink-secondary): supporting text, pass field labels, unselected segment labels; at least 5.19:1 on airport grey and 6.39:1 on night-sunken.
- **Hairline / Hairline Strong** (hairline, hairline-strong and night equivalents): card edges in dark, field rules on passes, header bar underline; strong is for outlines on secondary buttons, perforation dashes, the toggle's off track and scrollbars.
- **Cost Ramp** (ink, cost-room, cost-daily): flight, room share and daily spend inside a pass's breakdown bar. Deliberately neutral so livery colours keep meaning "a person".
- **Map and Chart Greys** (land-dot, chart-mark): dotted land and default month columns.
- **Status** (danger, success, hazard-ink on hazard-surface): over/under budget lines, weather hazards, the destructive button and a vetoed city. A vetoed pill sets on-danger text on the danger fill (white in light, night ground in dark) so it holds 4.5:1 in both themes.

### Named Rules
**The One Signal Rule.** Signal orange marks only where the group lands or what is selected: best match, selected mode, primary path, the meeting point. It is a fill and a graphic colour; it never sets text on stock.

**The Livery Rule.** A traveler's colour is fixed by their position in the trip and appears on every mark that stands for them, and only on those. Cost categories use the neutral ramp, never a livery.

## Typography

**Display Font:** Sofia Sans Condensed 700 and 800 (with Arial Narrow, sans-serif)
**Body Font:** the platform sans (system-ui on native; Inter / ui-sans-serif / system-ui on web)

**Character:** A tall, tight, bold condensed face that reads like airport signage and printed pass codes, set against an unremarkable platform sans that stays out of the way of the numbers.

### Hierarchy
- **Display** (800, 46/46, -0.6 px): the one big name per screen: the home promise, the trip name, the city name.
- **Title** (700, 34/36, -0.3 px): full-screen state messages (for example the broken invitation on Join).
- **Headline** (700, 22/26): section heads ("Your trips", "When's cheapest?", "Anyone out?") and the wordmark.
- **IATA Code** (800, 32/32, +0.4 px): airport codes on passes and as the lead of every ranking row; the specimen fan sets it at 24/26.
- **Price Large / Price / Numeral** (800 40/40; 700 26/28; 700 20/22; tabular): the stub total, the per-person price on a row, ranks and small figures.
- **Body** (400, 16/24) and **Body Compact** (400, 15/21; 600 for emphasis and button labels): reading text and list content.
- **Label** (600, 13/18): sentence-case form section labels and small button labels.
- **Small / Caption** (400 13/18; 500 12/16): metadata lines, "each, est.", chip text.
- **Pass Field** (600, 10.5/13, +0.8 px, uppercase): data labels printed inside a boarding pass (From, To, Flight, Nights, Dates, Pays · estimate) and the carrier strip text.

### Named Rules
**The Code-Led Rule.** A city in a list is introduced by its three-letter code in the condensed face before its name, as on a departure board.

**The Printed Field Rule.** Tracked uppercase exists only as data labels printed on a boarding pass, sitting directly over the value they name. Everywhere else labels are sentence case; never set tracked caps above a heading.

**The Tabular Figures Rule.** Every price, rank and figure uses tabular numerals so columns of money line up.

## Layout

A single centred column, max 640 px wide, with 24 px side padding on Home and 16 px gutters inside cards. From a 1024 px window the results screen becomes two columns inside 1120 px: map, mode switch, refine and the month chart on the left, the ranked list on the right. A boarding pass turns landscape once the pass itself is at least 540 px wide: the stub moves to a 190 px right-hand column behind a vertical perforation.

Spacing runs on a 4 px base (2, 4, 8, 16, 24, 32, 64). Card interiors use 16 px padding and 16 px gaps; rows inside cards use 8 to 10 px gaps; screen sections stack 24 px apart. A floating bottom bar holds the primary action above the home indicator, and scroll content clears it by 120 px. Screens draw their own 56 px header: circular back and action buttons that sit transparent at rest and gain a ground-coloured, hairline-underlined bar (blurred on web) as content scrolls under them.

## Elevation & Depth

Depth is one step: pass stock lifted off the concourse. In light mode a card carries a soft, low ambient shadow; in dark mode shadows don't read, so the same card gets a hairline edge instead. The floating bottom bar is the only element lifted higher. Inside a card nothing is lifted again; emphasis comes from colour (the top pick's 2 px orange border), not from more shadow.

### Shadow Vocabulary
- **Stock** (`box-shadow: 0 1px 2px rgba(17, 20, 24, 0.06), 0 4px 14px rgba(17, 20, 24, 0.06)`; native: ink, 0.08 opacity, radius 12, y 4): every card and pass in light mode.
- **Floating Bar** (`box-shadow: 0 2px 4px rgba(17, 20, 24, 0.12), 0 10px 28px rgba(17, 20, 24, 0.18)`): the bottom action bar on web and Android; liquid glass replaces it on iOS 26.
- **Control Thumb** (native: ink, 0.10 opacity, radius 6, y 2): the sliding thumb of the segmented control.

### Named Rules
**The One Elevation Rule.** A card is lifted once: shadow in light, hairline in dark, never both, and never a second shadow on something inside it.

## Shapes

Square-shouldered stock: cards, passes and sheets at 12 px, controls (buttons, fields, segmented track, bottom bar) at 10 px, the segmented thumb at 7 px and small inner marks at 1 to 2 px. Bottom sheets round their top corners to 18 px. Full rounds are reserved for things that are small, singular or a person: chips, avatars, circular header and stepper buttons, the toggle, and the per-person veto pills. Boarding passes carry a perforation: a row of 7 x 1.5 px dashes in hairline-strong between two 18 px notches punched in the ground colour. Flags sit in a 3:2 frame with a 2 px radius and a hairline edge.

### Named Rules
**The Perforation Rule.** What a person pays sits on a stub torn off below (or beside) a dashed perforation with punched notches; the stub is the only place a pass shows its total.

## Components

### Buttons
Flat slabs, decisive and plain.
- **Shape:** gently squared (10 px), 54 px tall at large size, 44 px at small, 1 px border on every variant.
- **Primary:** signal orange fill and border, ink label in 600 weight; optional 18 px leading icon.
- **Secondary:** transparent with a hairline-strong outline and ink label (used for Refine, Example trip).
- **Destructive:** transparent with a danger outline and danger label.
- **Ghost:** bare ink label.
- **Press:** every tappable surface sinks to 0.97 scale (0.985 for cards and passes) and 0.9 opacity on the snappy spring, with a light haptic on native.
- **Focus (web):** 2 px signal-orange outline, 2 px offset.

### Chips
- **Style:** pill, 4 x 10 px padding, 12 px caption text, optional 13 px icon.
- **Tones:** neutral (sunken grey, secondary ink) for weather; warning (hazard surface, hazard ink) for weather hazards; accent (signal orange, ink) only for "Best match".

### Cards / Containers
- **Corner Style:** 12 px.
- **Background:** pass stock.
- **Shadow Strategy:** the Stock shadow in light, hairline in dark (see Elevation).
- **Border:** transparent hairline by default so an override can show; the top-ranked result uses a 2 px signal-orange border.
- **Internal Padding:** 16 px, 16 px gaps.

### Inputs / Fields
- **Style:** sunken-grey fill, no stroke, 10 px corners, 46 to 50 px tall, 16 px side padding; placeholder and empty values in secondary ink.
- **Focus:** web gets the global orange focus ring and orange caret.

### Segmented Control
A sunken-grey track (10 px corners, 3 px inset) holding Cheapest / Balanced / Fairest; an orange thumb glides between options on the glide spring. Selected label ink on orange, others secondary ink, 600 weight 13 px; the row is 44 px.

### Toggle
50 x 30 track, 24 px stock thumb that springs across; the track tints from hairline-strong to signal orange.

### Navigation
No tab bar. Each screen floats a 56 px header with 44 px circular stock buttons (back on the left, share and edit on the right). A compact title fades and rises in once the display title scrolls away. Stack transitions slide from the right; the trip form presents as a modal.

### Ranking Row (result card)
A card led by rank (numeral, secondary ink), then the IATA code, then city name with flag and a "country · vibes" line, and the per-person price with "each, est." right-aligned. Beneath: the split bar in livery colours, then total and percentage even, and a weather chip. The top row adds the orange border and the "Best match" chip.

### Boarding Pass (signature)
One pass per friend, stacked. An ink carrier strip ("GoTogether · Boarding pass", n of m) with the mark in white, then a 4 px livery band. The body holds the traveler's avatar and name; a From / To route with IATA codes either side of a livery track and plane glyph; hairline-ruled field cells for Flight, Nights and Dates. Below the perforation, the stub holds "Pays · estimate", a budget line in success or danger, and the total in Price Large, counting up from zero. Tapping unfolds a breakdown: a neutral stacked bar and dot-leader line items for flight, room share and food. The home screen shows a compact, fanned version (each pass offset 16 px right and overlapping 8 px) as a live specimen.

### Route Map
Dotted-land world map in a card. Each traveler's arc draws in their livery from an origin dot ringed in stock to the orange destination point with a soft orange halo, labelled with an ink tag reading the code and city.

## Do's and Don'ts

### Do:
- **Do** keep signal orange to the best match, the selected state, the primary action and the meeting point; put ink, not white, on it.
- **Do** give every traveler one livery colour by trip position and repeat it on their avatar, band, route, map arc and split segment.
- **Do** lead city rows and pass endpoints with the three-letter code in the condensed face.
- **Do** set every price in tabular figures and label every figure as an estimate ("each, est.", "Pays · estimate").
- **Do** lift a card once: Stock shadow in light, hairline in dark.
- **Do** use the shared motion set: snappy spring for press and toggles, glide spring for things changing place, 160 / 280 / 520 ms with cubic-bezier(0.2, 0.8, 0.2, 1), 45 ms stagger.
- **Do** keep touch targets at 44 pt and text at 4.5:1 or better in both themes.

### Don't:
- **Don't** set tracked uppercase outside a boarding pass's printed fields, and never as an eyebrow over a heading.
- **Don't** use a livery colour for cost categories, status or decoration; the breakdown ramp stays neutral.
- **Don't** use hero photography for destinations; a city is its code, name, flag and numbers.
- **Don't** return to cream paper, serif display type or stamp-red accents.
- **Don't** stack a second shadow inside a card or add a shadow to dark-mode stock.
- **Don't** round rectangular stock into pills; full rounds are for chips, avatars, circular buttons, toggles and person pills.
