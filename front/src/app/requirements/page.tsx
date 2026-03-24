"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { EnquiryModal } from "@/components/EnquiryModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RequirementCard } from "@/components/RequirementCard";
import { useAuth } from "@/auth/useAuth";
import { createRequirement, fetchAreas, fetchRequirements, RequirementFilters } from "@/lib/deal-data";
import { dealTypeOptions, propertyTypeOptions, urgencyOptions } from "@/lib/deal-constants";
import { Area, Requirement, RequirementFormValues } from "@/lib/deal-types";
import { formatDealType } from "@/lib/deal-utils";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

const initialFilters: RequirementFilters = {};
const initialComposer: RequirementFormValues = {
  title: "",
  dealType: "secondary",
  propertyType: "apartment",
  bedrooms: "",
  areaId: "",
  budgetMin: "",
  budgetMax: "",
  urgency: "active",
  notes: "",
};

export default function RequirementsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filters, setFilters] = useState<RequirementFilters>(initialFilters);
  const [composer, setComposer] = useState<RequirementFormValues>(initialComposer);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  const loadBoard = async (activeFilters: RequirementFilters) => {
    const [loadedAreas, loadedRequirements] = await Promise.all([fetchAreas(), fetchRequirements(activeFilters)]);
    setAreas(loadedAreas);
    setRequirements(loadedRequirements);
  };

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }

    if (!loading && user) {
      loadBoard(filters)
        .catch((error) => enqueueSnackbar(error instanceof Error ? error.message : "Failed to load buyer board.", { variant: "error" }))
        .finally(() => setPageLoading(false));
    }
  }, [filters, loading, router, user, enqueueSnackbar]);

  const handleCreateRequirement = async () => {
    if (!user) return;
    if (!composer.title || !composer.areaId || !composer.budgetMin || !composer.budgetMax) {
      enqueueSnackbar("Complete the buyer brief, area, and budget range before posting.", { variant: "error" });
      return;
    }

    setSubmitting(true);
    try {
      await createRequirement({ values: composer, userId: user.uid });
      enqueueSnackbar("Buyer requirement posted to the board.", { variant: "success" });
      setComposer(initialComposer);
      await loadBoard(filters);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to post requirement.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading buyer board..." />;

  return (
    <AppShell title="Buyer Requirements Board" subtitle="Review live buyer mandates, publish fresh demand briefs, and connect directly when you have a match.">
      <section className="panel p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Post buyer requirement</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Share an anonymised demand brief</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-slate">Requirements appear immediately for approved brokers, keeping buyer demand separate from listing inventory.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <label className="label">Buyer brief</label>
            <input className="input" value={composer.title} onChange={(event) => setComposer({ ...composer, title: event.target.value })} placeholder="Example: Cash buyer for Palm villa under AED 13M" />
          </div>
          <div>
            <label className="label">Urgency</label>
            <select className="input" value={composer.urgency} onChange={(event) => setComposer({ ...composer, urgency: event.target.value as RequirementFormValues["urgency"] })}>
              {urgencyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Area</label>
            <select className="input" value={composer.areaId} onChange={(event) => setComposer({ ...composer, areaId: event.target.value })}>
              <option value="">Select area</option>
              {areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Deal type</label>
            <select className="input" value={composer.dealType} onChange={(event) => setComposer({ ...composer, dealType: event.target.value as RequirementFormValues["dealType"] })}>
              {dealTypeOptions.map((option) => <option key={option} value={option}>{formatDealType(option)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Property type</label>
            <select className="input" value={composer.propertyType} onChange={(event) => setComposer({ ...composer, propertyType: event.target.value as RequirementFormValues["propertyType"] })}>
              {propertyTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <input className="input" value={composer.bedrooms} onChange={(event) => setComposer({ ...composer, bedrooms: event.target.value })} placeholder="2" />
          </div>
          <div>
            <label className="label">Min budget</label>
            <input className="input" value={composer.budgetMin} onChange={(event) => setComposer({ ...composer, budgetMin: event.target.value })} placeholder="500000" />
          </div>
          <div>
            <label className="label">Max budget</label>
            <input className="input" value={composer.budgetMax} onChange={(event) => setComposer({ ...composer, budgetMax: event.target.value })} placeholder="8000000" />
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Notes / timeline</label>
          <textarea className="input min-h-[120px]" value={composer.notes} onChange={(event) => setComposer({ ...composer, notes: event.target.value })} placeholder="Budget flexibility, move timeline, preferred communities, or any deal constraints." />
        </div>

        <div className="mt-5 flex justify-end">
          <button className="btn-primary" type="button" onClick={handleCreateRequirement} disabled={submitting}>
            {submitting ? "Posting..." : "Post Requirement"}
          </button>
        </div>
      </section>

      <section className="panel mt-8 p-6">
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
        <div className="mt-4 flex justify-end">
          <button className="btn-secondary" type="button" onClick={() => setFilters(initialFilters)}>Reset Filters</button>
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