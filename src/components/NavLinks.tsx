"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ACTIVE_PREFIX, NAV_LINKS } from "@/lib/nav";

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map(({ href, label }) => {
        const prefix = NAV_ACTIVE_PREFIX[href];
        const active = prefix ? pathname.startsWith(prefix) : false;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-tint font-semibold text-primary"
                  : "text-text-body hover:bg-bg-subtle hover:text-primary"
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
