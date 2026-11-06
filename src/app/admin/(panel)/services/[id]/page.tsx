import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { JSONContent } from '@tiptap/core';
import { getDb } from '@/db/client';
import {
  services as servicesTable,
  serviceTranslations as serviceTranslationsTable,
} from '@/db/schema';
import { requireUser } from '@/lib/session';
import { EMPTY_TIPTAP_DOC } from '@/lib/tiptap';
import { isUuid } from '@/lib/uuid';
import ServiceEditor from './ServiceEditor';

export default async function AdminServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const db = getDb();
  const [[row], [enRow]] = await Promise.all([
    db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1),
    db
      .select()
      .from(serviceTranslationsTable)
      .where(
        and(
          eq(serviceTranslationsTable.serviceId, id),
          eq(serviceTranslationsTable.locale, 'en'),
        ),
      )
      .limit(1),
  ]);

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
        en: {
          serviceName: enRow?.serviceName ?? '',
          serviceDescription: enRow?.serviceDescription ?? '',
          content: (enRow?.content as JSONContent) ?? EMPTY_TIPTAP_DOC,
        },
      }}
    />
  );
}
