'use server';

/**
 * app/admin/profile/actions.ts — Server actions untuk update profil dokter.
 */

import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { profile } from '@/db/schema';
import { requireUser } from '@/lib/session';
import { revalidatePublicSite } from '@/lib/revalidate';

export interface SaveProfileInput {
  fullName: string;
  specialty: string;
  subSpecialty: string;
  strSipDisplay: string;
  education: string;
  certifications: string;
  experienceHistory: string;
  organizations: string;
  bookingUrl: string;
  email: string;
  socialLinks: string;
  personalStory: string;
  photoImageId: string | null;
}

export async function saveProfileAction(
  input: SaveProfileInput
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  try {
    const db = getDb();
    await db
      .update(profile)
      .set({
        fullName: input.fullName.trim(),
        specialty: input.specialty.trim(),
        subSpecialty: input.subSpecialty.trim(),
        strSipDisplay: input.strSipDisplay.trim(),
        education: input.education.trim(),
        certifications: input.certifications.trim(),
        experienceHistory: input.experienceHistory.trim(),
        organizations: input.organizations.trim(),
        bookingUrl: input.bookingUrl.trim(),
        email: input.email.trim(),
        socialLinks: input.socialLinks.trim(),
        personalStory: input.personalStory.trim(),
        photoImageId: input.photoImageId,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, 1));

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan profil';
    return { success: false, error: message };
  }
}
