import { Info } from "lucide-react";

export default function MedicalDisclaimer() {
  return (
    <aside className="card-clinical my-8 flex items-start gap-3.5 p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
        <Info size={18} aria-hidden="true" />
      </span>
      <p className="text-sm leading-relaxed text-text-muted">
        <strong className="font-semibold text-text-heading">Catatan Medis:</strong>{" "}
        Informasi ini disusun sebagai bahan edukasi kesehatan umum bagi pasien dan keluarga, serta
        tidak menggantikan pemeriksaan fisik, diagnosis, maupun tata laksana medis langsung oleh
        dokter spesialis THT-BKL.
      </p>
    </aside>
  );
}
