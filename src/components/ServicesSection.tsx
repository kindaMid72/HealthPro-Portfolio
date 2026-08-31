/**
 * components/ServicesSection.tsx
 * Daftar layanan/tindakan medis dari data Services[].
 *
 * Edge cases (FR-4):
 * - services kosong → pesan "Segera hadir"
 * - service_description kosong → tampilkan nama layanan saja
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
      className="border-t border-gray-100 bg-gray-50 px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="layanan-heading"
          className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Layanan & Tindakan
        </h2>

        {services.length === 0 ? (
          <p id="layanan-empty" className="text-gray-500">
            Informasi layanan segera hadir.
          </p>
        ) : (
          <ul id="services-list" role="list" className="space-y-4">
            {services.map((svc, i) => (
              <li
                key={i}
                id={`service-item-${i}`}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <h3
                  id={`service-name-${i}`}
                  className="text-base font-semibold text-gray-900"
                >
                  {svc.service_name}
                </h3>
                {svc.service_description && (
                  <p
                    id={`service-desc-${i}`}
                    className="mt-1 text-sm text-gray-600"
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
