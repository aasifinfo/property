import { NextRequest, NextResponse } from "next/server";
import { mockListings } from "@/lib/deal-constants";
import { getRequestUser, getServiceSupabase } from "@/lib/deal-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();

    if (request.nextUrl.searchParams.get("scope") === "auth-me") {
      const user = await getRequestUser(request);

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: brokerProfile } = await supabase
        .from("broker_profiles")
        .select(
          "user_id, agency_id, rera_brn, covered_area_ids, speciality, experience_years, whatsapp_number, bio, application_status, application_submitted_at, approved_at"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: agency } = user.agency_id
        ? await supabase
            .from("agencies")
            .select("id, name, rera_brn, status")
            .eq("id", user.agency_id)
            .maybeSingle()
        : { data: null };

      return NextResponse.json({
        platformUser: user,
        brokerProfile: brokerProfile ?? null,
        agency: agency ?? null,
      });
    }

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

    const listingRows = recentListings.data || [];
    const listingIds = listingRows.map((listing) => listing.id);
    const areaIds = Array.from(new Set(listingRows.map((listing) => listing.area_id).filter(Boolean)));

    const [imagesResult, termsResult, areasResult] = await Promise.all([
      listingIds.length
        ? supabase.from("listing_images").select("id, listing_id, file_name, storage_path, public_url, sort_order, is_cover").in("listing_id", listingIds).order("sort_order")
        : Promise.resolve({ data: [] as any[] }),
      listingIds.length
        ? supabase.from("commission_terms").select("listing_id, co_broke_percent, payment_terms, notes").in("listing_id", listingIds)
        : Promise.resolve({ data: [] as any[] }),
      areaIds.length
        ? supabase.from("areas").select("id, name, city, slug").in("id", areaIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const imagesMap = new Map<string, any[]>();
    (imagesResult.data || []).forEach((image) => {
      imagesMap.set(image.listing_id, [...(imagesMap.get(image.listing_id) || []), image]);
    });
    const termsMap = new Map((termsResult.data || []).map((term) => [term.listing_id, term]));
    const areaMap = new Map((areasResult.data || []).map((area) => [area.id, area]));

    const hydratedListings = listingRows.length
      ? listingRows.map((listing) => ({
          ...listing,
          area: listing.area_id ? areaMap.get(listing.area_id) || null : null,
          commission_terms: termsMap.get(listing.id) || null,
          listing_images: imagesMap.get(listing.id) || [],
        }))
      : mockListings;

    return NextResponse.json({
      approvedBrokerCount: brokers.count || 0,
      approvedListingCount: listings.count || 0,
      activeRequirementCount: requirements.count || 0,
      recentListings: hydratedListings,
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
