"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/nav";
import NavCta from "./NavCta";

interface MobileMenuProps {
  bookingUrl: string | null;
  whatsappFallback: string | null;
}

export default function MobileMenu({ bookingUrl, whatsappFallback }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-primary hover:bg-primary-tint"
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className="absolute inset-x-0 top-full z-40 h-[100dvh] cursor-default bg-primary-dark/30 backdrop-blur-xs"
          />
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-border bg-surface px-4 pb-5 pt-3 shadow-elevated"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-medium text-text-heading transition-colors hover:bg-primary-tint hover:text-primary"
                  >
                    {label}
                    <ChevronRight size={18} aria-hidden="true" className="text-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
            <NavCta
              bookingUrl={bookingUrl}
              whatsappFallback={whatsappFallback}
              size="md"
              className="mt-3 w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}
