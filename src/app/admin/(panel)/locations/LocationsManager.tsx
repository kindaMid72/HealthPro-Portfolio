'use client';

/**
 * app/admin/(panel)/locations/LocationsManager.tsx — Komponen pengelola lokasi praktik.
 */

import { useState, useTransition } from 'react';
import {
  saveLocationAction,
  deleteLocationAction,
  moveLocationAction,
  type LocationInput,
} from '@/app/admin/locations/actions';

interface LocationRow {
  id: string;
  sortOrder: number;
  locationName: string;
  address: string;
  practiceHours: string;
  whatsapp: string;
  phone: string;
  bookingUrlOverride: string;
}

interface LocationsManagerProps {
  initialLocations: LocationRow[];
}

const EMPTY_INPUT: LocationInput = {
  locationName: '',
  address: '',
  practiceHours: '',
  whatsapp: '',
  phone: '',
  bookingUrlOverride: '',
};

export function LocationsManager({ initialLocations }: LocationsManagerProps) {
  const [locationsList, setLocationsList] = useState<LocationRow[]>(initialLocations);
  const [editing, setEditing] = useState<LocationInput | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await saveLocationAction(editing);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Lokasi berhasil disimpan!' });
        setEditing(null);
        window.location.reload();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gagal menyimpan lokasi.' });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Hapus lokasi "${name}"?`)) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteLocationAction(id);
      if (res.success) {
        setLocationsList((prev) => prev.filter((l) => l.id !== id));
        setFeedback({ type: 'success', message: 'Lokasi berhasil dihapus.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gagal menghapus lokasi.' });
      }
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      const res = await moveLocationAction(id, direction);
      if (res.success) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lokasi Praktik</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola klinik/rumah sakit tempat dokter membuka praktik, jadwal, dan nomor kontak.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_INPUT })}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors"
        >
          + Tambah Lokasi Baru
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
              {editing.id ? 'Edit Lokasi Praktik' : 'Tambah Lokasi Praktik'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Nama Klinik / Rumah Sakit *
                </label>
                <input
                  type="text"
                  required
                  value={editing.locationName}
                  onChange={(e) => setEditing({ ...editing, locationName: e.target.value })}
                  placeholder="Klinik Hamdi"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editing.address}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  placeholder="Jl. Raya Batulicin No. 12..."
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Jadwal Praktik *
                </label>
                <input
                  type="text"
                  required
                  value={editing.practiceHours}
                  onChange={(e) => setEditing({ ...editing, practiceHours: e.target.value })}
                  placeholder="Senin - Kamis: 16.00 - 20.00 WITA"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editing.whatsapp}
                    onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })}
                    placeholder="08115553556"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={editing.phone}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    placeholder="0518-12345"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  URL Booking Override (Opsional)
                </label>
                <input
                  type="url"
                  value={editing.bookingUrlOverride}
                  onChange={(e) => setEditing({ ...editing, bookingUrlOverride: e.target.value })}
                  placeholder="https://booking.khusus-klinik-ini.com"
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
                  {isPending ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daftar Lokasi */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 w-16">Urutan</th>
              <th className="px-4 py-3">Nama Lokasi</th>
              <th className="px-4 py-3">Alamat</th>
              <th className="px-4 py-3">Jadwal Praktik</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {locationsList.map((loc, idx) => (
              <tr key={loc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0 || isPending}
                      onClick={() => handleMove(loc.id, 'up')}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-black disabled:opacity-30"
                      title="Geser ke atas"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === locationsList.length - 1 || isPending}
                      onClick={() => handleMove(loc.id, 'down')}
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-black disabled:opacity-30"
                      title="Geser ke bawah"
                    >
                      ▼
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {loc.locationName}
                  {loc.bookingUrlOverride && (
                    <span className="ml-2 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-700">
                      Booking Khusus
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">
                  {loc.address}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {loc.practiceHours}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {loc.whatsapp ? `WA: ${loc.whatsapp}` : ''}
                  {loc.phone ? ` • Telp: ${loc.phone}` : ''}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          id: loc.id,
                          locationName: loc.locationName,
                          address: loc.address,
                          practiceHours: loc.practiceHours,
                          whatsapp: loc.whatsapp,
                          phone: loc.phone,
                          bookingUrlOverride: loc.bookingUrlOverride,
                        })
                      }
                      className="rounded bg-primary px-2.5 py-1 font-medium text-white hover:bg-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(loc.id, loc.locationName)}
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
