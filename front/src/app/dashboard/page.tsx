"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RequirementCard } from "@/components/RequirementCard";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/auth/useAuth";
import { fetchDashboardData, reconfirmListing } from "@/lib/deal-data";
import { DashboardMetrics, Listing, Requirement } from "@/lib/deal-types";
import { getLastReconfirmedAt, getRenewalMeta, formatDate } from "@/lib/deal-utils";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

export default function DashboardPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    myListings: 0,
    myEnquiries: 0,
    matchedRequirements: 0,
    pendingListings: 0,
  });
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [matchedRequirements, setMatchedRequirements] = useState<Requirement[]>([]);
  const [renewalListings, setRenewalListings] = useState<Listing[]>([]);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!user) return;
    const payload = await fetchDashboardData(user.uid, user.brokerProfile?.covered_area_ids || []);
    setMetrics(payload.metrics);
    setRecentListings(payload.recentListings);
    setMatchedRequirements(payload.matchedRequirements);
    setRenewalListings(payload.renewalListings);
  };

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }

    if (!loading && user) {
      loadDashboard()
        .catch((error) => enqueueSnackbar(error instanceof Error ? error.message : "Failed to load dashboard.", { variant: "error" }))
        .finally(() => setPageLoading(false));
    }
  }, [loading, router, user, enqueueSnackbar]);

  const handleReconfirm = async (listingId: string) => {
    setRenewingId(listingId);
    try {
      await reconfirmListing(listingId);
      enqueueSnackbar("Listing reconfirmed for another 14-day cycle.", { variant: "success" });
      await loadDashboard();
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to reconfirm listing.", { variant: "error" });
    } finally {
      setRenewingId(null);
    }
  };

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading broker dashboard..." />;

  return (
    <AppShell title="Dashboard" subtitle="Track your listings, renewal deadlines, incoming enquiries, and buyer demand from one moderated feed.">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="My Listings" value={metrics.myListings} helper="Inventory you have posted to the exchange." />
        <StatCard label="Enquiries" value={metrics.myEnquiries} helper="Leads routed to your listings or buyer briefs." />
        <StatCard label="Matched Needs" value={metrics.matchedRequirements} helper="Requirements aligned with your covered areas." />
        <StatCard label="Pending Approval" value={metrics.pendingListings} helper="Listings waiting for admin moderation." />
      </div>

      <section className="mt-10 panel p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Renewal prompts</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Reconfirm active inventory before it expires</h2>
        </div>
        {renewalListings.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {renewalListings.map((listing) => {
              const renewalMeta = getRenewalMeta(listing.renewal_due_at);
              return (
                <div key={listing.id} className="subtle-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-brand-navy">{listing.title}</p>
                      <p className="mt-2 text-sm text-brand-slate">
                        Last reconfirmed {formatDate(getLastReconfirmedAt(listing.renewal_due_at, listing.updated_at))}
                      </p>
                    </div>
                    <span className={renewalMeta.tone === "critical" ? "badge bg-rose-50 text-rose-700" : "badge bg-amber-50 text-amber-700"}>
                      {renewalMeta.label}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="btn-primary" type="button" onClick={() => handleReconfirm(listing.id)} disabled={renewingId === listing.id}>
                      {renewingId === listing.id ? "Reconfirming..." : "Reconfirm Listing"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No renewals due" description="Listings scheduled for renewal within the next 7 days will appear here." />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">My listings</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Latest inventory you have posted</h2>
        </div>
        {recentListings.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="Post a listing to start building your private inventory on the exchange." />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Matched buyer requirements</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Demand signals relevant to your patch</h2>
        </div>
        {matchedRequirements.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {matchedRequirements.map((requirement) => (
              <RequirementCard key={requirement.id} requirement={requirement} />
            ))}
          </div>
        ) : (
          <EmptyState title="No matches yet" description="Buyer requirements will appear here when there is a match across your covered areas." />
        )}
      </section>
    </AppShell>
  );
}