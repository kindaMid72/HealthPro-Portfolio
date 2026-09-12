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
 * Styling: Modern grid layout dengan card premium, hover interaction,
 * dan decorative timeline markers.
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
    <div 
      id={id} 
      className="relative group bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Accent top bar on hover */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
      />

      <h3 className="mb-8 flex items-center gap-4 text-xl font-bold text-primary-dark font-heading">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm"
          aria-hidden="true"
        >
          {icon}
        </div>
        {title}
      </h3>

      {/* Timeline list */}
      <ul id={`${id}-list`} role="list" className="relative space-y-0 pl-4 sm:pl-6 ml-2 sm:ml-4 flex-grow">
        {/* Vertical line */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-2 bottom-4 w-[2px] bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"
        />

        {items.map((item, i) => (
          <li
            key={i}
            id={`${itemIdPrefix}-${i}`}
            className="relative flex gap-5 pb-6 last:pb-0 group/item"
          >
            {/* Timeline dot */}
            <span
              aria-hidden="true"
              className="absolute -left-[21px] sm:-left-[29px] top-1.5 flex h-4 w-4 items-center justify-center"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-primary/40 ring-4 ring-surface group-hover/item:bg-primary group-hover/item:scale-125 group-hover/item:ring-primary/10 transition-all duration-300" />
            </span>
            <span className="pt-0 text-sm sm:text-base leading-relaxed text-text-body group-hover/item:text-text-body/90 transition-colors">
              {item}
            </span>
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
      className="section-divider section-spacing px-4 bg-bg"
    >
      <div className="mx-auto max-w-5xl">
        {/* Heading dengan accent underline */}
        <div className="mb-16 text-center">
          <h2
            id="tentang-heading"
            className="text-3xl font-bold md:text-4xl text-primary-dark font-heading tracking-tight"
          >
            Tentang Dr. {firstName}
          </h2>
          {/* Accent underline dekoratif */}
          <div aria-hidden="true" className="mt-4 flex items-center justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-primary" />
            <div className="h-1 w-4 rounded-full bg-accent" />
          </div>
          <p className="mt-4 text-sm md:text-base text-text-body/70 max-w-2xl mx-auto leading-relaxed">
            Mengenal lebih dekat latar belakang pendidikan, pengalaman klinis, serta dedikasi profesional dalam memberikan pelayanan medis terbaik.
          </p>
        </div>

        {allEmpty ? (
          <p id="about-empty" className="text-text-body text-center py-8">
            Informasi profil akan segera hadir.
          </p>
        ) : (
          <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            <Subsection
              id="education-block"
              icon={<GraduationCap className="w-6 h-6" />}
              title="Pendidikan"
              items={educationList}
              itemIdPrefix="education-item"
            />
            <Subsection
              id="experience-block"
              icon={<Briefcase className="w-6 h-6" />}
              title="Pengalaman"
              items={experienceList}
              itemIdPrefix="experience-item"
            />
            <Subsection
              id="certifications-block"
              icon={<Award className="w-6 h-6" />}
              title="Sertifikasi"
              items={certificationList}
              itemIdPrefix="certification-item"
            />
            <Subsection
              id="organizations-block"
              icon={<Users className="w-6 h-6" />}
              title="Organisasi"
              items={organizationList}
              itemIdPrefix="organization-item"
            />
          </div>
        )}
      </div>
    </section>
  );
}
