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
 * Lever public postings API — per-company, no key required.
 * https://api.lever.co/v0/postings/{company}?mode=json
 */
@Injectable()
export class LeverProvider implements JobProvider {
  readonly source = JobSource.LEVER;
  private readonly logger = new Logger(LeverProvider.name);

  private readonly defaultCompanies = [
    'netflix', 'plaid', 'ramp', 'brex', 'mercury', 'faire', 'nubank', 'gitbook',
    'attentive', 'pilot', 'ashby', 'loom', 'clever', 'sardine', 'rippling',
    'metabase', 'census', 'vanta', 'welcometothejungle', 'swile', 'alan', 'qonto',
  ];

  private get companies(): string[] {
    const configured = (process.env.LEVER_COMPANIES ?? '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
    return configured.length ? configured : this.defaultCompanies;
  }

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const companies = query.boardTokens?.length ? query.boardTokens : this.companies;
    const keywords = (query.keywords ?? []).map((k) => k.toLowerCase()).filter(Boolean);

    const batches = await mapWithConcurrency(companies, 8, (company) =>
      this.fetchCompany(company, keywords),
    );
    return batches.flat();
  }

  private async fetchCompany(company: string, keywords: string[]): Promise<NormalizedJob[]> {
    const results: NormalizedJob[] = [];
    try {
      const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return results;
      const data = (await res.json()) as LeverJob[];
      for (const j of data) {
        const description = stripHtml(j.descriptionPlain ?? j.description ?? '');
        if (keywords.length) {
          const haystack = `${j.text} ${description}`.toLowerCase();
          if (!keywords.some((kw) => haystack.includes(kw))) continue;
        }
        results.push({
          source: this.source,
          sourceId: j.id,
          title: j.text,
          company,
          location: j.categories?.location,
          country: j.categories?.location,
          remote: /remote/i.test(j.categories?.location ?? '' + j.workplaceType),
          description,
          url: j.hostedUrl,
          applyUrl: j.applyUrl ?? j.hostedUrl,
          tags: j.categories?.team ? [j.categories.team] : [],
          postedAt: j.createdAt ? new Date(j.createdAt) : undefined,
        });
      }
    } catch (err) {
      this.logger.warn(`Lever company ${company} failed: ${(err as Error).message}`);
    }
    return results;
  }
}

interface LeverJob {
  id: string;
  text: string;
  description?: string;
  descriptionPlain?: string;
  hostedUrl: string;
  applyUrl?: string;
  workplaceType?: string;
  createdAt?: number;
  categories?: { location?: string; team?: string; commitment?: string };
}
