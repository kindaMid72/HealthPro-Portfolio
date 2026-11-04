import { ShieldCheck } from "lucide-react";

interface MedicalReviewNoteProps {
  fullName: string;
  specialty: string;
  strSip: string | null;
}

export default function MedicalReviewNote({ fullName, specialty, strSip }: MedicalReviewNoteProps) {
  return (
    <div className="mt-6 flex gap-3 rounded-xl bg-primary-tint p-4 text-sm">
      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="text-text-heading">
          Ditinjau secara medis oleh <strong className="font-semibold">{fullName}</strong> ({specialty})
        </p>
        {strSip && <p className="mt-0.5 text-text-muted">{strSip}</p>}
      </div>
    </div>
  );
}
