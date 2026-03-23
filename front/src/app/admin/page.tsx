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
      <div className="grid gap-4 lg:grid-cols-5">
        <StatCard label="Approved Brokers" value={overview.metrics.approvedBrokers} helper="Live approved broker accounts." />
        <StatCard label="Total Listings" value={overview.metrics.totalListings} helper="All listing records in the exchange." />
        <StatCard label="Total Leads" value={overview.metrics.totalLeads} helper="Structured enquiries and requirement matches." />
        <StatCard label="Applications" value={overview.metrics.pendingApplications} helper="Broker applications waiting for review." />
        <StatCard label="Pending Listings" value={overview.metrics.pendingListings} helper="Inventory waiting for moderation." />
      </div>

      <section className="mt-10 grid gap-8 xl:grid-cols-2">
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Broker applications</p>
              <h2 className="mt-2 text-2xl font-bold text-brand-navy">Approve or reject access</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {overview.applications.length ? overview.applications.map((application: any) => (
              <div key={application.id} className="subtle-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-brand-navy">{getFullName(application.first_name, application.last_name)}</p>
                    <p className="text-sm text-brand-slate">{application.email} · {application.phone}</p>
                    <p className="mt-2 text-sm text-brand-slate">{application.agency?.name || "Agency pending"} · {application.brokerProfile?.speciality || "Broker"}</p>
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
          <h2 className="mt-2 text-2xl font-bold text-brand-navy">Approve or reject inventory</h2>
          <div className="mt-6 space-y-4">
            {overview.pendingListings.length ? overview.pendingListings.map((listing: any) => (
              <div key={listing.id} className="subtle-panel p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-brand-navy">{listing.title}</p>
                    <p className="text-sm text-brand-slate">{formatCurrency(listing.price)} · Submitted {formatDate(listing.created_at)}</p>
                  </div>
                  <span className={statusClasses(listing.status)}>{listing.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-primary" onClick={() => runAction("approve_listing", listing.id)}>Approve</button>
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
            {overview.brokers.map((broker: any) => (
              <div key={broker.id} className="subtle-panel flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-brand-navy">{getFullName(broker.first_name, broker.last_name)}</p>
                  <p className="text-sm text-brand-slate">{broker.email} · {broker.agency?.name || "No agency"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={statusClasses(broker.status)}>{broker.status}</span>
                  <button className="btn-secondary" onClick={() => runAction("suspend_broker", broker.id)}>Suspend</button>
                  <button className="btn-secondary" onClick={() => runAction("deactivate_broker", broker.id)}>Deactivate</button>
                </div>
              </div>
            ))}
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
                  {log.actor ? `${getFullName(log.actor.first_name, log.actor.last_name)} · ${log.actor.email}` : "System event"}
                </p>
              </div>
            )) : <EmptyState title="No activity yet" description="Administrative events will appear here once the workflow is used." />}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

