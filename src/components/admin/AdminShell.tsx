'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ExternalLink,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { Button } from './Button';
import Dialog from './Dialog';

const ADMIN_NAV = [
  { href: '/admin', label: 'Beranda', Icon: LayoutDashboard },
  { href: '/admin/articles', label: 'Artikel', Icon: FileText },
  { href: '/admin/profile', label: 'Profil Dokter', Icon: UserRound },
  { href: '/admin/locations', label: 'Lokasi Praktik', Icon: MapPin },
  { href: '/admin/services', label: 'Layanan', Icon: Stethoscope },
  { href: '/admin/account', label: 'Akun', Icon: KeyRound },
] as const;

interface AdminShellProps {
  userName: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

function NavContent({
  userName,
  logoutAction,
  onNavigate,
}: Omit<AdminShellProps, 'children'> & { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Menu admin" className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${
                active
                  ? 'bg-primary-tint font-semibold text-primary'
                  : 'font-medium text-text-body hover:bg-primary-tint hover:text-primary'
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-text-body hover:bg-primary-tint hover:text-primary"
        >
          <ExternalLink size={18} aria-hidden="true" />
          Lihat website
        </Link>
        <p className="truncate px-3 text-xs text-text-muted">{userName}</p>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" icon={<LogOut size={16} aria-hidden="true" />} className="w-full justify-start">
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminShell({ userName, logoutAction, children }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-text-body">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <Link href="/admin" className="flex h-14 items-center px-6 text-base font-bold text-text-heading">
          Admin Dokter
        </Link>
        <div className="min-h-0 flex-1 border-t border-border">
          <NavContent userName={userName} logoutAction={logoutAction} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu admin"
          aria-expanded={drawerOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-tint"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <Link href="/admin" className="text-base font-bold text-text-heading">
          Admin Dokter
        </Link>
      </header>

      <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu admin" variant="drawer">
        <NavContent
          userName={userName}
          logoutAction={logoutAction}
          onNavigate={() => setDrawerOpen(false)}
        />
      </Dialog>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
