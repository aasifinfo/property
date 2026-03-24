"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { EnquiryModal } from "@/components/EnquiryModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/auth/useAuth";
import { fetchListingById } from "@/lib/deal-data";
import { Listing } from "@/lib/deal-types";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";
import { formatCurrency, formatDate, formatDealType, formatNumber, getFullName, getLastReconfirmedAt, statusClasses } from "@/lib/deal-utils";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }
    if (!loading && params?.id) {
      fetchListingById(params.id)
        .then(setListing)
        .finally(() => setPageLoading(false));
    }
  }, [loading, params, router, user]);

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading listing detail..." />;
  if (!listing) {
    return (
      <AppShell title="Listing Detail" subtitle="The requested listing could not be found.">
        <EmptyState title="Listing unavailable" description="This listing may have been removed, rejected, or is no longer approved for broker visibility." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Listing Detail" subtitle="Review inventory, co-broke structure, media, and broker contact details before sending an enquiry.">
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <section className="panel overflow-hidden">
            <div className="grid gap-2 md:grid-cols-2">
              {(listing.listing_images?.length ? listing.listing_images : [{ id: "placeholder", public_url: "", listing_id: listing.id, file_name: "", storage_path: "", sort_order: 0, is_cover: true }]).map((image) => (
                <div key={image.id} className="relative min-h-[220px] bg-slate-100">
                  {image.public_url ? (
                    <img src={image.public_url} alt={listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-slate">No photo uploaded</div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className={statusClasses(listing.status)}>{listing.status}</span>
                <span className="badge bg-brand-navy/10 text-brand-navy">{listing.property_type}</span>
                <span className="badge bg-brand-orange/10 text-brand-orange">{formatDealType(listing.deal_type)}</span>
              </div>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-brand-navy">{listing.title}</h1>
                  <p className="mt-2 text-sm text-brand-slate">{listing.area?.name || "Area TBD"} - {listing.developer || "Developer not specified"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm uppercase tracking-[0.2em] text-brand-slate">Guide price</p>
                  <p className="mt-2 text-3xl font-bold text-brand-navy">{formatCurrency(listing.price)}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-brand-slate">{listing.description || "No description provided by the listing broker."}</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="subtle-panel p-4"><p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Bedrooms</p><p className="mt-2 text-lg font-semibold text-brand-ink">{listing.bedrooms ?? "N/A"}</p></div>
            <div className="subtle-panel p-4"><p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Size</p><p className="mt-2 text-lg font-semibold text-brand-ink">{formatNumber(listing.size_sqft)} sqft</p></div>
            <div className="subtle-panel p-4"><p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Payment plan</p><p className="mt-2 text-lg font-semibold text-brand-ink">{listing.payment_plan || "TBD"}</p></div>
            <div className="subtle-panel p-4"><p className="text-xs uppercase tracking-[0.2em] text-brand-slate">Handover</p><p className="mt-2 text-lg font-semibold text-brand-ink">{formatDate(listing.handover_date)}</p></div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Co-broke terms</p>
            <h2 className="mt-3 text-2xl font-bold text-brand-navy">{listing.commission_terms?.co_broke_percent || 0}% split available</h2>
            <div className="mt-5 space-y-4 text-sm text-brand-slate">
              <p><span className="font-semibold text-brand-ink">Payment:</span> {listing.commission_terms?.payment_terms || "To be confirmed"}</p>
              <p><span className="font-semibold text-brand-ink">Co-broke notes:</span> {listing.commission_terms?.notes || "No extra co-broke notes shared."}</p>
              <p><span className="font-semibold text-brand-ink">Yield:</span> {listing.yield_percent ? `${listing.yield_percent}%` : "N/A"}</p>
              <p><span className="font-semibold text-brand-ink">Last reconfirmed:</span> {formatDate(getLastReconfirmedAt(listing.renewal_due_at, listing.updated_at))}</p>
              <p><span className="font-semibold text-brand-ink">Renewal due:</span> {formatDate(listing.renewal_due_at)}</p>
            </div>
            <button className="btn-primary mt-6 w-full" onClick={() => setEnquiryOpen(true)}>Send Enquiry</button>
          </section>

          <section className="panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Broker info</p>
            <div className="mt-4 rounded-2xl border border-brand-line bg-slate-50 p-4">
              <p className="text-lg font-semibold text-brand-navy">{getFullName(listing.owner?.first_name, listing.owner?.last_name)}</p>
              <p className="mt-2 text-sm text-brand-slate">{listing.owner?.email || "Private email"}</p>
              <p className="mt-1 text-sm text-brand-slate">{listing.owner?.phone || "Phone shared after enquiry"}</p>
              <p className="mt-3 text-sm font-semibold text-brand-ink">{listing.agency?.name || "Private agency"}</p>
              <div className="mt-4 space-y-1 text-sm text-brand-slate">
                <p>Member since {formatDate(listing.owner?.created_at)}</p>
                <p>{listing.owner_active_listings_count || 0} approved listings in the exchange</p>
              </div>
            </div>
            <Link href="/listings" className="btn-secondary mt-5 w-full">Back to Listings</Link>
          </section>

          <section className="panel p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">Documents</p>
            <div className="mt-4 space-y-3">
              {(listing.listing_documents || []).length ? (listing.listing_documents || []).map((document) => (
                <a key={document.id} href={document.public_url} target="_blank" rel="noreferrer" className="subtle-panel block p-4 text-sm font-semibold text-brand-navy">
                  {document.file_name}
                </a>
              )) : <p className="text-sm text-brand-slate">No documents uploaded yet.</p>}
            </div>
          </section>
        </div>
      </div>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} subject={{ kind: "listing", listing }} />
    </AppShell>
  );
}