import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

interface AttemptWindow {
  count: number;
  expiresAt: number;
}

@Injectable()
export class AuthThrottleGuard implements CanActivate {
  private readonly attempts = new Map<string, AttemptWindow>();
  private readonly limit = 10;
  private readonly windowMs = 15 * 60 * 1000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      body?: { email?: string };
    }>();
    const email = request.body?.email?.trim().toLowerCase() ?? 'unknown';
    const key = `${request.ip ?? 'unknown'}:${email}`;
    const now = Date.now();
    const current = this.attempts.get(key);

    if (!current || current.expiresAt <= now) {
      this.attempts.set(key, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (current.count >= this.limit) {
      throw new HttpException(
        'Too many authentication attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    return true;
  }
}
