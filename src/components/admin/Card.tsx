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
      className={`rounded-xl border border-border bg-surface p-5 md:p-6 ${className}`}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 id={titleId} className="text-base font-bold">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
