import { ConflictException, Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    await this.verifyCaptcha(dto.captchaToken);
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName?.trim() || undefined,
        profile: { create: {} },
      },
    });
    return this.sign(user.id, user.email);
  }

  async login(dto: LoginDto) {
    await this.verifyCaptcha(dto.captchaToken);
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.sign(user.id, user.email);
  }

  private async verifyCaptcha(token?: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return;
    if (!token) throw new UnauthorizedException('Please complete the security check');
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: token }) });
    const result = (await response.json()) as { success?: boolean };
    if (!response.ok || !result.success) throw new UnauthorizedException('Security check failed. Please try again.');
  }

  googleUrl(): string {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) throw new ServiceUnavailableException('Google sign-in is not configured');
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', access_type: 'online', prompt: 'select_account' });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async googleCallback(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const webUrl = process.env.WEB_URL ?? 'http://localhost:3000';
    if (!clientId || !clientSecret || !redirectUri) throw new ServiceUnavailableException('Google sign-in is not configured');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }) });
    if (!tokenResponse.ok) throw new UnauthorizedException('Google sign-in could not be completed');
    const tokens = (await tokenResponse.json()) as { access_token?: string };
    if (!tokens.access_token) throw new UnauthorizedException('Google sign-in could not be completed');
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (!profileResponse.ok) throw new UnauthorizedException('Google profile could not be loaded');
    const profile = (await profileResponse.json()) as { email?: string; name?: string };
    if (!profile.email) throw new UnauthorizedException('Google did not provide an email address');
    const email = profile.email.trim().toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) user = await this.prisma.user.create({ data: { email, fullName: profile.name, provider: 'GOOGLE', emailVerified: true, profile: { create: {} } } });
    const result = this.sign(user.id, user.email);
    const query = new URLSearchParams({ token: result.accessToken, email: result.user.email });
    return `${webUrl}/login?${query.toString()}`;
  }

  private sign(sub: string, email: string) {
    const accessToken = this.jwt.sign({ sub, email });
    return { accessToken, user: { id: sub, email } };
  }
}
