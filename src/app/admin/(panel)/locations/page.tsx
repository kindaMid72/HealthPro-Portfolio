import PageHeader from '@/components/admin/PageHeader';
import { loadLocationsAdminData } from '@/app/admin/locations/data';
import { requireUser } from '@/lib/session';
import ExceptionsManager from './ExceptionsManager';
import LocationsManager from './LocationsManager';

export default async function AdminLocationsPage() {
  await requireUser();
  const { locations, exceptions } = await loadLocationsAdminData();

  return (
    <div className="space-y-10">
      <PageHeader
        title="Jadwal & Lokasi Praktik"
        description="Kelola lokasi praktik, jam praktik mingguan, dan pengecualian tanggal (libur atau jam khusus) yang tampil di website."
      />

      <section aria-labelledby="locations-heading" className="space-y-6">
        <h2 id="locations-heading" className="text-lg font-bold text-text-heading">
          Lokasi praktik
        </h2>
        <LocationsManager locations={locations} />
      </section>

      <section aria-labelledby="exceptions-heading" className="space-y-6">
        <div>
          <h2 id="exceptions-heading" className="text-lg font-bold text-text-heading">
            Pengecualian tanggal
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Libur atau jam khusus pada tanggal tertentu. Memengaruhi jadwal di website dan status “Praktik hari ini”.
          </p>
        </div>
        <ExceptionsManager
          exceptions={exceptions}
          locations={locations.map((loc) => ({ id: loc.id, name: loc.locationName }))}
        />
      </section>
    </div>
  );
}
