'use server';

import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { getClientIp } from '@/lib/client-ip';
import { clearLoginAttempts, reserveLoginAttempt } from '@/lib/login-throttle';
import { hashPassword, needsRehash, verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';

// Dipakai saat email tidak ditemukan agar waktu respons sama dengan akun yang ada.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password || email.length > 254 || password.length > 1024) {
    redirect('/admin/login?error=invalid');
  }

  const ip = getClientIp(await headers());
  // Dicek sebelum scrypt dan sebelum tahu apakah email ada: respons "locked" tidak membocorkan akun.
  if (!(await reserveLoginAttempt(email, ip))) {
    redirect('/admin/login?error=locked');
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    redirect('/admin/login?error=invalid');
  }

  await clearLoginAttempts(email, ip);
  if (needsRehash(user.passwordHash)) {
    await getDb()
      .update(users)
      .set({ passwordHash: await hashPassword(password) })
      .where(eq(users.id, user.id));
  }

  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
