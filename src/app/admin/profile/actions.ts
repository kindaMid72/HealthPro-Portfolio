'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { profile } from '@/db/schema';
import { deleteImageIfUnused } from '@/lib/images';
import { revalidatePublicSite } from '@/lib/revalidate';
import { requireUser } from '@/lib/session';

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
  input: SaveProfileInput,
): Promise<{ success: boolean; error?: string }> {
  await requireUser();

  const fullName = input.fullName.trim();
  const specialty = input.specialty.trim();

  if (!fullName || !specialty) {
    return {
      success: false,
      error: 'Nama lengkap dan spesialisasi wajib diisi.',
    };
  }

  // Aturan yang sama dengan ProfileSchema (src/lib/types.ts): nilai yang lolos
  // di sini harus lolos parse di getProfile, kalau tidak situs publik jatuh
  // ke data fallback.
  const bookingUrl = input.bookingUrl.trim();
  if (bookingUrl && !z.string().url().safeParse(bookingUrl).success) {
    return {
      success: false,
      error: 'URL Booking tidak valid. Contoh: https://contoh.com/booking',
    };
  }
  if (bookingUrl && !/^https?:\/\//i.test(bookingUrl)) {
    return {
      success: false,
      error: 'URL Booking harus diawali dengan http:// atau https://',
    };
  }

  const email = input.email.trim();
  if (email && !z.string().email().safeParse(email).success) {
    return {
      success: false,
      error: 'Format email tidak valid. Contoh: nama@contoh.com',
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

    if (oldPhotoId && oldPhotoId !== newPhotoId) {
      await deleteImageIfUnused(oldPhotoId);
    }

    revalidatePublicSite();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Gagal menyimpan profil.',
    };
  }
}
