import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Papa from 'papaparse';
import { closeDb, getDb } from '../src/db/client';
import { locations, profile, services } from '../src/db/schema';
import {
  LocationsListSchema,
  ProfileSchema,
  ServicesListSchema,
} from '../src/lib/types';

function parseCsvRows(csvText: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  return result.data;
}

async function fetchCsvText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} saat mengambil ${url}`);
  }
  return res.text();
}

async function loadInitialSourceData() {
  const profileUrl = process.env.SHEET_CSV_URL_PROFILE;
  const locationsUrl = process.env.SHEET_CSV_URL_LOCATIONS;
  const servicesUrl = process.env.SHEET_CSV_URL_SERVICES;

  if (profileUrl && locationsUrl && servicesUrl) {
    try {
      const [profileCsv, locationsCsv, servicesCsv] = await Promise.all([
        fetchCsvText(profileUrl),
        fetchCsvText(locationsUrl),
        fetchCsvText(servicesUrl),
      ]);

      return {
        rawProfile: parseCsvRows(profileCsv)[0] ?? {},
        rawLocations: parseCsvRows(locationsCsv),
        rawServices: parseCsvRows(servicesCsv),
      };
    } catch (err) {
      console.warn(
        '[import-from-sheets] Gagal menarik dari Google Sheets, beralih ke fallback JSON lokal:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  const dataDir = join(process.cwd(), 'data');
  const rawProfile = JSON.parse(
    readFileSync(join(dataDir, 'fallback-profile.json'), 'utf8'),
  );
  const rawLocations = JSON.parse(
    readFileSync(join(dataDir, 'fallback-locations.json'), 'utf8'),
  );
  const rawServices = JSON.parse(
    readFileSync(join(dataDir, 'fallback-services.json'), 'utf8'),
  );

  return { rawProfile, rawLocations, rawServices };
}

async function main() {
  const force = process.argv.includes('--force');
  const db = getDb();

  // Skrip ini MENIMPA profil dan MENGHAPUS semua lokasi & layanan. Kalau DB
  // sudah berisi data (mis. hasil edit dokter lewat /admin), jangan lanjut
  // tanpa --force supaya edit tidak hilang diam-diam.
  if (!force) {
    const [existingProfile] = await db
      .select({ fullName: profile.fullName })
      .from(profile)
      .limit(1);
    const existingLocations = await db
      .select({ id: locations.id })
      .from(locations)
      .limit(1);
    const existingServices = await db
      .select({ id: services.id })
      .from(services)
      .limit(1);

    if (
      existingProfile?.fullName.trim() ||
      existingLocations.length > 0 ||
      existingServices.length > 0
    ) {
      console.error(
        'Database sudah berisi data profil/lokasi/layanan. Impor akan menimpanya ' +
          '(termasuk hasil edit di /admin). Jalankan ulang dengan --force bila memang disengaja:\n' +
          '  npm run db:import-sheets -- --force',
      );
      await closeDb();
      process.exit(1);
    }
  }

  const { rawProfile, rawLocations, rawServices } = await loadInitialSourceData();

  const profileParsed = ProfileSchema.parse(rawProfile);
  const locationsParsed = LocationsListSchema.parse(rawLocations);
  const servicesParsed = ServicesListSchema.parse(rawServices);

  await db.transaction(async (tx) => {
    const profileValues = {
      fullName: profileParsed.full_name,
      specialty: profileParsed.specialty,
      subSpecialty: profileParsed.sub_specialty ?? '',
      strSipDisplay: profileParsed.str_sip_display ?? '',
      education: profileParsed.education,
      certifications: profileParsed.certifications ?? '',
      experienceHistory: profileParsed.experience_history,
      organizations: profileParsed.organizations ?? '',
      bookingUrl: profileParsed.booking_url ?? '',
      email: profileParsed.email ?? '',
      socialLinks: profileParsed.social_links ?? '',
      personalStory: profileParsed.personal_story ?? '',
      updatedAt: new Date(),
    };

    await tx
      .insert(profile)
      .values({ id: 1, ...profileValues })
      .onConflictDoUpdate({
        target: profile.id,
        set: profileValues,
      });

    await tx.delete(locations);
    if (locationsParsed.length > 0) {
      await tx.insert(locations).values(
        locationsParsed.map((loc, i) => ({
          sortOrder: i,
          locationName: loc.location_name,
          address: loc.address,
          practiceHours: loc.practice_hours,
          whatsapp: loc.whatsapp ?? '',
          phone: loc.phone ?? '',
          bookingUrlOverride: loc.booking_url_override ?? '',
        })),
      );
    }

    await tx.delete(services);
    if (servicesParsed.length > 0) {
      await tx.insert(services).values(
        servicesParsed.map((svc, i) => ({
          sortOrder: i,
          serviceName: svc.service_name,
          serviceDescription: svc.service_description,
        })),
      );
    }
  });

  console.log(
    `Impor selesai: profile 1, locations ${locationsParsed.length}, services ${servicesParsed.length}.`,
  );
  await closeDb();
}

main().catch(async (err) => {
  console.error('Gagal impor data:', err);
  await closeDb();
  process.exit(1);
});
