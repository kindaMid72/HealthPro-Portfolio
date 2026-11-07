import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDays,
  dayIndexOf,
  getTodayStatus,
  getWitaClock,
  resolveDay,
  type ScheduleException,
  type ScheduleLocation,
  summarizeWeekly,
  validateRanges,
} from './schedule';

const ID_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
const EN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** Mon–Sat, 09:00–11:00 and 17:00–21:00. 2026-11-09 is a Monday. */
const monToSatTwoRanges = [0, 1, 2, 3, 4, 5].flatMap((day) => [
  { day, opens: '09:00', closes: '11:00' },
  { day, opens: '17:00', closes: '21:00' },
]);

const monToSatOneRange = [0, 1, 2, 3, 4, 5].map((day) => ({ day, opens: '09:00', closes: '11:00' }));

const location = (
  name: string,
  slots: ScheduleLocation['slots'],
  exceptions: ScheduleException[] = [],
): ScheduleLocation => ({ location_name: name, slots, exceptions });

const clock = (isoDate: string, minutes: number) => ({ isoDate, dayIndex: dayIndexOf(isoDate), minutes });

describe('validateRanges', () => {
  it('accepts well-formed, non-overlapping ranges', () => {
    assert.equal(
      validateRanges([
        { opens: '09:00', closes: '11:00' },
        { opens: '17:00', closes: '21:00' },
      ]),
      null,
    );
  });

  it('accepts ranges that touch', () => {
    assert.equal(
      validateRanges([
        { opens: '09:00', closes: '11:00' },
        { opens: '11:00', closes: '14:00' },
      ]),
      null,
    );
  });

  it('rejects malformed times', () => {
    assert.equal(validateRanges([{ opens: '9:00', closes: '11:00' }]), 'invalid');
    assert.equal(validateRanges([{ opens: '09:00', closes: '24:00' }]), 'invalid');
  });

  it('rejects a range that closes at or before it opens', () => {
    assert.equal(validateRanges([{ opens: '11:00', closes: '11:00' }]), 'order');
    assert.equal(validateRanges([{ opens: '17:00', closes: '09:00' }]), 'order');
  });

  it('rejects overlapping ranges', () => {
    assert.equal(
      validateRanges([
        { opens: '09:00', closes: '12:00' },
        { opens: '11:00', closes: '14:00' },
      ]),
      'overlap',
    );
  });

  it('rejects more than four ranges', () => {
    const five = [1, 2, 3, 4, 5].map((h) => ({ opens: `${String(h).padStart(2, '0')}:00`, closes: `${String(h).padStart(2, '0')}:30` }));
    assert.equal(validateRanges(five), 'too-many');
  });
});

describe('summarizeWeekly', () => {
  it('collapses Mon–Sat with one range into one line', () => {
    assert.deepEqual(summarizeWeekly(monToSatOneRange, ID_DAYS, 'id'), ['Senin–Sabtu: 09.00–11.00']);
  });

  it('lists non-consecutive days individually', () => {
    const slots = [0, 2, 5].map((day) => ({ day, opens: '13:00', closes: '15:00' }));
    assert.deepEqual(summarizeWeekly(slots, ID_DAYS, 'id'), ['Senin, Rabu, Sabtu: 13.00–15.00']);
  });

  it('lists two consecutive days separated by a comma', () => {
    const slots = [
      { day: 0, opens: '08:00', closes: '10:00' },
      { day: 1, opens: '08:00', closes: '10:00' },
    ];
    assert.deepEqual(summarizeWeekly(slots, ID_DAYS, 'id'), ['Senin, Selasa: 08.00–10.00']);
  });

  it('groups days with different ranges separately, ordered by first day', () => {
    const slots = [
      ...[0, 1, 2, 3, 4].map((day) => ({ day, opens: '08:00', closes: '12:00' })),
      { day: 5, opens: '08:00', closes: '10:00' },
    ];
    assert.deepEqual(summarizeWeekly(slots, ID_DAYS, 'id'), ['Senin–Jumat: 08.00–12.00', 'Sabtu: 08.00–10.00']);
  });

  it('prints every range of a day, joined by commas', () => {
    assert.deepEqual(summarizeWeekly(monToSatTwoRanges, ID_DAYS, 'id'), ['Senin–Sabtu: 09.00–11.00, 17.00–21.00']);
  });

  it('uses colon times and English day names for locale en', () => {
    assert.deepEqual(summarizeWeekly(monToSatTwoRanges, EN_DAYS, 'en'), ['Monday–Saturday: 09:00–11:00, 17:00–21:00']);
  });

  it('returns no lines when there are no slots', () => {
    assert.deepEqual(summarizeWeekly([], ID_DAYS, 'id'), []);
  });
});

