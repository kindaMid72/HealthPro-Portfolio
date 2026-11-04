import { eq } from 'drizzle-orm';
import { closeDb, getDb } from '../src/db/client';
import { users } from '../src/db/schema';
import { hashPassword } from '../src/lib/password';

async function main() {
  const [email, name] = process.argv.slice(2);
  const password = process.env.USER_PASSWORD ?? '';

  if (!email || !name) {
    console.error(
      'Penggunaan: USER_PASSWORD="<min 12 karakter>" npm run user:create -- <email> "<Nama Lengkap>"',
    );
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('Error: USER_PASSWORD minimal harus 12 karakter.');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    console.error(`Akun dengan email ${normalizedEmail} sudah ada.`);
    await closeDb();
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
  });

  console.log(`Akun dibuat: ${normalizedEmail}`);
  await closeDb();
}

main().catch(async (err) => {
  console.error('Gagal membuat akun:', err);
  await closeDb();
  process.exit(1);
});
