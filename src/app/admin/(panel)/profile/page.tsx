import { eq } from 'drizzle-orm';
import PageHeader from '@/components/admin/PageHeader';
import { getDb } from '@/db/client';
import {
  profile as profileTable,
  profileTranslations as profileTranslationsTable,
} from '@/db/schema';
import { requireUser } from '@/lib/session';
import ProfileForm from './ProfileForm';

export default async function AdminProfilePage() {
  await requireUser();
  const db = getDb();
  const [[row], [enRow]] = await Promise.all([
    db.select().from(profileTable).where(eq(profileTable.id, 1)).limit(1),
    db
      .select()
      .from(profileTranslationsTable)
      .where(eq(profileTranslationsTable.locale, 'en'))
      .limit(1),
  ]);

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
          en: {
            specialty: enRow?.specialty ?? '',
            subSpecialty: enRow?.subSpecialty ?? '',
            education: enRow?.education ?? '',
            certifications: enRow?.certifications ?? '',
            experienceHistory: enRow?.experienceHistory ?? '',
            organizations: enRow?.organizations ?? '',
            personalStory: enRow?.personalStory ?? '',
          },
        }}
      />
    </div>
  );
}
