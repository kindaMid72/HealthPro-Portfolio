'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateShortId } from '@/lib/format';
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
    await unlockAdminAccountAction(id);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Kolom Kiri: Profil & Ganti Password Saya */}
      <div className="lg:col-span-6">
        <form
          onSubmit={handleUpdateOwn}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs"
        >
          <h2 className="font-heading text-base font-bold text-primary-dark">
            Profil & Ganti Kata Sandi Saya
          </h2>

          {ownMessage && (
            <div
              role="alert"
              className={`rounded-xl border px-4 py-3 text-xs font-medium ${
                ownMessage.type === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {ownMessage.text}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Email Login
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full cursor-not-allowed rounded-xl border border-border bg-bg/70 px-3.5 py-2 text-xs text-text-muted"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Nama Tampilan (Muncul sebagai Penulis Artikel) *
            </label>
            <input
              type="text"
              required
              value={ownName}
              onChange={(e) => setOwnName(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 font-heading text-xs font-bold text-primary-dark">
              Ganti Kata Sandi (Kosongkan bila tidak ingin mengubah)
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-primary-dark">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-primary-dark">
                  Kata Sandi Baru (Minimal 12 karakter)
                </label>
                <input
                  type="password"
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-primary-dark">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingOwn}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {savingOwn ? 'Menyimpan...' : 'Simpan Profil & Kata Sandi'}
          </button>
        </form>
      </div>

      {/* Kolom Kanan: Daftar Akun Admin & Tambah Akun Baru */}
      <div className="space-y-6 lg:col-span-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
          <h2 className="font-heading text-base font-bold text-primary-dark">
            Daftar Akun Admin Terdaftar
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            Semua akun memiliki akses setara untuk menulis dan meninjau artikel.
          </p>

          <ul className="mt-4 divide-y divide-border/70 text-xs">
            {accounts.map((acc) => {
              const isLocked = acc.isLocked;
              return (
                <li
                  key={acc.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="font-heading font-semibold text-primary-dark">
                      {acc.name}{' '}
                      {acc.id === currentUser.id && (
                        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          Anda
                        </span>
                      )}
                    </p>
                    <p className="text-text-muted">
                      {acc.email} • Dibuat {formatDateShortId(acc.createdAt)}
                    </p>
                  </div>

                  <div>
                    {isLocked ? (
                      <button
                        type="button"
                        onClick={() => void handleUnlock(acc.id)}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        Terkunci — Buka Kunci
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Aktif
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs"
        >
          <h2 className="font-heading text-base font-bold text-primary-dark">
            Tambah Akun Admin Baru
          </h2>
          <p className="text-xs text-text-muted">
            Tambahkan akun untuk dokter atau rekan/asisten klinik.
          </p>

          {teamMessage && (
            <div
              role="alert"
              className={`rounded-xl border px-4 py-3 text-xs font-medium ${
                teamMessage.type === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {teamMessage.text}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Asisten Klinik THT"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Email Login *
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="asisten@dryuliana.my.id"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Kata Sandi Awal (Minimal 12 karakter) *
            </label>
            <input
              type="password"
              required
              minLength={12}
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Minimal 12 karakter"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={creatingUser}
            className="w-full rounded-xl border border-primary bg-primary/10 px-4 py-2.5 font-heading text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {creatingUser ? 'Membuat Akun...' : '+ Buat Akun Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
