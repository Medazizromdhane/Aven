import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * JSearch via RapidAPI — free plan available with RAPIDAPI_KEY.
 * https://jsearch.p.rapidapi.com/search
 */
@Injectable()
export class JSearchProvider implements JobProvider {
  readonly source = JobSource.JSEARCH;
  private readonly logger = new Logger(JSearchProvider.name);

  isEnabled(): boolean {
    return Boolean(process.env.RAPIDAPI_KEY);
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    if (!this.isEnabled()) return [];
    const key = process.env.RAPIDAPI_KEY as string;
    const q = `${query.keywords.join(' ') || 'software engineer'} ${query.countries[0] ?? ''}`.trim();

    try {
      const params = new URLSearchParams({ query: q, page: '1', num_pages: '1' });
      const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { data?: JSearchJob[] };
      return (data.data ?? []).map((j) => ({
        source: this.source,
        sourceId: j.job_id,
        title: j.job_title,
        company: j.employer_name ?? 'Unknown',
        location: [j.job_city, j.job_country].filter(Boolean).join(', '),
        country: j.job_country,
        remote: Boolean(j.job_is_remote),
        description: stripHtml(j.job_description ?? ''),
        url: j.job_apply_link ?? j.job_google_link ?? '',
        applyUrl: j.job_apply_link,
        salaryMin: j.job_min_salary ? Math.round(j.job_min_salary) : undefined,
        salaryMax: j.job_max_salary ? Math.round(j.job_max_salary) : undefined,
        currency: j.job_salary_currency ?? 'USD',
        tags: j.job_required_skills ?? [],
        postedAt: j.job_posted_at_datetime_utc ? new Date(j.job_posted_at_datetime_utc) : undefined,
      }));
    } catch (err) {
      this.logger.warn(`JSearch fetch failed: ${(err as Error).message}`);
      return [];
    }
  }
}

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name?: string;
  job_city?: string;
  job_country?: string;
  job_is_remote?: boolean;
  job_description?: string;
  job_apply_link?: string;
  job_google_link?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_required_skills?: string[];
  job_posted_at_datetime_utc?: string;
}
