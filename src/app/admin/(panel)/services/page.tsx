/**
 * app/admin/(panel)/services/page.tsx — Halaman kelola layanan spesialis THT.
 */

import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { services } from '@/db/schema';
import { ServicesManager } from './ServicesManager';

export const metadata: Metadata = {
  title: 'Layanan Medis',
};

export default async function AdminServicesPage() {
  const db = getDb();
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder));

  return (
    <div>
      <ServicesManager
        initialServices={rows.map((r) => ({
          id: r.id,
          sortOrder: r.sortOrder,
          serviceName: r.serviceName,
          serviceDescription: r.serviceDescription,
        }))}
      />
    </div>
  );
}
