import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { AuthThrottleGuard } from './auth-throttle.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UseGuards(AuthThrottleGuard)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @UseGuards(AuthThrottleGuard)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('google')
  google(@Res() response: Response) {
    return response.redirect(this.auth.googleUrl());
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string, @Res() response: Response) {
    return response.redirect(await this.auth.googleCallback(code));
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
