# Honor of Kings Database

An offline-capable reference app for **Honor of Kings Global** covering heroes, items, arcana, and patch notes. Available as a web app (Cloudflare Pages) and as an Android APK built via GitHub Actions.

---

## Features

- **Heroes** — 116 heroes with tier ratings, roles, win/pick/ban rates, base stats, recommended builds, skills, lore, and splash art
- **Items** — 107 items organized by category (Attack, Magic, Defense, Movement, Jungle, Support) with prices and stats
- **Arcana** — 27 arcana across Red, Purple, Blue, and Green sets with stat breakdowns
- **Patch Notes** — 12 built-in patch entries with per-hero change tracking (buff / nerf / adjustment)
- **News** — Live news feed scraped from the official Honor of Kings site; falls back to cached articles when offline
- **Patch Scraper** — Optional Tavily-powered tool to extract patch notes from any URL

## Offline Support

All hero, item, arcana, and patch data is bundled locally — no internet connection required to browse them. The news feed and patch scraper require a connection, but the rest of the app works fully offline including on the Android APK.

---

## Android APK

The APK is built automatically via GitHub Actions on every push to `main`.

**To download the latest APK:**

1. Go to the [Actions tab](../../actions)
2. Open the most recent successful workflow run
3. Scroll to **Artifacts** at the bottom
4. Download **HoK-Database-debug**
5. Unzip and install `app-debug.apk` on your Android device

You may need to enable **Install from unknown sources** on your device before installing.

---

## Web Deployment

The app is deployed to Cloudflare Pages. The `functions/api/` directory contains the serverless functions for the news feed and Tavily patch scraper.

To deploy your own instance:

```bash
npm install
npm run build
```

Then deploy the `out/` folder to Cloudflare Pages with `functions/` as the Functions directory. See `CLOUDFLARE_DEPLOY.md` for full instructions.

---

## Tech Stack

- **Framework** — Next.js 16 (static export)
- **UI** — React 19, Tailwind CSS v4, shadcn/ui
- **Language** — TypeScript
- **Backend** — Cloudflare Pages Functions
- **Android** — Capacitor 6
- **CI/CD** — GitHub Actions

---

## Data Sources

- Hero stats and rates: [hokstats.gg](https://www.hokstats.gg)
- Official news: [honorofkings.com](https://www.honorofkings.com/global-en/news-list.html)
- Hero images: [Roo0722/hokdatabase](https://github.com/Roo0722/hokdatabase)

---

*This is a fan-made reference tool and is not affiliated with TiMi Studio Group or Level Infinite.*

