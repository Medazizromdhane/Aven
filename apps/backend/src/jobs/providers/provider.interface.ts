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

/** Strip HTML tags to plain text (providers return HTML descriptions). */
export function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
