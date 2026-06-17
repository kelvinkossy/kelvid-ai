# VidForge

## Quick start
```bash
npm run dev    # slow in dev — pages compile on first visit
npm run build && npm run start  # FAST — all pages pre-compiled
```

## Production mode (for daily use)
Run this — it's the **fast** mode:
```bash
npm run build
npm start
```
Then open http://localhost:3000. Page loads go from 3-7s (dev) down to 18-300ms (production).
