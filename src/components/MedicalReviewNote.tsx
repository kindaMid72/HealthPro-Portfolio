interface MedicalReviewNoteProps {
  fullName: string;
  specialty: string;
  strSip: string | null;
}

export default function MedicalReviewNote({ fullName, specialty, strSip }: MedicalReviewNoteProps) {
  return (
    <div className="mt-6 border-l-2 border-primary/30 pl-4 text-sm">
      <p className="text-text-heading">
        Ditinjau secara medis oleh <strong className="font-semibold">{fullName}</strong> ({specialty})
      </p>
      {strSip && <p className="mt-0.5 text-text-muted">{strSip}</p>}
    </div>
  );
}
