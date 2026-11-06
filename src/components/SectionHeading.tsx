import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}

export default function SectionHeading({ id, title, intro, action }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <h2 id={id} className="font-display text-h2 font-semibold">
          {title}
        </h2>
        {intro ? <p className="mt-2.5 text-base leading-relaxed text-text-body">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
