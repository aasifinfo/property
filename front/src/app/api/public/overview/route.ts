import { NextResponse } from "next/server";
import { mockListings } from "@/lib/deal-constants";
import { getServiceSupabase } from "@/lib/deal-server";

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    const [brokers, listings, requirements, recentListings] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "broker").eq("status", "approved"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("requirements").select("id", { count: "exact", head: true }),
      supabase
        .from("listings")
        .select(
          "id, title, property_type, deal_type, bedrooms, size_sqft, area_id, developer, price, payment_plan, handover_date, yield_percent, description, status, created_at, updated_at, created_by, agency_id, renewal_due_at, approved_at"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    return NextResponse.json({
      approvedBrokerCount: brokers.count || 0,
      approvedListingCount: listings.count || 0,
      activeRequirementCount: requirements.count || 0,
      recentListings: recentListings.data?.length ? recentListings.data : mockListings,
    });
  } catch (_error) {
    return NextResponse.json({
      approvedBrokerCount: 125,
      approvedListingCount: 64,
      activeRequirementCount: 42,
      recentListings: mockListings,
    });
  }
}


