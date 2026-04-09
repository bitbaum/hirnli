/**
 * Web Search — Find foundation websites via search engines
 *
 * Abstracts search behind a clean interface so we can swap backends.
 * Currently supports:
 *   - Brave Search API (free tier: 2000 queries/month, needs BRAVE_API_KEY)
 *   - Google Custom Search (100 free/day, needs GOOGLE_API_KEY + GOOGLE_CX)
 *   - Fallback: no search, returns empty (script degrades gracefully)
 *
 * The search query is constructed to find the foundation's actual website,
 * not to guess URLs from slugs.
 */

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

/**
 * Search for a foundation's website.
 * Returns top results from whichever search backend is configured.
 */
export async function searchFoundationWebsite(
  name: string,
  maxResults = 5,
): Promise<SearchResult[]> {
  const query = `"${name}" Stiftung Kontakt Website`;

  // Try backends in order of preference
  if (process.env.BRAVE_API_KEY) {
    return braveSearch(query, maxResults);
  }
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
    return googleSearch(query, maxResults);
  }

  // No search API configured — degrade gracefully
  console.warn('  [search] No search API configured (set BRAVE_API_KEY or GOOGLE_API_KEY+GOOGLE_CX)');
  return [];
}

async function braveSearch(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(maxResults),
      search_lang: 'de',
      country: 'CH',
    });
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY!,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { web?: { results?: Array<{ title: string; url: string; description: string }> } };
    return (data.web?.results || []).map(r => ({
      title: r.title,
      url: r.url,
      description: r.description,
    }));
  } catch {
    return [];
  }
}

async function googleSearch(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      key: process.env.GOOGLE_API_KEY!,
      cx: process.env.GOOGLE_CX!,
      num: String(maxResults),
      gl: 'ch',
      lr: 'lang_de',
    });
    const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { items?: Array<{ title: string; link: string; snippet: string }> };
    return (data.items || []).map(r => ({
      title: r.title,
      url: r.link,
      description: r.snippet,
    }));
  } catch {
    return [];
  }
}
