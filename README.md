# Daily Whodunit — Game

## Local Development

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start dev server
npm run dev
```

Open http://localhost:3000 — the game loads with hot reload.

**Case files during dev:**  
Place `YYYY-MM-DD.json` files in `public/cases/` for local testing.  
The dev server proxies `/api/` to production.

## Deployment

Push to the `main` branch on GitHub.  
Vercel auto-runs `npm run build` and deploys `dist/`.

No manual compile step. No CDN scripts. No Babel.

## File Structure

```
src/
  App.jsx                 ← screen router + state
  main.jsx                ← React mount point
  components/
    CaseLoader.jsx        ← fetches /cases/YYYY-MM-DD.json
    LevelSelect.jsx       ← case intro + difficulty picker
    GameScreen.jsx        ← main game engine
    SolvedScreen.jsx      ← results + share card
    TimeoutScreen.jsx     ← time's up screen
    AlreadyPlayed.jsx     ← replay prevention + share
  lib/
    constants.js          ← colors, fonts, tier config, ranks
    normalize.js          ← case JSON normalization
    scoring.js            ← score calc, rank, share text
    storage.js            ← localStorage helpers, date utils
  data/
    fallback.js           ← Last Order (Case #004) fallback
public/
  cases/                  ← daily JSON files go here
```

## Adding a New Case

Drop `YYYY-MM-DD.json` in the `public/cases/` folder and push.  
Vercel deploys in ~30 seconds. No rebuild needed.

## Environment Variables (Vercel)

| Variable | Value |
|----------|-------|
| `GITHUB_OWNER` | `dailywhodunit` |
| `GITHUB_REPO` | `cold-case` |
| `GITHUB_BRANCH` | `main` |
| `GITHUB_TOKEN` | your PAT (for studio push) |
