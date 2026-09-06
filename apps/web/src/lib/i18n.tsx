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
    commandCenter: 'Your command center', greeting: 'Good to see you.', dashboardCopy: 'Keep the momentum moving toward your next opportunity.', exploreJobs: 'Explore jobs', jobsDetected: 'Jobs detected', visaSponsorship: 'With visa sponsorship', averageScore: 'Average match score', applicationsSent: 'Applications sent', applicationFunnel: 'Application funnel', interviewRate: 'Interview rate', offerRate: 'Offer rate', topCountries: 'Top countries', noData: 'No data yet', buildProfile: 'Build your profile', buildProfileCopy: 'Add your experience and preferences so Aven can surface roles that fit your next move.', completeProfile: 'Complete profile', recentActivity: 'Recent activity', noActivity: 'Your activity will appear here as you explore roles and save applications.', yourToolkit: 'Your toolkit', makeMoveReady: 'Make your move ready.', toolkitCopy: 'Keep your story, applications, and next steps in one place.', profile: 'Profile', profileCopy: 'Help Aven find the right fit.', cvLibrary: 'CV library', cvCopy: 'Your source material for stronger applications.', applications: 'Applications', applicationsCopy: 'A simple view of what is moving.', documents: 'Tailored documents', documentsCopy: 'Turn the right opportunity into a ready application.', saveProfile: 'Save profile', uploadParse: 'Upload and parse', download: 'Download', primary: 'Primary', uploadHint: 'Upload a text-based PDF or DOCX to activate matching and generation.', noApplications: 'Save a job from Explore jobs to track it here.', chooseJob: 'Choose a job', generateResume: 'Generate resume', generateCover: 'Generate cover letter', noDocuments: 'Generated documents will appear here.', skillsHint: 'Skills, separated by commas', technologies: 'Target technologies', countries: 'Target countries', country: 'Country', city: 'City', phone: 'Phone', headline: 'Professional headline', needVisa: 'I need visa sponsorship', relocate: 'I am willing to relocate', saved: 'Saved', applied: 'Applied', pending: 'Pending', interview: 'Interview', offer: 'Offer', rejected: 'Rejected', errorInvalidCredentials: 'The email or password is incorrect. Check your details and try again.', errorEmailExists: 'An account with this email already exists. Try signing in instead.', searchDesk: 'The opportunity desk', findPlace: 'Find your next place.', jobsCopy: 'Roles with a clearer path to sponsorship, relocation, and a future you can picture.', refineSearch: 'Refine your search', remote: 'Remote', visaOnly: 'Visa sponsorship only', searchLive: 'Search live jobs', searching: 'Searching live job sources…', liveUpdated: 'Live sources searched. Results are updated.', saveApplication: 'Save application', applyEmployer: 'Apply on employer site', noJobs: 'No roles found yet. Search live sources to refresh the opportunity desk.', loading: 'Loading…', signInToScores: 'Log in to see personalized match scores.', invalidFile: 'Please upload a PDF or DOCX file.', savedApplication: 'Job saved to your application tracker.', generated: 'generated.', profileSaved: 'Profile saved.', cvUploaded: 'CV uploaded and parsed.', aiRateLimit: 'AI generation is temporarily busy. Please wait a minute and try again.', wrongCredentials: 'The email or password is incorrect. Please check your details.', google: 'Continue with Google', or: 'or', googleUnavailable: 'Google sign-in is not configured yet.',
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
    commandCenter: 'Votre centre de pilotage', greeting: 'Ravi de vous revoir.', dashboardCopy: 'Gardez votre elan vers votre prochaine opportunite.', exploreJobs: 'Explorer les offres', jobsDetected: 'Offres detectees', visaSponsorship: 'Avec visa de travail', averageScore: 'Score moyen de compatibilite', applicationsSent: 'Candidatures envoyees', applicationFunnel: 'Suivi des candidatures', interviewRate: 'Taux d entretien', offerRate: 'Taux d offre', topCountries: 'Pays les plus presents', noData: 'Aucune donnee pour le moment', buildProfile: 'Construisez votre profil', buildProfileCopy: 'Ajoutez votre experience et vos preferences pour que Aven vous propose des roles pertinents.', completeProfile: 'Completer le profil', recentActivity: 'Activite recente', noActivity: 'Votre activite apparaitra ici lorsque vous explorerez des roles et enregistrerez des candidatures.', yourToolkit: 'Votre espace outils', makeMoveReady: 'Preparez votre prochaine etape.', toolkitCopy: 'Votre parcours, vos candidatures et vos prochaines actions au meme endroit.', profile: 'Profil', profileCopy: 'Aidez Aven a trouver le bon match.', cvLibrary: 'Bibliotheque de CV', cvCopy: 'Vos documents sources pour des candidatures plus fortes.', applications: 'Candidatures', applicationsCopy: 'Une vue simple de ce qui avance.', documents: 'Documents personnalises', documentsCopy: 'Transformez le bon poste en candidature prete.', saveProfile: 'Enregistrer le profil', uploadParse: 'Importer et analyser', download: 'Telecharger', primary: 'Principal', uploadHint: 'Importez un PDF ou DOCX textuel pour activer le matching et la generation.', noApplications: 'Enregistrez une offre depuis Explorer les offres pour la suivre ici.', chooseJob: 'Choisir une offre', generateResume: 'Generer un CV', generateCover: 'Generer une lettre de motivation', noDocuments: 'Vos documents generes apparaitront ici.', skillsHint: 'Competences, separees par des virgules', technologies: 'Technologies ciblees', countries: 'Pays cibles', country: 'Pays', city: 'Ville', phone: 'Telephone', headline: 'Titre professionnel', needVisa: 'J ai besoin d un visa de travail', relocate: 'Je suis pret a demenager', saved: 'Enregistree', applied: 'Postulee', pending: 'En attente', interview: 'Entretien', offer: 'Offre', rejected: 'Refusee', searchDesk: 'Le bureau des opportunites', findPlace: 'Trouvez votre prochaine destination.', jobsCopy: 'Des roles avec un chemin plus clair vers le visa, la mobilite et un avenir qui vous ressemble.', refineSearch: 'Affiner votre recherche', remote: 'Teletravail', visaOnly: 'Visa de travail uniquement', searchLive: 'Rechercher des offres', searching: 'Recherche des offres en direct…', liveUpdated: 'Les sources ont ete actualisees.', saveApplication: 'Enregistrer la candidature', applyEmployer: 'Postuler sur le site employeur', noJobs: 'Aucune offre trouvee. Lancez une recherche pour actualiser votre espace.', loading: 'Chargement…', signInToScores: 'Connectez-vous pour voir vos scores personnalises.', invalidFile: 'Importez un fichier PDF ou DOCX.', savedApplication: 'Offre ajoutee a votre suivi.', generated: 'genere.', profileSaved: 'Profil enregistre.', cvUploaded: 'CV importe et analyse.', aiRateLimit: 'La generation IA est temporairement saturee. Reessayez dans une minute.', wrongCredentials: 'Votre e-mail ou mot de passe est incorrect. Verifiez vos informations.', google: 'Continuer avec Google', or: 'ou', googleUnavailable: 'La connexion Google n est pas encore configuree.',
  },
};

