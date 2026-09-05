import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applications.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query('status') status?: ApplicationStatus) {
    return this.applications.list(user.id, status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applications.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.applications.remove(user.id, id);
  }
}
