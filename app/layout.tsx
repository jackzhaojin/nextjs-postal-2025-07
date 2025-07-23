import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LocalStorageInitializer } from '@/components/LocalStorageInitializer';
import { DemoProvider } from '@/lib/demo/demo-context';
import { DemoControlPanel } from '@/app/demo/components/DemoControlPanel';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'B2B Shipping Transport System',
  description: 'Professional shipping solutions for businesses. Fast, reliable, and transparent pricing.',
  keywords: ['shipping', 'b2b', 'transport', 'logistics', 'freight'],
  authors: [{ name: 'B2B Shipping System' }],
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DemoProvider>
          <LocalStorageInitializer />
          {children}
          <DemoControlPanel />
        </DemoProvider>
      </body>
    </html>
  );
}
