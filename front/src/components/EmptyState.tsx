import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="subtle-panel flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-lg font-semibold text-brand-navy">{title}</p>
      <p className="mt-2 max-w-md text-sm text-brand-slate">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

