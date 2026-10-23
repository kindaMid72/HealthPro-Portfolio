'use client';

/**
 * app/admin/(panel)/profile/ProfileForm.tsx — Form edit profil dokter.
 */

import { useState, useTransition } from 'react';
import { saveProfileAction, type SaveProfileInput } from '@/app/admin/profile/actions';

interface ProfileFormProps {
  initial: SaveProfileInput;
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [form, setForm] = useState<SaveProfileInput>(initial);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleChange = (
    field: keyof SaveProfileInput,
    value: string | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal mengunggah foto');
      }

      const data = await res.json();
      handleChange('photoImageId', data.id);
      setFeedback({ type: 'success', message: 'Foto dokter berhasil diunggah.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal upload foto';
      setFeedback({ type: 'error', message });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await saveProfileAction(form);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Profil dokter berhasil disimpan!' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Gagal menyimpan profil.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom kiri: data utama */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-700">
              Informasi Utama Dokter
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="dr. Yuliana, Sp.THTBKL, M.Kes"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Spesialisasi
                </label>
                <input
                  type="text"
                  required
                  value={form.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  placeholder="Spesialis THT-BKL"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600">
                  Sub-Spesialisasi / Minat Klinis
                </label>
                <input
                  type="text"
                  value={form.subSpecialty}
                  onChange={(e) => handleChange('subSpecialty', e.target.value)}
                  placeholder="Rinologi, Otologi, Bedah Kepala Leher"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                STR / SIP (Teks Legal)
              </label>
              <input
                type="text"
                value={form.strSipDisplay}
                onChange={(e) => handleChange('strSipDisplay', e.target.value)}
                placeholder="STR: 1234567890 | SIP: 0987654321"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Biografi Singkat (Personal Story)
              </label>
              <textarea
                rows={4}
                value={form.personalStory}
                onChange={(e) => handleChange('personalStory', e.target.value)}
                placeholder="Cerita singkat atau sambutan dokter kepada pasien..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-700">
              Riwayat Pendidikan & Pengalaman
            </h2>
            <p className="text-xs text-gray-500">
              Gunakan baris baru (Enter) untuk memisahkan setiap poin.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Pendidikan (1 per baris)
              </label>
              <textarea
                rows={3}
                value={form.education}
                onChange={(e) => handleChange('education', e.target.value)}
                placeholder="Dokter Umum - Universitas X&#10;Spesialis THT - Universitas Y"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Sertifikasi & Pelatihan (1 per baris)
              </label>
              <textarea
                rows={3}
                value={form.certifications}
                onChange={(e) => handleChange('certifications', e.target.value)}
                placeholder="Workshop FESS, 2023"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Riwayat Praktik / Pengalaman (1 per baris)
              </label>
              <textarea
                rows={3}
                value={form.experienceHistory}
                onChange={(e) => handleChange('experienceHistory', e.target.value)}
                placeholder="Dokter Spesialis THT di RS X (2018 - sekarang)"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Organisasi Profesi (1 per baris)
              </label>
              <textarea
                rows={3}
                value={form.organizations}
                onChange={(e) => handleChange('organizations', e.target.value)}
                placeholder="Ikatan Dokter Indonesia (IDI)&#10;PERHATI-KL Cabang..."
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kolom kanan: Foto, Kontak & Simpan */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase text-gray-700">
              Foto Dokter
            </h2>

            {form.photoImageId ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/media/${form.photoImageId}`}
                  alt="Foto Dokter"
                  className="h-56 w-full rounded-md object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleChange('photoImageId', null)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Hapus foto custom (kembali ke default)
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Saat ini memakai foto bawaan (`/images/dokter-profile.webp`).
                </p>
                <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-center hover:bg-gray-50">
                  <span className="text-xs text-gray-600">
                    {isUploadingPhoto ? 'Mengunggah foto...' : '+ Unggah Foto Dokter'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold uppercase text-gray-700">
              Tautan & Kontak
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                URL Booking Global
              </label>
              <input
                type="url"
                value={form.bookingUrl}
                onChange={(e) => handleChange('bookingUrl', e.target.value)}
                placeholder="https://booking.klinik.com/dr-yuliana"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Bila dikosongkan, CTA otomatis mengarah ke WhatsApp lokasi.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="dr.yuliana@example.com"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600">
                Social Links (JSON atau Teks)
              </label>
              <input
                type="text"
                value={form.socialLinks}
                onChange={(e) => handleChange('socialLinks', e.target.value)}
                placeholder='{"instagram": "dryuliana_tht"}'
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-xs focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
          </button>
        </div>
      </div>
    </form>
  );
}
