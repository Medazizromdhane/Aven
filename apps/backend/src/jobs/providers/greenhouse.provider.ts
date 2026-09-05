import { Injectable, Logger } from '@nestjs/common';
import { JobSource } from '@prisma/client';
import { JobProvider, JobQuery, NormalizedJob, stripHtml } from './provider.interface';

/**
 * Greenhouse public job board API — per-company, no key required.
 * https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
 */
@Injectable()
export class GreenhouseProvider implements JobProvider {
  readonly source = JobSource.GREENHOUSE;
  private readonly logger = new Logger(GreenhouseProvider.name);

  // Sensible defaults: well-known boards that frequently sponsor visas.
  private readonly defaultBoards = ['stripe', 'gitlab', 'databricks', 'airbnb', 'coinbase'];

  isEnabled(): boolean {
    return true;
  }

  async fetch(query: JobQuery): Promise<NormalizedJob[]> {
    const boards = query.boardTokens?.length ? query.boardTokens : this.defaultBoards;
    const results: NormalizedJob[] = [];

    for (const token of boards) {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`;
        const res = await fetch(url);
        if (!res.ok) {
          continue;
        }
        const data = (await res.json()) as { jobs?: GreenhouseJob[] };
        for (const j of data.jobs ?? []) {
          results.push({
            source: this.source,
            sourceId: `${token}-${j.id}`,
            title: j.title,
            company: token,
            location: j.location?.name,
            country: j.location?.name,
            remote: /remote/i.test(j.location?.name ?? ''),
            description: stripHtml(j.content ?? ''),
            url: j.absolute_url,
            applyUrl: j.absolute_url,
            tags: [],
            postedAt: j.updated_at ? new Date(j.updated_at) : undefined,
          });
        }
      } catch (err) {
        this.logger.warn(`Greenhouse board ${token} failed: ${(err as Error).message}`);
      }
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
