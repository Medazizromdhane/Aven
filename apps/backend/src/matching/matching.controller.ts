import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@ApiTags('matching')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matching: MatchingService) {}

  @Post('recompute')
  recompute(@CurrentUser() user: AuthUser) {
    return this.matching.recomputeForUser(user.id);
  }

  @Get('top')
  top(
    @CurrentUser() user: AuthUser,
    @Query('take') take?: string,
    @Query('minScore') minScore?: string,
  ) {
    return this.matching.topMatches(
      user.id,
      take ? Number(take) : 20,
      minScore ? Number(minScore) : 0,
    );
  }
}
