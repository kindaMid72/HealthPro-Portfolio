'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Foto Profil & Identitas Utama */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="font-heading text-sm font-bold text-primary-dark">
              Foto Profil Dokter
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              Disarankan foto PNG/WebP transparan (tanpa latar) untuk tampilan
              Hero terbaik.
            </p>

            <div className="mt-4 flex flex-col items-center rounded-xl border border-border bg-bg p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreviewUrl}
                alt="Pratinjau Foto Dokter"
                className="h-56 w-auto object-contain"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 rounded-xl border border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
              >
                {uploadingPhoto ? 'Mengunggah...' : 'Unggah Foto Baru'}
              </button>
              {form.photoImageId && (
                <button
                  type="button"
                  onClick={() => updateField('photoImageId', null)}
                  className="rounded-xl border border-border bg-bg px-3 py-2 text-xs font-medium text-text-muted hover:text-red-700"
                >
                  Pakai Default
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <h2 className="font-heading text-sm font-bold text-primary-dark">
              Kontak & Tautan Booking Global
            </h2>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                URL Booking Global (Opsional)
              </label>
              <input
                type="url"
                value={form.bookingUrl}
                onChange={(e) => updateField('bookingUrl', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-text-muted">
                Jika dikosongkan, tombol CTA utama otomatis mengarah ke WhatsApp
                lokasi pertama.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Email Resmi
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="dokter@domain.id"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Tautan Sosial / Profil Eksternal (Pisahkan dengan baris baru atau |)
              </label>
              <textarea
                rows={2}
                value={form.socialLinks}
                onChange={(e) => updateField('socialLinks', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kredensial & Riwayat */}
        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-xs lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs font-semibold text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Spesialisasi Utama *
              </label>
              <input
                type="text"
                required
                value={form.specialty}
                onChange={(e) => updateField('specialty', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Sub-Spesialisasi (Opsional)
              </label>
              <input
                type="text"
                value={form.subSpecialty}
                onChange={(e) => updateField('subSpecialty', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Nomor STR / SIP
              </label>
              <input
                type="text"
                value={form.strSipDisplay}
                onChange={(e) => updateField('strSipDisplay', e.target.value)}
                placeholder="Contoh: SIP: 503/.../DINKES"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-primary-dark">
              Biografi Singkat / Pengantar Pelayanan (Personal Story)
            </label>
            <textarea
              rows={3}
              value={form.personalStory}
              onChange={(e) => updateField('personalStory', e.target.value)}
              placeholder="Tuliskan pengantar singkat mengenai dedikasi dan pendekatan pelayanan kepada pasien..."
              className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Riwayat Pendidikan (Pisahkan per baris atau dengan |)
              </label>
              <textarea
                rows={4}
                value={form.education}
                onChange={(e) => updateField('education', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Riwayat Pengalaman Klinis (Pisahkan per baris atau dengan |)
              </label>
              <textarea
                rows={4}
                value={form.experienceHistory}
                onChange={(e) =>
                  updateField('experienceHistory', e.target.value)
                }
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Sertifikasi & Pelatihan (Pisahkan per baris atau dengan |)
              </label>
              <textarea
                rows={3}
                value={form.certifications}
                onChange={(e) => updateField('certifications', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-primary-dark">
                Organisasi Profesi (Pisahkan per baris atau dengan |)
              </label>
              <textarea
                rows={3}
                value={form.organizations}
                onChange={(e) => updateField('organizations', e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2 text-xs leading-relaxed text-primary-dark focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-6 py-2.5 font-heading text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Profil Dokter'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
