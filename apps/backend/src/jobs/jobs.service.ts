import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VisaAnalysisService } from './visa-analysis.service';
import { JobProvider, JobQuery, NormalizedJob } from './providers/provider.interface';
import { JOB_PROVIDERS } from './jobs.providers';
import { JobFilterDto } from './dto/job-filter.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly visa: VisaAnalysisService,
    @Inject(JOB_PROVIDERS) private readonly providers: JobProvider[],
  ) {}

  /**
   * Run all enabled providers, analyze visa sponsorship, and upsert jobs.
   * Returns the number of jobs created/updated.
   */
  async aggregate(query: JobQuery): Promise<{ fetched: number; saved: number }> {
    const enabled = this.providers.filter((p) => p.isEnabled());
    this.logger.log(`Aggregating jobs from ${enabled.length} providers`);

    const batches = await Promise.all(
      enabled.map((p) =>
        p.fetch(query).catch((err) => {
          this.logger.warn(`${p.source} failed: ${(err as Error).message}`);
          return [] as NormalizedJob[];
        }),
      ),
    );

    const jobs = batches.flat();
    let saved = 0;

    for (const job of jobs) {
      if (!job.url || !job.title) continue;
      const analysis = this.visa.keywordAnalysis(`${job.title} ${job.description}`);

      const data: Prisma.JobCreateInput = {
        source: job.source,
        sourceId: job.sourceId,
        title: job.title,
        company: job.company,
        location: job.location,
        country: job.country,
        remote: job.remote,
        description: job.description,
        url: job.url,
        applyUrl: job.applyUrl,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        currency: job.currency,
        tags: job.tags,
        hasVisaSponsorship: analysis.hasVisaSponsorship,
        visaConfidence: analysis.confidence,
        visaKeywords: analysis.keywords,
        relocationSupport: analysis.relocationSupport,
        postedAt: job.postedAt,
      };

      try {
        await this.prisma.job.upsert({
          where: { source_sourceId: { source: job.source, sourceId: job.sourceId } },
          create: data,
          update: {
            title: data.title,
            description: data.description,
            hasVisaSponsorship: data.hasVisaSponsorship,
            visaConfidence: data.visaConfidence,
            visaKeywords: data.visaKeywords,
            relocationSupport: data.relocationSupport,
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
          },
        });
        saved++;
      } catch (err) {
        this.logger.warn(`Upsert failed for ${job.source}:${job.sourceId}`);
      }
    }

    this.logger.log(`Fetched ${jobs.length}, saved ${saved}`);
    return { fetched: jobs.length, saved };
  }

  /**
   * List jobs with filters. When userId is provided, join match scores.
   */
  async list(filter: JobFilterDto, userId?: string) {
    const where: Prisma.JobWhereInput = {};
    if (filter.country) where.country = { contains: filter.country, mode: 'insensitive' };
    if (filter.remote !== undefined) where.remote = filter.remote;
    if (filter.visaOnly) where.hasVisaSponsorship = true;
    if (filter.salaryMin) where.salaryMax = { gte: filter.salaryMin };
    if (filter.tech) {
      where.OR = [
        { title: { contains: filter.tech, mode: 'insensitive' } },
        { description: { contains: filter.tech, mode: 'insensitive' } },
        { tags: { has: filter.tech } },
      ];
    }

    const take = Math.min(filter.take ?? 30, 100);
    const skip = filter.skip ?? 0;

    const jobs = await this.prisma.job.findMany({
      where,
      orderBy: [{ hasVisaSponsorship: 'desc' }, { postedAt: 'desc' }],
      take,
      skip,
      include: userId
        ? { matches: { where: { userId }, select: { score: true, reasons: true } } }
        : undefined,
    });

    let mapped = jobs.map((j) => ({
      ...j,
      matchScore: userId ? (j as { matches?: { score: number }[] }).matches?.[0]?.score ?? null : null,
      matchReasons: userId
        ? (j as { matches?: { reasons: string[] }[] }).matches?.[0]?.reasons ?? []
        : [],
    }));

    if (userId && filter.minScore) {
      mapped = mapped.filter((j) => (j.matchScore ?? 0) >= filter.minScore!);
    }

    return mapped;
  }

  async get(id: string, userId?: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job || !userId) return job;

    const match = await this.prisma.jobMatch.findUnique({
      where: { userId_jobId: { userId, jobId: id } },
      include: { application: true },
    });
    return { ...job, match };
  }

  count() {
    return this.prisma.job.count();
  }

  async dailyHunt() {
    const profiles = await this.prisma.profile.findMany({
      select: { targetCountries: true, favoriteTech: true, skills: true },
    });

    const countries = new Set<string>();
    const keywords = new Set<string>();
    for (const profile of profiles) {
      profile.targetCountries.forEach((country) => countries.add(country));
      profile.favoriteTech.forEach((technology) => keywords.add(technology));
      profile.skills.slice(0, 3).forEach((skill) => keywords.add(skill));
    }

    if (keywords.size === 0) keywords.add('software engineer');

    return this.aggregate({
      keywords: Array.from(keywords).slice(0, 8),
      countries: Array.from(countries),
      limit: 50,
    });
  }
}
