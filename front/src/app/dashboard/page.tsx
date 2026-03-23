"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RequirementCard } from "@/components/RequirementCard";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/auth/useAuth";
import { fetchDashboardData } from "@/lib/deal-data";
import { DashboardMetrics, Listing, Requirement } from "@/lib/deal-types";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

export default function DashboardPage() {
  const router = useRouter();
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

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }

    if (!loading && user) {
      fetchDashboardData(user.uid, user.brokerProfile?.covered_area_ids || [])
        .then((payload) => {
          setMetrics(payload.metrics);
          setRecentListings(payload.recentListings);
          setMatchedRequirements(payload.matchedRequirements);
        })
        .finally(() => setPageLoading(false));
    }
  }, [loading, router, user]);

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading broker dashboard..." />;

  return (
    <AppShell title="Dashboard" subtitle="Track your listings, incoming enquiries, and buyer demand from one moderated feed.">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="My Listings" value={metrics.myListings} helper="Inventory you have posted to the exchange." />
        <StatCard label="Enquiries" value={metrics.myEnquiries} helper="Leads routed to your listings or buyer briefs." />
        <StatCard label="Matched Needs" value={metrics.matchedRequirements} helper="Requirements aligned with your covered areas." />
        <StatCard label="Pending Approval" value={metrics.pendingListings} helper="Listings waiting for admin moderation." />
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Recent listings</p>
            <h2 className="mt-2 text-2xl font-bold text-brand-navy">Fresh opportunities from the network</h2>
          </div>
        </div>
        {recentListings.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings yet" description="Approved listings will appear here once brokers post inventory and admins approve it." />
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

