'use server';

/**
 * app/admin/actions.ts — aksi autentikasi admin.
 * Login dikunci sementara setelah 5 kali gagal berturut-turut (15 menit).
 */

import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';

const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    redirect('/admin/login?error=locked');
  }

  const ok = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !ok) {
    if (user) {
      const failed = user.failedLoginCount + 1;
      await db
        .update(users)
        .set({
          failedLoginCount: failed,
          lockedUntil: failed >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCK_MS) : null,
        })
        .where(eq(users.id, user.id));
    }
    redirect('/admin/login?error=invalid');
  }

  await db
    .update(users)
    .set({ failedLoginCount: 0, lockedUntil: null })
    .where(eq(users.id, user.id));

  await createSession(user.id);
  redirect('/admin');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
