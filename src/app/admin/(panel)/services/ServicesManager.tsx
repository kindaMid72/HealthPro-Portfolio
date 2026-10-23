'use client';

/**
 * app/admin/(panel)/services/ServicesManager.tsx — Komponen pengelola layanan medis.
 */

import { useState, useTransition } from 'react';
import {
  saveServiceAction,
  deleteServiceAction,
  moveServiceAction,
  type ServiceInput,
} from '@/app/admin/services/actions';

interface ServiceRow {
  id: string;
  sortOrder: number;
  serviceName: string;
  serviceDescription: string;
}

interface ServicesManagerProps {
  initialServices: ServiceRow[];
}

const EMPTY_INPUT: ServiceInput = {
  serviceName: '',
  serviceDescription: '',
};

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [servicesList, setServicesList] = useState<ServiceRow[]>(initialServices);
  const [editing, setEditing] = useState<ServiceInput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await saveServiceAction(editing);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Layanan berhasil disimpan!' });
        setEditing(null);
        window.location.reload();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gagal menyimpan layanan.' });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus layanan "${name}"?`)) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteServiceAction(id);
      if (res.success) {
        setServicesList((prev) => prev.filter((s) => s.id !== id));
        setFeedback({ type: 'success', message: 'Layanan berhasil dihapus.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gagal menghapus layanan.' });
      }
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      const res = await moveServiceAction(id, direction);
      if (res.success) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Layanan Medis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola daftar layanan spesialis THT yang ditampilkan pada bagian Layanan di website.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_INPUT })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          + Tambah Layanan Baru
        </button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-lg p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Modal / Dialog Form Edit */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editing.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Nama Layanan *
                </label>
                <input
                  type="text"
                  required
                  value={editing.serviceName}
                  onChange={(e) => setEditing({ ...editing, serviceName: e.target.value })}
                  placeholder="Contoh: Endoskopi Telinga, Hidung & Tenggorok"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Deskripsi Singkat Layanan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editing.serviceDescription}
                  onChange={(e) => setEditing({ ...editing, serviceDescription: e.target.value })}
                  placeholder="Pemeriksaan visual dengan kamera mikro resolusi tinggi untuk deteksi infeksi, polip, atau kelainan rongga THT."
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Layanan */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 w-16">Urutan</th>
              <th className="px-4 py-3">Nama Layanan</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {servicesList.map((svc, idx) => (
              <tr key={svc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 || isPending}
                      onClick={() => handleMove(svc.id, 'up')}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-black disabled:opacity-30"
                      title="Geser ke atas"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === servicesList.length - 1 || isPending}
                      onClick={() => handleMove(svc.id, 'down')}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-black disabled:opacity-30"
                      title="Geser ke bawah"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {svc.serviceName}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-md">
                  {svc.serviceDescription}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          id: svc.id,
                          serviceName: svc.serviceName,
                          serviceDescription: svc.serviceDescription,
                        })
                      }
                      className="rounded bg-primary px-2.5 py-1 font-medium text-white hover:bg-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(svc.id, svc.serviceName)}
                      className="rounded border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
