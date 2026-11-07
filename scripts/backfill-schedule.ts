/**
 * One-off, idempotent backfill: converts legacy free-text `locations.practice_hours` into
 * structured `location_slots`. Locations that already have slots are left untouched.
 * Unparseable text is kept verbatim in `schedule_note` (nothing is dropped or guessed).
 *
 * Usage: npm run db:backfill-schedule
 */
import { eq, sql } from 'drizzle-orm';
import { closeDb, getDb } from '../src/db/client';
import { locationSlots, locations } from '../src/db/schema';
import { parseLegacyHours } from './lib/legacy-hours';

/** Legacy placeholder written by migration 0004 for "no free-text hours". */
const NO_LEGACY_HOURS = '-';

const toMinute = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

type ReportRow = { name: string; 'slots inserted': number; status: string };

async function main() {
  const db = getDb();
  try {
    const rows = await db
      .select({
        id: locations.id,
        name: locations.locationName,
        practiceHours: sql<string>`practice_hours`,
        scheduleNote: locations.scheduleNote,
      })
      .from(locations)
      .orderBy(locations.sortOrder);

    const withSlots = new Set(
      (await db.selectDistinct({ id: locationSlots.locationId }).from(locationSlots)).map((r) => r.id),
    );

    const report: ReportRow[] = [];
    for (const row of rows) {
      if (withSlots.has(row.id) || row.practiceHours.trim() === NO_LEGACY_HOURS) continue;

      const parsed = parseLegacyHours(row.practiceHours);
      if (!parsed) {
        // Keep the original text for the admin to read; only fill an empty note so admin edits survive.
        if (row.scheduleNote === '') {
          await db.update(locations).set({ scheduleNote: row.practiceHours }).where(eq(locations.id, row.id));
        }
        console.warn(`UNPARSED ${row.name}: ${row.practiceHours}`);
        report.push({ name: row.name, 'slots inserted': 0, status: 'UNPARSED (kept as schedule note)' });
        continue;
      }

      const values = parsed.days.flatMap((day) =>
        parsed.ranges.map((r) => ({
          locationId: row.id,
          dayOfWeek: day,
          opensMinute: toMinute(r.opens),
          closesMinute: toMinute(r.closes),
        })),
      );
      await db.transaction(async (tx) => {
        await tx.insert(locationSlots).values(values);
      });
      report.push({ name: row.name, 'slots inserted': values.length, status: 'OK' });
    }

    if (report.length === 0) console.log('Nothing to backfill: every location already has structured hours.');
    else console.table(report);
  } finally {
    await closeDb();
  }
}

main().catch(async (err) => {
  console.error('Backfill gagal:', err);
  await closeDb();
  process.exit(1);
});
