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
