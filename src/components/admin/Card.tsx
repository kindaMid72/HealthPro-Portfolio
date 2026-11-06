import { useId, type ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, actions, children, className = '' }: CardProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={`rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6 ${className}`}
    >
      {(title || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div className="min-w-0">
            {title && (
              <h2 id={titleId} className="text-base font-bold text-text-heading">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm leading-relaxed text-text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
