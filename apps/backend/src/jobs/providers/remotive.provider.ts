import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * Remotive public API — remote jobs, no key required.
 * https://remotive.com/api/remote-jobs
 */
@Injectable()
export class RemotiveProvider implements JobProvider {
  readonly source = JobSource.REMOTIVE;
  private readonly logger = new Logger(RemotiveProvider.name);

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const search = query.keywords.join(' ') || 'software';
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=${query.limit ?? 50}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return [];
      }
      const data = (await res.json()) as { jobs?: RemotiveJob[] };
      return (data.jobs ?? []).map((j) => ({
        source: this.source,
        sourceId: String(j.id),
        title: j.title,
        company: j.company_name,
        location: j.candidate_required_location,
        country: j.candidate_required_location,
        remote: true,
        description: stripHtml(j.description),
        url: j.url,
        applyUrl: j.url,
        tags: j.tags ?? [],
        currency: 'USD',
        postedAt: j.publication_date ? new Date(j.publication_date) : undefined,
      }));
    } catch (err) {
      this.logger.warn(`Remotive fetch failed: ${(err as Error).message}`);
      return [];
    }
  }
}

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location: string;
  description: string;
  url: string;
  tags?: string[];
  publication_date?: string;
}
