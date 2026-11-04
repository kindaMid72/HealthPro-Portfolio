'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteLocationAction,
  type LocationItem,
  moveLocationAction,
  saveLocationAction,
} from '../../locations/actions';

export default function LocationsManager({
  initialLocations,
}: {
  initialLocations: LocationItem[];
}) {
  const router = useRouter();
  const [locationsList, setLocationsList] =
    useState<LocationItem[]>(initialLocations);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [practiceHours, setPracticeHours] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingUrlOverride, setBookingUrlOverride] = useState('');

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  function resetForm() {
    setEditingId(null);
    setLocationName('');
    setAddress('');
    setPracticeHours('');
    setWhatsapp('');
    setPhone('');
    setBookingUrlOverride('');
  }

  function startEdit(loc: LocationItem) {
    setEditingId(loc.id);
    setLocationName(loc.locationName);
    setAddress(loc.address);
    setPracticeHours(loc.practiceHours);
    setWhatsapp(loc.whatsapp);
    setPhone(loc.phone);
    setBookingUrlOverride(loc.bookingUrlOverride);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    const res = await saveLocationAction({
      id: editingId ?? undefined,
      locationName,
      address,
      practiceHours,
      whatsapp,
      phone,
      bookingUrlOverride,
    });

    setBusy(false);

    if (!res.success || !res.items) {
      setMessage({
        type: 'err',
        text: res.error ?? 'Gagal menyimpan lokasi.',
      });
      return;
    }

    setLocationsList(res.items);
    resetForm();
    setMessage({
      type: 'ok',
      text: editingId
        ? 'Data lokasi praktik berhasil diperbarui.'
        : 'Lokasi praktik baru berhasil ditambahkan.',
    });
    router.refresh();
  }

  async function handleDelete(loc: LocationItem) {
    if (
      !window.confirm(`Hapus lokasi praktik "${loc.locationName}"?`)
    ) {
      return;
    }
    setBusy(true);
    const res = await deleteLocationAction(loc.id);
    setBusy(false);

    if (res.success && res.items) {
      setLocationsList(res.items);
      if (editingId === loc.id) resetForm();
      router.refresh();
    } else {
      setMessage({
        type: 'err',
        text: res.error ?? 'Gagal menghapus lokasi.',
      });
    }
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    setBusy(true);
    const res = await moveLocationAction(id, dir);
    setBusy(false);
    if (res.success && res.items) {
      setLocationsList(res.items);
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Daftar Lokasi */}
      <div className="space-y-4 lg:col-span-7">
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

        {locationsList.map((loc, idx) => (
          <div
            key={loc.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-base font-bold text-primary-dark">
                  {loc.locationName}
                </h3>
                <p className="mt-1 text-xs text-text-body">{loc.address}</p>
                <p className="mt-1 text-xs font-medium text-primary">
                  Jam Praktik: {loc.practiceHours}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-text-muted">
                  <span>WA: {loc.whatsapp || '—'}</span>
                  <span>Telp: {loc.phone || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  disabled={busy || idx === 0}
                  onClick={() => void handleMove(loc.id, 'up')}
                  className="rounded-lg border border-border px-2 py-1 hover:border-primary disabled:opacity-40"
                  title="Naikkan urutan"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || idx === locationsList.length - 1}
                  onClick={() => void handleMove(loc.id, 'down')}
                  className="rounded-lg border border-border px-2 py-1 hover:border-primary disabled:opacity-40"
                  title="Turunkan urutan"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(loc)}
                  className="rounded-lg bg-primary/10 px-2.5 py-1 font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDelete(loc)}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-700 hover:bg-red-100"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Tambah / Edit Lokasi */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-bold text-primary-dark">
              {editingId ? 'Edit Lokasi Praktik' : 'Tambah Lokasi Baru'}
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
              Nama RS / Klinik *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Contoh: RSUD dr. H. Andi Abdurrahman Noor"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Alamat Lengkap *
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Jam Praktik *
            </label>
            <input
              type="text"
              required
              value={practiceHours}
              onChange={(e) => setPracticeHours(e.target.value)}
              placeholder="Contoh: Senin–Jumat, 08.00–14.00 WITA"
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0812..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0518..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              URL Booking Khusus Lokasi Ini (Opsional)
            </label>
            <input
              type="url"
              value={bookingUrlOverride}
              onChange={(e) => setBookingUrlOverride(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
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
                ? 'Simpan Perubahan Lokasi'
                : '+ Tambah Lokasi Praktik'}
          </button>
        </form>
      </div>
    </div>
  );
}
