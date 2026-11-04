'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/admin/Alert';
import { Button } from '@/components/admin/Button';
import Card from '@/components/admin/Card';
import { TextAreaField, TextField } from '@/components/admin/Field';
import {
  type SaveProfileInput,
  saveProfileAction,
} from '../../profile/actions';

export default function ProfileForm({
  initialProfile,
}: {
  initialProfile: SaveProfileInput;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SaveProfileInput>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateField<K extends keyof SaveProfileInput>(
    key: K,
    val: SaveProfileInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingPhoto(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: 'err',
          text: data.error ?? 'Gagal mengunggah foto.',
        });
      } else {
        updateField('photoImageId', data.id);
        setMessage({
          type: 'ok',
          text: 'Foto berhasil diunggah. Klik "Simpan Profil" untuk menerapkan.',
        });
      }
    } catch {
      setMessage({ type: 'err', text: 'Gagal mengunggah foto profil.' });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await saveProfileAction(form);
    setSaving(false);

    if (!res.success) {
      setMessage({
        type: 'err',
        text: res.error ?? 'Gagal menyimpan profil.',
      });
      return;
    }

    setMessage({
      type: 'ok',
      text: 'Profil dokter berhasil diperbarui dan halaman publik telah disegarkan.',
    });
    router.refresh();
  }

  const photoPreviewUrl = form.photoImageId
    ? `/media/${form.photoImageId}`
    : '/images/dokter-profile.webp';

  const LIST_HINT = 'Pisahkan setiap item dengan tanda | atau baris baru.';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && <Alert tone={message.type === 'ok' ? 'success' : 'error'}>{message.text}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card
            title="Foto profil"
            description="Disarankan foto PNG/WebP transparan (tanpa latar) untuk tampilan Hero terbaik."
          >
            <div className="flex flex-col items-center rounded-lg border border-border bg-bg p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreviewUrl} alt="Pratinjau foto dokter" className="h-56 w-auto object-contain" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handlePhotoUpload}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                pending={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingPhoto ? 'Mengunggah...' : 'Unggah foto baru'}
              </Button>
              {form.photoImageId && (
                <Button variant="ghost" onClick={() => updateField('photoImageId', null)}>
                  Pakai default
                </Button>
              )}
            </div>
          </Card>

          <Card title="Kontak & booking">
            <div className="space-y-4">
              <TextField
                label="URL booking global (opsional)"
                type="url"
                value={form.bookingUrl}
                onChange={(e) => updateField('bookingUrl', e.target.value)}
                placeholder="https://..."
                hint="Jika dikosongkan, tombol CTA utama otomatis mengarah ke WhatsApp lokasi pertama."
              />
              <TextField
                label="Email resmi"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="dokter@domain.id"
              />
              <TextAreaField
                label="Tautan sosial / profil eksternal"
                hint="Pisahkan dengan baris baru atau |."
                rows={2}
                value={form.socialLinks}
                onChange={(e) => updateField('socialLinks', e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <Card title="Identitas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Nama lengkap & gelar"
                required
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
              />
              <TextField
                label="Spesialisasi utama"
                required
                value={form.specialty}
                onChange={(e) => updateField('specialty', e.target.value)}
              />
              <TextField
                label="Sub-spesialisasi (opsional)"
                value={form.subSpecialty}
                onChange={(e) => updateField('subSpecialty', e.target.value)}
              />
              <TextField
                label="Nomor STR / SIP"
                value={form.strSipDisplay}
                onChange={(e) => updateField('strSipDisplay', e.target.value)}
                placeholder="Contoh: SIP: 503/.../DINKES"
              />
            </div>
          </Card>

          <Card title="Pengantar" description="Tampil di bagian Tentang pada beranda.">
            <TextAreaField
              label="Biografi singkat / pengantar pelayanan"
              rows={3}
              value={form.personalStory}
              onChange={(e) => updateField('personalStory', e.target.value)}
              placeholder="Tuliskan pengantar singkat mengenai dedikasi dan pendekatan pelayanan kepada pasien..."
            />
          </Card>

          <Card title="Riwayat & kredensial" description={LIST_HINT}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextAreaField
                label="Riwayat pendidikan"
                rows={4}
                value={form.education}
                onChange={(e) => updateField('education', e.target.value)}
              />
              <TextAreaField
                label="Riwayat pengalaman klinis"
                rows={4}
                value={form.experienceHistory}
                onChange={(e) => updateField('experienceHistory', e.target.value)}
              />
              <TextAreaField
                label="Sertifikasi & pelatihan"
                rows={3}
                value={form.certifications}
                onChange={(e) => updateField('certifications', e.target.value)}
              />
              <TextAreaField
                label="Organisasi profesi"
                rows={3}
                value={form.organizations}
                onChange={(e) => updateField('organizations', e.target.value)}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-border bg-surface/95 p-3 backdrop-blur md:mx-0 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Button type="submit" pending={saving}>
          {saving ? 'Menyimpan...' : 'Simpan profil'}
        </Button>
      </div>
    </form>
  );
}
