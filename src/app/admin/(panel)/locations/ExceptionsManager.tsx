'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ExceptionDraft,
  type ExceptionItem,
  emptyExceptionDraft,
  exceptionDraftError,
  exceptionToDraft,
  formatDateId,
} from '@/app/admin/locations/model';
import { deleteExceptionAction, purgePastExceptionsAction, saveExceptionAction } from '@/app/admin/locations/actions';
import Alert from '@/components/admin/Alert';
import { Button } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { SelectField, TextAreaField, TextField } from '@/components/admin/Field';
import { getWitaClock } from '@/lib/schedule';
import { RangeList } from './ScheduleFields';

export interface LocationOption {
  id: string;
  name: string;
}

type Message = { type: 'ok' | 'error'; text: string };

/** Sentinel select value for "all locations"; stored as locationId = null. */
const ALL_LOCATIONS = 'all';

function describeDates(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDateId(startDate);
  return `${formatDateId(startDate)} – ${formatDateId(endDate)}`;
}

export default function ExceptionsManager({
  exceptions,
  locations,
}: {
  exceptions: ExceptionItem[];
  locations: LocationOption[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExceptionDraft>(emptyExceptionDraft);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ExceptionItem | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const editing = draft.id !== undefined;
  const nameById = new Map(locations.map((loc) => [loc.id, loc.name]));
  // Past = ended before today in WITA, the same clock the public site uses.
  const today = getWitaClock(new Date()).isoDate;
  const pastCount = exceptions.filter((item) => item.endDate < today).length;
  const visible = showPast ? exceptions : exceptions.filter((item) => item.endDate >= today);

  function patch(next: Partial<ExceptionDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function resetForm() {
    setDraft(emptyExceptionDraft());
  }

  function startEdit(item: ExceptionItem) {
    setDraft(exceptionToDraft(item));
    setMessage(null);
  }

  function changeScope(value: string) {
    if (value === ALL_LOCATIONS) {
      // Global exceptions are closures only (see schema check location_exceptions_scope_check).
      patch({ locationId: null, closed: true, hours: [] });
    } else {
      patch({ locationId: value });
    }
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
    const error = exceptionDraftError(draft);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }
    await run(
      () => saveExceptionAction(draft),
      editing ? 'Pengecualian diperbarui.' : 'Pengecualian ditambahkan.',
      resetForm,
    );
  }

  async function handleDelete() {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    await run(
      () => deleteExceptionAction(target.id),
      'Pengecualian dihapus.',
      () => {
        if (draft.id === target.id) resetForm();
      },
    );
  }

  async function handlePurge() {
    setPurgeOpen(false);
    await run(() => purgePastExceptionsAction(), `${pastCount} pengecualian yang sudah lewat dihapus.`);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {message && (
        <div className="lg:col-span-12">
          <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>
        </div>
      )}

      <div className="space-y-4 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} />
            Tampilkan yang sudah lewat
          </label>
          {pastCount > 0 && (
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setPurgeOpen(true)}>
              Hapus yang sudah lewat ({pastCount})
            </Button>
          )}
        </div>
        {exceptions.length === 0 && (
          <EmptyState
            title="Belum ada pengecualian tanggal"
            description="Tambahkan libur atau jam khusus pada tanggal tertentu lewat formulir di samping."
          />
        )}
        {exceptions.length > 0 && visible.length === 0 && (
          <p className="text-sm text-text-muted">
            Tidak ada pengecualian yang akan datang. Centang “Tampilkan yang sudah lewat” untuk melihat riwayat.
          </p>
        )}

        {visible.map((item) => (
          <div key={item.id} className="card-clinical card-clinical-interactive p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-text-heading">
                  {describeDates(item.startDate, item.endDate)}
                </h3>
                <p className="mt-1 text-sm">
                  {item.locationId === null
                    ? 'Semua lokasi'
                    : (nameById.get(item.locationId) ?? 'Lokasi tidak dikenal')}
                </p>
                <p className="mt-2 inline-block rounded-lg bg-primary-tint px-2.5 py-1 text-sm font-medium text-primary">
                  {item.closed
                    ? 'Libur (tutup)'
                    : item.hours.map((r) => `${r.opens}–${r.closes}`).join(', ')}
                </p>
                {item.reason && <p className="mt-2 text-xs text-text-muted">{item.reason}</p>}
              </div>

              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="secondary" disabled={busy} onClick={() => startEdit(item)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => setPendingDelete(item)}>
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
            title={editing ? 'Edit pengecualian tanggal' : 'Tambah pengecualian tanggal'}
            actions={
              editing ? (
                <Button size="sm" variant="ghost" onClick={resetForm}>
                  Batal edit
                </Button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              <SelectField
                label="Berlaku untuk"
                value={draft.locationId ?? ALL_LOCATIONS}
                onChange={(e) => changeScope(e.target.value)}
              >
                <option value={ALL_LOCATIONS}>Semua lokasi (libur)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </SelectField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  label="Tanggal mulai"
                  type="date"
                  required
                  value={draft.startDate}
                  onChange={(e) => patch({ startDate: e.target.value })}
                />
                <TextField
                  label="Tanggal selesai"
                  type="date"
                  required
                  value={draft.endDate}
                  onChange={(e) => patch({ endDate: e.target.value })}
                />
              </div>

              <SelectField
                label="Jenis"
                value={draft.closed ? 'closed' : 'hours'}
                disabled={draft.locationId === null}
                onChange={(e) => patch({ closed: e.target.value === 'closed' })}
                hint={draft.locationId === null ? 'Pengecualian untuk semua lokasi hanya bisa berupa libur.' : undefined}
              >
                <option value="closed">Libur (tutup)</option>
                <option value="hours">Jam khusus</option>
              </SelectField>

              {!draft.closed && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-heading">Jam khusus pada tanggal ini</p>
                  <RangeList
                    label="tanggal khusus"
                    value={draft.hours}
                    onChange={(hours) => patch({ hours })}
                  />
                </div>
              )}

              <TextAreaField
                label="Keterangan (Bahasa Indonesia)"
                required
                rows={2}
                value={draft.reason}
                onChange={(e) => patch({ reason: e.target.value })}
                hint="Tampil di website pada jadwal dan status praktik."
              />
              <TextAreaField
                label="Keterangan (English)"
                rows={2}
                value={draft.reasonEn}
                onChange={(e) => patch({ reasonEn: e.target.value })}
                hint="Dikosongkan = memakai keterangan Bahasa Indonesia di /en."
              />

              <Button type="submit" pending={busy} className="w-full">
                {busy ? 'Menyimpan...' : editing ? 'Simpan pengecualian' : 'Tambah pengecualian'}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus pengecualian tanggal?"
        description={
          pendingDelete
            ? `Pengecualian ${describeDates(pendingDelete.startDate, pendingDelete.endDate)} akan dihapus. Jadwal kembali mengikuti pola mingguan.`
            : ''
        }
        confirmLabel="Hapus pengecualian"
        pending={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={purgeOpen}
        title="Hapus pengecualian yang sudah lewat?"
        description={`${pastCount} pengecualian yang sudah lewat akan dihapus permanen. Jadwal yang tampil di website tidak berubah.`}
        confirmLabel="Hapus yang sudah lewat"
        pending={busy}
        onConfirm={() => void handlePurge()}
        onCancel={() => setPurgeOpen(false)}
      />
    </div>
  );
}
