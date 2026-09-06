'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Eye, EyeOff, Sparkles, UserRound } from 'lucide-react';
import { api, apiUrl } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/i18n';
import { Turnstile } from '@/components/turnstile';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api<{ accessToken: string; user: { email: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, captchaToken: captchaToken || undefined }),
      });
      setAuth(res.accessToken, res.user.email);
      router.push('/dashboard');
    } catch (err) {
      const message = (err as Error).message;
      setError(message === 'Email already registered' ? t('errorEmailExists') : message === 'Google sign-in is not configured' ? t('googleUnavailable') : message.includes('security check') ? t('captchaFailed') : message || t('errorEmailExists'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[.85fr_1.15fr]">
      <section className="hidden bg-[var(--ink)] p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center justify-between"><Link href="/" className="brand-lockup text-white"><span className="brand-mark"><Sparkles size={16} /></span>aven</Link><LanguageSwitcher dark /></div><div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8fd0b2]">{t('startClarity')}</p><h2 className="display-type max-w-md text-5xl leading-tight">{t('nextMove')}</h2><p className="mt-5 max-w-sm leading-7 text-[#afc6bd]">{t('sideRegisterCopy')}</p></div><p className="text-sm text-[#78958a]">{t('footerLine')}</p></section>
      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-12 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--ink)] lg:hidden"><span className="brand-mark"><Sparkles size={15} /></span>aven</Link><LanguageSwitcher /></div>
      <div className="mb-8"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#e7f2eb] text-[var(--brand)]"><UserRound size={20} /></div><h1 className="display-type text-4xl">{t('registerTitle')}</h1><p className="mt-3 text-[var(--muted)]">{t('registerCopy')}</p></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="form-label">{t('fullName')}<input autoComplete="name" placeholder={t('fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="field mt-1.5 w-full px-4 py-3" /></label>
        <label className="form-label">{t('email')}<input type="email" autoComplete="email" placeholder={t('emailAddress')} value={email} onChange={(e) => setEmail(e.target.value)} required className="field mt-1.5 w-full px-4 py-3" /></label>
        <label className="form-label">{t('password')}<span className="password-field mt-1.5"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder={t('passwordHint')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="field w-full px-4 py-3 pr-12" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
        <Turnstile onToken={setCaptchaToken} />
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
        >
          {loading ? t('creating') : <>{t('createAccount')} <ArrowRight size={17} /></>}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />{t('or')}<span className="h-px flex-1 bg-[var(--line)]" /></div>
      <a href={`${apiUrl}/api/auth/google`} className="google-button"><span className="google-g">G</span>{t('google')}</a>
      <p className="mt-4 text-sm text-gray-600">
        {t('alreadyAccount')} <Link href="/login">{t('signIn')}</Link>
      </p></section>
    </main>
  );
}
