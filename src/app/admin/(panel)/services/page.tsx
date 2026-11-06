import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { services as servicesTable } from '@/db/schema';
import PageHeader from '@/components/admin/PageHeader';
import { countWords } from '@/lib/tiptap';
import ServicesManager from './ServicesManager';
import { requireUser } from '@/lib/session';

export default async function AdminServicesPage() {
  await requireUser();
  const rows = await getDb()
    .select({
      id: servicesTable.id,
      sortOrder: servicesTable.sortOrder,
      serviceName: servicesTable.serviceName,
      serviceDescription: servicesTable.serviceDescription,
      slug: servicesTable.slug,
      content: servicesTable.content,
      category: servicesTable.category,
      updatedAt: servicesTable.updatedAt,
    })
    .from(servicesTable)
    .orderBy(asc(servicesTable.sortOrder));

  const items = rows.map(({ content, ...rest }) => ({ ...rest, hasDetail: countWords(content) > 0 }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan & Tindakan Medis"
        description="Kelola daftar layanan pemeriksaan serta tindakan medis THT-BKL. Layanan dengan konten detail punya halaman sendiri di website."
      />

      <ServicesManager initialServices={items} />
    </div>
  );
}
