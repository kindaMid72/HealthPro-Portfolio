import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { locations as locationsTable } from '@/db/schema';
import PageHeader from '@/components/admin/PageHeader';
import LocationsManager from './LocationsManager';
import { requireUser } from '@/lib/session';

export default async function AdminLocationsPage() {
  await requireUser();
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
      <PageHeader
        title="Jadwal & Lokasi Praktik"
        description="Kelola daftar rumah sakit/klinik tempat praktik, jam layanan, dan kontak pendaftaran masing-masing lokasi."
      />

      <LocationsManager initialLocations={rows} />
    </div>
  );
}
