'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api<{ accessToken: string; user: { email: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuth(res.accessToken, res.user.email);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[.85fr_1.15fr]">
      <section className="hidden bg-[var(--ink)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center justify-between"><Link href="/" className="brand-lockup text-white"><span className="brand-mark"><Sparkles size={16} /></span>aven</Link><LanguageSwitcher dark /></div>
        <div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8fd0b2]">Welcome back</p><h2 className="display-type max-w-md text-5xl leading-tight">Make your next move count.</h2><p className="mt-5 max-w-sm leading-7 text-[#afc6bd]">Your opportunities, profile, and application momentum in one calm place.</p></div>
        <p className="text-sm text-[#78958a]">A clearer path to global work.</p>
      </section>
      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-12 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--ink)] lg:hidden"><span className="brand-mark"><Sparkles size={15} /></span>aven</Link><LanguageSwitcher /></div>
      <div className="mb-8"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#e7f2eb] text-[var(--brand)]"><LockKeyhole size={20} /></div><h1 className="display-type text-4xl">{t('welcome')}</h1><p className="mt-3 text-[var(--muted)]">{t('welcomeCopy')}</p></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder={t('email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="field w-full px-4 py-3"
        />
        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="field w-full px-4 py-3"
        />
        {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
        >
          {loading ? t('signingIn') : <>{t('signIn')} <ArrowRight size={17} /></>}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        {t('noAccount')} <Link href="/register">{t('createAccount')}</Link>
      </p></section>
    </main>
  );
}
