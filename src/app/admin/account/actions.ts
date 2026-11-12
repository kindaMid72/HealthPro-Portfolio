'use server';

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { clearAllLoginAttempts } from '@/lib/login-throttle';
import { revalidatePublicSite } from '@/lib/revalidate';
import { hashPassword, verifyPassword } from '@/lib/password';
import { destroyOtherSessions, requireUser } from '@/lib/session';
import { isUuid } from '@/lib/uuid';

// Sensitive actions (password change, admin creation/deletion) require current account password confirmation.
async function checkCurrentPassword(storedHash: string, candidate: string | undefined): Promise<string | null> {
  if (!candidate || candidate.length > 1024 || !(await verifyPassword(candidate, storedHash))) {
    return 'Kata sandi saat ini tidak sesuai.';
  }
  return null;
}

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
    const err = await checkCurrentPassword(row.passwordHash, input.currentPassword);
    if (err) {
      return { success: false, error: err };
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
    revalidatePublicSite();
    return { success: true };
  }

  await db
    .update(users)
    .set({ name: cleanName })
    .where(eq(users.id, user.id));

  revalidatePublicSite();
  return { success: true };
}

export async function createAdminAccountAction(input: {
  name: string;
  email: string;
  password: string;
  currentPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const actor = await requireUser();
  const db = getDb();
  const [actorRow] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);
  if (!actorRow) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }
  const pwError = await checkCurrentPassword(actorRow.passwordHash, input.currentPassword);
  if (pwError) {
    return { success: false, error: pwError };
  }

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

export async function deleteAdminAccountAction(input: {
  targetUserId: string;
  currentPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const actor = await requireUser();
  if (!isUuid(input.targetUserId)) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }
  if (input.targetUserId === actor.id) {
    return { success: false, error: 'Tidak dapat menghapus akun sendiri.' };
  }

  const db = getDb();
  const [actorRow] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, actor.id))
    .limit(1);
  if (!actorRow) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }
  const pwError = await checkCurrentPassword(actorRow.passwordHash, input.currentPassword);
  if (pwError) {
    return { success: false, error: pwError };
  }

  // Sessions deleted via ON DELETE CASCADE; articles remain with authorId set to null.
  const deleted = await db
    .delete(users)
    .where(eq(users.id, input.targetUserId))
    .returning({ id: users.id });
  if (deleted.length === 0) {
    return { success: false, error: 'Akun tidak ditemukan.' };
  }
  revalidatePublicSite();
  return { success: true };
}
