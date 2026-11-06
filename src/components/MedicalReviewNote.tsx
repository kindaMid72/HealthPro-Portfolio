import type { Dictionary } from '@/i18n/dictionaries/id';
import { id as idDictionary } from '@/i18n/dictionaries/id';
import { format } from '@/i18n/dictionary';

interface MedicalReviewNoteProps {
  fullName: string;
  specialty: string;
  strSip: string | null;
  dict?: Dictionary['medical'];
}

export default function MedicalReviewNote({
  fullName,
  specialty,
  strSip,
  dict = idDictionary.medical,
}: MedicalReviewNoteProps) {
  const text = format(dict.reviewedBy, { name: '__NAME__', specialty });
  const [before, after] = text.split('__NAME__');

  return (
    <div className="mt-6 border-l-2 border-primary/30 pl-4 text-sm">
      <p className="text-text-heading">
        {before}
        <strong className="font-semibold">{fullName}</strong>
        {after}
      </p>
      {strSip && <p className="mt-0.5 text-text-muted">{strSip}</p>}
    </div>
  );
}
