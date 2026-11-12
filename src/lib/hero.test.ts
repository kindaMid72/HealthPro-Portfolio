import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cleanHeroText, validateHeroFields } from './hero';

test('cleanHeroText collapses whitespace', () => {
  assert.equal(cleanHeroText('  a\n b  '), 'a b');
});

test('validateHeroFields enforces limits', () => {
  const ok = { tagline: 'a'.repeat(160), bookingLabel: 'b'.repeat(40), whatsappLabel: '' };
  assert.equal(validateHeroFields(ok), null);
  assert.equal(validateHeroFields({ ...ok, tagline: 'a'.repeat(161) }), 'Tagline hero maksimal 160 karakter.');
  assert.equal(validateHeroFields({ ...ok, bookingLabel: 'b'.repeat(41) }), 'Label tombol maksimal 40 karakter.');
});
