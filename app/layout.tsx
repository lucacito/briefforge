import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/lib/themeContext';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BriefForge — Project Scoping for Freelancers & Agencies',
  description:
    'Turn vague client requests into structured scope documents, pricing ranges, complexity estimates, and risk assessments. Built for freelancers, agencies, and consultants.',
  keywords: ['project scoping', 'freelance estimator', 'web project scope', 'agency tool', 'project estimation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#080810] text-white antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
