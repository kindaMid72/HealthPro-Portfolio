import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { getDb } from '@/db/client';
import { services as servicesTable } from '@/db/schema';
import ServiceEditor from './ServiceEditor';
import { requireUser } from '@/lib/session';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [row] = await getDb().select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);
  if (!row) notFound();

  return (
    <ServiceEditor
      initialService={{
        id: row.id,
        serviceName: row.serviceName,
        slug: row.slug,
        serviceDescription: row.serviceDescription,
        category: row.category ?? null,
        content: row.content as JSONContent,
      }}
    />
  );
}
