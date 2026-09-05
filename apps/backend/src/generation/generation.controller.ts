import { Body, Controller, Get, Param, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { GenerationService } from './generation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

class GenerateDto {
  @IsString()
  jobId!: string;
}

@ApiTags('generation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('generation')
export class GenerationController {
  constructor(private readonly generation: GenerationService) {}

  @Post('resume')
  resume(@CurrentUser() user: AuthUser, @Body() dto: GenerateDto) {
    return this.generation.generateResume(user.id, dto.jobId);
  }

  @Post('cover-letter')
  coverLetter(@CurrentUser() user: AuthUser, @Body() dto: GenerateDto) {
    return this.generation.generateCoverLetter(user.id, dto.jobId);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.generation.list(user.id);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.generation.download(user.id, id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return new StreamableFile(file.buffer);
  }
}
