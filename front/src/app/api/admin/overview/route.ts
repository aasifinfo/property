import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, requireAdmin } from "@/lib/deal-server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const supabase = getServiceSupabase();
  const expiryThreshold = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    applicationsResult,
    profilesResult,
    agenciesResult,
    pendingListingsResult,
    expiringListingsResult,
    brokersResult,
    logsResult,
    listingsCount,
    brokersCount,
    leadsCount,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, first_name, last_name, phone, role, status, agency_id, created_at, updated_at")
      .eq("role", "broker")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("broker_profiles")
      .select("user_id, agency_id, rera_brn, covered_area_ids, speciality, experience_years, whatsapp_number, bio, application_status, application_submitted_at, approved_at"),
    supabase.from("agencies").select("id, name, rera_brn, status"),
    supabase
      .from("listings")
      .select("id, title, price, status, created_at, created_by, agency_id, renewal_due_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("listings")
      .select("id, title, price, status, created_at, created_by, agency_id, renewal_due_at")
      .eq("status", "approved")
      .not("renewal_due_at", "is", null)
      .lte("renewal_due_at", expiryThreshold)
      .order("renewal_due_at", { ascending: true }),
    supabase
      .from("users")
      .select("id, email, first_name, last_name, phone, role, status, agency_id, created_at, updated_at")
      .eq("role", "broker")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("activity_log")
      .select("id, action, target_table, target_id, created_at, metadata, actor_user_id")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "broker").eq("status", "approved"),
    supabase.from("leads").select("id", { count: "exact", head: true }),
  ]);

  const profileMap = new Map((profilesResult.data || []).map((profile) => [profile.user_id, profile]));
  const agencyMap = new Map((agenciesResult.data || []).map((agency) => [agency.id, agency]));

  const actorIds = Array.from(new Set((logsResult.data || []).map((log) => log.actor_user_id).filter(Boolean)));
  const listingOwnerIds = Array.from(
    new Set([
      ...(pendingListingsResult.data || []).map((listing) => listing.created_by),
      ...(expiringListingsResult.data || []).map((listing) => listing.created_by),
    ].filter(Boolean))
  );

  const { data: actors } = actorIds.length
    ? await supabase.from("users").select("id, email, first_name, last_name").in("id", actorIds)
    : { data: [] as any[] };
  const { data: listingOwners } = listingOwnerIds.length
    ? await supabase.from("users").select("id, email, first_name, last_name").in("id", listingOwnerIds)
    : { data: [] as any[] };

  const actorMap = new Map((actors || []).map((actor) => [actor.id, actor]));
  const ownerMap = new Map((listingOwners || []).map((owner) => [owner.id, owner]));

  return NextResponse.json({
    metrics: {
      approvedBrokers: brokersCount.count || 0,
      totalListings: listingsCount.count || 0,
      totalLeads: leadsCount.count || 0,
      pendingApplications: applicationsResult.data?.length || 0,
      pendingListings: pendingListingsResult.data?.length || 0,
      expiringListings: expiringListingsResult.data?.length || 0,
    },
    applications: (applicationsResult.data || []).map((user) => ({
      ...user,
      brokerProfile: profileMap.get(user.id) || null,
      agency: user.agency_id ? agencyMap.get(user.agency_id) || null : null,
    })),
    pendingListings: (pendingListingsResult.data || []).map((listing) => ({
      ...listing,
      owner: ownerMap.get(listing.created_by) || null,
      agency: listing.agency_id ? agencyMap.get(listing.agency_id) || null : null,
    })),
    expiringListings: (expiringListingsResult.data || []).map((listing) => ({
      ...listing,
      owner: ownerMap.get(listing.created_by) || null,
      agency: listing.agency_id ? agencyMap.get(listing.agency_id) || null : null,
    })),
    brokers: (brokersResult.data || []).map((broker) => ({
      ...broker,
      brokerProfile: profileMap.get(broker.id) || null,
      agency: broker.agency_id ? agencyMap.get(broker.agency_id) || null : null,
    })),
    logs: (logsResult.data || []).map((log) => ({
      ...log,
      actor: log.actor_user_id ? actorMap.get(log.actor_user_id) || null : null,
    })),
  });
}