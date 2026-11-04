'use server';

import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { locations } from '@/db/schema';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';

export interface LocationItem {
  id: string;
  sortOrder: number;
  locationName: string;
  address: string;
  practiceHours: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
}

async function fetchLocationsOrdered(): Promise<LocationItem[]> {
  return getDb()
    .select({
      id: locations.id,
      sortOrder: locations.sortOrder,
      locationName: locations.locationName,
      address: locations.address,
      practiceHours: locations.practiceHours,
      whatsapp: locations.whatsapp,
      phone: locations.phone,
      bookingUrlOverride: locations.bookingUrlOverride,
    })
    .from(locations)
    .orderBy(asc(locations.sortOrder));
}

export async function saveLocationAction(input: {
  id?: string;
  locationName: string;
  address: string;
  practiceHours: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
}): Promise<{
  success: boolean;
  error?: string;
  items?: LocationItem[];
}> {
  await requireUser();

  const locationName = input.locationName.trim();
  const address = input.address.trim();
  const practiceHours = input.practiceHours.trim();

  if (!locationName || !address || !practiceHours) {
    return {
      success: false,
      error: 'Nama lokasi, alamat, dan jam praktik wajib diisi.',
    };
  }

  // Aturan yang sama dengan LocationSchema (src/lib/types.ts).
  const bookingUrlOverride = input.bookingUrlOverride.trim();
  if (
    bookingUrlOverride &&
    (!z.string().url().safeParse(bookingUrlOverride).success ||
      !/^https?:\/\//i.test(bookingUrlOverride))
  ) {
    return {
      success: false,
      error:
        'URL booking lokasi tidak valid. Gunakan alamat lengkap berawalan https://',
    };
  }

  try {
    const db = getDb();
    if (input.id) {
      await db
        .update(locations)
        .set({
          locationName,
          address,
          practiceHours,
          whatsapp: input.whatsapp.trim(),
          phone: input.phone.trim(),
          bookingUrlOverride,
          updatedAt: new Date(),
        })
        .where(eq(locations.id, input.id));
    } else {
      const current = await fetchLocationsOrdered();
      const nextSort =
        current.length > 0
          ? Math.max(...current.map((c) => c.sortOrder)) + 1
          : 0;
      await db.insert(locations).values({
        sortOrder: nextSort,
        locationName,
        address,
        practiceHours,
        whatsapp: input.whatsapp.trim(),
        phone: input.phone.trim(),
        bookingUrlOverride,
      });
    }

    revalidatePublicSite();
    const items = await fetchLocationsOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyimpan lokasi.',
    };
  }
}

export async function deleteLocationAction(id: string): Promise<{
  success: boolean;
  error?: string;
  items?: LocationItem[];
}> {
  await requireUser();
  try {
    await getDb().delete(locations).where(eq(locations.id, id));
    revalidatePublicSite();
    const items = await fetchLocationsOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menghapus lokasi.',
    };
  }
}

export async function moveLocationAction(
  id: string,
  direction: 'up' | 'down',
): Promise<{
  success: boolean;
  error?: string;
  items?: LocationItem[];
}> {
  await requireUser();
  try {
    const db = getDb();
    const current = await fetchLocationsOrdered();
    const idx = current.findIndex((item) => item.id === id);
    if (idx === -1) return { success: false, error: 'Lokasi tidak ditemukan.' };

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
          .update(locations)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(locations.id, reordered[i].id));
      }
    });

    revalidatePublicSite();
    const items = await fetchLocationsOrdered();
    return { success: true, items };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal mengubah urutan.',
    };
  }
}
