'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, downloadApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';
import { FileText, FolderOpen, Settings2, UserRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

type Profile = {
  fullName?: string;
  email: string;
  profile?: {
    phone?: string;
    country?: string;
    city?: string;
    headline?: string;
    skills: string[];
    targetCountries: string[];
    favoriteTech: string[];
    needsVisaSponsor: boolean;
    willingToRelocate: boolean;
  };
};

type Cv = { id: string; fileName: string; isPrimary: boolean };
type Job = { id: string; title: string; company: string };
type Application = {
  id: string;
  status: string;
  notes?: string;
  match: { job: Job };
};
type Document = { id: string; type: string; content: string; jobId: string };

const statuses = ['SAVED', 'APPLIED', 'PENDING', 'INTERVIEW', 'OFFER', 'REJECTED'];

export default function WorkspacePage() {
  const { token, hydrate } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cvs, setCvs] = useState<Cv[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api<Profile>('/users/me/profile'),
      api<Cv[]>('/cv'),
      api<Application[]>('/applications'),
      api<Document[]>('/generation'),
      api<Job[]>('/jobs?take=100'),
    ])
      .then(([profileResult, cvResult, applicationResult, documentResult, jobResult]) => {
        setProfile(profileResult);
        setCvs(cvResult);
        setApplications(applicationResult);
        setDocuments(documentResult);
        setJobs(jobResult);
        setSelectedJob(jobResult[0]?.id ?? '');
      })
      .catch((err) => setMessage((err as Error).message));
  }, [token]);

  if (!token) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20">
        <p>{t('signInRequired')}</p>
        <Link className="mt-4 inline-block font-semibold" href="/login">{t('signIn')}</Link>
      </main>
    );
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api<Profile>('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: String(form.get('fullName') ?? ''),
          headline: String(form.get('headline') ?? ''),
          country: String(form.get('country') ?? ''),
          city: String(form.get('city') ?? ''),
          phone: String(form.get('phone') ?? ''),
          skills: splitList(form.get('skills')),
          favoriteTech: splitList(form.get('favoriteTech')),
          targetCountries: splitList(form.get('targetCountries')),
          needsVisaSponsor: form.get('needsVisaSponsor') === 'on',
          willingToRelocate: form.get('willingToRelocate') === 'on',
        }),
      });
      setProfile(updated);
      setMessage(t('profileSaved'));
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get('file')) return;
    setBusy(true);
    try {
      const uploaded = await api<Cv>('/cv/upload', { method: 'POST', body: form });
      setCvs((current) => [uploaded, ...current]);
      setMessage(t('cvUploaded'));
      event.currentTarget.reset();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadFile(path: string, name: string) {
    try {
      const blob = await downloadApi(path);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function updateApplication(id: string, status: string) {
    try {
      const updated = await api<Application>(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setApplications((current) => current.map((item) => item.id === id ? { ...item, ...updated } : item));
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function generate(type: 'resume' | 'cover-letter') {
    if (!selectedJob) return;
    setBusy(true);
    try {
      const created = await api<Document>(`/generation/${type}`, {
        method: 'POST',
        body: JSON.stringify({ jobId: selectedJob }),
      });
      setDocuments((current) => [created, ...current]);
      await downloadFile(`/generation/${created.id}/download`, type === 'resume' ? 'tailored-resume.pdf' : 'cover-letter.pdf');
      setMessage(`${type === 'resume' ? t('generateResume') : t('generateCover')} ${t('generated')}`);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const userProfile = profile?.profile;
  const initials = (profile?.fullName ?? profile?.email ?? 'A').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const completenessChecks = [
    Boolean(profile?.fullName),
    Boolean(userProfile?.headline),
    Boolean(userProfile?.country),
    Boolean(userProfile?.city),
    Boolean(userProfile?.phone),
    Boolean(userProfile?.skills?.length),
    Boolean(userProfile?.favoriteTech?.length),
    Boolean(userProfile?.targetCountries?.length),
  ];
  const completeness = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);
  return (
    <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-6"><p className="eyebrow">{t('yourToolkit')}</p><h1 className="display-type mt-2 text-4xl">{t('makeMoveReady')}</h1><p className="mt-2 text-[var(--muted)]">{t('toolkitCopy')}</p></header>
      {message && <p className="mb-6 rounded-lg border border-[var(--line)] bg-[var(--brand-soft)] p-3 text-sm font-medium text-[var(--brand-dark)]">{message}</p>}

      <section className="profile-banner mb-6 p-6 sm:p-7">
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="profile-avatar">{initials}</div>
          <div className="min-w-0">
            <span className="eyebrow">Aven profile</span>
            <h2 className="display-type mt-0.5 text-2xl">{profile?.fullName || t('profile')}</h2>
            <p className="text-sm text-[var(--muted)]">{profile?.email}</p>
          </div>
          {profile && <span className="status-dot ml-auto">Actif</span>}
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniStat value={cvs.length} label={t('labelCvs')} />
          <MiniStat value={userProfile?.skills?.length ?? 0} label={t('labelSkills')} />
          <MiniStat value={userProfile?.targetCountries?.length ?? 0} label={t('labelTargets')} />
          <MiniStat value={applications.length} label={t('labelSaved')} />
        </div>
        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold"><span className="text-[var(--muted)]">{t('profileStrength')}</span><span className="text-[var(--brand)]">{completeness}%</span></div>
          <div className="progress-track"><div className="progress-value" style={{ width: `${completeness}%` }} /></div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <section className="surface p-6">
          <div className="section-heading"><div className="flex items-center gap-2"><span className="section-icon"><UserRound size={17} /></span><h2>{t('profile')}</h2></div></div>
          <p className="mb-4 -mt-1 text-sm text-[var(--muted)]">{t('profileCopy')}</p>
          <form key={profile ? JSON.stringify(userProfile) : 'profile-loading'} onSubmit={saveProfile} className="grid gap-3">
            <input name="fullName" defaultValue={profile?.fullName ?? ''} placeholder={t('fullName')} className="field" />
            <input name="headline" defaultValue={userProfile?.headline ?? ''} placeholder={t('headline')} className="field" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="country" defaultValue={userProfile?.country ?? ''} placeholder={t('country')} className="field" />
              <input name="city" defaultValue={userProfile?.city ?? ''} placeholder={t('city')} className="field" />
            </div>
            <input name="phone" defaultValue={userProfile?.phone ?? ''} placeholder={t('phone')} className="field" />
            <input name="skills" defaultValue={userProfile?.skills?.join(', ') ?? ''} placeholder={t('skillsHint')} className="field" />
            <input name="favoriteTech" defaultValue={userProfile?.favoriteTech?.join(', ') ?? ''} placeholder={t('technologies')} className="field" />
            <input name="targetCountries" defaultValue={userProfile?.targetCountries?.join(', ') ?? ''} placeholder={t('countries')} className="field" />
            <div className="grid gap-2 rounded-xl bg-[var(--paper)] p-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm"><input name="needsVisaSponsor" type="checkbox" defaultChecked={userProfile?.needsVisaSponsor ?? true} /> <span>{t('needVisa')}</span></label>
              <label className="flex items-center gap-2 text-sm"><input name="willingToRelocate" type="checkbox" defaultChecked={userProfile?.willingToRelocate ?? true} /> <span>{t('relocate')}</span></label>
            </div>
            <button disabled={busy} className="mt-1 rounded-lg bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">{t('saveProfile')}</button>
          </form>
        </section>

        <section className="surface p-6">
          <div className="section-heading"><div className="flex items-center gap-2"><span className="section-icon"><FolderOpen size={17} /></span><h2>{t('cvLibrary')}</h2></div>{cvs.length > 0 && <span className="chip">{cvs.length}</span>}</div>
          <p className="mb-4 -mt-1 text-sm text-[var(--muted)]">{t('cvCopy')}</p>
          <form onSubmit={uploadCv} className="flex flex-wrap gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--paper)] p-3">
            <input name="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required className="min-w-0 flex-1 text-sm" />
            <button disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">{t('uploadParse')}</button>
          </form>
          <div className="mt-4 space-y-3">
            {cvs.map((cv) => <div key={cv.id} className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-sm">
              <span className="flex items-center gap-2"><FileText size={15} className="text-[var(--brand)]" /> {cv.fileName} {cv.isPrimary && <span className="chip">{t('primary')}</span>}</span>
              <button onClick={() => downloadFile(`/cv/${cv.id}/download`, cv.fileName)} className="font-semibold text-[var(--brand)]">{t('download')}</button>
            </div>)}
            {cvs.length === 0 && <p className="text-sm text-[var(--muted)]">{t('uploadHint')}</p>}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <div className="section-heading"><div className="flex items-center gap-2"><span className="section-icon"><Settings2 size={17} /></span><h2>{t('applications')}</h2></div>{applications.length > 0 && <span className="chip">{applications.length}</span>}</div>
          <p className="mb-4 -mt-1 text-sm text-[var(--muted)]">{t('applicationsCopy')}</p>
          <div className="space-y-3">
            {applications.map((application) => <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div><strong>{application.match.job.title}</strong><p className="text-sm text-[var(--muted)]">{application.match.job.company}</p></div>
              <select value={application.status} onChange={(event) => updateApplication(application.id, event.target.value)} className="field w-auto">
                {statuses.map((status) => <option key={status} value={status}>{t(status.toLowerCase())}</option>)}
              </select>
            </div>)}
            {applications.length === 0 && <p className="text-sm text-[var(--muted)]">{t('noApplications')}</p>}
          </div>
        </section>

        <section className="surface p-6">
          <div className="section-heading"><div className="flex items-center gap-2"><span className="section-icon"><FileText size={17} /></span><h2>{t('documents')}</h2></div>{documents.length > 0 && <span className="chip">{documents.length}</span>}</div>
          <p className="mb-4 -mt-1 text-sm text-[var(--muted)]">{t('documentsCopy')}</p>
          <select value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)} className="field mb-3 w-full">
            <option value="">{t('chooseJob')}</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.company}</option>)}
          </select>
          <div className="flex flex-wrap gap-3">
            <button disabled={busy || !selectedJob} onClick={() => generate('resume')} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">{t('generateResume')}</button>
            <button disabled={busy || !selectedJob} onClick={() => generate('cover-letter')} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60">{t('generateCover')}</button>
          </div>
          <div className="mt-5 space-y-3">
            {documents.map((document) => <div key={document.id} className="flex items-center justify-between border-b border-[var(--line)] pb-3 text-sm">
              <span className="flex items-center gap-2"><FileText size={15} className="text-[var(--brand)]" /> {document.type === 'RESUME' ? t('generateResume') : t('generateCover')}</span>
              <button onClick={() => downloadFile(`/generation/${document.id}/download`, document.type === 'RESUME' ? 'tailored-resume.pdf' : 'cover-letter.pdf')} className="font-semibold text-[var(--brand)]">{t('download')} PDF</button>
            </div>)}
            {documents.length === 0 && <p className="text-sm text-[var(--muted)]">{t('noDocuments')}</p>}
          </div>
        </section>
      </div>
    </main></>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return <div className="mini-stat"><div className="mini-value">{value}</div><div className="mini-label">{label}</div></div>;
}

function splitList(value: FormDataEntryValue | null): string[] {
  return String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}
