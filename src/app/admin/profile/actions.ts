'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db/client';
import { profile, profileTranslations } from '@/db/schema';
import { cleanHeroText, validateHeroFields } from '@/lib/hero';
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
  heroTagline: string;
  heroBookingLabel: string;
  heroWhatsappLabel: string;
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
  heroTagline: string;
  heroBookingLabel: string;
  heroWhatsappLabel: string;
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

  const hero = {
    tagline: cleanHeroText(input.heroTagline),
    bookingLabel: cleanHeroText(input.heroBookingLabel),
    whatsappLabel: cleanHeroText(input.heroWhatsappLabel),
  };
  const heroError = validateHeroFields(hero);
  if (heroError) return { success: false, error: heroError };

  const enHero = input.en
    ? {
        tagline: cleanHeroText(input.en.heroTagline),
        bookingLabel: cleanHeroText(input.en.heroBookingLabel),
        whatsappLabel: cleanHeroText(input.en.heroWhatsappLabel),
      }
    : null;
  if (enHero) {
    const enHeroError = validateHeroFields(enHero);
    if (enHeroError) return { success: false, error: enHeroError };
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
      heroTagline: hero.tagline,
      heroBookingLabel: hero.bookingLabel,
      heroWhatsappLabel: hero.whatsappLabel,
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

    // Row lifecycle rule for EN translations
    if (input.en && enHero) {
      const enSpecialty = input.en.specialty.trim();
      const enSubSpecialty = input.en.subSpecialty.trim();
      const enEducation = input.en.education.trim();
      const enCertifications = input.en.certifications.trim();
      const enExperienceHistory = input.en.experienceHistory.trim();
      const enOrganizations = input.en.organizations.trim();
      const enPersonalStory = input.en.personalStory.trim();
      const { tagline: enTagline, bookingLabel: enBookingLabel, whatsappLabel: enWhatsappLabel } = enHero;

      const hasAnyEn = Boolean(
        enSpecialty ||
        enSubSpecialty ||
        enEducation ||
        enCertifications ||
        enExperienceHistory ||
        enOrganizations ||
        enPersonalStory ||
        enTagline ||
        enBookingLabel ||
        enWhatsappLabel,
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
            heroTagline: enTagline,
            heroBookingLabel: enBookingLabel,
            heroWhatsappLabel: enWhatsappLabel,
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
              heroTagline: enTagline,
              heroBookingLabel: enBookingLabel,
              heroWhatsappLabel: enWhatsappLabel,
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