describe('resolveDay', () => {
  const clinic = location('Klinik', monToSatOneRange);
  const other = location('Apotik', [{ day: 0, opens: '13:00', closes: '15:00' }]);

  it('passes the weekly pattern through for a normal day', () => {
    const day = resolveDay([clinic], '2026-11-09');
    assert.equal(day.dayIndex, 0);
    assert.deepEqual(day.slots, [
      { locationIndex: 0, locationName: 'Klinik', opens: '09:00', closes: '11:00', special: false },
    ]);
    assert.deepEqual(day.closures, []);
  });

  it('has no slots on a day without weekly hours', () => {
    assert.deepEqual(resolveDay([clinic], '2026-11-15').slots, []);
  });

  it('closes a location for a closed exception and keeps its reason', () => {
    const closedClinic = location('Klinik', monToSatOneRange, [
      { start_date: '2026-11-10', end_date: '2026-11-10', closed: true, hours: [], reason: 'Libur' },
    ]);
    const day = resolveDay([closedClinic], '2026-11-10');
    assert.deepEqual(day.slots, []);
    assert.deepEqual(day.closures, [{ locationIndex: 0, locationName: 'Klinik', reason: 'Libur' }]);
    assert.equal(resolveDay([closedClinic], '2026-11-09').closures.length, 0);
  });

  it('applies a global closure to every location as a separate closure', () => {
    const closure: ScheduleException = { start_date: '2026-11-10', end_date: '2026-11-10', closed: true, hours: [], reason: 'Idul Adha' };
    const day = resolveDay([location('Klinik', monToSatOneRange, [closure]), location('Apotik', [{ day: 1, opens: '13:00', closes: '15:00' }], [closure])], '2026-11-10');
    assert.deepEqual(day.slots, []);
    assert.deepEqual(day.closures.map((c) => c.locationIndex), [0, 1]);
  });

  it('replaces the weekly hours with special hours', () => {
    const special = location('Klinik', monToSatOneRange, [
      { start_date: '2026-11-10', end_date: '2026-11-10', closed: false, hours: [{ opens: '13:00', closes: '15:00' }] },
    ]);
    assert.deepEqual(resolveDay([special], '2026-11-10').slots, [
      { locationIndex: 0, locationName: 'Klinik', opens: '13:00', closes: '15:00', special: true },
    ]);
  });

  it('lets a closure beat special hours on the same date', () => {
    const both = location('Klinik', monToSatOneRange, [
      { start_date: '2026-11-10', end_date: '2026-11-10', closed: false, hours: [{ opens: '13:00', closes: '15:00' }] },
      { start_date: '2026-11-10', end_date: '2026-11-10', closed: true, hours: [], reason: 'Rapat' },
    ]);
    const day = resolveDay([both], '2026-11-10');
    assert.deepEqual(day.slots, []);
    assert.equal(day.closures[0].reason, 'Rapat');
  });

  it('treats end_date as inclusive and returns to the weekly pattern afterwards', () => {
    const ranged = location('Klinik', monToSatOneRange, [
      { start_date: '2026-11-09', end_date: '2026-11-11', closed: true, hours: [] },
    ]);
    assert.equal(resolveDay([ranged], '2026-11-11').closures.length, 1);
    const after = resolveDay([ranged], '2026-11-12');
    assert.equal(after.closures.length, 0);
    assert.deepEqual(after.slots.map((s) => [s.opens, s.special]), [['09:00', false]]);
  });

  it('sorts slots from several locations by opening time', () => {
    const day = resolveDay([clinic, other], '2026-11-09');
    assert.deepEqual(day.slots.map((s) => [s.locationName, s.opens]), [
      ['Klinik', '09:00'],
      ['Apotik', '13:00'],
    ]);
  });
});

