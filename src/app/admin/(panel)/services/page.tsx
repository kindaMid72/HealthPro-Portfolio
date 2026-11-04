import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { services as servicesTable } from '@/db/schema';
import ServicesManager from './ServicesManager';

export default async function AdminServicesPage() {
  const rows = await getDb()
    .select({
      id: servicesTable.id,
      sortOrder: servicesTable.sortOrder,
      serviceName: servicesTable.serviceName,
      serviceDescription: servicesTable.serviceDescription,
    })
    .from(servicesTable)
    .orderBy(asc(servicesTable.sortOrder));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-primary-dark">
          Layanan & Tindakan Medis
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Kelola daftar layanan pemeriksaan serta tindakan medis THT-BKL beserta
          penjelasannya untuk pasien.
        </p>
      </div>

      <ServicesManager initialServices={rows} />
    </div>
  );
}
