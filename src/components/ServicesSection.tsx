/**
 * components/ServicesSection.tsx
 * Daftar layanan/tindakan. Deskripsi singkat hanya tampil bila layak (sudah difilter di content.ts);
 * link "Pelajari" hanya bila layanan punya halaman detail (FR-7).
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicService } from "@/lib/types";
import SectionHeading from "./SectionHeading";

export default function ServicesSection({ services }: { services: PublicService[] }) {
  return (
    <section
      id="layanan"
      aria-labelledby="layanan-heading"
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="layanan-heading"
          title="Layanan pemeriksaan & tindakan"
          intro="Pemeriksaan dan tindakan yang tersedia di tempat praktik."
        />

        {services.length === 0 ? (
          <p id="layanan-empty" className="py-8 text-text-body">
            Informasi layanan segera hadir.
          </p>
        ) : (
          <ul id="services-list" className="grid gap-x-10 md:grid-cols-2">
            {services.map((svc, i) => (
              <li key={svc.slug} id={`service-item-${i}`} className="border-t border-border py-6">
                <h3 id={`service-name-${i}`} className="text-xl font-semibold">
                  {svc.service_name}
                </h3>
                {svc.service_description && (
                  <p id={`service-desc-${i}`} className="mt-2">
                    {svc.service_description}
                  </p>
                )}
                {svc.hasDetail && (
                  <Link href={`/layanan/${svc.slug}`} className="link mt-3 inline-flex items-center gap-1.5">
                    Pelajari {svc.service_name}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
