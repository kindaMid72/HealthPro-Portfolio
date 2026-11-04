/**
 * components/Footer.tsx
 * Footer 3 kolom: identitas, navigasi, disclaimer + catatan darurat.
 */

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { NAV_LINKS } from "@/lib/nav";
import { EMERGENCY_NOTE } from "@/lib/cta";
import type { Profile } from "@/lib/types";

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  return (
    <footer id="footer" className="bg-primary-dark px-4 py-12 text-white/75 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 text-sm md:grid-cols-3">
          <div>
            <p className="text-base font-semibold text-white">{profile.full_name}</p>
            <p className="mt-1">{profile.specialty}</p>
          </div>

          <nav aria-label="Navigasi footer">
            <ul className="space-y-2">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 leading-relaxed">
            <p>
              Informasi yang tersaji di website ini bersifat umum dan tidak menggantikan konsultasi
              medis langsung. Untuk keperluan medis, silakan hubungi dokter secara langsung.
            </p>
            <p>{EMERGENCY_NOTE}</p>
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
