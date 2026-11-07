'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  emptyLocationDraft,
  hasWeeklySlots,
  type LocationDraft,
  type LocationEnglish,
  type LocationItem,
  locationDraftError,
  locationToDraft,
  type WeeklyRanges,
} from '@/app/admin/locations/model';
import { deleteLocationAction, moveLocationAction, saveLocationAction } from '@/app/admin/locations/actions';
import Alert from '@/components/admin/Alert';
import { Button } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TextAreaField, TextField } from '@/components/admin/Field';
import { id } from '@/i18n/dictionaries/id';
import { WeeklyScheduleEditor } from './ScheduleFields';

type Message = { type: 'ok' | 'error'; text: string };

function WeeklySummary({ week }: { week: WeeklyRanges }) {
  const days = week.flatMap((ranges, day) => (ranges.length > 0 ? [{ day, ranges }] : []));
  if (days.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {days.map(({ day, ranges }) => (
        <li key={day} className="rounded-lg bg-primary-tint px-2.5 py-1 text-xs font-medium text-primary">
          {`${id.schedule.daysShort[day]} ${ranges.map((r) => `${r.opens}–${r.closes}`).join(', ')}`}
        </li>
      ))}
    </ul>
  );
}

export default function LocationsManager({ locations }: { locations: LocationItem[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<LocationDraft>(emptyLocationDraft);
  const [tab, setTab] = useState<'id' | 'en'>('id');
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<LocationItem | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const editing = draft.id !== undefined;

  function patch(next: Partial<LocationDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function patchEn(next: Partial<LocationEnglish>) {
    setDraft((current) => ({ ...current, en: { ...current.en, ...next } }));
  }

  function resetForm() {
    setDraft(emptyLocationDraft());
    setTab('id');
  }

  function startEdit(loc: LocationItem) {
    setDraft(locationToDraft(loc));
    setTab('id');
    setMessage(null);
  }

  /** Runs a server action, then refreshes server data so the list reflects the change. */
  async function run(action: () => Promise<{ success: boolean; error?: string }>, okText?: string, onSuccess?: () => void) {
    setBusy(true);
    setMessage(null);
    const result = await action();
    setBusy(false);
    if (!result.success) {
      setMessage({ type: 'error', text: result.error ?? 'Terjadi kesalahan.' });
      return;
    }
    if (okText) setMessage({ type: 'ok', text: okText });
    onSuccess?.();
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = locationDraftError(draft);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    await run(
      () => saveLocationAction(draft),
      editing ? 'Perubahan lokasi disimpan.' : 'Lokasi praktik ditambahkan.',
      resetForm,
    );
  }

  async function handleDelete() {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    await run(
      () => deleteLocationAction(target.id),
      'Lokasi praktik dihapus.',
      () => {
        if (draft.id === target.id) resetForm();
      },
    );
  }

  async function handleMove(id: string, dir: 'up' | 'down') {
    await run(() => moveLocationAction(id, dir));
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {message && (
        <div className="lg:col-span-12">
          <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>
        </div>
      )}

      <div className="space-y-4 lg:col-span-7">
        {locations.length === 0 && (
          <EmptyState
            title="Belum ada lokasi praktik"
            description="Tambahkan lokasi pertama lewat formulir di samping."
          />
        )}

        {locations.map((loc, idx) => (
          <div key={loc.id} className="card-clinical card-clinical-interactive p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-text-heading">{loc.locationName}</h3>
                <p className="mt-1 text-sm">{loc.address}</p>
                <WeeklySummary week={loc.weekly} />
                {!hasWeeklySlots(loc.weekly) && (
                  <p className="mt-2 text-xs italic text-text-muted">Jam praktik mingguan belum diisi.</p>
                )}
                {loc.scheduleNote && (
                  <p className="mt-2 text-xs text-text-muted">Catatan jadwal: {loc.scheduleNote}</p>
                )}
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
                  disabled={busy || idx === locations.length - 1}
                  onClick={() => void handleMove(loc.id, 'down')}
                  aria-label={`Pindahkan ${loc.locationName} ke bawah`}
                  title="Turunkan urutan"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </Button>
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => startEdit(loc)}>
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
        <form onSubmit={handleSubmit}>
          <Card
            title={editing ? 'Edit lokasi praktik' : 'Tambah lokasi baru'}
            actions={
              editing ? (
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Batal edit
                </Button>
              ) : undefined
            }
          >
            <div className="space-y-5">
              <div role="tablist" aria-label="Bahasa konten lokasi" className="flex gap-1 rounded-lg bg-bg p-1">
                {(['id', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    role="tab"
                    aria-selected={tab === lang}
                    onClick={() => setTab(lang)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                      tab === lang ? 'bg-surface text-text-heading shadow-2xs' : 'text-text-muted'
                    }`}
                  >
                    {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
                  </button>
                ))}
              </div>

              {tab === 'id' ? (
                <div className="space-y-4">
                  <TextField
                    label="Nama RS / klinik"
                    required
                    value={draft.locationName}
                    onChange={(e) => patch({ locationName: e.target.value })}
                    placeholder="Contoh: RSUD dr. H. Andi Abdurrahman Noor"
                  />
                  <TextAreaField
                    label="Alamat lengkap"
                    required
                    rows={2}
                    value={draft.address}
                    onChange={(e) => patch({ address: e.target.value })}
                  />
                  <TextAreaField
                    label="Catatan jadwal (opsional)"
                    rows={2}
                    value={draft.scheduleNote}
                    onChange={(e) => patch({ scheduleNote: e.target.value })}
                    hint="Tampil di bawah jadwal, mis. “Jadwal dapat berubah sewaktu-waktu.”"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <TextField
                    label="Location name (English)"
                    value={draft.en.locationName}
                    onChange={(e) => patchEn({ locationName: e.target.value })}
                    hint="Kosongkan untuk memakai nama Bahasa Indonesia."
                  />
                  <TextAreaField
                    label="Address (English)"
                    rows={2}
                    value={draft.en.address}
                    onChange={(e) => patchEn({ address: e.target.value })}
                    hint="Kosongkan untuk memakai alamat Bahasa Indonesia."
                  />
                  <TextAreaField
                    label="Schedule note (English)"
                    rows={2}
                    value={draft.en.scheduleNote}
                    onChange={(e) => patchEn({ scheduleNote: e.target.value })}
                    hint="Kosongkan untuk memakai catatan Bahasa Indonesia."
                  />
                </div>
              )}

              <div className="border-t border-border pt-5">
                <h3 className="text-sm font-bold text-text-heading">Jam praktik mingguan (WITA)</h3>
                <p className="mt-1 text-xs text-text-muted">
                  Hari tanpa rentang berarti tidak praktik. Jam tutup harus setelah jam buka.
                </p>
                <div className="mt-4">
                  <WeeklyScheduleEditor value={draft.weekly} onChange={(weekly) => patch({ weekly })} />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    label="Nomor WhatsApp"
                    value={draft.whatsapp}
                    onChange={(e) => patch({ whatsapp: e.target.value })}
                    placeholder="0812..."
                  />
                  <TextField
                    label="Nomor telepon"
                    value={draft.phone}
                    onChange={(e) => patch({ phone: e.target.value })}
                    placeholder="0518..."
                  />
                </div>
                <TextField
                  label="URL booking khusus lokasi ini (opsional)"
                  type="url"
                  value={draft.bookingUrlOverride}
                  onChange={(e) => patch({ bookingUrlOverride: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Button type="submit" pending={busy} className="w-full">
                {busy ? 'Menyimpan...' : editing ? 'Simpan perubahan lokasi' : 'Tambah lokasi praktik'}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus lokasi praktik?"
        description={`Lokasi "${pendingDelete?.locationName ?? ''}" beserta jam praktiknya dan pengecualian tanggal khusus lokasi ini akan dihapus dari website.`}
        confirmLabel="Hapus lokasi"
        pending={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
