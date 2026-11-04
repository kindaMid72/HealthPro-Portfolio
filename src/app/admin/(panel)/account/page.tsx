import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { requireUser } from '@/lib/session';
import PageHeader from '@/components/admin/PageHeader';
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
      <PageHeader
        title="Manajemen Akun & Keamanan"
        description="Perbarui nama tampilan, ganti kata sandi Anda, atau tambahkan akun rekan/asisten admin."
      />

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
