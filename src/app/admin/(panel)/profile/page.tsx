/**
 * app/admin/(panel)/profile/page.tsx — Halaman kelola profil dokter.
 */

import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { profile } from '@/db/schema';
import { ProfileForm } from './ProfileForm';

export const metadata: Metadata = {
  title: 'Profil Dokter',
};

export default async function AdminProfilePage() {
  const db = getDb();
  const [row] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);

  const initial = {
    fullName: row?.fullName ?? '',
    specialty: row?.specialty ?? '',
    subSpecialty: row?.subSpecialty ?? '',
    strSipDisplay: row?.strSipDisplay ?? '',
    education: row?.education ?? '',
    certifications: row?.certifications ?? '',
    experienceHistory: row?.experienceHistory ?? '',
    organizations: row?.organizations ?? '',
    bookingUrl: row?.bookingUrl ?? '',
    email: row?.email ?? '',
    socialLinks: row?.socialLinks ?? '',
    personalStory: row?.personalStory ?? '',
    photoImageId: row?.photoImageId ?? null,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Profil Dokter</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ubah informasi biografi, gelar, STR/SIP, dan riwayat pendidikan yang tampil di website profil.
        </p>
      </div>

      <ProfileForm initial={initial} />
    </div>
  );
}
