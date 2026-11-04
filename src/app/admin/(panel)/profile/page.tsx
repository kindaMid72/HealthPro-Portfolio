import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { profile as profileTable } from '@/db/schema';
import PageHeader from '@/components/admin/PageHeader';
import ProfileForm from './ProfileForm';
import { requireUser } from '@/lib/session';

export default async function AdminProfilePage() {
  await requireUser();
  const [row] = await getDb()
    .select()
    .from(profileTable)
    .where(eq(profileTable.id, 1))
    .limit(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil & Kredensial Dokter"
        description="Perbarui biodata, riwayat pendidikan, pengalaman klinis, foto profil, dan tautan booking global."
      />

      <ProfileForm
        initialProfile={{
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
        }}
      />
    </div>
  );
}