const extras: Record<Language, Dictionary> = {
  en: { featureHorizon: 'Find your horizon', featureHorizonCopy: 'Search international roles filtered for sponsorship and relocation.', featureFit: 'Know your fit', featureFitCopy: 'A grounded match score that shows what makes you stand out.', featureReady: 'Show up ready', featureReadyCopy: 'Generate truthful, tailored documents from your real experience.', sideLoginTitle: 'Make your next move count.', sideLoginCopy: 'Your opportunities, profile, and application momentum in one calm place.', sideRegisterCopy: 'Build a profile that helps the right global opportunities find you.', footerLine: 'A clearer path to global work.', emailAddress: 'Email address', signInRequired: 'Sign in to manage your profile, applications, and documents.', insight: 'Aven insight', momentum: 'Your search is gaining momentum.', keepExploring: 'Keep exploring roles and save the ones that feel like a real possibility.', remoteBadge: 'Remote', visaBadge: 'Visa sponsorship', relocationBadge: 'Relocation', captchaFailed: 'The security check failed. Please try again.' },
  fr: { featureHorizon: 'Trouvez votre horizon', featureHorizonCopy: 'Explorez des roles internationaux filtres par visa et mobilite.', featureFit: 'Mesurez votre compatibilite', featureFitCopy: 'Un score clair qui montre ce qui vous distingue.', featureReady: 'Soyez pret a postuler', featureReadyCopy: 'Generez des documents fideles et personnalises a partir de votre parcours.', sideLoginTitle: 'Faites compter votre prochaine etape.', sideLoginCopy: 'Vos opportunites, votre profil et vos candidatures au meme endroit.', sideRegisterCopy: 'Construisez un profil qui attire les bonnes opportunites internationales.', footerLine: 'Une trajectoire plus claire vers votre prochain poste.', emailAddress: 'Adresse e-mail', signInRequired: 'Connectez-vous pour gerer votre profil, vos candidatures et vos documents.', insight: 'Conseil Aven', momentum: 'Votre recherche prend de l elan.', keepExploring: 'Continuez a explorer les offres et enregistrez celles qui vous correspondent.', remoteBadge: 'Teletravail', visaBadge: 'Visa de travail', relocationBadge: 'Mobilite', captchaFailed: 'La verification de securite a echoue. Reessayez.' },
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

  return <LanguageContext.Provider value={{ language, setLanguage, t: (key) => messages[language][key] ?? extras[language][key] ?? key }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
