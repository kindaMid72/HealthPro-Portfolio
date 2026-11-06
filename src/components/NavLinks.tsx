'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stripLocalePrefix } from '@/i18n/path';
import { NAV_ACTIVE_PREFIX } from '@/lib/nav';

export interface NavLinksProps {
  links: { href: string; label: string }[];
}

export default function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();
  const clean = stripLocalePrefix(pathname || '/');

  return (
    <ul className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label }) => {
        const prefix = NAV_ACTIVE_PREFIX[href];
        const active = prefix ? clean.startsWith(prefix) : false;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-tint font-semibold text-primary'
                  : 'text-text-body hover:bg-bg-subtle hover:text-primary'
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
