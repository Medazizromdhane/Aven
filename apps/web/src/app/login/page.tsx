'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuth((s) => s.setAuth);
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
        <Link href="/" className="brand-lockup text-white"><span className="brand-mark"><Sparkles size={16} /></span>aven</Link>
        <div><p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8fd0b2]">Welcome back</p><h2 className="display-type max-w-md text-5xl leading-tight">Make your next move count.</h2><p className="mt-5 max-w-sm leading-7 text-[#afc6bd]">Your opportunities, profile, and application momentum in one calm place.</p></div>
        <p className="text-sm text-[#78958a]">A clearer path to global work.</p>
      </section>
      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-12 flex items-center gap-2 font-serif text-xl font-bold text-[var(--ink)] lg:hidden"><span className="brand-mark"><Sparkles size={15} /></span>aven</Link>
      <div className="mb-8"><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#e7f2eb] text-[var(--brand)]"><LockKeyhole size={20} /></div><h1 className="display-type text-4xl">Welcome back.</h1><p className="mt-3 text-[var(--muted)]">Pick up where your next move begins.</p></div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="field w-full px-4 py-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="field w-full px-4 py-3"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : <>Sign in <ArrowRight size={17} /></>}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account? <Link href="/register">Create one</Link>
      </p></section>
    </main>
  );
}
