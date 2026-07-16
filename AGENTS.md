# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## GoTogether

Expo (React Native + Web) app that ranks meetup cities for friends living in
different countries. Domain logic lives in `src/lib/` (city data, pricing
providers, ranking engine, persisted store); screens in `src/app/`
(expo-router). Product notes and roadmap: `docs/BRAINSTORM.md`.

Commands:

- `npm run typecheck` — tsc, must stay clean
- `npm run lint` — expo lint
- `npm run build:web` then `npm run e2e` — Playwright smoke test of the full
  user flow against the static export

