'use server';

/**
 * app/admin/locations/actions.ts — Server actions untuk manajemen lokasi praktik.
 */

import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { locations } from '@/db/schema';
import { requireUser } from '@/lib/session';
import { revalidatePublicSite } from '@/lib/revalidate';

export interface LocationInput {
  id?: string;
  locationName: string;
  address: string;
  practiceHours: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
}

export async function saveLocationAction(
  input: LocationInput
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();

    if (input.id) {
      await db
        .update(locations)
        .set({
          locationName: input.locationName.trim(),
          address: input.address.trim(),
          practiceHours: input.practiceHours.trim(),
          whatsapp: input.whatsapp.trim(),
          phone: input.phone.trim(),
          bookingUrlOverride: input.bookingUrlOverride.trim(),
          updatedAt: new Date(),
        })
        .where(eq(locations.id, input.id));
    } else {
      const all = await db.select({ sortOrder: locations.sortOrder }).from(locations);
      const nextOrder = all.length > 0 ? Math.max(...all.map((l) => l.sortOrder)) + 1 : 1;

      await db.insert(locations).values({
        sortOrder: nextOrder,
        locationName: input.locationName.trim(),
        address: input.address.trim(),
        practiceHours: input.practiceHours.trim(),
        whatsapp: input.whatsapp.trim(),
        phone: input.phone.trim(),
        bookingUrlOverride: input.bookingUrlOverride.trim(),
      });
    }

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan lokasi';
    return { success: false, error: message };
  }
}

export async function deleteLocationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();
    await db.delete(locations).where(eq(locations.id, id));
    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus lokasi';
    return { success: false, error: message };
  }
}

export async function moveLocationAction(
  id: string,
  direction: 'up' | 'down'
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();
    const all = await db.select().from(locations).orderBy(asc(locations.sortOrder));
    const idx = all.findIndex((l) => l.id === id);
    if (idx === -1) return { success: false, error: 'Lokasi tidak ditemukan' };

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= all.length) return { success: true };

    const currentLoc = all[idx];
    const swapLoc = all[targetIdx];

    await db.transaction(async (tx) => {
      await tx
        .update(locations)
        .set({ sortOrder: swapLoc.sortOrder })
        .where(eq(locations.id, currentLoc.id));
      await tx
        .update(locations)
        .set({ sortOrder: currentLoc.sortOrder })
        .where(eq(locations.id, swapLoc.id));
    });

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah urutan';
    return { success: false, error: message };
  }
}
