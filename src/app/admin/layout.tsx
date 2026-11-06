import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';
import { figtree, literata } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Portal Dokter',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${figtree.variable} ${literata.variable}`}>
      <body>{children}</body>
    </html>
  );
}
