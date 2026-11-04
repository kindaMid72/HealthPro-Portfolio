'use server';

import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

export async function loginAction(formData: FormData): Promise<void> {
  const emailRaw = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!emailRaw || !password) {
    redirect('/admin/login?error=invalid');
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, emailRaw))
    .limit(1);

  if (!user) {
    redirect('/admin/login?error=invalid');
  }

  const now = new Date();
  if (user.lockedUntil && user.lockedUntil > now) {
    redirect('/admin/login?error=locked');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const nextCount = (user.failedLoginCount ?? 0) + 1;
    const lockedUntil =
      nextCount >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_MS)
        : null;

    await db
      .update(users)
      .set({
        failedLoginCount: nextCount,
        lockedUntil,
      })
      .where(eq(users.id, user.id));

    if (lockedUntil) {
      redirect('/admin/login?error=locked');
    }
    redirect('/admin/login?error=invalid');
  }

  await db
    .update(users)
    .set({
      failedLoginCount: 0,
      lockedUntil: null,
    })
    .where(eq(users.id, user.id));

  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
