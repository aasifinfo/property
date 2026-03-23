"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { EnquiryModal } from "@/components/EnquiryModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RequirementCard } from "@/components/RequirementCard";
import { useAuth } from "@/auth/useAuth";
import { fetchAreas, fetchRequirements, RequirementFilters } from "@/lib/deal-data";
import { urgencyOptions } from "@/lib/deal-constants";
import { Area, Requirement } from "@/lib/deal-types";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

export default function RequirementsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filters, setFilters] = useState<RequirementFilters>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }
    if (!loading && user) {
      Promise.all([fetchAreas(), fetchRequirements(filters)])
        .then(([loadedAreas, loadedRequirements]) => {
          setAreas(loadedAreas);
          setRequirements(loadedRequirements);
        })
        .finally(() => setPageLoading(false));
    }
  }, [filters, loading, router, user]);

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading buyer board..." />;

  return (
    <AppShell title="Buyer Requirements Board" subtitle="Match active buyer mandates by urgency, area, and budget before they disappear into chat history.">
      <section className="panel p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="label">Urgency</label>
            <select className="input" value={filters.urgency || ""} onChange={(event) => setFilters({ ...filters, urgency: event.target.value || undefined })}>
              <option value="">All</option>
              {urgencyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Area</label>
            <select className="input" value={filters.areaId || ""} onChange={(event) => setFilters({ ...filters, areaId: event.target.value || undefined })}>
              <option value="">All areas</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min budget</label>
            <input className="input" value={filters.minBudget || ""} onChange={(event) => setFilters({ ...filters, minBudget: event.target.value || undefined })} placeholder="500000" />
          </div>
          <div>
            <label className="label">Max budget</label>
            <input className="input" value={filters.maxBudget || ""} onChange={(event) => setFilters({ ...filters, maxBudget: event.target.value || undefined })} placeholder="8000000" />
          </div>
        </div>
      </section>

      <section className="mt-8">
        {requirements.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {requirements.map((requirement) => (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                action={<button className="btn-primary" onClick={() => setSelectedRequirement(requirement)}>I have a match</button>}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No buyer requirements match the current filters" description="Adjust urgency, area, or budget range to widen the buyer board." />
        )}
      </section>

      <EnquiryModal
        open={!!selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        subject={selectedRequirement ? { kind: "requirement", requirement: selectedRequirement } : null}
      />
    </AppShell>
  );
}

