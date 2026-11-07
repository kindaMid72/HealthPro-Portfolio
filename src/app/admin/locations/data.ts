import { asc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { locationExceptions, locations, locationSlots, locationTranslations } from '@/db/schema';
import { minutesToHhmm } from '@/lib/schedule';
import { emptyWeek, type ExceptionItem, type LocationItem, type WeeklyRanges } from './model';

/** Everything the admin locations page edits, loaded in one pass. */
export async function loadLocationsAdminData(): Promise<{
  locations: LocationItem[];
  exceptions: ExceptionItem[];
}> {
  const db = getDb();
  const [locationRows, slotRows, translationRows, exceptionRows] = await Promise.all([
    db.select().from(locations).orderBy(asc(locations.sortOrder)),
    db.select().from(locationSlots).orderBy(asc(locationSlots.opensMinute)),
    db.select().from(locationTranslations).where(eq(locationTranslations.locale, 'en')),
    db
      .select()
      .from(locationExceptions)
      .orderBy(asc(locationExceptions.startDate), asc(locationExceptions.createdAt)),
  ]);

  const weeklyByLocation = new Map<string, WeeklyRanges>();
  for (const slot of slotRows) {
    const weekly = weeklyByLocation.get(slot.locationId) ?? emptyWeek();
    weekly[slot.dayOfWeek].push({
      opens: minutesToHhmm(slot.opensMinute),
      closes: minutesToHhmm(slot.closesMinute),
    });
    weeklyByLocation.set(slot.locationId, weekly);
  }

  const translationByLocation = new Map(translationRows.map((t) => [t.locationId, t] as const));

  return {
    locations: locationRows.map((row) => {
      const en = translationByLocation.get(row.id);
      return {
        id: row.id,
        sortOrder: row.sortOrder,
        locationName: row.locationName,
        address: row.address,
        scheduleNote: row.scheduleNote,
        whatsapp: row.whatsapp,
        phone: row.phone,
        bookingUrlOverride: row.bookingUrlOverride,
        weekly: weeklyByLocation.get(row.id) ?? emptyWeek(),
        en: {
          locationName: en?.locationName ?? '',
          address: en?.address ?? '',
          scheduleNote: en?.scheduleNote ?? '',
        },
      };
    }),
    exceptions: exceptionRows.map((row) => ({
      id: row.id,
      locationId: row.locationId,
      startDate: row.startDate,
      endDate: row.endDate,
      closed: row.closed,
      hours: row.hours,
      reason: row.reason,
      reasonEn: row.reasonEn,
    })),
  };
}
