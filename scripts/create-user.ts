/**
 * scripts/create-user.ts — buat akun admin baru.
 *
 * Pemakaian (password lewat env, supaya tidak tersimpan di riwayat shell):
 *   USER_PASSWORD='...' npm run user:create -- <email> "<nama>"
 *
 * Semua akun setara (tidak ada role). Password minimal 12 karakter.
 */

import { eq } from 'drizzle-orm';
import { closeDb, getDb } from '../src/db/client';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/lib/password';

async function main() {
  const [email, name] = process.argv.slice(2);
  const password = process.env.USER_PASSWORD ?? '';

  if (!email || !name) {
    console.error('Pemakaian: USER_PASSWORD=... npm run user:create -- <email> "<nama>"');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('USER_PASSWORD wajib diisi dan minimal 12 karakter.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail));
  if (existing.length > 0) {
    console.error(`Akun dengan email ${normalizedEmail} sudah ada.`);
    process.exit(1);
  }

  await db.insert(users).values({
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: await hashPassword(password),
  });

  console.log(`Akun dibuat: ${normalizedEmail}`);
  await closeDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeDb();
  process.exit(1);
});
