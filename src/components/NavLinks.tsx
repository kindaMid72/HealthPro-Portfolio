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
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                active ? "text-primary underline decoration-2 underline-offset-8" : "text-text-body"
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
