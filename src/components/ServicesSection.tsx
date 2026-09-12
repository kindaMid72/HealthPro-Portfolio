/**
 * components/ServicesSection.tsx
 * Daftar layanan/tindakan medis dari data Services[].
 *
 * Edge cases (FR-4):
 * - services kosong → pesan "Segera hadir"
 * - service_description kosong → tampilkan nama layanan saja
 *
 * Styling: sesuai 04-design.md — background off-white gradient, kartu premium,
 *          hover micro-interaction via CSS, ikon Lucide dekoratif.
 * Note: Server Component — hover via CSS class saja, tidak ada event handler JS.
 */

import { Service } from "@/lib/types";

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section
      id="layanan"
      aria-labelledby="layanan-heading"
      className="section-divider section-spacing px-4 bg-bg"
    >
      <div className="mx-auto max-w-3xl">
        {/* Heading centered dengan accent underline */}
        <div className="mb-12 text-center">
          <h2
            id="layanan-heading"
            className="text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
          >
            Layanan &amp; Tindakan
          </h2>
          {/* Accent underline dekoratif */}
          <div aria-hidden="true" className="mt-3 flex items-center justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-primary" />
            <div className="h-1 w-4 rounded-full bg-accent" />
          </div>
          <p className="mt-4 text-sm text-text-body/70 max-w-md mx-auto">
            Layanan yang tersedia di tempat praktik. Untuk detail, hubungi klinik langsung.
          </p>
        </div>

        {services.length === 0 ? (
          <p id="layanan-empty" className="text-text-body text-center py-8">
            Informasi layanan segera hadir.
          </p>
        ) : (
          <ul id="services-list" role="list" className="grid gap-4 sm:grid-cols-2">
            {services.map((svc, i) => (
              <li
                key={i}
                id={`service-item-${i}`}
                className="group bg-surface border border-border rounded-2xl p-6 shadow-sm
                           hover:shadow-md hover:-translate-y-1
                           hover:border-primary/30
                           transition-all duration-300 relative overflow-hidden flex flex-col"
              >
                {/* Accent top bar on hover */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                />

                {/* Large subtle background number */}
                <div 
                  className="absolute -bottom-2 -right-2 text-7xl font-black text-primary/5 group-hover:text-primary/10 transition-colors duration-500 pointer-events-none select-none z-0"
                  aria-hidden="true"
                >
                  {(i + 1).toString().padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col flex-grow">
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-1">
                      {/* Decorative Line */}
                      <div className="h-[2px] w-6 bg-primary/30 group-hover:w-10 group-hover:bg-primary transition-all duration-300 rounded-full" aria-hidden="true" />
                      <h3
                        id={`service-name-${i}`}
                        className="text-lg font-semibold leading-snug text-primary-dark font-heading group-hover:text-primary transition-colors duration-200"
                      >
                        {svc.service_name}
                      </h3>
                    </div>
                  </div>

                  {svc.service_description && (
                    <p
                      id={`service-desc-${i}`}
                      className="text-sm leading-relaxed text-text-body/80 mt-auto"
                    >
                      {svc.service_description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
