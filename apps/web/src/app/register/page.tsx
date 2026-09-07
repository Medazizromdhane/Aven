'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Eye, EyeOff, FileText, Globe2, LockKeyhole, Mail, Target, UserRound } from 'lucide-react';
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
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!termsAccepted) { setError(t('termsRequired')); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api<{ accessToken: string; user: { email: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, captchaToken: captchaToken || undefined, termsAccepted }),
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
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="auth-aurora" />
        <div className="auth-grid-overlay" />
        <div className="flex items-center justify-between">
          <Link href="/" className="landing-brand"><span className="landing-brand-mark" />aven</Link>
          <LanguageSwitcher dark />
        </div>
        <div>
          <p className="auth-eyebrow"><Target size={13} /> {t('startClarity')}</p>
          <h2 className="auth-headline mt-4">{t('nextMove')}</h2>
          <p className="auth-sub">{t('sideRegisterCopy')}</p>
          <div className="auth-float-stack">
            <div className="auth-float-card">
              <span className="auth-float-icon"><Globe2 size={18} /></span>
              <div><strong>Offres internationales</strong><span>30+ sources agrégées</span></div>
              <span className="auth-float-badge">Live</span>
            </div>
            <div className="auth-float-card">
              <span className="auth-float-icon"><Target size={18} /></span>
              <div><strong>Score de compatibilité</strong><span>Basé sur votre CV</span></div>
              <span className="auth-float-badge">IA</span>
            </div>
            <div className="auth-float-card">
              <span className="auth-float-icon"><FileText size={18} /></span>
              <div><strong>CV adapté par poste</strong><span>Généré en 1 clic</span></div>
              <span className="auth-float-badge">PDF</span>
            </div>
          </div>
        </div>
        <div className="auth-trust">
          <div><div className="figure">30+</div><div className="label">Sources d’offres</div></div>
          <div><div className="figure">1‑clic</div><div className="label">CV sur mesure</div></div>
          <div><div className="figure">Visa</div><div className="label">Parrainage détecté</div></div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="brand-lockup"><span className="brand-mark"><span className="brand-letter">A</span></span>aven</Link>
            <LanguageSwitcher />
          </div>
          <div className="mb-6 hidden justify-end lg:flex"><LanguageSwitcher /></div>
          <div className="mb-7">
            <div className="auth-badge-icon mb-4"><UserRound size={20} /></div>
            <h1 className="display-type text-4xl">{t('registerTitle')}</h1>
            <p className="mt-3 text-[var(--muted)]">{t('registerCopy')}</p>
          </div>
          <a href={`${apiUrl}/api/auth/google`} className="google-button w-full"><span className="google-g">G</span>{t('continueGoogle')}</a>
          <div className="my-5 flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--line)]" />{t('orEmail')}<span className="h-px flex-1 bg-[var(--line)]" /></div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <span className="form-label">{t('fullName')}</span>
              <div className="auth-field mt-1.5">
                <UserRound size={17} className="auth-field-icon" />
                <input autoComplete="name" placeholder={t('fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            </div>
            <div>
              <span className="form-label">{t('email')}</span>
              <div className="auth-field mt-1.5">
                <Mail size={17} className="auth-field-icon" />
                <input type="email" autoComplete="email" placeholder={t('emailAddress')} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <span className="form-label">{t('password')}</span>
              <div className="auth-field mt-1.5">
                <LockKeyhole size={17} className="auth-field-icon" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder={t('passwordHint')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={{ paddingRight: '2.6rem' }} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
            </div>
            <Turnstile onToken={setCaptchaToken} />
            <label className="consent-check"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required /><span>{t('termsAccept')} <Link href="/terms">({t('terms')})</Link></span></label>
            {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={16} /><span>{error}</span></div>}
            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? t('creating') : <>{t('createAccount')} <ArrowRight size={17} /></>}
            </button>
          </form>
          <p className="mt-6 text-sm text-[var(--muted)]">
            {t('alreadyAccount')} <Link href="/login">{t('signIn')}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
