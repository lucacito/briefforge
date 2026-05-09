import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/themeContext';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  icons: { icon: '/flyscope-favicon.png' },
  title: 'FlyScope — Project Scoping for Freelancers & Agencies',
  description:
    'Walk through your project\'s shape, get pricing ranges grounded in your hourly rate, a timeline broken into phases, and an exportable scope document. Made for freelancers and agencies.',
  keywords: ['project scoping', 'freelance estimator', 'web project scope', 'agency tool', 'project estimation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-bg-main text-white antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
