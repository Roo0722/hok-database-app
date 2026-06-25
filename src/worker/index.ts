/**
 * Honor of Kings News Scraper - Cloudflare Worker
 * 
 * Deploys as a standalone Cloudflare Worker for news scraping.
 * Can be bound to a KV namespace for caching.
 * 
 * Usage:
 *   wrangler deploy
 * 
 * Endpoints:
 *   GET  / - Get cached or fresh news
 *   POST / - Force refresh news (clears cache)
 */

interface Env {
  CACHE_KV: KVNamespace;
  CACHE_TTL?: string;
  NEWS_SOURCE_URL?: string;
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

const DEFAULT_SOURCE = 'https://www.honorofkings.com/global-en/news-list.html';
const DEFAULT_TTL = 1800; // 30 minutes

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST = force refresh
      if (request.method === 'POST') {
        const sourceUrl = env.NEWS_SOURCE_URL || DEFAULT_SOURCE;
        const articles = await scrapeAndParse(sourceUrl);
        
        await env.CACHE_KV.put('hok_news', JSON.stringify(articles), {
          expirationTtl: parseInt(env.CACHE_TTL || String(DEFAULT_TTL)),
          metadata: { scrapedAt: new Date().toISOString(), count: articles.length },
        });

        return new Response(JSON.stringify({
          success: true,
          articles,
          cached: false,
          lastFetched: new Date().toISOString(),
          totalArticles: articles.length,
          message: 'Cache cleared and data refreshed',
        }), { headers: corsHeaders });
      }

      // GET = try cache first
      const cached = await env.CACHE_KV.get('hok_news', 'json') as NewsArticle[] | null;
      if (cached && cached.length > 0) {
        const meta = await env.CACHE_KV.getWithMetadata('hok_news');
        return new Response(JSON.stringify({
          success: true,
          articles: cached,
          cached: true,
          lastFetched: meta?.metadata?.scrapedAt || new Date().toISOString(),
          totalArticles: cached.length,
        }), { headers: corsHeaders });
      }

      // Cache miss: scrape fresh
      const sourceUrl = env.NEWS_SOURCE_URL || DEFAULT_SOURCE;
      const articles = await scrapeAndParse(sourceUrl);

      await env.CACHE_KV.put('hok_news', JSON.stringify(articles), {
        expirationTtl: parseInt(env.CACHE_TTL || String(DEFAULT_TTL)),
        metadata: { scrapedAt: new Date().toISOString(), count: articles.length },
      });

      return new Response(JSON.stringify({
        success: true,
        articles,
        cached: false,
        lastFetched: new Date().toISOString(),
        totalArticles: articles.length,
      }), { headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        articles: [],
        totalArticles: 0,
      }), { status: 500, headers: corsHeaders });
    }
  },
};

async function scrapeAndParse(sourceUrl: string): Promise<NewsArticle[]> {
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: HTTP ${response.status}`);
  }

  const html = await response.text();
  return parseNewsHtml(html);
}

function parseNewsHtml(html: string): NewsArticle[] {
  const articles: NewsArticle[] = [];

  try {
    // Extract data using regex patterns matching the HoK website structure
    const linkPattern = /href="(https:\/\/www\.honorofkings\.com\/global-en\/news-detail\.html[^"]+)"/g;
    const datePattern = /(\d{4}\/\d{2}\/\d{2})/g;
    const titlePattern = /news_rt_tit[^>]*>[\s]*([^<]+)</g;
    const descPattern = /news_rt_des[^>]*>[\s]*([^<]+)</g;
    const imgPattern = /src="(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi;

    const links: string[] = [];
    const dates: string[] = [];
    const titles: string[] = [];
    const descs: string[] = [];
    const images: string[] = [];

    let m;
    while ((m = linkPattern.exec(html)) !== null) {
      if (!links.includes(m[1])) links.push(m[1]);
    }
    while ((m = datePattern.exec(html)) !== null) {
      dates.push(m[1].replace(/\//g, '-'));
    }
    while ((m = titlePattern.exec(html)) !== null) {
      const t = m[1].trim();
      if (t) titles.push(t);
    }
    while ((m = descPattern.exec(html)) !== null) {
      const d = m[1].trim();
      if (d) descs.push(d);
    }
    while ((m = imgPattern.exec(html)) !== null) {
      if (!m[1].includes('onetrust') && !m[1].includes('logo') && !images.includes(m[1])) {
        images.push(m[1]);
      }
    }

    const count = Math.min(links.length, titles.length, dates.length);
    for (let i = 0; i < count; i++) {
      const title = titles[i];
      const isPatch = isPatchArticle(title);

      articles.push({
        id: `hok-news-${i}-${Date.now()}`,
        title,
        date: dates[i] || 'unknown',
        category: isPatch ? 'PATCH NOTES' : 'ALL NEWS',
        description: cleanText(descs[i] || ''),
        imageUrl: images[i] || undefined,
        link: links[i] || undefined,
        isPatch,
      });
    }
  } catch (e) {
    console.error('Parse error:', e);
  }

  if (articles.length === 0) {
    articles.push({
      id: 'fallback-0',
      title: 'Unable to parse news - Visit honorofkings.com',
      date: new Date().toISOString().split('T')[0],
      category: 'ALL NEWS',
      description: 'The scraper could not parse the news page. Please try again later or visit the official site directly.',
      link: 'https://www.honorofkings.com/global-en/news-list.html',
      isPatch: false,
    });
  }

  return articles;
}

function isPatchArticle(title: string): boolean {
  const keywords = ['update', 'patch', 'version', 'maintenance', 'server', 'balance', 'adjustment'];
  const lower = title.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}
