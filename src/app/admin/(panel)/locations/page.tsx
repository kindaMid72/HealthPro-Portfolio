/**
 * app/admin/(panel)/locations/page.tsx — Halaman kelola lokasi praktik admin.
 */

import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { locations } from '@/db/schema';
import { LocationsManager } from './LocationsManager';

export const metadata: Metadata = {
  title: 'Lokasi Praktik',
};

export default async function AdminLocationsPage() {
  const db = getDb();
  const rows = await db.select().from(locations).orderBy(asc(locations.sortOrder));

  return (
    <div>
      <LocationsManager
        initialLocations={rows.map((r) => ({
          id: r.id,
          sortOrder: r.sortOrder,
          locationName: r.locationName,
          address: r.address,
          practiceHours: r.practiceHours,
          whatsapp: r.whatsapp,
          phone: r.phone,
          bookingUrlOverride: r.bookingUrlOverride,
        }))}
      />
    </div>
  );
}
