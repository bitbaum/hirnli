/**
 * Website Content Extraction — Fetch and strip HTML for LLM analysis
 *
 * Reuses the redirect-following pattern from foundation-research-assistant.ts
 * but adds timeout handling, HTML stripping, and content truncation.
 *
 * Also provides HEAD request support for URL verification (used by url-discover.ts).
 */

import * as https from 'https';
import * as http from 'http';

const MAX_CONTENT_LENGTH = 4000;
const TIMEOUT_MS = 10_000;
const HEAD_TIMEOUT_MS = 5_000;

interface ExtractResult {
  ok: boolean;
  content?: string;
  error?: string;
}

export interface HeadResult {
  ok: boolean;
  statusCode: number;
  finalUrl: string;
  error?: string;
}

/**
 * Fetch a URL with redirect support and timeout.
 */
export function fetchRaw(url: string, redirectCount = 0): Promise<string> {
  if (redirectCount > 5) {
    return Promise.reject(new Error('Too many redirects'));
  }

  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(url, { timeout: TIMEOUT_MS }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          const absolute = redirectUrl.startsWith('http')
            ? redirectUrl
            : new URL(redirectUrl, url).href;
          fetchRaw(absolute, redirectCount + 1)
            .then(resolve)
            .catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk: Buffer) => {
        data += chunk;
      });
      response.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
    });
  });
}

/**
 * Strip HTML tags, scripts, styles, and normalize whitespace.
 */
export function stripHtml(html: string): string {
  return (
    html
      // Remove script/style blocks entirely
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      // Remove HTML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove all remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * HTTP HEAD with redirect following. Used by url-discover.ts to verify
 * candidate URLs cheaply (no body downloaded).
 */
export function headRequest(url: string, redirectCount = 0): Promise<HeadResult> {
  if (redirectCount > 5) {
    return Promise.resolve({
      ok: false,
      statusCode: 0,
      finalUrl: url,
      error: 'Too many redirects',
    });
  }

  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    const req = client.request(url, { method: 'HEAD', timeout: HEAD_TIMEOUT_MS }, (response) => {
      const status = response.statusCode || 0;

      if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          const absolute = redirectUrl.startsWith('http')
            ? redirectUrl
            : new URL(redirectUrl, url).href;
          headRequest(absolute, redirectCount + 1).then(resolve);
          return;
        }
      }

      resolve({
        ok: status >= 200 && status < 400,
        statusCode: status,
        finalUrl: url,
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, statusCode: 0, finalUrl: url, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        statusCode: 0,
        finalUrl: url,
        error: `Timeout after ${HEAD_TIMEOUT_MS}ms`,
      });
    });
    req.end();
  });
}

/**
 * Fetch website content, strip HTML, truncate to meaningful text.
 */
export async function extractWebContent(url: string): Promise<ExtractResult> {
  try {
    const html = await fetchRaw(url);
    const text = stripHtml(html);

    if (text.length < 50) {
      return { ok: false, error: 'Page content too short (likely empty or JS-rendered)' };
    }

    return {
      ok: true,
      content: text.substring(0, MAX_CONTENT_LENGTH),
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
