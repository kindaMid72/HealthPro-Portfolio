/**
 * components/AboutSection.tsx
 * Bio lengkap dokter: pendidikan, pengalaman, sertifikasi, organisasi.
 *
 * Catatan penting:
 * - personal_story TIDAK ditampilkan (lihat 02-content-data.md — perlu klarifikasi)
 * - str_sip_display sudah dipindah ke HeroSection sebagai trust signal
 * - education & experience_history di-split per " | " menjadi list items
 * - certifications & organizations: hidden kalau kosong
 *
 * Styling: sesuai 04-design.md — surface putih, ikon Lucide, warna primary.
 */

import {
  GraduationCap,
  Briefcase,
  Award,
  Users,
} from "lucide-react";
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
  const stripped = fullName
    .replace(/^(dr\.|dr)\s*/i, "")
    .split(",")[0]
    .trim();
  return stripped.split(" ")[0] || fullName;
}

interface SubsectionProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  items: string[];
  itemIdPrefix: string;
}

function Subsection({ id, icon, title, items, itemIdPrefix }: SubsectionProps) {
  if (items.length === 0) return null;
  return (
    <div id={id}>
      <h3
        className="mb-4 flex items-center gap-3 text-lg font-semibold text-primary font-heading"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shadow-sm"
          aria-hidden="true"
        >
          {icon}
        </span>
        {title}
      </h3>
      <ul id={`${id}-list`} role="list" className="space-y-2 pl-1">
        {items.map((item, i) => (
          <li
            key={i}
            id={`${itemIdPrefix}-${i}`}
            className="flex gap-3 text-base leading-relaxed text-text-body"
          >
            <span
              aria-hidden="true"
              className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutSection({ profile }: AboutSectionProps) {
  const firstName = getFirstName(profile.full_name);
  const educationList = splitPipeList(profile.education);
  const experienceList = splitPipeList(profile.experience_history);
  const certificationList = splitPipeList(profile.certifications);
  const organizationList = splitPipeList(profile.organizations);

  const allEmpty =
    educationList.length === 0 &&
    experienceList.length === 0 &&
    certificationList.length === 0 &&
    organizationList.length === 0;

  return (
    <section
      id="tentang"
      aria-labelledby="tentang-heading"
      className="section-divider section-spacing px-4 bg-surface"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="tentang-heading"
          className="mb-10 text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
        >
          Tentang Dr. {firstName}
        </h2>

        {allEmpty ? (
          <p id="about-empty" className="text-text-body text-center py-8">
            Informasi profil akan segera hadir.
          </p>
        ) : (
          <div className="space-y-12">
            <Subsection
              id="education-block"
              icon={<GraduationCap size={16} className="text-primary" />}
              title="Pendidikan"
              items={educationList}
              itemIdPrefix="education-item"
            />
            <Subsection
              id="experience-block"
              icon={<Briefcase size={16} className="text-primary" />}
              title="Pengalaman"
              items={experienceList}
              itemIdPrefix="experience-item"
            />
            <Subsection
              id="certifications-block"
              icon={<Award size={16} className="text-primary" />}
              title="Sertifikasi & Pelatihan"
              items={certificationList}
              itemIdPrefix="certification-item"
            />
            <Subsection
              id="organizations-block"
              icon={<Users size={16} className="text-primary" />}
              title="Organisasi Profesi"
              items={organizationList}
              itemIdPrefix="organization-item"
            />
          </div>
        )}
      </div>
    </section>
  );
}
