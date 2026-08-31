/**
 * components/ServicesSection.tsx
 * Daftar layanan/tindakan medis dari data Services[].
 *
 * Edge cases (FR-4):
 * - services kosong → pesan "Segera hadir"
 * - service_description kosong → tampilkan nama layanan saja
 *
 * Styling: sesuai 04-design.md — background off-white, kartu dengan shadow halus,
 *          hover micro-interaction via CSS, ikon Lucide dekoratif.
 * Note: Server Component — hover via CSS class saja, tidak ada event handler JS.
 */

import { Stethoscope } from "lucide-react";
import { Service } from "@/lib/types";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section
      id="layanan"
      aria-labelledby="layanan-heading"
      className="section-divider section-spacing px-4 bg-bg/50"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="layanan-heading"
          className="mb-10 text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight text-center sm:text-left"
        >
          Layanan & Tindakan
        </h2>

        {services.length === 0 ? (
          <p id="layanan-empty" className="text-text-body text-center py-8">
            Informasi layanan segera hadir.
          </p>
        ) : (
          <ul id="services-list" role="list" className="grid gap-5 sm:grid-cols-2">
            {services.map((svc, i) => (
              <li
                key={i}
                id={`service-item-${i}`}
                className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Ikon + nama layanan */}
                <div className="mb-3 flex items-start gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20"
                    aria-hidden="true"
                  >
                    <Stethoscope size={20} className="text-primary" />
                  </span>
                  <h3
                    id={`service-name-${i}`}
                    className="text-base font-semibold leading-snug text-primary-dark font-heading mt-1 group-hover:text-primary transition-colors"
                  >
                    {svc.service_name}
                  </h3>
                </div>

                {svc.service_description && (
                  <p
                    id={`service-desc-${i}`}
                    className="pl-14 text-sm leading-relaxed text-text-body/80"
                  >
                    {svc.service_description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
