'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { api, apiUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/i18n';
import { Turnstile } from '@/components/turnstile';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const googleEmail = params.get('email');
    if (token && googleEmail) {
      setAuth(token, googleEmail);
      router.replace('/dashboard');
    }
  }, [router, setAuth]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api<{ accessToken: string; user: { email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, captchaToken: captchaToken || undefined }),
      });
      setAuth(res.accessToken, res.user.email);
      router.push('/dashboard');
    } catch (err) {
      const message = (err as Error).message;
      setError(message === 'Invalid credentials' ? t('wrongCredentials') : message === 'Google sign-in is not configured' ? t('googleUnavailable') : message.includes('security check') ? t('captchaFailed') : message || t('wrongCredentials'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[.85fr_1.15fr]">
      <section className="hidden bg-[var(--ink)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center justify-between"><Link href="/" className="brand-lockup text-white"><span className="brand-mark"><span className="brand-letter">A</span></span>aven</Link><LanguageSwitcher dark /></div>
        <div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#b7a6ff]">{t('welcome')}</p><h2 className="display-type max-w-md text-5xl leading-tight">{t('sideLoginTitle')}</h2><p className="mt-5 max-w-sm leading-7 text-[#c4c0dc]">{t('sideLoginCopy')}</p></div>
        <p className="text-sm text-[#8f8bb0]">{t('footerLine')}</p>
      </section>
      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-12 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--ink)] lg:hidden"><span className="brand-mark"><span className="brand-letter">A</span></span>aven</Link><LanguageSwitcher /></div>
      <div className="mb-8"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><LockKeyhole size={20} /></div><h1 className="display-type text-4xl">{t('welcome')}</h1><p className="mt-3 text-[var(--muted)]">{t('welcomeCopy')}</p></div>
      <a href={`${apiUrl}/api/auth/google`} className="google-button w-full"><span className="google-g">G</span>{t('continueGoogle')}</a>
      <div className="my-5 flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />{t('orEmail')}<span className="h-px flex-1 bg-[var(--line)]" /></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="form-label">{t('email')}<input type="email" autoComplete="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} required className="field mt-1.5 w-full px-4 py-3" /></label>
        <label className="form-label">{t('password')}<span className="password-field mt-1.5"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} required className="field w-full px-4 py-3 pr-12" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <Turnstile onToken={setCaptchaToken} />
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
        >
          {loading ? t('signingIn') : <>{t('signIn')} <ArrowRight size={17} /></>}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--muted)]">
        {t('noAccount')} <Link href="/register">{t('createAccount')}</Link>
      </p></section>
    </main>
  );
}
