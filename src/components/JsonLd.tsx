import { Profile, Location } from "@/lib/types";

interface JsonLdProps {
  profile: Profile;
  locations: Location[];
}

/**
 * Parses an Indonesian address string to extract Locality and Region.
 * Assumes format usually ends with Regency/Province, preceded by District/Subdistrict.
 */
function parseAddressLocality(address: string) {
  const parts = address.split(',').map(p => p.trim());
  let locality = "";
  let region = "";

  if (parts.length >= 2) {
    // The last part is usually the region (e.g., "Kab. Tanah Bumbu")
    region = parts[parts.length - 1];
    
    // The second to last part is usually the locality/district (e.g., "Kec. Simpang Empat" or "Angsana")
    locality = parts[parts.length - 2];
    
    // Clean up common prefixes for better SEO matching
    locality = locality.replace(/^(Kec\.|Kecamatan)\s+/i, '');
    region = region.replace(/^(Kab\.|Kabupaten|Kota)\s+/i, '');
  } else {
    // Fallback if no commas
    locality = address;
    region = "Kalimantan Selatan";
  }

  return { locality, region };
}

export default function JsonLd({ profile, locations }: JsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dryuliana.my.id";
  
  // Format the locations array for Schema.org
  const availableAtOrFrom = locations.map((loc) => {
    const { locality, region } = parseAddressLocality(loc.address);
    
    return {
      "@type": "MedicalClinic",
      "name": loc.location_name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": loc.address, // We keep the full address as street address for completeness
        "addressLocality": locality,
        "addressRegion": region,
        "addressCountry": "ID"
      },
      ...(loc.phone || loc.whatsapp ? { "telephone": loc.phone || loc.whatsapp } : {})
    };
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": profile.full_name,
    "medicalSpecialty": "Otolaryngologic",
    "url": siteUrl,
    "image": `${siteUrl}${profile.photo_url}`,
    ...(profile.email ? { "email": profile.email } : {}),
    "availableAtOrFrom": availableAtOrFrom,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
