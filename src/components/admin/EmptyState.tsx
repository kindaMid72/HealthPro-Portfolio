import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-bg/60 p-10 text-center">
      <p className="font-semibold text-text-heading">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
