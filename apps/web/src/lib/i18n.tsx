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
    termsAccept: 'I agree to the Terms and Privacy Policy',
    termsRequired: 'Please accept the Terms and Privacy Policy to continue.',
    terms: 'Terms',
    overview: 'Overview',
    navExploreJobs: 'Explore jobs',
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
    french: 'Français',
    login: 'Se connecter',
    signup: 'Commencer',
    welcome: 'Ravi de vous revoir.',
    welcomeCopy: 'Reprenez là où votre prochaine étape commence.',
    email: 'E-mail',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion…',
    noAccount: 'Pas encore de compte ?',
    createAccount: 'Créer un compte',
    registerTitle: 'Créez votre compte.',
    registerCopy: 'Une trajectoire plus claire commence par quelques détails.',
    fullName: 'Nom complet',
    passwordHint: 'Mot de passe (8 caractères min.)',
    creating: 'Création…',
    alreadyAccount: 'Vous avez déjà un compte ?',
    termsAccept: 'J’accepte les Conditions et la Politique de confidentialité',
    termsRequired: 'Veuillez accepter les Conditions et la Politique de confidentialité pour continuer.',
    terms: 'Conditions',
    overview: 'Vue d’ensemble',
    navExploreJobs: 'Explorer les offres',
    workspace: 'Espace de travail',
    startClarity: 'Commencer clairement',
    nextMove: 'Votre prochaine étape, en toute clarté.',
    globalCareer: 'La plateforme des carrières internationales',
    heroTitle: 'La bonne opportunité est là.',
    heroCopy: 'Trouvez des postes ouverts aux talents internationaux, mesurez votre compatibilité et avancez avec confiance.',
    startSearch: 'Commencer ma recherche',
    exploreRoles: 'Explorer les offres',
    live: 'En direct',
    opportunityMap: 'Votre carte des opportunités',
    visaRoles: 'Postes avec visa',
    newThisWeek: '142 nouveaux cette semaine',
    strongestFit: 'Votre meilleur match',
    applicationReady: 'Candidature prête',
    resumeCover: 'CV + lettre de motivation',
    nextBestMove: 'Prochaine meilleure étape',
    refineProfile: 'Complétez votre profil pour trouver de meilleurs matchs.',
    commandCenter: 'Votre centre de pilotage', greeting: 'Ravi de vous revoir.', dashboardCopy: 'Gardez votre élan vers votre prochaine opportunité.', exploreJobs: 'Explorer les offres', jobsDetected: 'Offres détectées', visaSponsorship: 'Avec visa de travail', averageScore: 'Score moyen de compatibilité', applicationsSent: 'Candidatures envoyées', applicationFunnel: 'Suivi des candidatures', interviewRate: 'Taux d’entretien', offerRate: 'Taux d’offre', topCountries: 'Pays les plus présents', noData: 'Aucune donnée pour le moment', buildProfile: 'Construisez votre profil', buildProfileCopy: 'Ajoutez votre expérience et vos préférences pour que Aven vous propose des rôles pertinents.', completeProfile: 'Compléter le profil', recentActivity: 'Activité récente', noActivity: 'Votre activité apparaîtra ici lorsque vous explorerez des rôles et enregistrerez des candidatures.', yourToolkit: 'Votre espace outils', makeMoveReady: 'Préparez votre prochaine étape.', toolkitCopy: 'Votre parcours, vos candidatures et vos prochaines actions au même endroit.', profile: 'Profil', profileCopy: 'Aidez Aven à trouver le bon match.', cvLibrary: 'Bibliothèque de CV', cvCopy: 'Vos documents sources pour des candidatures plus fortes.', applications: 'Candidatures', applicationsCopy: 'Une vue simple de ce qui avance.', documents: 'Documents personnalisés', documentsCopy: 'Transformez le bon poste en candidature prête.', saveProfile: 'Enregistrer le profil', uploadParse: 'Importer et analyser', download: 'Télécharger', primary: 'Principal', uploadHint: 'Importez un PDF ou DOCX textuel pour activer le matching et la génération.', noApplications: 'Enregistrez une offre depuis Explorer les offres pour la suivre ici.', chooseJob: 'Choisir une offre', generateResume: 'Générer un CV', generateCover: 'Générer une lettre de motivation', noDocuments: 'Vos documents générés apparaîtront ici.', skillsHint: 'Compétences, séparées par des virgules', technologies: 'Technologies ciblées', countries: 'Pays cibl\u00e9s', country: 'Pays', city: 'Ville', phone: 'T\u00e9l\u00e9phone', headline: 'Titre professionnel', needVisa: 'J\u2019ai besoin d\u2019un visa de travail', relocate: 'Je suis pr\u00eat \u00e0 d\u00e9m\u00e9nager', saved: 'Enregistr\u00e9e', applied: 'Postul\u00e9e', pending: 'En attente', interview: 'Entretien', offer: 'Offre', rejected: 'Refus\u00e9e', searchDesk: 'Le bureau des opportunit\u00e9s', findPlace: 'Trouvez votre prochaine destination.', jobsCopy: 'Des r\u00f4les avec un chemin plus clair vers le visa, la mobilit\u00e9 et un avenir qui vous ressemble.', refineSearch: 'Affiner votre recherche', remote: 'T\u00e9l\u00e9travail', visaOnly: 'Visa de travail uniquement', searchLive: 'Rechercher des offres', searching: 'Recherche des offres en direct…', liveUpdated: 'Les sources ont \u00e9t\u00e9 actualis\u00e9es.', saveApplication: 'Enregistrer la candidature', applyEmployer: 'Postuler sur le site employeur', noJobs: 'Aucune offre trouv\u00e9e. Lancez une recherche pour actualiser votre espace.', loading: 'Chargement…', signInToScores: 'Connectez-vous pour voir vos scores personnalis\u00e9s.', invalidFile: 'Importez un fichier PDF ou DOCX.', savedApplication: 'Offre ajout\u00e9e \u00e0 votre suivi.', generated: 'g\u00e9n\u00e9r\u00e9.', profileSaved: 'Profil enregistr\u00e9.', cvUploaded: 'CV import\u00e9 et analys\u00e9.', aiRateLimit: 'La g\u00e9n\u00e9ration IA est temporairement satur\u00e9e. R\u00e9essayez dans une minute.', wrongCredentials: 'Votre e-mail ou mot de passe est incorrect. V\u00e9rifiez vos informations.', google: 'Continuer avec Google', or: 'ou', googleUnavailable: 'La connexion Google n\u2019est pas encore configur\u00e9e.',
  },
};

