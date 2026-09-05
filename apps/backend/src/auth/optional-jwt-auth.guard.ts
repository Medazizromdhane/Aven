import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_: unknown, user: TUser | false | null): TUser | undefined {
    return user || undefined;
  }
}
