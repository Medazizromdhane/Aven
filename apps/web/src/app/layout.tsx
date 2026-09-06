import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { CookieConsent } from '@/components/cookie-consent';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Aven — Your next move, made clearer',
  description:
    'Find international roles with visa sponsorship, understand your fit, and move forward with confidence.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}<SiteFooter /><CookieConsent /></Providers>
      </body>
    </html>
  );
}
