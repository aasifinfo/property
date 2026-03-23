import type { ReactNode } from "react";
import { Requirement } from "@/lib/deal-types";
import { formatCurrency, statusClasses } from "@/lib/deal-utils";

export function RequirementCard({
  requirement,
  action,
}: {
  requirement: Requirement;
  action?: ReactNode;
}) {
  return (
    <article className="panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={statusClasses(requirement.urgency)}>{requirement.urgency}</span>
          <h3 className="mt-3 text-xl font-semibold text-brand-navy">{requirement.title}</h3>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-slate">{requirement.deal_type}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="subtle-panel p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Area</p>
          <p className="mt-2 font-semibold text-brand-ink">{requirement.area?.name || "Flexible"}</p>
        </div>
        <div className="subtle-panel p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Property</p>
          <p className="mt-2 font-semibold text-brand-ink">{requirement.property_type}</p>
        </div>
        <div className="subtle-panel p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Budget</p>
          <p className="mt-2 font-semibold text-brand-ink">
            {formatCurrency(requirement.budget_min)} - {formatCurrency(requirement.budget_max)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-brand-slate">{requirement.notes || "Broker hasn't added extra notes yet."}</p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-ink">
            {(requirement.owner?.first_name || "Broker") + " " + (requirement.owner?.last_name || "")}
          </p>
          <p className="text-sm text-brand-slate">{requirement.owner?.email || "Private broker network"}</p>
        </div>
        {action}
      </div>
    </article>
  );
}

