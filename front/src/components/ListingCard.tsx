import Link from "next/link";
import { Listing } from "@/lib/deal-types";
import { formatCurrency, formatDate, formatNumber, statusClasses } from "@/lib/deal-utils";

export function ListingCard({ listing }: { listing: Listing }) {
  const coverImage = listing.listing_images?.find((image) => image.is_cover)?.public_url || listing.listing_images?.[0]?.public_url;

  return (
    <article className="panel overflow-hidden">
      <div className="relative h-52 w-full bg-slate-200">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-navy/10 text-brand-navy">No image uploaded</div>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={statusClasses(listing.status)}>{listing.status}</span>
          {listing.commission_terms ? <span className="badge bg-white/90 text-brand-navy">{listing.commission_terms.co_broke_percent}% co-broke</span> : null}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange">{listing.deal_type}</p>
            <h3 className="mt-2 text-xl font-semibold text-brand-navy">{listing.title}</h3>
          </div>
          <p className="text-xl font-bold text-brand-navy">{formatCurrency(listing.price)}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-brand-slate sm:grid-cols-4">
          <div className="subtle-panel p-3">
            <p className="text-xs uppercase tracking-[0.2em]">Area</p>
            <p className="mt-2 font-semibold text-brand-ink">{listing.area?.name || "TBD"}</p>
          </div>
          <div className="subtle-panel p-3">
            <p className="text-xs uppercase tracking-[0.2em]">Beds</p>
            <p className="mt-2 font-semibold text-brand-ink">{listing.bedrooms ?? "Studio/NA"}</p>
          </div>
          <div className="subtle-panel p-3">
            <p className="text-xs uppercase tracking-[0.2em]">Size</p>
            <p className="mt-2 font-semibold text-brand-ink">{formatNumber(listing.size_sqft)} sqft</p>
          </div>
          <div className="subtle-panel p-3">
            <p className="text-xs uppercase tracking-[0.2em]">Handover</p>
            <p className="mt-2 font-semibold text-brand-ink">{formatDate(listing.handover_date)}</p>
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-brand-slate">{listing.description || "No description provided."}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-slate">{listing.property_type}</p>
          <Link href={`/listings/${listing.id}`} className="btn-primary">
            View Listing
          </Link>
        </div>
      </div>
    </article>
  );
}