describe('getTodayStatus', () => {
  const clinic = location('Klinik', monToSatTwoRanges);

  it('reports ongoing inside the first of two ranges', () => {
    const status = getTodayStatus([clinic], clock('2026-11-09', 9 * 60 + 30));
    assert.equal(status?.kind, 'ongoing');
    assert.equal(status?.kind === 'ongoing' && status.slot.opens, '09:00');
  });

  it('reports the second range as later-today between two ranges', () => {
    const status = getTodayStatus([clinic], clock('2026-11-09', 12 * 60));
    assert.equal(status?.kind, 'later-today');
    assert.equal(status?.kind === 'later-today' && status.slot.opens, '17:00');
  });

  it('reports tomorrow morning after the last range closes', () => {
    const status = getTodayStatus([clinic], clock('2026-11-09', 22 * 60));
    assert.equal(status?.kind, 'next');
    assert.equal(status?.kind === 'next' && status.daysAhead, 1);
    assert.equal(status?.kind === 'next' && status.slot.opens, '09:00');
  });

  it('skips a closed day for the next practice day', () => {
    const closedTuesday = location('Klinik', monToSatTwoRanges, [
      { start_date: '2026-11-10', end_date: '2026-11-10', closed: true, hours: [] },
    ]);
    const status = getTodayStatus([closedTuesday], clock('2026-11-09', 22 * 60));
    assert.equal(status?.kind === 'next' && status.daysAhead, 2);
  });

  it('keeps searching past 14 consecutive closed days', () => {
    const closedFortnight = location('Klinik', monToSatTwoRanges, [
      { start_date: '2026-11-10', end_date: '2026-11-23', closed: true, hours: [] },
    ]);
    const status = getTodayStatus([closedFortnight], clock('2026-11-09', 22 * 60));
    assert.equal(status?.kind === 'next' && status.daysAhead, 15);
  });

  it('returns null when no location has any slot', () => {
    assert.equal(getTodayStatus([location('Kosong', [])], clock('2026-11-09', 10 * 60)), null);
  });
});

describe('getWitaClock', () => {
  it('moves to the next WITA calendar day when UTC is still the previous day', () => {
    assert.deepEqual(getWitaClock(new Date('2026-11-07T17:30:00Z')), {
      dayIndex: 6,
      minutes: 90,
      isoDate: '2026-11-08',
    });
  });

  it('rolls over exactly at WITA midnight', () => {
    assert.deepEqual(getWitaClock(new Date('2026-11-08T16:00:00Z')), {
      dayIndex: 0,
      minutes: 0,
      isoDate: '2026-11-09',
    });
  });
});

describe('addDays and dayIndexOf', () => {
  it('crosses month and year boundaries', () => {
    assert.equal(addDays('2026-01-31', 1), '2026-02-01');
    assert.equal(addDays('2026-12-31', 1), '2027-01-01');
    assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  });

  it('handles leap days', () => {
    assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  });

  it('maps ISO dates to Monday-based indexes', () => {
    assert.equal(dayIndexOf('2026-11-09'), 0);
    assert.equal(dayIndexOf('2026-11-15'), 6);
  });
});
