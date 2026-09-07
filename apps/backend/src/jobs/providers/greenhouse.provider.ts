import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import {
  JobProvider,
  JobQuery,
  NormalizedJob,
  fetchWithTimeout,
  mapWithConcurrency,
  stripHtml,
} from './provider.interface';

/**
 * Greenhouse public job board API — per-company, no key required.
 * https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
 */
@Injectable()
export class GreenhouseProvider implements JobProvider {
  readonly source = JobSource.GREENHOUSE;
  private readonly logger = new Logger(GreenhouseProvider.name);

  // Sensible defaults: a broad mix of companies (not just big names) that hire
  // internationally and frequently sponsor visas. Extend at runtime with
  // GREENHOUSE_BOARDS (comma-separated) without a code change.
  private readonly defaultBoards = [
    'stripe', 'gitlab', 'databricks', 'airbnb', 'coinbase', 'robinhood',
    'doordash', 'instacart', 'discord', 'figma', 'dropbox', 'cloudflare',
    'twilio', 'asana', 'elastic', 'hashicorp', 'mongodb', 'samsara', 'affirm',
    'gusto', 'reddit', 'pinterest', 'lyft', 'sofi', 'benchling', 'gemini',
    'chainalysis', 'wise', 'deel', 'monzo', 'checkr', 'flexport', 'nuro',
    'scaleai', 'weightsandbiases', 'vercel', 'retool', 'ramp', 'mistralai',
    'huggingface', 'anthropic', 'openai', 'sonarsource', 'contentful',
    'algolia', 'typeform', 'gocardless', 'bumble', 'personio', 'celonis',
  ];

  private get boards(): string[] {
    const configured = (process.env.GREENHOUSE_BOARDS ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
    return configured.length ? configured : this.defaultBoards;
  }

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const boards = query.boardTokens?.length ? query.boardTokens : this.boards;
    const keywords = (query.keywords ?? []).map((k) => k.toLowerCase()).filter(Boolean);

    // Crawl boards in parallel (bounded) so a search over ~50 boards takes
    // seconds instead of minutes; skip boards that are slow or unavailable.
    const batches = await mapWithConcurrency(boards, 8, (token) => this.fetchBoard(token, keywords));
    return batches.flat();
  }

  private async fetchBoard(token: string, keywords: string[]): Promise<NormalizedJob[]> {
    const results: NormalizedJob[] = [];
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return results;
      const data = (await res.json()) as { jobs?: GreenhouseJob[] };
      for (const j of data.jobs ?? []) {
        const description = stripHtml(j.content ?? '');
        // Keep results relevant to the search instead of dumping whole boards.
        if (keywords.length) {
          const haystack = `${j.title} ${description}`.toLowerCase();
          if (!keywords.some((kw) => haystack.includes(kw))) continue;
        }
        results.push({
          source: this.source,
          sourceId: `${token}-${j.id}`,
          title: j.title,
          company: token,
          location: j.location?.name,
          country: j.location?.name,
          remote: /remote/i.test(j.location?.name ?? ''),
          description,
          url: j.absolute_url,
          applyUrl: j.absolute_url,
          tags: [],
          postedAt: j.updated_at ? new Date(j.updated_at) : undefined,
        });
      }
    } catch (err) {
      this.logger.warn(`Greenhouse board ${token} failed: ${(err as Error).message}`);
    }
    return results;
  }
}

interface GreenhouseJob {
  id: number;
  title: string;
  content?: string;
  absolute_url: string;
  updated_at?: string;
  location?: { name?: string };
}
