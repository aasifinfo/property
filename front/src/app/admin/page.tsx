"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/auth/useAuth";
import { apiFetch } from "@/lib/deal-api";
import { getDefaultRouteForUser, isAdmin } from "@/lib/route-access";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, getFullName, statusClasses } from "@/lib/deal-utils";

export default function AdminPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  const loadOverview = async () => {
    setPageLoading(true);
    try {
      const payload = await apiFetch<any>("/api/admin/overview");
      setOverview(payload);
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Failed to load admin overview.", { variant: "error" });
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && (!user || !isAdmin(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }
    if (!loading && user) {
      loadOverview();
    }
  }, [loading, router, user]);

  const runAction = async (action: string, targetId: string) => {
    const notes = window.prompt("Optional note for the activity log:") || "";
    try {
      await apiFetch("/api/admin/action", {
        method: "POST",
        body: JSON.stringify({ action, targetId, notes }),
      });
      enqueueSnackbar("Admin action completed.", { variant: "success" });
      await loadOverview();
    } catch (error) {
      enqueueSnackbar(error instanceof Error ? error.message : "Admin action failed.", { variant: "error" });
    }
  };

  const exportLeads = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch("/api/export/leads", {
      headers: {
        Authorization: `Bearer ${session?.access_token || ""}`
      },
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "deal-exchange-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading || pageLoading || !user || !overview) return <LoadingScreen label="Loading admin controls..." />;

  return (
    <AppShell title="Admin Panel" subtitle="Approve brokers and listings, manage network access, inspect activity, and export lead flow.">
      <div className="grid gap-4 lg:grid-cols-6">
        <StatCard label="Approved Brokers" value={overview.metrics.approvedBrokers} helper="Live approved broker accounts." />
        <StatCard label="Total Listings" value={overview.metrics.totalListings} helper="All listing records in the exchange." />
        <StatCard label="Total Leads" value={overview.metrics.totalLeads} helper="Structured enquiries and requirement matches." />
        <StatCard label="Applications" value={overview.metrics.pendingApplications} helper="Broker applications waiting for review." />
        <StatCard label="Pending Listings" value={overview.metrics.pendingListings} helper="Inventory waiting for moderation." />
        <StatCard label="Expiring Soon" value={overview.metrics.expiringListings} helper="Approved listings due for renewal within 7 days." />
      </div>

      <section className="mt-10 grid gap-8 xl:grid-cols-2">
        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Broker applications</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Approve or reject access</h2>
          <div className="mt-6 space-y-4">
            {overview.applications.length ? overview.applications.map((application: any) => (
              <div key={application.id} className="subtle-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-brand-navy">{getFullName(application.first_name, application.last_name)}</p>
                    <p className="text-sm text-brand-slate">{application.email} - {application.phone}</p>
                    <p className="mt-2 text-sm text-brand-slate">{application.agency?.name || "Agency pending"} - {application.brokerProfile?.speciality || "Broker"}</p>
                  </div>
                  <span className={statusClasses(application.status)}>{application.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={() => runAction("approve_application", application.id)}>Approve</button>
                  <button className="btn-secondary" onClick={() => runAction("reject_application", application.id)}>Reject</button>
                </div>
              </div>
            )) : <EmptyState title="No pending applications" description="All broker applications have been reviewed." />}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Listing moderation</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Approve, reject, or request changes</h2>
          <div className="mt-6 space-y-4">
            {overview.pendingListings.length ? overview.pendingListings.map((listing: any) => (
              <div key={listing.id} className="subtle-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-brand-navy">{listing.title}</p>
                    <p className="text-sm text-brand-slate">{formatCurrency(listing.price)} - Submitted {formatDate(listing.created_at)}</p>
                    <p className="mt-2 text-sm text-brand-slate">{getFullName(listing.owner?.first_name, listing.owner?.last_name)} - {listing.agency?.name || "No agency"}</p>
                  </div>
                  <span className={statusClasses(listing.status)}>{listing.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={() => runAction("approve_listing", listing.id)}>Approve</button>
                  <button className="btn-secondary" onClick={() => runAction("request_listing_changes", listing.id)}>Request Changes</button>
                  <button className="btn-secondary" onClick={() => runAction("reject_listing", listing.id)}>Reject</button>
                </div>
              </div>
            )) : <EmptyState title="No pending listings" description="All current listing submissions have been reviewed." />}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.85fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Broker management</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-navy">Suspend or deactivate approved brokers</h2>
            </div>
            <button className="btn-primary" onClick={exportLeads}>Export Leads CSV</button>
          </div>
          <div className="mt-6 space-y-4">
            {overview.brokers.length ? overview.brokers.map((broker: any) => (
              <div key={broker.id} className="subtle-panel p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-brand-navy">{getFullName(broker.first_name, broker.last_name)}</p>
                      <span className={statusClasses(broker.status)}>{broker.status}</span>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-brand-slate sm:grid-cols-2">
                      <div className="rounded-2xl border border-brand-line/50 bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate/80">Contact</p>
                        <p className="mt-2 break-all font-medium text-brand-ink">{broker.email}</p>
                        <p className="mt-1">{broker.phone || broker.brokerProfile?.whatsapp_number || "No phone provided"}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-line/50 bg-slate-50/80 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate/80">Agency</p>
                        <p className="mt-2 font-medium text-brand-ink">{broker.agency?.name || "No agency"}</p>
                        <p className="mt-1">{broker.brokerProfile?.speciality || "Speciality not provided"}</p>
                      </div>
                      <div className="rounded-2xl border border-brand-line/50 bg-slate-50/80 px-4 py-3 sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-slate/80">Profile</p>
                        <p className="mt-2 font-medium text-brand-ink">Joined {formatDate(broker.created_at)}</p>
                        <p className="mt-1">
                          {typeof broker.brokerProfile?.experience_years === "number"
                            ? `${broker.brokerProfile.experience_years} years experience`
                            : "Experience not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:flex-col">
                    <button className="btn-secondary w-full xl:min-w-[10rem]" onClick={() => runAction("suspend_broker", broker.id)}>Suspend</button>
                    <button className="btn-secondary w-full xl:min-w-[10rem]" onClick={() => runAction("deactivate_broker", broker.id)}>Deactivate</button>
                  </div>
                </div>
              </div>
            )) : <EmptyState title="No brokers found" description="Approved and pending broker accounts will appear here for management actions." />}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Activity log</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Recent platform events</h2>
          <div className="mt-6 space-y-4">
            {overview.logs.length ? overview.logs.map((log: any) => (
              <div key={log.id} className="subtle-panel p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-brand-ink">{log.action}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">{formatDate(log.created_at)}</p>
                </div>
                <p className="mt-2 text-sm text-brand-slate">
                  {log.actor ? `${getFullName(log.actor.first_name, log.actor.last_name)} - ${log.actor.email}` : "System event"}
                </p>
              </div>
            )) : <EmptyState title="No activity yet" description="Administrative events will appear here once the workflow is used." />}
          </div>
        </div>
      </section>

      <section className="mt-10 panel p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Expiring listings</p>
        <h2 className="mt-2 text-2xl font-bold text-brand-navy">Approved inventory due for reconfirmation</h2>
        <div className="mt-6 space-y-4">
          {overview.expiringListings.length ? overview.expiringListings.map((listing: any) => (
            <div key={listing.id} className="subtle-panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-brand-navy">{listing.title}</p>
                <p className="text-sm text-brand-slate">{getFullName(listing.owner?.first_name, listing.owner?.last_name)} - {listing.agency?.name || "No agency"}</p>
              </div>
              <div className="text-sm text-brand-slate">Renewal due {formatDate(listing.renewal_due_at)}</div>
            </div>
          )) : <EmptyState title="No expiring listings" description="Approved listings that are due for reconfirmation within 7 days will appear here." />}
        </div>
      </section>
    </AppShell>
  );
}
