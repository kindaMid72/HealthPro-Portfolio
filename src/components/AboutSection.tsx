import type { Dictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';
import { getDisplayName, splitList } from '@/lib/seo';
import type { Profile } from '@/lib/types';
import SectionHeading from './SectionHeading';

interface Group {
  id: string;
  title: string;
  items: string[];
}

interface AboutSectionProps {
  profile: Profile;
  dict: Dictionary;
}

export default function AboutSection({ profile, dict }: AboutSectionProps) {
  const title = format(dict.about.title, { name: getDisplayName(profile.full_name) });

  const groups: Group[] = [
    { id: 'education-block', title: dict.about.education, items: splitList(profile.education) },
    { id: 'experience-block', title: dict.about.experience, items: splitList(profile.experience_history) },
    { id: 'certifications-block', title: dict.about.certifications, items: splitList(profile.certifications) },
    { id: 'organizations-block', title: dict.about.organizations, items: splitList(profile.organizations) },
  ].filter((g) => g.items.length > 0);

  const personalStory =
    profile.personal_story && !profile.personal_story.includes('[BELUM DIISI]')
      ? profile.personal_story.trim()
      : '';
  const hasSide = Boolean(personalStory);

  return (
    <section
      id="tentang"
      aria-labelledby="tentang-heading"
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="tentang-heading" title={title} />
        {!hasSide && groups.length === 0 ? (
          <p id="about-empty" className="py-8 text-text-body">
            {dict.about.empty}
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-12">
            {hasSide && (
              <blockquote
                id="personal-story-block"
                className="font-reading whitespace-pre-line text-lg leading-relaxed text-text-heading lg:col-span-4"
              >
                {personalStory}
              </blockquote>
            )}
            {groups.length > 0 && (
              <dl
                className={`grid gap-x-10 gap-y-8 sm:grid-cols-2 ${hasSide ? 'lg:col-span-8' : 'lg:col-span-12'}`}
              >
                {groups.map((g) => (
                  <div key={g.id} id={g.id} className="border-t border-border pt-5">
                    <dt className="text-sm font-semibold text-text-heading">{g.title}</dt>
                    <dd className="mt-3">
                      <ul className="space-y-2 text-sm leading-relaxed text-text-body">
                        {g.items.map((item, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
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
