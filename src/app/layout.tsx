import { Inter, Playfair_Display } from 'next/font/google';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Dapper Squad Entertainment — DJ • Karaoke • Photo | Chicago–Milwaukee',
    template: '%s | Dapper Squad Entertainment',
  },
  description:
    'Full-service DJ, karaoke, and event photography for weddings, parties, and corporate events. Flat pricing, fast booking, and 5★ reviews across the Chicago–Milwaukee area.',
  keywords: [
    'DJ services Chicago',
    'Wedding DJ Milwaukee',
    'Event photography',
    'Karaoke rental',
    'Corporate events',
    'Party DJ',
    'Wedding entertainment',
    'Chicago DJ',
    'Milwaukee DJ',
  ],
  authors: [{ name: 'Dapper Squad Entertainment' }],
  creator: 'Dapper Squad Entertainment',
  publisher: 'Dapper Squad Entertainment',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dappersquad.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dappersquad.com',
    siteName: 'Dapper Squad Entertainment',
    title: 'Dapper Squad Entertainment — DJ • Karaoke • Photo | Chicago–Milwaukee',
    description:
      'Full-service DJ, karaoke, and event photography for weddings, parties, and corporate events.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dapper Squad Entertainment - DJ, Karaoke, and Photography Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dapper Squad Entertainment — DJ • Karaoke • Photo | Chicago–Milwaukee',
    description:
      'Full-service DJ, karaoke, and event photography for weddings, parties, and corporate events.',
    images: ['/images/og-image.jpg'],
    creator: '@dappersquad',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
