import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * The Muse API — free, optional API key for higher limits.
 * https://www.themuse.com/api/public/jobs
 */
@Injectable()
export class TheMuseProvider implements JobProvider {
  readonly source = JobSource.THEMUSE;
  private readonly logger = new Logger(TheMuseProvider.name);

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const key = process.env.THEMUSE_API_KEY;
    const pages = 2;
    const results: NormalizedJob[] = [];
    for (let page = 0; page < pages; page++) {
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (key) params.set('api_key', key);
        const url = `https://www.themuse.com/api/public/jobs?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) break;
        const data = (await res.json()) as { results?: MuseJob[] };
        for (const j of data.results ?? []) {
          const loc = j.locations?.[0]?.name;
          results.push({
            source: this.source,
            sourceId: String(j.id),
            title: j.name,
            company: j.company?.name ?? 'Unknown',
            location: loc,
            country: loc,
            remote: /remote|flexible/i.test(loc ?? ''),
            description: stripHtml(j.contents ?? ''),
            url: j.refs?.landing_page ?? '',
            applyUrl: j.refs?.landing_page,
            tags: (j.categories ?? []).map((c) => c.name),
            postedAt: j.publication_date ? new Date(j.publication_date) : undefined,
          });
        }
      } catch (err) {
        this.logger.warn(`TheMuse fetch failed: ${(err as Error).message}`);
        break;
      }
    }
    return results;
  }
}

interface MuseJob {
  id: number;
  name: string;
  contents?: string;
  publication_date?: string;
  company?: { name?: string };
  locations?: { name?: string }[];
  categories?: { name: string }[];
  refs?: { landing_page?: string };
}
