import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

const SIZES: Record<Size, string> = {
  md: 'min-h-10 px-4 text-sm',
  sm: 'min-h-9 px-3 text-sm',
};

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text-heading hover:border-primary hover:text-primary',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  ghost: 'text-text-body hover:bg-primary-tint hover:text-primary',
};

/** Kelas tombol admin — juga dipakai untuk <Link> yang tampil sebagai tombol. */
export function buttonClassName(variant: Variant = 'primary', size: Size = 'md'): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  pending?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  pending = false,
  icon,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={`${buttonClassName(variant, size)} ${className}`}
      {...props}
    >
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
