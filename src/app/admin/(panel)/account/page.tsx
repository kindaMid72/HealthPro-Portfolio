import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { requireUser } from '@/lib/session';
import AccountManager from './AccountManager';

export default async function AdminAccountPage() {
  const currentUser = await requireUser();
  const allUsers = await getDb()
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      failedLoginCount: users.failedLoginCount,
      lockedUntil: users.lockedUntil,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-primary-dark">
          Manajemen Akun & Keamanan
        </h1>
        <p className="mt-1 text-xs text-text-muted">
          Perbarui nama tampilan, ganti kata sandi Anda, atau tambahkan akun
          rekan/asisten admin.
        </p>
      </div>

      <AccountManager
        currentUser={currentUser}
        accounts={allUsers.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          failedLoginCount: u.failedLoginCount,
          isLocked: Boolean(u.lockedUntil && u.lockedUntil > new Date()),
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
