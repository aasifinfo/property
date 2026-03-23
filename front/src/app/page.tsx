"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { ListingCard } from "@/components/ListingCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/auth/useAuth";
import { PublicOverview } from "@/lib/deal-types";
import { mockListings } from "@/lib/deal-constants";

const fallbackOverview: PublicOverview = {
  approvedBrokerCount: 125,
  approvedListingCount: 64,
  activeRequirementCount: 42,
  recentListings: mockListings,
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const [overview, setOverview] = useState<PublicOverview>(fallbackOverview);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const response = await fetch("/api/public/overview");
        const payload = await response.json();
        setOverview(payload);
      } catch (_error) {
        setOverview(fallbackOverview);
      } finally {
        setPageLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading && pageLoading) {
    return <LoadingScreen label="Loading deal flow preview..." />;
  }

  return (
    <div className="min-h-screen">
      <PublicHeader />

      <section className="shell py-10 lg:py-16">
        <div className="panel overflow-hidden bg-brand-navy bg-[radial-gradient(circle_at_top_left,rgba(248,141,42,0.28),transparent_35%),linear-gradient(135deg,#003A5D_0%,#022942_100%)] p-8 text-white lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-orange">Private broker network</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight lg:text-6xl">
                Replace WhatsApp deal flow with a structured off-market exchange.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
                Share verified listings, capture buyer mandates, and coordinate co-broke opportunities inside a moderated, invite-only SaaS workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={user ? "/dashboard" : "/apply"} className="btn-accent">
                  {user ? "Open Workspace" : "Apply for Access"}
                </Link>
                <Link href="/signin" className="btn-secondary border-white/30 bg-white/10 text-white hover:border-white">
                  Broker Login
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-white/60">Moderated workflow</p>
                <p className="mt-3 text-2xl font-semibold">Broker + listing approvals</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-white/60">Controlled access</p>
                <p className="mt-3 text-2xl font-semibold">Only approved listings visible</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-white/60">Fast connections</p>
                <p className="mt-3 text-2xl font-semibold">Email + WhatsApp enquiry triggers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-4 pb-8 md:grid-cols-3">
        <StatCard label="Approved Brokers" value={overview.approvedBrokerCount} helper="Curated network with admin-vetted access." />
        <StatCard label="Live Listings" value={overview.approvedListingCount} helper="Only approved off-market inventory reaches the feed." />
        <StatCard label="Buyer Mandates" value={overview.activeRequirementCount} helper="Active briefs ready for broker matching." />
      </section>

      <section className="shell py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Listings preview</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">A cleaner feed for private inventory</h2>
          </div>
          <Link href="/apply" className="btn-secondary">Join as Broker</Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {(overview.recentListings.length ? overview.recentListings : mockListings).slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="shell py-10">
        <div className="panel p-8 lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">How it works</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">01</p>
              <h3 className="mt-3 text-xl font-semibold text-brand-navy">Apply and get approved</h3>
              <p className="mt-3 text-sm leading-6 text-brand-slate">Submit your broker profile, agency credentials, and coverage areas for admin review.</p>
            </div>
            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">02</p>
              <h3 className="mt-3 text-xl font-semibold text-brand-navy">Post or discover opportunities</h3>
              <p className="mt-3 text-sm leading-6 text-brand-slate">Approved brokers can list off-market stock, browse filtered inventory, and monitor buyer briefs.</p>
            </div>
            <div className="subtle-panel p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-slate">03</p>
              <h3 className="mt-3 text-xl font-semibold text-brand-navy">Move faster on co-broke deals</h3>
              <p className="mt-3 text-sm leading-6 text-brand-slate">Enquiries create structured lead records and notification triggers instead of buried chat threads.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-16">
        <div className="panel flex flex-col items-start justify-between gap-6 p-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Built for broker collaboration</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-navy">Ready to centralize private deal flow?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-slate">Invite-only access keeps the signal high. Apply once, then manage listings, requirements, approvals, and broker connections from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/apply" className="btn-accent">Apply Now</Link>
            <Link href="/signin" className="btn-secondary">Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

