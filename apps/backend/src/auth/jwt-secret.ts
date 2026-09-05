export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && (!secret || secret === 'change-me-in-production' || secret.length < 32)) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }

  return secret ?? 'development-only-secret-change-before-production';
}
