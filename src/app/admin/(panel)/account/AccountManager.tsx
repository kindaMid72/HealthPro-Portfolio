'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/admin/Alert';
import { Button } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import { TextField } from '@/components/admin/Field';
import { formatDateShort } from '@/lib/format';
import type { SessionUser } from '@/lib/session';
import {
  createAdminAccountAction,
  unlockAdminAccountAction,
  updateOwnAccountAction,
} from '../../account/actions';

interface AdminAccountRow {
  id: string;
  email: string;
  name: string;
  failedLoginCount: number;
  isLocked: boolean;
  createdAt: string;
}

export default function AccountManager({
  currentUser,
  accounts,
}: {
  currentUser: SessionUser;
  accounts: AdminAccountRow[];
}) {
  const router = useRouter();
  const [ownName, setOwnName] = useState(currentUser.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingOwn, setSavingOwn] = useState(false);
  const [ownMessage, setOwnMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [teamMessage, setTeamMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  async function handleUpdateOwn(e: React.FormEvent) {
    e.preventDefault();
    setOwnMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setOwnMessage({
        type: 'err',
        text: 'Konfirmasi kata sandi baru tidak cocok.',
      });
      return;
    }

    setSavingOwn(true);
    const res = await updateOwnAccountAction({
      name: ownName,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setSavingOwn(false);

    if (!res.success) {
      setOwnMessage({
        type: 'err',
        text: res.error ?? 'Gagal memperbarui akun.',
      });
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOwnMessage({
      type: 'ok',
      text: 'Profil akun Anda berhasil diperbarui.',
    });
    router.refresh();
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setTeamMessage(null);
    setCreatingUser(true);

    const res = await createAdminAccountAction({
      name: newName,
      email: newEmail,
      password: newUserPassword,
    });
    setCreatingUser(false);

    if (!res.success) {
      setTeamMessage({
        type: 'err',
        text: res.error ?? 'Gagal membuat akun baru.',
      });
      return;
    }

    setNewName('');
    setNewEmail('');
    setNewUserPassword('');
    setTeamMessage({
      type: 'ok',
      text: 'Akun admin baru berhasil ditambahkan.',
    });
    router.refresh();
  }

  async function handleUnlock(id: string) {
    setTeamMessage(null);
    const res = await unlockAdminAccountAction(id);
    setTeamMessage(
      res.success
        ? { type: 'ok', text: 'Akun dibuka kembali.' }
        : { type: 'err', text: res.error ?? 'Gagal membuka kunci akun.' },
    );
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <form onSubmit={handleUpdateOwn}>
          <Card title="Profil & ganti kata sandi saya">
            <div className="space-y-4">
              {ownMessage && <Alert tone={ownMessage.type === 'ok' ? 'success' : 'error'}>{ownMessage.text}</Alert>}

              <TextField label="Email login" type="email" disabled value={currentUser.email} readOnly />
              <TextField
                label="Nama tampilan (muncul sebagai penulis artikel)"
                required
                value={ownName}
                onChange={(e) => setOwnName(e.target.value)}
              />

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-bold">Ganti kata sandi (kosongkan bila tidak ingin mengubah)</p>
                <TextField
                  label="Kata sandi saat ini"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <TextField
                  label="Kata sandi baru"
                  hint="Minimal 12 karakter."
                  type="password"
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <TextField
                  label="Konfirmasi kata sandi baru"
                  type="password"
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" pending={savingOwn} className="w-full">
                {savingOwn ? 'Menyimpan...' : 'Simpan profil & kata sandi'}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      <div className="space-y-6 lg:col-span-6">
        <Card
          title="Daftar akun admin terdaftar"
          description="Semua akun memiliki akses setara untuk menulis dan meninjau artikel."
        >
          <ul className="space-y-2 text-sm">
            {accounts.map((acc) => (
              <li
                key={acc.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg/60 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-sm font-bold text-primary"
                  >
                    {(acc.name.trim()[0] ?? '?').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-heading">
                      {acc.name}{' '}
                      {acc.id === currentUser.id && (
                        <span className="ml-1 rounded-full bg-primary-tint px-2 py-0.5 text-xs text-primary">Anda</span>
                      )}
                    </p>
                    <p className="break-all text-text-muted">
                      {acc.email} • Dibuat {formatDateShort(acc.createdAt, 'id')}
                    </p>
                  </div>
                </div>

                {acc.isLocked ? (
                  <Button size="sm" variant="secondary" className="text-amber-800" onClick={() => void handleUnlock(acc.id)}>
                    Terkunci — buka kunci
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Aktif
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <form onSubmit={handleCreateUser}>
          <Card title="Tambah akun admin baru" description="Tambahkan akun untuk dokter atau rekan/asisten klinik.">
            <div className="space-y-4">
              {teamMessage && <Alert tone={teamMessage.type === 'ok' ? 'success' : 'error'}>{teamMessage.text}</Alert>}

              <TextField
                label="Nama lengkap"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Asisten Klinik THT"
              />
              <TextField
                label="Email login"
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="asisten@dryuliana.my.id"
              />
              <TextField
                label="Kata sandi awal"
                hint="Minimal 12 karakter."
                type="password"
                required
                minLength={12}
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button type="submit" variant="secondary" pending={creatingUser} className="w-full">
                {creatingUser ? 'Membuat akun...' : 'Buat akun admin'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
