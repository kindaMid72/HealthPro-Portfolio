import { Info } from 'lucide-react';
import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';

export default function MedicalDisclaimer({
  dict = idDictionary.medical,
}: {
  dict?: Dictionary['medical'];
}) {
  return (
    <aside className="card-clinical my-8 flex items-start gap-3.5 p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
        <Info size={18} aria-hidden="true" />
      </span>
      <p className="text-sm leading-relaxed text-text-muted">
        <strong className="font-semibold text-text-heading">{dict.disclaimerTitle}</strong>{' '}
        {dict.disclaimerBody}
      </p>
    </aside>
  );
}
