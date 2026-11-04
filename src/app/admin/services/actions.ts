'use server';

import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { services } from '@/db/schema';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';

export interface ServiceItem {
  id: string;
  sortOrder: number;
  serviceName: string;
  serviceDescription: string;
}

async function fetchServicesOrdered(): Promise<ServiceItem[]> {
  return getDb()
    .select({
      id: services.id,
      sortOrder: services.sortOrder,
      serviceName: services.serviceName,
      serviceDescription: services.serviceDescription,
    })
    .from(services)
    .orderBy(asc(services.sortOrder));
}

export async function saveServiceAction(input: {
  id?: string;
  serviceName: string;
  serviceDescription: string;
}): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();

  const serviceName = input.serviceName.trim();
  const serviceDescription = input.serviceDescription.trim();

  if (!serviceName) {
    return {
      success: false,
      error: 'Nama layanan wajib diisi.',
    };
  }

  try {
    const db = getDb();
    if (input.id) {
      await db
        .update(services)
        .set({
          serviceName,
          serviceDescription,
          updatedAt: new Date(),
        })
        .where(eq(services.id, input.id));
    } else {
      const current = await fetchServicesOrdered();
      const nextSort =
        current.length > 0
          ? Math.max(...current.map((c) => c.sortOrder)) + 1
          : 0;
      await db.insert(services).values({
        sortOrder: nextSort,
        serviceName,
        serviceDescription,
      });
    }

    revalidatePublicSite();
    const items = await fetchServicesOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyimpan layanan.',
    };
  }
}

export async function deleteServiceAction(id: string): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();
  try {
    await getDb().delete(services).where(eq(services.id, id));
    revalidatePublicSite();
    const items = await fetchServicesOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus layanan.',
    };
  }
}

export async function moveServiceAction(
  id: string,
  direction: 'up' | 'down',
): Promise<{
  success: boolean;
  error?: string;
  items?: ServiceItem[];
}> {
  await requireUser();
  try {
    const db = getDb();
    const current = await fetchServicesOrdered();
    const idx = current.findIndex((item) => item.id === id);
    if (idx === -1) return { success: false, error: 'Layanan tidak ditemukan.' };

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= current.length) {
      return { success: true, items: current };
    }

    const reordered = [...current];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(swapIdx, 0, moved);

    await db.transaction(async (tx) => {
      for (let i = 0; i < reordered.length; i++) {
        await tx
          .update(services)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(services.id, reordered[i].id));
      }
    });

    revalidatePublicSite();
    const items = await fetchServicesOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengubah urutan.',
    };
  }
}
