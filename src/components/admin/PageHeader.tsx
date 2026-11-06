import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-text-heading md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
