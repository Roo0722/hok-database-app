// Cloudflare Pages Function — Tavily API proxy
// Handles both search and extract operations
// Works alongside static `out/` deployment

interface Env {
  TAVILY_API_KEY?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const mode = url.searchParams.get('mode') || 'extract';

  // Get API key: from env, or from request header (client-side fallback)
  const apiKey =
    context.env.TAVILY_API_KEY ||
    (context.request.headers.get('X-Tavily-Key') || '');

  if (!apiKey) {
    return Response.json(
      { success: false, error: 'Tavily API key not configured. Set it in the UI or as a Cloudflare secret.' },
      { status: 400 }
    );
  }

  try {
    if (mode === 'search') {
      const query = url.searchParams.get('query') || 'Honor of Kings patch notes hero balance changes 2026';
      const maxResults = parseInt(url.searchParams.get('max_results') || '5', 10);

      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          max_results: maxResults,
          include_answer: true,
          include_raw_content: false,
        }),
      });

      const data = await response.json();

      return Response.json({
        success: true,
        mode: 'search',
        results: (data.results || []).map((r: { title?: string; url?: string; content?: string; score?: number }) => ({
          title: r.title || '',
          url: r.url || '',
          snippet: r.content?.slice(0, 300) || '',
          score: r.score || 0,
        })),
        answer: data.answer || '',
      });
    }

    // Default: extract mode
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return Response.json(
        { success: false, error: 'URL parameter required for extract mode' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.tavily.com/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        urls: [targetUrl],
      }),
    });

    const data = await response.json();

    // Tavily extract returns: { results: [{ url, raw_content }] }
    const results = data.results || data.results || [];

    return Response.json({
      success: true,
      mode: 'extract',
      results: results.map((r: { url?: string; raw_content?: string }) => ({
        url: r.url || targetUrl,
        content: r.raw_content || '',
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { success: false, error: `Tavily API error: ${message}` },
      { status: 500 }
    );
  }
};
