import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * Lever public postings API — per-company, no key required.
 * https://api.lever.co/v0/postings/{company}?mode=json
 */
@Injectable()
export class LeverProvider implements JobProvider {
  readonly source = JobSource.LEVER;
  private readonly logger = new Logger(LeverProvider.name);

  private readonly defaultCompanies = ['netflix', 'plaid', 'ramp', 'brex'];

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const companies = query.boardTokens?.length ? query.boardTokens : this.defaultCompanies;
    const results: NormalizedJob[] = [];

    for (const company of companies) {
      try {
        const url = `https://api.lever.co/v0/postings/${company}?mode=json`;
        const res = await fetch(url);
        if (!res.ok) {
          continue;
        }
        const data = (await res.json()) as LeverJob[];
        for (const j of data) {
          results.push({
            source: this.source,
            sourceId: j.id,
            title: j.text,
            company,
            location: j.categories?.location,
            country: j.categories?.location,
            remote: /remote/i.test(j.categories?.location ?? '' + j.workplaceType),
            description: stripHtml(j.descriptionPlain ?? j.description ?? ''),
            url: j.hostedUrl,
            applyUrl: j.applyUrl ?? j.hostedUrl,
            tags: j.categories?.team ? [j.categories.team] : [],
            postedAt: j.createdAt ? new Date(j.createdAt) : undefined,
          });
        }
      } catch (err) {
        this.logger.warn(`Lever company ${company} failed: ${(err as Error).message}`);
      }
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