const extras: Record<Language, Dictionary> = {
  en: { featureHorizon: 'Find your horizon', featureHorizonCopy: 'Search international roles filtered for sponsorship and relocation.', featureFit: 'Know your fit', featureFitCopy: 'A grounded match score that shows what makes you stand out.', featureReady: 'Show up ready', featureReadyCopy: 'Generate truthful, tailored documents from your real experience.', sideLoginTitle: 'Make your next move count.', sideLoginCopy: 'Your opportunities, profile, and application momentum in one calm place.', sideRegisterCopy: 'Build a profile that helps the right global opportunities find you.', footerLine: 'A clearer path to global work.', emailAddress: 'Email address', signInRequired: 'Sign in to manage your profile, applications, and documents.', insight: 'Aven insight', momentum: 'Your search is gaining momentum.', keepExploring: 'Keep exploring roles and save the ones that feel like a real possibility.', remoteBadge: 'Remote', visaBadge: 'Visa sponsorship', relocationBadge: 'Relocation', captchaFailed: 'The security check failed. Please try again.', continueGoogle: 'Continue with Google', orEmail: 'or continue with email', howItWorks: 'How it works', howCopy: 'From your first search to a ready-to-send application in four calm steps.', step1Title: 'Import your CV', step1Copy: 'Drop a PDF or DOCX. Aven reads your real experience and builds your profile automatically.', step2Title: 'Discover matched roles', step2Copy: 'We aggregate visa-friendly roles from trusted boards and score them against your profile.', step3Title: 'Understand your fit', step3Copy: 'A transparent score shows why each role fits — skills, experience, visa and location.', step4Title: 'Generate & apply', step4Copy: 'Create a tailored, ATS-ready resume and cover letter for each job, then apply with confidence.', trustedBy: 'Built on trusted sources', statRoles: 'Live roles', statRolesLabel: 'aggregated across boards', statCountries: '8+', statCountriesLabel: 'countries covered', statVisa: 'Visa-first', statVisaLabel: 'sponsorship signals detected', statTailored: 'ATS-ready', statTailoredLabel: 'documents per application', quoteText: '“I stopped guessing which roles were worth my time. Aven showed me where I actually fit and had my resume ready in minutes.”', quoteAuthor: 'Amina K.', quoteRole: 'Software Engineer, relocated to Berlin', ctaTitle: 'Your next move is closer than you think.', ctaCopy: 'Create your free account and let Aven surface the roles built for your profile.', ctaButton: 'Get started free', navFeatures: 'Features', navHow: 'How it works', whyAven: 'Why Aven', sortBy: 'Sort by', sortRecent: 'Most recent', sortMatch: 'Best match', sortVisa: 'Visa first', clear: 'Clear', resultsOne: 'result matching your search', resultsMany: 'results matching your search', viewDetails: 'View details', hideDetails: 'Hide details', requirements: 'Key requirements', matchReasonsLabel: 'Why you match', applyByEmail: 'Apply by email', generateCvForJob: 'Generate tailored CV', generatingCv: 'Generating\u2026', cvReady: 'Tailored CV ready \u2014 downloading.', needPrimaryCv: 'Upload a CV in your workspace first.', signInToGenerate: 'Sign in to generate a tailored CV for this job.', detailsOnEmployer: 'Full requirements on the employer page.', apply: 'Apply', profileStrength: 'Profile strength', quickActions: 'Quick actions', qaSearch: 'Search roles', qaSearchCopy: 'Browse visa-friendly jobs matched to you.', qaProfile: 'Refine profile', qaProfileCopy: 'Better profile, better matches and documents.', qaDocs: 'Generate documents', qaDocsCopy: 'Tailored CVs and cover letters, ready to send.', topCompanies: 'Top companies', labelCvs: 'CVs', labelSkills: 'Skills', labelTargets: 'Target countries', labelSaved: 'Saved jobs', editProfile: 'Edit profile', overviewTab: 'Overview' },
  fr: { featureHorizon: 'Trouvez votre horizon', featureHorizonCopy: 'Explorez des postes internationaux filtrés par visa et mobilité.', featureFit: 'Mesurez votre compatibilité', featureFitCopy: 'Un score clair qui montre ce qui vous distingue.', featureReady: 'Soyez prêt à postuler', featureReadyCopy: 'Générez des documents fidèles et personnalisés à partir de votre parcours.', sideLoginTitle: 'Faites compter votre prochaine étape.', sideLoginCopy: 'Vos opportunités, votre profil et vos candidatures au même endroit.', sideRegisterCopy: 'Construisez un profil qui attire les bonnes opportunités internationales.', footerLine: 'Une trajectoire plus claire vers votre prochain poste.', emailAddress: 'Adresse e-mail', signInRequired: 'Connectez-vous pour gérer votre profil, vos candidatures et vos documents.', insight: 'Conseil Aven', momentum: 'Votre recherche prend de l\u2019élan.', keepExploring: 'Continuez à explorer les offres et enregistrez celles qui vous correspondent.', remoteBadge: 'Télétravail', visaBadge: 'Visa de travail', relocationBadge: 'Mobilité', captchaFailed: 'La vérification de sécurité a échoué. Réessayez.', continueGoogle: 'Continuer avec Google', orEmail: 'ou continuer avec un e-mail', howItWorks: 'Comment ça marche', howCopy: 'De votre première recherche à une candidature prête à envoyer, en quatre étapes simples.', step1Title: 'Importez votre CV', step1Copy: 'Déposez un PDF ou un DOCX. Aven lit votre parcours réel et construit votre profil automatiquement.', step2Title: 'Découvrez les offres compatibles', step2Copy: 'Nous agrégeons des postes ouverts au parrainage de visa et les évaluons selon votre profil.', step3Title: 'Comprenez votre compatibilité', step3Copy: 'Un score transparent explique pourquoi chaque poste vous correspond : compétences, expérience, visa et localisation.', step4Title: 'Générez et postulez', step4Copy: 'Créez un CV et une lettre personnalisés, optimisés pour les ATS, puis postulez en confiance.', trustedBy: 'Fondé sur des sources fiables', statRoles: 'Offres en direct', statRolesLabel: 'agrégées depuis plusieurs plateformes', statCountries: '8+', statCountriesLabel: 'pays couverts', statVisa: 'Visa d\u2019abord', statVisaLabel: 'signaux de parrainage détectés', statTailored: 'Prêt pour ATS', statTailoredLabel: 'documents par candidature', quoteText: '\u00ab J\u2019ai arrêté de deviner quelles offres valaient mon temps. Aven m\u2019a montré où je correspondais vraiment et mon CV était prêt en quelques minutes. \u00bb', quoteAuthor: 'Amina K.', quoteRole: 'Ingénieure logicielle, installée à Berlin', ctaTitle: 'Votre prochaine étape est plus proche que vous ne le pensez.', ctaCopy: 'Créez votre compte gratuit et laissez Aven faire remonter les offres faites pour votre profil.', ctaButton: 'Commencer gratuitement', navFeatures: 'Fonctionnalités', navHow: 'Comment ça marche', whyAven: 'Pourquoi Aven', sortBy: 'Trier par', sortRecent: 'Plus récentes', sortMatch: 'Meilleure compatibilité', sortVisa: 'Visa en priorité', clear: 'Effacer', resultsOne: 'offre correspondant à votre recherche', resultsMany: 'offres correspondant à votre recherche', viewDetails: 'Voir les détails', hideDetails: 'Masquer les détails', requirements: 'Exigences clés', matchReasonsLabel: 'Pourquoi vous correspondez', applyByEmail: 'Postuler par e-mail', generateCvForJob: 'Générer le CV adapté', generatingCv: 'Génération\u2026', cvReady: 'CV adapté prêt \u2014 téléchargement.', needPrimaryCv: 'Importez d\u2019abord un CV dans votre espace.', signInToGenerate: 'Connectez-vous pour générer un CV adapté à cette offre.', detailsOnEmployer: 'Exigences complètes sur la page de l\u2019employeur.', apply: 'Postuler', profileStrength: 'Complétude du profil', quickActions: 'Actions rapides', qaSearch: 'Rechercher des offres', qaSearchCopy: 'Parcourez des offres avec visa adaptées à vous.', qaProfile: 'Affiner le profil', qaProfileCopy: 'Un meilleur profil, de meilleures correspondances et documents.', qaDocs: 'Générer des documents', qaDocsCopy: 'CV et lettres personnalisés, prêts à envoyer.', topCompanies: 'Entreprises phares', labelCvs: 'CV', labelSkills: 'Compétences', labelTargets: 'Pays ciblés', labelSaved: 'Offres enregistrées', editProfile: 'Modifier le profil', overviewTab: 'Vue d\u2019ensemble' },
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
