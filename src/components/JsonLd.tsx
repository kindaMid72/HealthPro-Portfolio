import type { Profile, Location, Service } from "@/lib/types";
import {
  absoluteUrl,
  buildDescription,
  getCredentials,
  getPlainName,
  getServiceAreas,
  mapsSearchUrl,
  getSiteUrl,
  parseAddressLocality,
  parseOpeningHours,
  parseSocialLinks,
  splitList,
  toE164,
} from "@/lib/seo";

interface JsonLdProps {
  profile: Profile;
  locations: Location[];
  services: Service[];
}

/**
 * Structured data (schema.org) untuk mesin pencari & LLM.
 * Satu @graph dengan entitas yang saling terhubung lewat @id:
 * WebSite ↔ ProfilePage ↔ Physician ↔ MedicalClinic (per lokasi).
 * Semua nilai dari data Sheet; field kosong dihilangkan (tidak ada data dikarang).
 */
export default function JsonLd({ profile, locations, services }: JsonLdProps) {
  const siteUrl = getSiteUrl();
  const ids = {
    website: `${siteUrl}/#website`,
    page: `${siteUrl}/#webpage`,
    physician: `${siteUrl}/#physician`,
    clinic: (i: number) => `${siteUrl}/#clinic-${i + 1}`,
  };

  const credentials = getCredentials(profile.full_name);
  const education = splitList(profile.education);
  const experience = splitList(profile.experience_history);
  const organizations = splitList(profile.organizations);
  const certifications = splitList(profile.certifications);
  const sameAs = parseSocialLinks(profile.social_links);
  const description = buildDescription(profile, locations, services);

  const clinics = locations.map((loc, i) => {
    const { locality, region } = parseAddressLocality(loc.address);
    const hours = parseOpeningHours(loc.practice_hours);
    const phone = toE164(loc.phone || loc.whatsapp);
    return {
      "@type": ["MedicalClinic", "LocalBusiness"],
      "@id": ids.clinic(i),
      name: loc.location_name,
      medicalSpecialty: "Otolaryngologic",
      address: {
        "@type": "PostalAddress",
        streetAddress: loc.address,
        addressLocality: locality,
        addressRegion: region,
        addressCountry: "ID",
      },
      hasMap: mapsSearchUrl(loc),
      ...(phone ? { telephone: phone } : {}),
      ...(hours ? { openingHoursSpecification: hours } : {}),
      // Teks asli jam praktik tetap disertakan agar LLM bisa mengutip apa adanya
      description: `Jam praktik ${profile.full_name}: ${loc.practice_hours}`,
      url: siteUrl,
      image: absoluteUrl(profile.photo_url),
      employee: { "@id": ids.physician },
    };
  });

  const physician = {
    "@type": ["Physician", "Person"],
    "@id": ids.physician,
    name: profile.full_name,
    givenName: getPlainName(profile.full_name),
    honorificPrefix: /^dr\.?\s/i.test(profile.full_name) ? "dr." : undefined,
    honorificSuffix: credentials.length ? credentials.join(", ") : undefined,
    jobTitle: profile.specialty,
    description,
    url: siteUrl,
    image: absoluteUrl(profile.photo_url),
    medicalSpecialty: "Otolaryngologic",
    ...(profile.email ? { email: profile.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(education.length
      ? { alumniOf: education.map((e) => ({
            "@type": "EducationalOrganization",
            // buang label jenjang ("S1: Universitas X" → "Universitas X")
            name: e.replace(/^[^:]{1,20}:\s*/, ""),
          })) }
      : {}),
    ...(experience.length
      ? { workHistory: experience.map((e) => ({ "@type": "Organization", name: e })) }
      : {}),
    ...(organizations.length
      ? { memberOf: organizations.map((o) => ({ "@type": "Organization", name: o })) }
      : {}),
    ...(certifications.length
      ? {
          hasCredential: certifications.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c,
          })),
        }
      : {}),
    ...(services.length
      ? {
          knowsAbout: services.map((s) => s.service_name),
          availableService: services.map((s) => ({
            "@type": "MedicalProcedure",
            name: s.service_name,
          })),
        }
      : {}),
    ...(locations.length
      ? {
          areaServed: getServiceAreas(locations).map((a) => ({ "@type": "AdministrativeArea", name: a })),
          availableAtOrFrom: locations.map((_, i) => ({ "@id": ids.clinic(i) })),
          workLocation: locations.map((_, i) => ({ "@id": ids.clinic(i) })),
        }
      : {}),
    ...(profile.booking_url
      ? {
          potentialAction: {
            "@type": "ReserveAction",
            name: "Booking Sekarang",
            target: { "@type": "EntryPoint", urlTemplate: profile.booking_url, actionPlatform: "https://schema.org/DesktopWebPlatform" },
          },
        }
      : {}),
    mainEntityOfPage: { "@id": ids.page },
  };

  const graph = [
    {
      "@type": "WebSite",
      "@id": ids.website,
      url: siteUrl,
      name: profile.full_name,
      inLanguage: "id-ID",
      publisher: { "@id": ids.physician },
    },
    {
      "@type": ["WebPage", "ProfilePage"],
      "@id": ids.page,
      url: siteUrl,
      name: `${profile.full_name} — ${profile.specialty}`,
      description,
      inLanguage: "id-ID",
      isPartOf: { "@id": ids.website },
      about: { "@id": ids.physician },
      mainEntity: { "@id": ids.physician },
      primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(profile.photo_url) },
      dateModified: new Date().toISOString().slice(0, 10),
    },
    physician,
    ...clinics,
  ];

  const schema = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // `<` di-escape agar data dari Sheet tidak bisa menutup tag <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
