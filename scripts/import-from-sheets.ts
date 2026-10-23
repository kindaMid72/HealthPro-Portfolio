/**
 * scripts/import-from-sheets.ts — impor sekali dari Google Sheet (CSV publish-to-web) ke database.
 *
 * Pemakaian:
 *   npm run db:import-sheets
 *
 * Membutuhkan SHEET_CSV_URL_PROFILE, SHEET_CSV_URL_LOCATIONS, SHEET_CSV_URL_SERVICES di .env.local.
 * Semua baris divalidasi dengan skema Zod sebelum disimpan; kalau ada yang tidak valid, script
 * gagal tanpa mengubah database (transaksi dibatalkan).
 * Script ini ada hanya untuk migrasi awal; setelah cutover dihapus bersama papaparse.
 */

import Papa from 'papaparse';
import { closeDb, getDb } from '../src/db/client';
import { locations, profile, services } from '../src/db/schema';
import {
  LocationsListSchema,
  ProfileSchema,
  ServicesListSchema,
} from '../src/lib/types';

async function fetchCsvRows(envKey: string): Promise<Record<string, unknown>[]> {
  const url = process.env[envKey];
  if (!url) throw new Error(`${envKey} belum di-set di .env.local`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal fetch ${envKey}: HTTP ${res.status}`);

  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  if (parsed.errors.length > 0) {
    throw new Error(`CSV ${envKey} rusak: ${parsed.errors[0].message}`);
  }
  return parsed.data;
}

async function main() {
  const profileRows = await fetchCsvRows('SHEET_CSV_URL_PROFILE');
  const locationRows = await fetchCsvRows('SHEET_CSV_URL_LOCATIONS');
  const serviceRows = await fetchCsvRows('SHEET_CSV_URL_SERVICES');

  if (profileRows.length !== 1) {
    throw new Error(`Tab Profile harus berisi tepat 1 baris, ditemukan ${profileRows.length}.`);
  }

  const profileParsed = ProfileSchema.parse(profileRows[0]);
  const locationsParsed = LocationsListSchema.parse(locationRows);
  const servicesParsed = ServicesListSchema.parse(serviceRows);

  const db = getDb();
  await db.transaction(async (tx) => {
    const profileValues = {
      id: 1,
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
      .values(profileValues)
      .onConflictDoUpdate({ target: profile.id, set: profileValues });

    // Data Locations & Services diganti penuh (sumber Sheet adalah daftar lengkap).
    await tx.delete(locations);
    if (locationsParsed.length > 0) {
      await tx.insert(locations).values(
        locationsParsed.map((l, i) => ({
          sortOrder: i,
          locationName: l.location_name,
          address: l.address,
          practiceHours: l.practice_hours,
          whatsapp: l.whatsapp ?? '',
          phone: l.phone ?? '',
          bookingUrlOverride: l.booking_url_override ?? '',
        })),
      );
    }

    await tx.delete(services);
    if (servicesParsed.length > 0) {
      await tx.insert(services).values(
        servicesParsed.map((s, i) => ({
          sortOrder: i,
          serviceName: s.service_name,
          serviceDescription: s.service_description ?? '',
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
  console.error(err);
  await closeDb();
  process.exit(1);
});
