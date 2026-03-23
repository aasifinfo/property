"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { ListingCard } from "@/components/ListingCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/auth/useAuth";
import { dealTypeOptions, propertyTypeOptions } from "@/lib/deal-constants";
import { fetchAreas, fetchListings, ListingFilters } from "@/lib/deal-data";
import { Area, Listing } from "@/lib/deal-types";
import { canAccessBrokerWorkspace, getDefaultRouteForUser } from "@/lib/route-access";

const initialFilters: ListingFilters = {
  sort: "newest",
};

export default function ListingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !canAccessBrokerWorkspace(user))) {
      router.replace(getDefaultRouteForUser(user));
      return;
    }
    if (!loading && user) {
      Promise.all([fetchAreas(), fetchListings(filters)])
        .then(([loadedAreas, loadedListings]) => {
          setAreas(loadedAreas);
          setListings(loadedListings);
        })
        .finally(() => setPageLoading(false));
    }
  }, [filters, loading, router, user]);

  if (loading || pageLoading || !user) return <LoadingScreen label="Loading listing feed..." />;

  return (
    <AppShell title="Browse Listings" subtitle="Filter approved off-market inventory by deal type, area, bedrooms, price, and co-broke terms.">
      <section className="panel p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div>
            <label className="label">Deal type</label>
            <select className="input" value={filters.dealType || ""} onChange={(event) => setFilters({ ...filters, dealType: event.target.value || undefined })}>
              <option value="">All</option>
              {dealTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
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
            <label className="label">Bedrooms</label>
            <select className="input" value={filters.bedrooms || ""} onChange={(event) => setFilters({ ...filters, bedrooms: event.target.value || undefined })}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count}+</option>)}
            </select>
          </div>
          <div>
            <label className="label">Min price</label>
            <input className="input" value={filters.minPrice || ""} onChange={(event) => setFilters({ ...filters, minPrice: event.target.value || undefined })} placeholder="500000" />
          </div>
          <div>
            <label className="label">Max price</label>
            <input className="input" value={filters.maxPrice || ""} onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value || undefined })} placeholder="5000000" />
          </div>
          <div>
            <label className="label">Property type</label>
            <select className="input" value={filters.propertyType || ""} onChange={(event) => setFilters({ ...filters, propertyType: event.target.value || undefined })}>
              <option value="">All types</option>
              {propertyTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-brand-ink">Sort by</label>
            <select className="input w-[220px]" value={filters.sort || "newest"} onChange={(event) => setFilters({ ...filters, sort: event.target.value as ListingFilters["sort"] })}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to high</option>
              <option value="price_desc">Price: High to low</option>
              <option value="co_broke_desc">Co-broke %</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={() => setFilters(initialFilters)}>Reset Filters</button>
        </div>
      </section>

      <section className="mt-8">
        {listings.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState title="No listings match these filters" description="Try widening price, area, or property type to pull more approved inventory into the feed." />
        )}
      </section>
    </AppShell>
  );
}

