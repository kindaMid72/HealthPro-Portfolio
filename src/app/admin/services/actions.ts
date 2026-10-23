'use server';

/**
 * app/admin/services/actions.ts — Server actions untuk manajemen layanan medis.
 */

import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { services } from '@/db/schema';
import { requireUser } from '@/lib/session';
import { revalidatePublicSite } from '@/lib/revalidate';

export interface ServiceInput {
  id?: string;
  serviceName: string;
  serviceDescription: string;
}

export async function saveServiceAction(
  input: ServiceInput
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();

    if (input.id) {
      await db
        .update(services)
        .set({
          serviceName: input.serviceName.trim(),
          serviceDescription: input.serviceDescription.trim(),
          updatedAt: new Date(),
        })
        .where(eq(services.id, input.id));
    } else {
      const all = await db.select({ sortOrder: services.sortOrder }).from(services);
      const nextOrder = all.length > 0 ? Math.max(...all.map((s) => s.sortOrder)) + 1 : 1;

      await db.insert(services).values({
        sortOrder: nextOrder,
        serviceName: input.serviceName.trim(),
        serviceDescription: input.serviceDescription.trim(),
      });
    }

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan layanan';
    return { success: false, error: message };
  }
}

export async function deleteServiceAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();
    await db.delete(services).where(eq(services.id, id));
    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus layanan';
    return { success: false, error: message };
  }
}

export async function moveServiceAction(
  id: string,
  direction: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();
    const all = await db.select().from(services).orderBy(asc(services.sortOrder));
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return { success: false, error: 'Layanan tidak ditemukan' };

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= all.length) return { success: true };

    const currentSvc = all[idx];
    const swapSvc = all[targetIdx];

    await db.transaction(async (tx) => {
      await tx
        .update(services)
        .set({ sortOrder: swapSvc.sortOrder })
        .where(eq(services.id, currentSvc.id));
      await tx
        .update(services)
        .set({ sortOrder: currentSvc.sortOrder })
        .where(eq(services.id, swapSvc.id));
    });

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah urutan';
    return { success: false, error: message };
  }
}
