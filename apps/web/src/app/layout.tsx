import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';
import { SiteFooter } from '@/components/site-footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Aven — Votre prochaine étape, en toute clarté',
  description:
    'Aven réunit des offres internationales avec parrainage de visa, un score de compatibilité fondé sur votre parcours et des CV personnalisés pour chaque poste.',
  openGraph: {
    title: 'Aven — Votre prochaine étape, en toute clarté',
    description:
      'Des offres internationales, un score de compatibilité honnête et des candidatures prêtes à envoyer.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Providers>{children}<SiteFooter /><CookieConsent /></Providers>
      </body>
    </html>
  );
}
