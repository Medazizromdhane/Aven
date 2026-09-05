import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { jwtSecret } from './jwt-secret';
import { AuthThrottleGuard } from './auth-throttle.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthThrottleGuard, OptionalJwtAuthGuard],
  exports: [AuthService, OptionalJwtAuthGuard],
})
export class AuthModule {}
