# Honor of Kings Database - Cloudflare Workers/Pages Deployment Guide

## Architecture Overview

This project is designed to be deployable on **Cloudflare Workers** (API) + **Cloudflare Pages** (Frontend).

### Components

1. **Frontend (Cloudflare Pages)**: Next.js static export with client-side rendering
2. **API (Cloudflare Workers)**: News scraping endpoint
3. **Data (Static)**: Hero, Item, Arcana, Patch data served as static JSON or bundled in the build
4. **Cache (Cloudflare KV/R2)**: Optional caching for scraped news data

## Deployment Options

### Option A: Cloudflare Pages with Functions (Recommended)

Cloudflare Pages supports Next.js with server-side functions natively. This is the simplest approach.

#### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

#### Step 2: Login to Cloudflare

```bash
wrangler login
```

#### Step 3: Configure for Static Export

Add `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

#### Step 4: Build the Project

```bash
npm run build
```

This generates a static `out/` directory.

#### Step 5: Deploy to Cloudflare Pages

```bash
wrangler pages deploy out --project-name=hok-database
```

### Option B: Cloudflare Pages with SSR (Full Stack)

Cloudflare Pages now supports Next.js SSR with the `@cloudflare/next-on-pages` adapter.

#### Step 1: Install Dependencies

```bash
npm install @cloudflare/next-on-pages
```

#### Step 2: Create `wrangler.toml`

```toml
name = "hok-database"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NEWS_CACHE_TTL = "1800"
```

#### Step 3: Create `worker.ts` (entry point for Functions)

```typescript
import { onRequest } from "@cloudflare/next-on-pages";

export const onRequest = onRequest;
```

#### Step 4: Deploy

```bash
npx wrangler pages deploy .vercel/output/static --project-name=hok-database
```

### Option C: Cloudflare Worker (API-only)

For the news scraping API as a standalone Cloudflare Worker:

#### `wrangler.toml`

```toml
name = "hok-news-api"
main = "src/worker/index.ts"
compatibility_date = "2024-01-01"

[routes]
pattern = "api.hok-database.pages.dev/*"
zone_name = "hok-database.pages.dev"
```

#### `src/worker/index.ts`

```typescript
interface Env {
  CACHE_KV: KVNamespace;
  CACHE_TTL?: number;
}

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  imageUrl?: string;
  link?: string;
  isPatch: boolean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Force refresh
    if (request.method === 'POST') {
      const freshData = await scrapeNews();
      await env.CACHE_KV.put('news_data', JSON.stringify(freshData), {
        expirationTtl: env.CACHE_TTL || 1800,
      });
      return new Response(JSON.stringify({ success: true, articles: freshData }), { headers });
    }

    // Try cache first
    const cached = await env.CACHE_KV.get('news_data');
    if (cached) {
      return new Response(
        JSON.stringify({ success: true, articles: JSON.parse(cached), cached: true }),
        { headers }
      );
    }

    // Scrape fresh
    const articles = await scrapeNews();
    await env.CACHE_KV.put('news_data', JSON.stringify(articles), {
      expirationTtl: env.CACHE_TTL || 1800,
    });

    return new Response(
      JSON.stringify({ success: true, articles, cached: false }),
      { headers }
    );
  },
};

async function scrapeNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch('https://www.honorofkings.com/global-en/news-list.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    return parseNewsFromHtml(html);
  } catch (error) {
    console.error('Scrape error:', error);
    return getFallbackNews();
  }
}

function parseNewsFromHtml(html: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  // Extract article data from HTML
  const linkRegex = /href="(https:\/\/www\.honorofkings\.com\/global-en\/news-detail\.html[^"]+)"/g;
  const dateRegex = /(\d{4}\/\d{2}\/\d{2})/g;
  const titleRegex = /news_rt_tit[^>]*>[\s]*([^<]+)</g;
  const descRegex = /news_rt_des[^>]*>[\s]*([^<]+)</g;
  const imgRegex = /src="(https:\/\/[^"]+\.(jpg|jpeg|png|webp))"/gi;

  const links: string[] = [];
  const dates: string[] = [];
  const titles: string[] = [];
  const descs: string[] = [];
  const images: string[] = [];

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    if (!links.includes(match[1])) links.push(match[1]);
  }
  while ((match = dateRegex.exec(html)) !== null) {
    dates.push(match[1].replace(/\//g, '-'));
  }
  while ((match = titleRegex.exec(html)) !== null) {
    if (match[1].trim()) titles.push(match[1].trim());
  }
  while ((match = descRegex.exec(html)) !== null) {
    if (match[1].trim()) descs.push(match[1].trim());
  }
  while ((match = imgRegex.exec(html)) !== null) {
    if (!match[1].includes('onetrust') && !match[1].includes('logo')) {
      images.push(match[1]);
    }
  }

  const max = Math.min(links.length, titles.length, dates.length);
  for (let i = 0; i < max; i++) {
    const title = titles[i] || `News ${i + 1}`;
    articles.push({
      id: `news-${i}-${Date.now()}`,
      title,
      date: dates[i] || '2026-01-01',
      category: title.toLowerCase().includes('update') || title.toLowerCase().includes('patch')
        ? 'PATCH NOTES' : 'ALL NEWS',
      description: descs[i] || '',
      imageUrl: images[i] || undefined,
      link: links[i] || undefined,
      isPatch: title.toLowerCase().includes('update') ||
               title.toLowerCase().includes('patch') ||
               title.toLowerCase().includes('version'),
    });
  }

  return articles;
}

function getFallbackNews(): NewsArticle[] {
  return [{
    id: 'fallback',
    title: 'Visit honorofkings.com for latest news',
    date: new Date().toISOString().split('T')[0],
    category: 'ALL NEWS',
    description: 'Unable to scrape news at this time. Please visit the official site.',
    isPatch: false,
    link: 'https://www.honorofkings.com/global-en/news-list.html',
  }];
}
```

#### Bind KV Namespace

```bash
npx wrangler kv namespace create "CACHE_KV"
```

Then add to `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE_KV"
id = "<your-kv-namespace-id>"
```

## Patch Notes Auto-Detection

The news scraper automatically detects patch notes by checking article titles for keywords:
- "update", "patch", "version", "maintenance", "server"

These are flagged with `isPatch: true` and shown with gold badges in the UI.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEWS_CACHE_TTL` | Cache duration in seconds | `1800` (30 min) |
| `NEWS_SOURCE_URL` | Official news page URL | `https://www.honorofkings.com/global-en/news-list.html` |

## Custom Domain Setup

After deployment, add a custom domain in Cloudflare Pages:
1. Go to Pages → Your Project → Custom domains
2. Add your domain (e.g., `hok.yourdomain.com`)
3. Cloudflare handles DNS automatically

## Recommended Cloudflare Plan

- **Free Plan**: Works for static deployment + limited Workers
- **Workers Paid ($5/mo)**: Required for KV storage and longer Worker execution times
- **Pages Pro**: For advanced features like SSR with larger bundles

## Performance Notes

- Static data (heroes, items, arcana, patches) is bundled in the build — no API needed
- News scraping runs server-side only (Cloudflare Worker/Function)
- Cache news data in KV to reduce scraping frequency
- The scraper uses 30-minute TTL by default to avoid rate limiting
