'use server';

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { clearAllLoginAttempts } from '@/lib/login-throttle';
import { hashPassword, verifyPassword } from '@/lib/password';
import { destroyOtherSessions, requireUser } from '@/lib/session';
import { isUuid } from '@/lib/uuid';

export async function updateOwnAccountAction(input: {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();
  const cleanName = input.name.trim();
  if (!cleanName) {
    return { success: false, error: 'Nama tampilan tidak boleh kosong.' };
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }

  const newPass = input.newPassword ?? '';
  if (newPass.length > 0) {
    const currPass = input.currentPassword ?? '';
    if (!currPass) {
      return {
        success: false,
        error: 'Masukkan kata sandi saat ini untuk mengganti kata sandi.',
      };
    }

    const valid = await verifyPassword(currPass, row.passwordHash);
    if (!valid) {
      return {
        success: false,
        error: 'Kata sandi saat ini tidak sesuai.',
      };
    }

    if (newPass.length < 12) {
      return {
        success: false,
        error: 'Kata sandi baru minimal harus 12 karakter.',
      };
    }

    const newHash = await hashPassword(newPass);
    await db
      .update(users)
      .set({
        name: cleanName,
        passwordHash: newHash,
      })
      .where(eq(users.id, user.id));

    await destroyOtherSessions(user.id);
    return { success: true };
  }

  await db
    .update(users)
    .set({ name: cleanName })
    .where(eq(users.id, user.id));

  return { success: true };
}

export async function createAdminAccountAction(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name || !email) {
    return { success: false, error: 'Nama dan email wajib diisi.' };
  }

  if (password.length < 12) {
    return {
      success: false,
      error: 'Kata sandi minimal harus 12 karakter.',
    };
  }

  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: false,
      error: `Akun dengan email ${email} sudah terdaftar.`,
    };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    name,
    email,
    passwordHash,
  });

  return { success: true };
}

export async function unlockAdminAccountAction(
  targetUserId: string,
): Promise<{ success: boolean; error?: string }> {
  await requireUser();
  if (!isUuid(targetUserId)) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }

  const [target] = await getDb()
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, targetUserId))
    .limit(1);
  if (!target) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }

  await clearAllLoginAttempts(target.email);
  return { success: true };
}
