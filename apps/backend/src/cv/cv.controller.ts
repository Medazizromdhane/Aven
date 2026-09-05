import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@ApiTags('cv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cv')
export class CvController {
  constructor(private readonly cv: CvService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException('Only PDF or DOCX files are supported');
    }
    return this.cv.uploadAndParse(user.id, file);
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.cv.list(user.id);
  }

  @Get(':id/download')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.cv.download(user.id, id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName.replace(/"/g, '')}"`,
    );
    return new StreamableFile(file.buffer);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cv.get(user.id, id);
  }

  @Post(':id/primary')
  setPrimary(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cv.setPrimary(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cv.remove(user.id, id);
  }
}
