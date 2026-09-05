'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fr';

type Dictionary = Record<string, string>;

const messages: Record<Language, Dictionary> = {
  en: {
    language: 'Language',
    english: 'English',
    french: 'French',
    login: 'Log in',
    signup: 'Get started',
    welcome: 'Welcome back.',
    welcomeCopy: 'Pick up where your next move begins.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in…',
    noAccount: 'No account?',
    createAccount: 'Create one',
    registerTitle: 'Create your account.',
    registerCopy: 'A clearer path starts with a few details.',
    fullName: 'Full name',
    passwordHint: 'Password (min 8 chars)',
    creating: 'Creating…',
    alreadyAccount: 'Already have an account?',
    overview: 'Overview',
    exploreJobs: 'Explore jobs',
    workspace: 'Workspace',
    startClarity: 'Start with clarity',
    nextMove: 'Your next move, made clearer.',
    globalCareer: 'The global career platform',
    heroTitle: 'The right move is out there.',
    heroCopy: 'Find roles built for global talent, understand your fit, and make every application feel like a step forward.',
    startSearch: 'Start your search',
    exploreRoles: 'Explore roles',
    live: 'Live',
    opportunityMap: 'Your opportunity map',
    visaRoles: 'Visa-friendly roles',
    newThisWeek: '142 new this week',
    strongestFit: 'Your strongest fit',
    applicationReady: 'Application ready',
    resumeCover: 'Resume + cover letter',
    nextBestMove: 'Next best move',
    refineProfile: 'Refine your profile to unlock better matches.',
  },
  fr: {
    language: 'Langue',
    english: 'Anglais',
    french: 'Francais',
    login: 'Se connecter',
    signup: 'Commencer',
    welcome: 'Ravi de vous revoir.',
    welcomeCopy: 'Reprenez la ou votre prochaine etape commence.',
    email: 'E-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion…',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Creer un compte',
    registerTitle: 'Creez votre compte.',
    registerCopy: 'Une trajectoire plus claire commence par quelques details.',
    fullName: 'Nom complet',
    passwordHint: 'Mot de passe (8 caracteres min.)',
    creating: 'Creation…',
    alreadyAccount: 'Vous avez deja un compte ?',
    overview: 'Vue d ensemble',
    exploreJobs: 'Explorer les offres',
    workspace: 'Espace de travail',
    startClarity: 'Commencer clairement',
    nextMove: 'Votre prochaine etape, en toute clarte.',
    globalCareer: 'La plateforme des carrieres internationales',
    heroTitle: 'La bonne opportunite est la.',
    heroCopy: 'Trouvez des postes ouverts aux talents internationaux, mesurez votre compatibilite et avancez avec confiance.',
    startSearch: 'Commencer ma recherche',
    exploreRoles: 'Explorer les offres',
    live: 'En direct',
    opportunityMap: 'Votre carte des opportunites',
    visaRoles: 'Postes avec visa',
    newThisWeek: '142 nouveaux cette semaine',
    strongestFit: 'Votre meilleur match',
    applicationReady: 'Candidature prete',
    resumeCover: 'CV + lettre de motivation',
    nextBestMove: 'Prochaine meilleure etape',
    refineProfile: 'Completez votre profil pour trouver de meilleurs matchs.',
  },
};

const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string } | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('aven_language');
    if (saved === 'en' || saved === 'fr') setLanguageState(saved);
  }, []);

  function setLanguage(next: Language) {
    localStorage.setItem('aven_language', next);
    setLanguageState(next);
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t: (key) => messages[language][key] ?? key }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
