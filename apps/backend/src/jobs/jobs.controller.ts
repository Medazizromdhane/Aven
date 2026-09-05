import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobFilterDto, TriggerSearchDto } from './dto/job-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  /**
   * Public listing. If a bearer token is present, match scores are included,
   * but auth is not required to browse.
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@Query() filter: JobFilterDto, @Req() req: { user?: { id: string } }) {
    return this.jobs.list(filter, req.user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  get(@Param('id') id: string, @Req() req: { user?: { id: string } }) {
    return this.jobs.get(id, req.user?.id);
  }

  @Post('search')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  triggerSearch(@Body() dto: TriggerSearchDto) {
    return this.jobs.aggregate({
      keywords: dto.keywords ?? ['software engineer'],
      countries: dto.countries ?? [],
      boardTokens: dto.boardTokens,
      limit: 50,
    });
  }

  @Post('internal/daily-hunt')
  @HttpCode(200)
  triggerDailyHunt(@Headers('x-cron-secret') secret?: string) {
    const expectedSecret = process.env.JOBS_CRON_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return this.jobs.dailyHunt();
  }
}
