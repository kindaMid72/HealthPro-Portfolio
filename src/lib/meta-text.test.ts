import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ensureSentence, fitTitle, truncateMeta } from './meta-text';

test('truncateMeta leaves short text', () => {
  assert.equal(truncateMeta('  hello   world ', 160), 'hello world');
});

test('truncateMeta cuts on word boundary', () => {
  const text = Array.from({ length: 60 }, () => 'kata,').join(' ');
  const out = truncateMeta(text, 160);
  assert.ok(out.length <= 160);
  assert.ok(out.endsWith('…'));
  assert.ok(!/[,—]…$/.test(out));
  assert.ok(/kata…$/.test(out));
});

test('truncateMeta hard-cuts a single long word', () => {
  const out = truncateMeta('a'.repeat(200), 160);
  assert.equal(out.length, 160);
  assert.ok(out.endsWith('…'));
});

test('fitTitle', () => {
  assert.equal(fitTitle('Title', 'Name'), 'Title — Name');
  const out = fitTitle('word '.repeat(24).trim(), 'Dr Name');
  assert.ok(out.length <= 65 && out.endsWith('…') && !out.includes('Dr Name'));
});

test('ensureSentence', () => {
  assert.equal(ensureSentence('Halo'), 'Halo.');
  assert.equal(ensureSentence('Halo.'), 'Halo.');
  assert.equal(ensureSentence('Halo?'), 'Halo?');
});
