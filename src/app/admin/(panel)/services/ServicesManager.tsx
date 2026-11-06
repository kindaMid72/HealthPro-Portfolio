'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import Alert from '@/components/admin/Alert';
import { Button, buttonClassName } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { TextField } from '@/components/admin/Field';
import {
  createServiceAction,
  deleteServiceAction,
  moveServiceAction,
  type ServiceItem,
} from '../../services/actions';

export default function ServicesManager({ initialServices }: { initialServices: ServiceItem[] }) {
  const router = useRouter();
  const [servicesList, setServicesList] = useState<ServiceItem[]>(initialServices);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ServiceItem | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    // Berhasil → server mengarahkan ke editor; hanya kegagalan yang kembali ke sini.
    const res = await createServiceAction({ serviceName: newName });
    setBusy(false);
    if (res && !res.success) setMessage({ type: 'err', text: res.error });
  }

  async function handleDelete() {
    const svc = pendingDelete;
    if (!svc) return;
    setBusy(true);
    const res = await deleteServiceAction(svc.id);
    setBusy(false);
    setPendingDelete(null);
    if (res.success && res.items) {
      setServicesList(res.items);
      router.refresh();
    } else {
      setMessage({ type: 'err', text: res.error ?? 'Gagal menghapus layanan.' });
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
      <div className="space-y-3 lg:col-span-8">
        {message && <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>}

        {servicesList.length === 0 && (
          <EmptyState title="Belum ada layanan" description="Tambahkan layanan pertama lewat formulir di samping." />
        )}

        {servicesList.map((svc, idx) => (
          <div key={svc.id} className="card-clinical card-clinical-interactive p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-text-heading">{svc.serviceName}</h3>
                <p className="mt-1 text-sm">
                  {svc.serviceDescription || (
                    <span className="text-text-muted">Belum ada deskripsi singkat</span>
                  )}
                </p>
                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      svc.hasDetail
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {svc.hasDetail ? 'Halaman detail aktif' : 'Belum ada halaman detail'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy || idx === 0}
                  onClick={() => void handleMove(svc.id, 'up')}
                  aria-label={`Pindahkan ${svc.serviceName} ke atas`}
                  title="Naikkan urutan"
                >
                  <ChevronUp size={16} aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy || idx === servicesList.length - 1}
                  onClick={() => void handleMove(svc.id, 'down')}
                  aria-label={`Pindahkan ${svc.serviceName} ke bawah`}
                  title="Turunkan urutan"
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </Button>
                <Link href={`/admin/services/${svc.id}`} className={buttonClassName('secondary', 'sm')}>
                  Edit
                </Link>
                <Button size="sm" variant="danger" disabled={busy} onClick={() => setPendingDelete(svc)}>
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-4">
        <form onSubmit={handleCreate} className="lg:sticky lg:top-8">
          <Card title="Tambah layanan baru" description="Isi nama dulu; deskripsi dan konten detail diisi di halaman edit.">
            <div className="space-y-4">
              <TextField
                label="Nama layanan baru"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Timpanometri"
              />
              <Button type="submit" pending={busy} icon={<Plus size={16} aria-hidden="true" />} className="w-full">
                Tambah &amp; lanjut edit
              </Button>
            </div>
          </Card>
        </form>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus layanan?"
        description={`Layanan "${pendingDelete?.serviceName ?? ''}" beserta halaman detailnya akan dihapus dari website.`}
        confirmLabel="Hapus layanan"
        pending={busy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
