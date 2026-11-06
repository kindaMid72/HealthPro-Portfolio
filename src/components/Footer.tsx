/**
 * components/Footer.tsx
 * Footer 12 kolom: identitas, navigasi, disclaimer + catatan darurat.
 */

import Link from "next/link";
import { ArrowUp, TriangleAlert } from "lucide-react";
import BrandMark from "./BrandMark";
import { NAV_LINKS } from "@/lib/nav";
import { EMERGENCY_NOTE } from "@/lib/cta";
import type { Profile } from "@/lib/types";

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  return (
    <footer id="footer" className="bg-primary-dark px-4 py-12 text-white/80 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 text-sm md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <BrandMark className="h-9 w-9 shrink-0 text-white" />
              <div>
                <p className="font-display text-lg font-semibold text-white">{profile.full_name}</p>
                <p className="mt-0.5">{profile.specialty}</p>
              </div>
            </div>
            {profile.sub_specialty && (
              <p className="mt-4 max-w-sm leading-relaxed text-white/70">{profile.sub_specialty}</p>
            )}
          </div>

          <nav aria-label="Navigasi footer" className="md:col-span-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
              Navigasi
            </p>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-white hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 rounded-2xl border border-white/15 bg-white/5 p-4 leading-relaxed md:col-span-4">
            <p>
              Informasi yang tersaji di website ini bersifat umum dan tidak menggantikan konsultasi
              medis langsung. Untuk keperluan medis, silakan hubungi dokter secara langsung.
            </p>
            <p className="flex items-start gap-2 border-t border-white/15 pt-3 text-white">
              <TriangleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
              <span>{EMERGENCY_NOTE}</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.full_name}
          </p>
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-white">
            <ArrowUp size={14} aria-hidden="true" />
            Kembali ke atas
          </a>
        </div>
      </div>
    </footer>
  );
}
