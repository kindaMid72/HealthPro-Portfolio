import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { locations as locationsTable } from '@/db/schema';
import LocationsManager from './LocationsManager';

export default async function AdminLocationsPage() {
  const rows = await getDb()
    .select({
      id: locationsTable.id,
      sortOrder: locationsTable.sortOrder,
      locationName: locationsTable.locationName,
      address: locationsTable.address,
      practiceHours: locationsTable.practiceHours,
      whatsapp: locationsTable.whatsapp,
      phone: locationsTable.phone,
      bookingUrlOverride: locationsTable.bookingUrlOverride,
    })
    .from(locationsTable)
    .orderBy(asc(locationsTable.sortOrder));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-primary-dark">
          Jadwal & Lokasi Praktik
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Kelola daftar rumah sakit/klinik tempat praktik, jam layanan, dan
          kontak pendaftaran masing-masing lokasi.
        </p>
      </div>

      <LocationsManager initialLocations={rows} />
    </div>
  );
}
