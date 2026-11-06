'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { profile, profileTranslations } from '@/db/schema';
import { deleteImageIfUnused } from '@/lib/images';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';
import { actionErrorMessage } from '@/lib/action-error';

export interface ProfileTranslationInput {
  specialty: string;
  subSpecialty: string;
  education: string;
  certifications: string;
  experienceHistory: string;
  organizations: string;
  personalStory: string;
}

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
  en?: ProfileTranslationInput;
}

export async function saveProfileAction(
  input: SaveProfileInput,
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  const fullName = input.fullName.trim();
  const specialty = input.specialty.trim();

  if (!fullName || !specialty) {
    return {
      success: false,
      error: 'Nama dokter dan spesialisasi utama wajib diisi.',
    };
  }

  const bookingUrl = input.bookingUrl.trim();
  if (bookingUrl && !z.string().url().safeParse(bookingUrl).success) {
    return {
      success: false,
      error: 'Format URL booking tidak valid (harus dimulai dengan https:// atau http://).',
    };
  }
  if (bookingUrl && !/^https?:\/\//i.test(bookingUrl)) {
    return {
      success: false,
      error: 'URL booking harus menggunakan protokol http:// atau https://.',
    };
  }

  const email = input.email.trim();
  if (email && !z.string().email().safeParse(email).success) {
    return {
      success: false,
      error: 'Format alamat email tidak valid.',
    };
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({ photoImageId: profile.photoImageId })
      .from(profile)
      .where(eq(profile.id, 1))
      .limit(1);

    const oldPhotoId = existing?.photoImageId ?? null;
    const newPhotoId = input.photoImageId ?? null;

    const values = {
      fullName,
      specialty,
      subSpecialty: input.subSpecialty.trim(),
      strSipDisplay: input.strSipDisplay.trim(),
      education: input.education.trim(),
      certifications: input.certifications.trim(),
      experienceHistory: input.experienceHistory.trim(),
      organizations: input.organizations.trim(),
      bookingUrl,
      email,
      socialLinks: input.socialLinks.trim(),
      personalStory: input.personalStory.trim(),
      photoImageId: newPhotoId,
      updatedAt: new Date(),
    };

    await db
      .insert(profile)
      .values({ id: 1, ...values })
      .onConflictDoUpdate({
        target: profile.id,
        set: values,
      });

    // Row lifecycle rule untuk terjemahan EN
    if (input.en) {
      const enSpecialty = input.en.specialty.trim();
      const enSubSpecialty = input.en.subSpecialty.trim();
      const enEducation = input.en.education.trim();
      const enCertifications = input.en.certifications.trim();
      const enExperienceHistory = input.en.experienceHistory.trim();
      const enOrganizations = input.en.organizations.trim();
      const enPersonalStory = input.en.personalStory.trim();

      const hasAnyEn = Boolean(
        enSpecialty ||
        enSubSpecialty ||
        enEducation ||
        enCertifications ||
        enExperienceHistory ||
        enOrganizations ||
        enPersonalStory,
      );

      if (hasAnyEn) {
        await db
          .insert(profileTranslations)
          .values({
            locale: 'en',
            specialty: enSpecialty,
            subSpecialty: enSubSpecialty,
            education: enEducation,
            certifications: enCertifications,
            experienceHistory: enExperienceHistory,
            organizations: enOrganizations,
            personalStory: enPersonalStory,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: profileTranslations.locale,
            set: {
              specialty: enSpecialty,
              subSpecialty: enSubSpecialty,
              education: enEducation,
              certifications: enCertifications,
              experienceHistory: enExperienceHistory,
              organizations: enOrganizations,
              personalStory: enPersonalStory,
              updatedAt: new Date(),
            },
          });
      } else {
        await db
          .delete(profileTranslations)
          .where(eq(profileTranslations.locale, 'en'));
      }
    }

    if (oldPhotoId && oldPhotoId !== newPhotoId) {
      await deleteImageIfUnused(oldPhotoId);
    }

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, 'Gagal menyimpan profil.', 'profile/actions'),
    };
  }
}
