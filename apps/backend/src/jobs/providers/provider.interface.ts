import { JobSource } from '@prisma/client';

/** Normalized job shape shared by all providers before persistence. */
export interface NormalizedJob {
  source: JobSource;
  sourceId: string;
  title: string;
  company: string;
  location?: string;
  country?: string;
  remote: boolean;
  description: string;
  url: string;
  applyUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  tags: string[];
  postedAt?: Date;
}

export interface JobProvider {
  readonly source: JobSource;
  /** Fetch jobs for a given search query / keywords. */
  fetch(query: JobQuery): Promise<NormalizedJob[]>;
  /** Whether this provider is usable given current env configuration. */
  isEnabled(): boolean;
}

export interface JobQuery {
  keywords: string[];
  countries: string[];
  remoteOnly?: boolean;
  /** Greenhouse/Lever board tokens to crawl (per-company). */
  boardTokens?: string[];
  limit?: number;
}

/** fetch() with an abort timeout so one slow board can't stall the whole hunt. */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Run async tasks with a bounded concurrency so we don't open 50 sockets at once. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await task(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Strip HTML tags to plain text (providers return HTML descriptions). */
export function stripHtml(html: string): string {
  if (!html) return '';
  let text = html;
  // Decode entities, then strip tags — twice, because providers such as
  // Greenhouse return entity-encoded markup (e.g. "&lt;p&gt;...&quot;") which
  // only becomes real HTML after the first decode and must then be removed.
  for (let pass = 0; pass < 2; pass++) {
    text = decodeHtmlEntities(text)
      .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ');
  }
  return text
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

/** Decode the HTML entities commonly seen in job-board descriptions. */
function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(Number(dec)))
    // Decode &amp; last so sequences like "&amp;lt;" survive the earlier passes.
    .replace(/&amp;/gi, '&');
}

function safeFromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}
