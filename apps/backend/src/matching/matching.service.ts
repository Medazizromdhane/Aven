import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingEngine } from './matching.engine';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: MatchingEngine,
  ) {}

  /**
   * (Re)compute match scores for a user against all stored jobs (or a subset).
   */
  async recomputeForUser(userId: string, limit = 200) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Complete your profile first');
    }

    const jobs = await this.prisma.job.findMany({
      orderBy: { postedAt: 'desc' },
      take: limit,
    });

    let count = 0;
    for (const job of jobs) {
      const result = this.engine.score(profile, job);
      await this.prisma.jobMatch.upsert({
        where: { userId_jobId: { userId, jobId: job.id } },
        create: {
          userId,
          jobId: job.id,
          score: result.score,
          breakdown: result.breakdown as unknown as object,
          reasons: result.reasons,
        },
        update: {
          score: result.score,
          breakdown: result.breakdown as unknown as object,
          reasons: result.reasons,
        },
      });
      count++;
    }
    this.logger.log(`Computed ${count} matches for user ${userId}`);
    return { computed: count };
  }

  /**
   * Top recommended matches for a user.
   */
  topMatches(userId: string, take = 20, minScore = 0) {
    return this.prisma.jobMatch.findMany({
      where: { userId, score: { gte: minScore } },
      orderBy: { score: 'desc' },
      take,
      include: { job: true, application: true },
    });
  }

  async getMatch(userId: string, jobId: string) {
    const match = await this.prisma.jobMatch.findUnique({
      where: { userId_jobId: { userId, jobId } },
      include: { job: true },
    });
    if (!match) {
      throw new NotFoundException('Match not found — recompute matches first');
    }
    return match;
  }
}
