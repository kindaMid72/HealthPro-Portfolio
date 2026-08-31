/**
 * lib/sheets.ts
 * Satu-satunya entry point untuk semua akses data dari Google Sheets.
 *
 * Prinsip kunci (docs/07-data-architecture.md):
 * - Komponen React TIDAK PERNAH fetch Sheet langsung.
 * - Semua akses data lewat file ini sebagai satu titik kontrol.
 * - Kalau sumber data ganti (Sheets API, CMS), cukup ubah file ini.
 *
 * Urutan prioritas data:
 * 1. USE_LOCAL_FIXTURE=true → pakai dev-fixture lokal (dev/testing tanpa network)
 * 2. SHEET_CSV_URL_* tersedia → fetch dari Google Sheets publish-to-web CSV
 * 3. Fetch gagal / validasi Zod gagal → fallback ke snapshot JSON di /data/
 */

import Papa from 'papaparse';
import {
  Profile,
  ProfileSchema,
  Location,
  LocationsListSchema,
  Service,
  ServicesListSchema,
  SiteData,
} from './types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const USE_LOCAL_FIXTURE =
  process.env.USE_LOCAL_FIXTURE === 'true' ||
  process.env.NODE_ENV === 'test';

const SHEET_URLS = {
  profile: process.env.SHEET_CSV_URL_PROFILE ?? '',
  locations: process.env.SHEET_CSV_URL_LOCATIONS ?? '',
  services: process.env.SHEET_CSV_URL_SERVICES ?? '',
} as const;

const REVALIDATE_SECONDS = 3600; // ISR: refresh tiap 1 jam

// ---------------------------------------------------------------------------
// CSV Parsers
// ---------------------------------------------------------------------------

/**
 * Untuk tab dengan 1 baris data (Profile):
 * Format Sheet: baris pertama = header (nama kolom), baris kedua = nilai.
 * Output: 1 object dengan field sesuai header.
 */
function parseCsvToObject(csvText: string): Record<string, string> {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  if (result.errors.length > 0) {
    console.warn('[sheets] CSV parse warnings:', result.errors);
  }
  return result.data[0] ?? {};
}

/**
 * Untuk tab dengan banyak baris (Locations, Services):
 * Format Sheet: baris pertama = header, baris berikutnya = data.
 * Output: array of objects.
 */
function parseCsvToObjectArray(csvText: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  if (result.errors.length > 0) {
    console.warn('[sheets] CSV parse warnings:', result.errors);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Fallback Loaders (dari snapshot JSON di repo)
// ---------------------------------------------------------------------------

async function loadFallbackProfile(): Promise<Profile> {
  try {
    // Dynamic import supaya tidak di-bundle kalau tidak dipakai
    const data = await import('../../data/fallback-profile.json');
    return data.default as Profile;
  } catch {
    // Minimal safe fallback — tidak akan crash UI
    return {
      full_name: '[BELUM DIISI]',
      specialty: '[BELUM DIISI]',
      photo_url: '/images/dr-profile-placeholder.jpg',
      education: '[BELUM DIISI]',
      experience_history: '[BELUM DIISI]',
      booking_url: undefined,
      email: undefined,
    };
  }
}

async function loadFallbackLocations(): Promise<Location[]> {
  try {
    const data = await import('../../data/fallback-locations.json');
    return data.default as Location[];
  } catch {
    return [];
  }
}

async function loadFallbackServices(): Promise<Service[]> {
  try {
    const data = await import('../../data/fallback-services.json');
    return data.default as Service[];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Dev Fixture Loader
// ---------------------------------------------------------------------------

async function loadDevFixture(): Promise<SiteData> {
  const fixture = await import('../../data/dev-fixture.json');
  const f = fixture.default as { profile: unknown; locations: unknown; services: unknown };

  const profileResult = ProfileSchema.safeParse(f.profile);
  const locationsResult = LocationsListSchema.safeParse(f.locations);
  const servicesResult = ServicesListSchema.safeParse(f.services);

  return {
    profile: profileResult.success ? profileResult.data : await loadFallbackProfile(),
    locations: locationsResult.success ? locationsResult.data : [],
    services: servicesResult.success ? servicesResult.data : [],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<Profile> {
  if (USE_LOCAL_FIXTURE) {
    const fixture = await loadDevFixture();
    return fixture.profile;
  }

  if (!SHEET_URLS.profile) {
    console.warn('[sheets] SHEET_CSV_URL_PROFILE tidak di-set, pakai fallback.');
    return loadFallbackProfile();
  }

  try {
    const res = await fetch(SHEET_URLS.profile, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const csvText = await res.text();
    const rawObj = parseCsvToObject(csvText);
    const result = ProfileSchema.safeParse(rawObj);

    if (!result.success) {
      console.error('[sheets] Data Profile tidak valid:', result.error.flatten());
      return loadFallbackProfile();
    }
    return result.data;
  } catch (err) {
    console.error('[sheets] Gagal fetch Profile:', err);
    return loadFallbackProfile();
  }
}

export async function getLocations(): Promise<Location[]> {
  if (USE_LOCAL_FIXTURE) {
    const fixture = await loadDevFixture();
    return fixture.locations;
  }

  if (!SHEET_URLS.locations) {
    console.warn('[sheets] SHEET_CSV_URL_LOCATIONS tidak di-set, pakai fallback.');
    return loadFallbackLocations();
  }

  try {
    const res = await fetch(SHEET_URLS.locations, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const csvText = await res.text();
    const rows = parseCsvToObjectArray(csvText);
    const result = LocationsListSchema.safeParse(rows);

    if (!result.success) {
      console.error('[sheets] Data Locations tidak valid:', result.error.flatten());
      return loadFallbackLocations();
    }
    return result.data;
  } catch (err) {
    console.error('[sheets] Gagal fetch Locations:', err);
    return loadFallbackLocations();
  }
}

export async function getServices(): Promise<Service[]> {
  if (USE_LOCAL_FIXTURE) {
    const fixture = await loadDevFixture();
    return fixture.services;
  }

  if (!SHEET_URLS.services) {
    console.warn('[sheets] SHEET_CSV_URL_SERVICES tidak di-set, pakai fallback.');
    return loadFallbackServices();
  }

  try {
    const res = await fetch(SHEET_URLS.services, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const csvText = await res.text();
    const rows = parseCsvToObjectArray(csvText);
    const result = ServicesListSchema.safeParse(rows);

    if (!result.success) {
      console.error('[sheets] Data Services tidak valid:', result.error.flatten());
      return loadFallbackServices();
    }
    return result.data;
  } catch (err) {
    console.error('[sheets] Gagal fetch Services:', err);
    return loadFallbackServices();
  }
}

/**
 * getAllSiteData — fetch semua data sekaligus untuk page.tsx.
 * Dipakai di server component, bukan di client component.
 */
export async function getAllSiteData(): Promise<SiteData> {
  const [profile, locations, services] = await Promise.all([
    getProfile(),
    getLocations(),
    getServices(),
  ]);
  return { profile, locations, services };
}
