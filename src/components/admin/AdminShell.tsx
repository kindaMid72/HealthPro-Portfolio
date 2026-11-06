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
import BrandMark from '@/components/BrandMark';
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

function initialsOf(name: string): string {
  const parts = name.replace(/^(dr\.?|drg\.?)\s+/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function BrandText() {
  return (
    <span className="flex flex-col leading-tight">
      <span className="text-sm font-bold text-text-heading">Panel Klinik THT</span>
      <span className="text-xs font-medium text-text-muted">dr. Yuliana</span>
    </span>
  );
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
              className={`flex min-h-11 items-center gap-3 rounded-lg border-l-3 px-3 text-sm transition-colors duration-150 ${
                active
                  ? 'border-primary bg-primary-tint font-semibold text-primary shadow-2xs'
                  : 'border-transparent font-medium text-text-body hover:bg-bg-subtle hover:text-text-heading'
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
          className="flex min-h-11 items-center gap-3 rounded-lg border-l-3 border-transparent px-3 text-sm font-medium text-text-body transition-colors hover:bg-bg-subtle hover:text-text-heading"
        >
          <ExternalLink size={18} aria-hidden="true" />
          Lihat website
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-bg p-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-primary"
          >
            {initialsOf(userName)}
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text-heading">{userName}</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" icon={<LogOut size={16} aria-hidden="true" />} className="w-full">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface shadow-2xs lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-3 border-b border-border px-5">
          <BrandMark className="h-9 w-9 shrink-0 text-primary" />
          <BrandText />
        </Link>
        <div className="min-h-0 flex-1">
          <NavContent userName={userName} logoutAction={logoutAction} />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu admin"
          aria-expanded={drawerOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-tint"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <Link href="/admin" className="flex items-center gap-3">
          <BrandMark className="h-9 w-9 shrink-0 text-primary" />
          <BrandText />
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
        <main className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
