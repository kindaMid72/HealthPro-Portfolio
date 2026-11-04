import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { requireUser } from '@/lib/session';
import { logoutAction } from '../actions';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Portal Dokter',
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <AdminShell userName={user.name} logoutAction={logoutAction}>
      {children}
    </AdminShell>
  );
}
