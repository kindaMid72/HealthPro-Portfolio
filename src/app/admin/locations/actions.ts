'use server';

import { asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { locationExceptions, locations, locationSlots, locationTranslations } from '@/db/schema';
import { actionErrorMessage, UserFacingError } from '@/lib/action-error';
import { revalidatePublicSite } from '@/lib/revalidate';
import { toMinutes } from '@/lib/schedule';
import { requireUser } from '@/lib/session';
import { isUuid } from '@/lib/uuid';
import {
  type ExceptionDraft,
  exceptionDraftError,
  type LocationDraft,
  locationDraftError,
} from './model';

const SCOPE = 'locations/actions';

interface ActionResult {
  success: boolean;
  error?: string;
}

function fail(error: string): ActionResult {
  return { success: false, error };
}

// Same rule as LocationSchema (src/lib/types.ts).
function bookingUrlError(url: string): string | null {
  if (!url) return null;
  if (!z.string().url().safeParse(url).success || !/^https?:\/\//i.test(url)) {
    return 'URL booking lokasi tidak valid. Gunakan alamat lengkap berawalan https://';
  }
  return null;
}

export async function saveLocationAction(draft: LocationDraft): Promise<ActionResult> {
  await requireUser();
  if (draft.id !== undefined && !isUuid(draft.id)) return fail('Lokasi tidak ditemukan.');

  const error = locationDraftError(draft) ?? bookingUrlError(draft.bookingUrlOverride.trim());
  if (error) return fail(error);

  const fields = {
    locationName: draft.locationName.trim(),
    address: draft.address.trim(),
    scheduleNote: draft.scheduleNote.trim(),
    whatsapp: draft.whatsapp.trim(),
    phone: draft.phone.trim(),
    bookingUrlOverride: draft.bookingUrlOverride.trim(),
  };
  const english = {
    locationName: draft.en.locationName.trim(),
    address: draft.en.address.trim(),
    scheduleNote: draft.en.scheduleNote.trim(),
  };

  try {
    await getDb().transaction(async (tx) => {
      let locationId = draft.id;
      if (locationId) {
        const updated = await tx
          .update(locations)
          .set({ ...fields, updatedAt: new Date() })
          .where(eq(locations.id, locationId))
          .returning({ id: locations.id });
        if (updated.length === 0) throw new UserFacingError('Lokasi tidak ditemukan.');
      } else {
        const [last] = await tx
          .select({ sortOrder: locations.sortOrder })
          .from(locations)
          .orderBy(desc(locations.sortOrder))
          .limit(1);
        const [created] = await tx
          .insert(locations)
          .values({ ...fields, sortOrder: last ? last.sortOrder + 1 : 0 })
          .returning({ id: locations.id });
        locationId = created.id;
      }
      // Narrowed to string here; closures below must not capture the reassigned `let`.
      const resolvedId = locationId;

      await tx
        .insert(locationTranslations)
        .values({ locationId: resolvedId, locale: 'en', ...english, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [locationTranslations.locationId, locationTranslations.locale],
          set: { ...english, updatedAt: new Date() },
        });

      // Replace the whole weekly pattern: the unique (location, day, opens) index makes a diff more complex than it is worth.
      await tx.delete(locationSlots).where(eq(locationSlots.locationId, resolvedId));
      const slots = draft.weekly.flatMap((ranges, dayOfWeek) =>
        ranges.map((range) => ({
          locationId: resolvedId,
          dayOfWeek,
          opensMinute: toMinutes(range.opens),
          closesMinute: toMinutes(range.closes),
        })),
      );
      if (slots.length > 0) await tx.insert(locationSlots).values(slots);
    });

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return fail(actionErrorMessage(err, 'Gagal menyimpan lokasi.', SCOPE));
  }
}

export async function deleteLocationAction(id: string): Promise<ActionResult> {
  await requireUser();
  if (!isUuid(id)) return fail('Lokasi tidak ditemukan.');
  try {
    await getDb().delete(locations).where(eq(locations.id, id));
    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return fail(actionErrorMessage(err, 'Gagal menghapus lokasi.', SCOPE));
  }
}

export async function moveLocationAction(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  await requireUser();
  if (!isUuid(id)) return fail('Lokasi tidak ditemukan.');
  if (direction !== 'up' && direction !== 'down') return fail('Arah tidak valid.');
  try {
    const db = getDb();
    const current = await db
      .select({ id: locations.id })
      .from(locations)
      .orderBy(asc(locations.sortOrder));
    const idx = current.findIndex((item) => item.id === id);
    if (idx === -1) return fail('Lokasi tidak ditemukan.');

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= current.length) return { success: true };

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
    return { success: true };
  } catch (err) {
    return fail(actionErrorMessage(err, 'Gagal mengubah urutan.', SCOPE));
  }
}

export async function saveExceptionAction(draft: ExceptionDraft): Promise<ActionResult> {
  await requireUser();
  if (draft.id !== undefined && !isUuid(draft.id)) return fail('Pengecualian tidak ditemukan.');
  if (draft.locationId !== null && !isUuid(draft.locationId)) return fail('Lokasi tidak ditemukan.');

  const error = exceptionDraftError(draft);
  if (error) return fail(error);

  const values = {
    locationId: draft.locationId,
    startDate: draft.startDate,
    endDate: draft.endDate,
    closed: draft.closed,
    // Closed days carry no hours; the DB check constraint requires an empty array for them.
    hours: draft.closed ? [] : draft.hours.map((r) => ({ opens: r.opens, closes: r.closes })),
    reason: draft.reason.trim(),
    reasonEn: draft.reasonEn.trim(),
    updatedAt: new Date(),
  };

  try {
    const db = getDb();
    if (draft.id) {
      const updated = await db
        .update(locationExceptions)
        .set(values)
        .where(eq(locationExceptions.id, draft.id))
        .returning({ id: locationExceptions.id });
      if (updated.length === 0) return fail('Pengecualian tidak ditemukan.');
    } else {
      await db.insert(locationExceptions).values(values);
    }
    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return fail(actionErrorMessage(err, 'Gagal menyimpan pengecualian.', SCOPE));
  }
}

export async function deleteExceptionAction(id: string): Promise<ActionResult> {
  await requireUser();
  if (!isUuid(id)) return fail('Pengecualian tidak ditemukan.');
  try {
    await getDb().delete(locationExceptions).where(eq(locationExceptions.id, id));
    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return fail(actionErrorMessage(err, 'Gagal menghapus pengecualian.', SCOPE));
  }
}
