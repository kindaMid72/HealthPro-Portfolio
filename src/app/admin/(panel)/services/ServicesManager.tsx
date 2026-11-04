'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteServiceAction,
  moveServiceAction,
  saveServiceAction,
  type ServiceItem,
} from '../../services/actions';

export default function ServicesManager({
  initialServices,
}: {
  initialServices: ServiceItem[];
}) {
  const router = useRouter();
  const [servicesList, setServicesList] =
    useState<ServiceItem[]>(initialServices);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  function resetForm() {
    setEditingId(null);
    setServiceName('');
    setServiceDescription('');
  }

  function startEdit(svc: ServiceItem) {
    setEditingId(svc.id);
    setServiceName(svc.serviceName);
    setServiceDescription(svc.serviceDescription);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    const res = await saveServiceAction({
      id: editingId ?? undefined,
      serviceName,
      serviceDescription,
    });

    setBusy(false);

    if (!res.success || !res.items) {
      setMessage({
        type: 'err',
        text: res.error ?? 'Gagal menyimpan layanan.',
      });
      return;
    }

    setServicesList(res.items);
    resetForm();
    setMessage({
      type: 'ok',
      text: editingId
        ? 'Layanan medis berhasil diperbarui.'
        : 'Layanan medis baru berhasil ditambahkan.',
    });
    router.refresh();
  }

  async function handleDelete(svc: ServiceItem) {
    if (!window.confirm(`Hapus layanan "${svc.serviceName}"?`)) return;
    setBusy(true);
    const res = await deleteServiceAction(svc.id);
    setBusy(false);
    if (res.success && res.items) {
      setServicesList(res.items);
      if (editingId === svc.id) resetForm();
      router.refresh();
    } else {
      setMessage({
        type: 'err',
        text: res.error ?? 'Gagal menghapus layanan.',
      });
    }
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    setBusy(true);
    const res = await moveServiceAction(id, dir);
    setBusy(false);
    if (res.success && res.items) {
      setServicesList(res.items);
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        {message && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 text-xs font-medium ${
              message.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {servicesList.map((svc, idx) => (
          <div
            key={svc.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-primary-dark">
                  {svc.serviceName}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-text-body">
                  {svc.serviceDescription || '(Belum ada deskripsi)'}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-xs">
                <button
                  type="button"
                  disabled={busy || idx === 0}
                  onClick={() => void handleMove(svc.id, 'up')}
                  className="rounded-lg border border-border px-2 py-1 hover:border-primary disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || idx === servicesList.length - 1}
                  onClick={() => void handleMove(svc.id, 'down')}
                  className="rounded-lg border border-border px-2 py-1 hover:border-primary disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(svc)}
                  className="rounded-lg bg-primary/10 px-2.5 py-1 font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete(svc)}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-700 hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-primary-dark">
              {editingId ? 'Edit Layanan Medis' : 'Tambah Layanan Baru'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-text-muted hover:text-primary"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Nama Layanan / Tindakan *
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Contoh: Endoskopi THT-KL Diagnostik"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Deskripsi Layanan
            </label>
            <textarea
              rows={4}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Jelaskan secara ringkas tujuan pemeriksaan atau tindakan medis bagi pasien..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-4 py-2.5 font-heading text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {busy
              ? 'Menyimpan...'
              : editingId
                ? 'Simpan Perubahan Layanan'
                : '+ Tambah Layanan Medis'}
          </button>
        </form>
      </div>
    </div>
  );
}
