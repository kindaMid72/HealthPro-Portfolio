'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Alert from '@/components/admin/Alert';
import { Button } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TextAreaField, TextField } from '@/components/admin/Field';
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
  const [pendingDelete, setPendingDelete] = useState<LocationItem | null>(null);
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

  async function handleDelete() {
    const loc = pendingDelete;
    if (!loc) return;
    setBusy(true);
    const res = await deleteLocationAction(loc.id);
    setBusy(false);
    setPendingDelete(null);

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
      <div className="space-y-4 lg:col-span-7">
        {message && <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>}

        {locationsList.length === 0 && (
          <EmptyState
            title="Belum ada lokasi praktik"
            description="Tambahkan lokasi pertama lewat formulir di samping."
          />
        )}

        {locationsList.map((loc, idx) => (
          <div key={loc.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold">{loc.locationName}</h3>
                <p className="mt-1 text-sm">{loc.address}</p>
                <p className="mt-1 text-sm font-medium text-primary">Jam praktik: {loc.practiceHours}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-muted">
                  <span>WA: {loc.whatsapp || '—'}</span>
                  <span>Telp: {loc.phone || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy || idx === 0}
                  onClick={() => void handleMove(loc.id, 'up')}
                  aria-label={`Pindahkan ${loc.locationName} ke atas`}
                  title="Naikkan urutan"
                >
                  <ChevronUp size={16} aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy || idx === locationsList.length - 1}
                  onClick={() => void handleMove(loc.id, 'down')}
                  aria-label={`Pindahkan ${loc.locationName} ke bawah`}
                  title="Turunkan urutan"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => startEdit(loc)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => setPendingDelete(loc)}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-5">
        <form onSubmit={handleSubmit} className="lg:sticky lg:top-8">
          <Card
            title={editingId ? 'Edit lokasi praktik' : 'Tambah lokasi baru'}
            actions={
              editingId ? (
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Batal edit
                </Button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              <TextField
                label="Nama RS / klinik"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Contoh: RSUD dr. H. Andi Abdurrahman Noor"
              />
              <TextAreaField
                label="Alamat lengkap"
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <TextField
                label="Jam praktik"
                required
                value={practiceHours}
                onChange={(e) => setPracticeHours(e.target.value)}
                placeholder="Contoh: Senin–Jumat, 08.00–14.00"
                hint="Format hari + jam (mis. Senin–Sabtu, 17.00–21.00) membuat jadwal tampil di papan mingguan dan status “Praktik hari ini”."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Nomor WhatsApp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="0812..."
                />
                <TextField
                  label="Nomor telepon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0518..."
                />
              </div>
              <TextField
                label="URL booking khusus lokasi ini (opsional)"
                type="url"
                value={bookingUrlOverride}
                onChange={(e) => setBookingUrlOverride(e.target.value)}
                placeholder="https://..."
              />
              <Button type="submit" pending={busy} className="w-full">
                {busy ? 'Menyimpan...' : editingId ? 'Simpan perubahan lokasi' : 'Tambah lokasi praktik'}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus lokasi praktik?"
        description={`Lokasi "${pendingDelete?.locationName ?? ''}" akan dihapus dari website.`}
        confirmLabel="Hapus lokasi"
        pending={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
