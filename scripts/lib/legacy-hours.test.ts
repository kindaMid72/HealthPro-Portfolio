import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseLegacyHours } from './legacy-hours';

describe('parseLegacyHours', () => {
  it('parses a day span with one range', () => {
    assert.deepEqual(parseLegacyHours('Senin–Sabtu, 17.00–21.00'), {
      days: [0, 1, 2, 3, 4, 5],
      ranges: [{ opens: '17:00', closes: '21:00' }],
    });
  });

  it('parses a day list', () => {
    assert.deepEqual(parseLegacyHours('Senin, Rabu, Sabtu, 13.00–15.00'), {
      days: [0, 2, 5],
      ranges: [{ opens: '13:00', closes: '15:00' }],
    });
  });

  it('keeps every range when one day has two ranges', () => {
    assert.deepEqual(parseLegacyHours('Senin–Sabtu, 09:00-11:00 & 17.00-21.00'), {
      days: [0, 1, 2, 3, 4, 5],
      ranges: [
        { opens: '09:00', closes: '11:00' },
        { opens: '17:00', closes: '21:00' },
      ],
    });
  });

  it('returns null for different hours per weekday', () => {
    assert.equal(parseLegacyHours('Senin 08.00-10.00, Selasa 13.00-15.00'), null);
  });

  it('returns null when no time is present', () => {
    assert.equal(parseLegacyHours('Buka setiap hari'), null);
  });

  it('returns null when a range closes before it opens', () => {
    assert.equal(parseLegacyHours('Senin–Jumat, 21.00-09.00'), null);
  });

  it('returns null when ranges overlap', () => {
    assert.equal(parseLegacyHours('Senin–Jumat, 09.00-12.00 & 11.00-14.00'), null);
  });

  it('returns null when no weekday is named', () => {
    assert.equal(parseLegacyHours('09.00-12.00'), null);
  });
});
