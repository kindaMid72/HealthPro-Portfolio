import { asc } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { accountKeyFor, getLockedAccountKeys } from '@/lib/login-throttle';
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
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  const locked = await getLockedAccountKeys();

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
          isLocked: locked.has(accountKeyFor(u.email)),
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
