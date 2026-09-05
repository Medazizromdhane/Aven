import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * Adzuna API — free tier with app_id + app_key.
 * https://api.adzuna.com/v1/api/jobs/{country}/search/1
 */
@Injectable()
export class AdzunaProvider implements JobProvider {
  readonly source = JobSource.ADZUNA;
  private readonly logger = new Logger(AdzunaProvider.name);

  isEnabled(): boolean {
    return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    if (!this.isEnabled()) return [];
    const appId = process.env.ADZUNA_APP_ID as string;
    const appKey = process.env.ADZUNA_APP_KEY as string;
    const country = (query.countries[0] ?? 'gb').toLowerCase().slice(0, 2);
    const what = query.keywords.join(' ') || 'software developer';

    try {
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        what,
        results_per_page: String(query.limit ?? 50),
        content_type: 'application/json',
      });
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: AdzunaJob[] };
      return (data.results ?? []).map((j) => ({
        source: this.source,
        sourceId: String(j.id),
        title: j.title,
        company: j.company?.display_name ?? 'Unknown',
        location: j.location?.display_name,
        country: j.location?.area?.[0] ?? country.toUpperCase(),
        remote: /remote/i.test(j.title + (j.description ?? '')),
        description: stripHtml(j.description ?? ''),
        url: j.redirect_url,
        applyUrl: j.redirect_url,
        salaryMin: j.salary_min ? Math.round(j.salary_min) : undefined,
        salaryMax: j.salary_max ? Math.round(j.salary_max) : undefined,
        currency: 'USD',
        tags: j.category?.label ? [j.category.label] : [],
        postedAt: j.created ? new Date(j.created) : undefined,
      }));
    } catch (err) {
      this.logger.warn(`Adzuna fetch failed: ${(err as Error).message}`);
      return [];
    }
  }
}

interface AdzunaJob {
  id: string | number;
  title: string;
  description?: string;
  redirect_url: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  category?: { label?: string };
}
