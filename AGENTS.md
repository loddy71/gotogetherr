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
- `npm run check:data` — dataset sanity + fare calibration (sources and
  refresh steps in `docs/DATA_SOURCES.md`)
- `npm run build:web` then `npm run e2e` — Playwright smoke test of the full
  user flow against the static export
- Dev server: `npx expo start --port 8081`, web at http://localhost:8081.
  `.claude/launch.json` lets the Claude desktop app's preview start it.


UI work: the Impeccable design plugin is enabled for this project
(`.claude/settings.json`). Product context is in `PRODUCT.md`, the visual
system in `DESIGN.md` (boarding-pass world). Follow its craft floor: text ≥
4.5:1 in both themes, 44 pt touch targets, one elevation per card, theme
tokens instead of raw hex. Labels are sentence case; tracked caps appear only
as data labels printed on a pass (FROM, TO, FLIGHT, PAYS), never as an
eyebrow over a heading. Signal orange is reserved for the best match,
selection and the primary action.

Git workflow (local sessions):

- Work on a feature branch, never directly on `main`. Open a PR to merge.
- Commit at each logical step with a clear message. Don't batch a whole
  session into one commit.
- `scripts/auto-commit.sh` runs as a Stop hook (`.claude/settings.json`). It
  commits anything left uncommitted as a "WIP: auto-commit" and pushes the
  branch at the end of every turn. It skips `main`, cloud sessions, and
  in-progress merges and rebases. Set `AUTO_COMMIT=0` to turn it off.
- Never commit secrets. API keys go in `.env.local` (gitignored) or the
  environment, never in tracked files.
