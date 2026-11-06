/**
 * components/ServicesSection.tsx
 * Daftar layanan/tindakan, dikelompokkan per domain klinis (daftar, bukan kartu).
 * Deskripsi singkat hanya tampil bila layak (sudah difilter di content.ts);
 * link "Pelajari" hanya bila layanan punya halaman detail (FR-7).
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicService } from "@/lib/types";
import SectionHeading from "./SectionHeading";

interface Domain {
  label: string;
}

const EAR: Domain = { label: "Telinga & Pendengaran" };
const NOSE: Domain = { label: "Hidung & Sinus" };
const THROAT: Domain = { label: "Tenggorok & Kepala-Leher" };
const GENERAL: Domain = { label: "Tindakan umum" };

const DOMAIN_ORDER = [EAR, NOSE, THROAT, GENERAL];

/** Domain klinis dari kategori layanan; bila kosong/umum → tebak dari nama layanan. */
function getDomain(svc: PublicService): Domain {
  switch (svc.category) {
    case "telinga":
      return EAR;
    case "hidung":
      return NOSE;
    case "tenggorok":
    case "kepala-leher":
      return THROAT;
    default:
      break;
  }
  const name = svc.service_name.toLowerCase();
  if (/audiometri|cerumen|kolesteatoma|telinga|timpan|otitis|pendengaran|epley|kanalit|vertigo/.test(name)) return EAR;
  if (/nasoendoskopi|sinus|hidung|polip|septum|epistaksis|nasal|rh?initis/.test(name)) return NOSE;
  if (/laringoskopi|tonsil|peritonsil|tenggorok|leher|faring|tiroid|suara/.test(name)) return THROAT;
  return GENERAL;
}

export default function ServicesSection({ services }: { services: PublicService[] }) {
  const groups = DOMAIN_ORDER.map((domain) => ({
    domain,
    items: services.map((svc, i) => ({ svc, i })).filter(({ svc }) => getDomain(svc) === domain),
  })).filter((g) => g.items.length > 0);
  const single = groups.length === 1;

  return (
    <section
      id="layanan"
      aria-labelledby="layanan-heading"
      className="section-spacing border-t border-border bg-surface px-4 md:px-6"
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
          <div id="services-list">
            {groups.map((group, gi) => (
              <section
                key={group.domain.label}
                aria-labelledby={single ? "layanan-heading" : `service-domain-${gi}`}
                className="grid gap-4 border-t border-border py-10 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-10"
              >
                {!single && (
                  <h3
                    id={`service-domain-${gi}`}
                    className="font-display text-2xl font-semibold lg:col-span-4"
                  >
                    {group.domain.label}
                  </h3>
                )}
                <ul className={`divide-y divide-border ${single ? "lg:col-span-12" : "lg:col-span-8"}`}>
                  {group.items.map(({ svc, i }) => (
                    <li key={svc.slug} id={`service-item-${i}`} className="py-5 first:pt-0 last:pb-0">
                      <h4 id={`service-name-${i}`} className="text-lg font-semibold leading-snug text-text-heading">
                        {svc.service_name}
                      </h4>
                      {svc.service_description && (
                        <p id={`service-desc-${i}`} className="mt-1.5 max-w-prose leading-relaxed text-text-body">
                          {svc.service_description}
                        </p>
                      )}
                      {svc.hasDetail && svc.slug && (
                        <Link
                          href={`/layanan/${svc.slug}`}
                          aria-label={`Pelajari prosedur ${svc.service_name}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                        >
                          Pelajari prosedur
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
