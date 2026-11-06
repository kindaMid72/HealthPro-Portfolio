import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Info } from 'lucide-react';

type Tone = 'success' | 'error' | 'info';

const TONES: Record<Tone, { className: string; Icon: typeof Info }> = {
  success: { className: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
  error: { className: 'border-red-200 bg-red-50 text-red-700', Icon: CircleAlert },
  info: { className: 'border-primary/20 bg-primary-tint text-text-heading', Icon: Info },
};

export default function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  const { className, Icon } = TONES[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xs ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
