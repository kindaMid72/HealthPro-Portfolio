/**
 * components/AboutSection.tsx
 * Bio lengkap dokter: pendidikan, pengalaman, sertifikasi, organisasi.
 *
 * Catatan penting:
 * - personal_story TIDAK ditampilkan (lihat 02-content-data.md — perlu klarifikasi)
 * - str_sip_display ditampilkan hanya kalau terisi (FR-4)
 * - education & experience_history di-split per " | " menjadi list items
 * - certifications & organizations: hidden kalau kosong
 */

import { Profile } from "@/lib/types";

interface AboutSectionProps {
  profile: Profile;
}

/** Split string yang dipisah " | " jadi array, filter entri kosong */
function splitPipeList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ambil nama depan tanpa gelar untuk sapaan ("dr. Yuliana, Sp..." → "Yuliana") */
function getFirstName(fullName: string): string {
  // Strip prefix "dr.", "dr", gelar suffix setelah koma, ambil kata pertama sisanya
  const stripped = fullName
    .replace(/^(dr\.|dr)\s*/i, "")
    .split(",")[0]
    .trim();
  return stripped.split(" ")[0] || fullName;
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const firstName = getFirstName(profile.full_name);
  const educationList = splitPipeList(profile.education);
  const experienceList = splitPipeList(profile.experience_history);
  const certificationList = splitPipeList(profile.certifications);
  const organizationList = splitPipeList(profile.organizations);

  return (
    <section
      id="tentang"
      aria-labelledby="tentang-heading"
      className="border-t border-gray-100 px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="tentang-heading"
          className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Tentang Dr. {firstName}
        </h2>

        {/* No. STR/SIP — hanya tampil kalau terisi */}
        {profile.str_sip_display && (
          <p
            id="doctor-str-sip"
            className="mb-6 text-sm text-gray-500"
          >
            No. STR/SIP: {profile.str_sip_display}
          </p>
        )}

        <div className="space-y-8">
          {/* Pendidikan */}
          {educationList.length > 0 && (
            <div id="education-block">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Pendidikan
              </h3>
              <ul
                id="education-list"
                role="list"
                className="space-y-2"
              >
                {educationList.map((item, i) => (
                  <li
                    key={i}
                    id={`education-item-${i}`}
                    className="flex gap-2 text-gray-600"
                  >
                    <span aria-hidden="true" className="mt-1 shrink-0 text-gray-400">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pengalaman Kerja */}
          {experienceList.length > 0 && (
            <div id="experience-block">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Pengalaman
              </h3>
              <ul
                id="experience-list"
                role="list"
                className="space-y-2"
              >
                {experienceList.map((item, i) => (
                  <li
                    key={i}
                    id={`experience-item-${i}`}
                    className="flex gap-2 text-gray-600"
                  >
                    <span aria-hidden="true" className="mt-1 shrink-0 text-gray-400">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sertifikasi (opsional) */}
          {certificationList.length > 0 && (
            <div id="certifications-block">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Sertifikasi & Pelatihan
              </h3>
              <ul
                id="certifications-list"
                role="list"
                className="space-y-2"
              >
                {certificationList.map((item, i) => (
                  <li
                    key={i}
                    id={`certification-item-${i}`}
                    className="flex gap-2 text-gray-600"
                  >
                    <span aria-hidden="true" className="mt-1 shrink-0 text-gray-400">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Organisasi Profesi (opsional) */}
          {organizationList.length > 0 && (
            <div id="organizations-block">
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Organisasi Profesi
              </h3>
              <ul
                id="organizations-list"
                role="list"
                className="space-y-2"
              >
                {organizationList.map((item, i) => (
                  <li
                    key={i}
                    id={`organization-item-${i}`}
                    className="flex gap-2 text-gray-600"
                  >
                    <span aria-hidden="true" className="mt-1 shrink-0 text-gray-400">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fallback kalau semua field kosong */}
          {educationList.length === 0 &&
            experienceList.length === 0 &&
            certificationList.length === 0 &&
            organizationList.length === 0 && (
              <p id="about-empty" className="text-gray-500">
                Informasi profil akan segera hadir.
              </p>
            )}
        </div>
      </div>
    </section>
  );
}
