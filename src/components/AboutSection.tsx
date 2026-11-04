/**
 * components/AboutSection.tsx
 * Pendidikan, pengalaman, sertifikasi, organisasi — daftar definisi tanpa kartu.
 * Grup kosong disembunyikan; field berisi [BELUM DIISI] disaring (02-content-data.md).
 */

import { GraduationCap, Briefcase, Award, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { Profile } from "@/lib/types";
import { getPlainName, splitList } from "@/lib/seo";
import SectionHeading from "./SectionHeading";

interface Group {
  id: string;
  icon: ReactNode;
  title: string;
  items: string[];
}

export default function AboutSection({ profile }: { profile: Profile }) {
  const hasTitle = /^dr\.?\s/i.test(profile.full_name);
  const title = `Tentang ${hasTitle ? "dr. " : ""}${getPlainName(profile.full_name)}`;

  const groups: Group[] = [
    { id: "education-block", icon: <GraduationCap size={18} />, title: "Pendidikan", items: splitList(profile.education) },
    { id: "experience-block", icon: <Briefcase size={18} />, title: "Pengalaman", items: splitList(profile.experience_history) },
    { id: "certifications-block", icon: <Award size={18} />, title: "Sertifikasi", items: splitList(profile.certifications) },
    { id: "organizations-block", icon: <Users size={18} />, title: "Organisasi profesi", items: splitList(profile.organizations) },
  ].filter((g) => g.items.length > 0);

  const personalStory =
    profile.personal_story && !profile.personal_story.includes("[BELUM DIISI]")
      ? profile.personal_story.trim()
      : "";

  return (
    <section
      id="tentang"
      aria-labelledby="tentang-heading"
      className="section-spacing border-t border-border bg-surface px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        {!personalStory && groups.length === 0 ? (
          <>
            <SectionHeading id="tentang-heading" title={title} />
            <p id="about-empty" className="py-8 text-text-body">
              Informasi profil akan segera hadir.
            </p>
          </>
        ) : (
          <div className="grid gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <h2 id="tentang-heading" className="text-h2 font-bold">
                {title}
              </h2>
              {personalStory && (
                <p id="personal-story-block" className="mt-5 whitespace-pre-line text-lg">
                  {personalStory}
                </p>
              )}
            </div>
            {groups.length > 0 && (
              <dl className="md:col-span-8">
                {groups.map((g) => (
                  <div
                    key={g.id}
                    id={g.id}
                    className="grid gap-2 border-t border-border py-5 sm:grid-cols-[10rem_1fr]"
                  >
                    <dt className="flex items-center gap-2 font-semibold text-text-heading">
                      <span className="text-primary" aria-hidden="true">
                        {g.icon}
                      </span>
                      {g.title}
                    </dt>
                    <dd>
                      <ul className="space-y-1.5">
                        {g.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
