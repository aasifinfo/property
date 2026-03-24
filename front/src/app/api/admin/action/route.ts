import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, jsonError, requireAdmin } from "@/lib/deal-server";

async function logActivity(actorUserId: string, action: string, targetTable: string, targetId: string, metadata: Record<string, unknown> = {}) {
  const supabase = getServiceSupabase();
  await supabase.from("activity_log").insert({
    actor_user_id: actorUserId,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const { action, targetId, notes } = await request.json();
    const supabase = getServiceSupabase();

    switch (action) {
      case "approve_application": {
        await supabase.from("users").update({ status: "approved" }).eq("id", targetId);
        await supabase.from("broker_profiles").update({ application_status: "approved", approved_at: new Date().toISOString() }).eq("user_id", targetId);
        await logActivity(auth.user.id, "broker_application_approved", "users", targetId, { notes: notes || null });
        break;
      }
      case "reject_application": {
        await supabase.from("users").update({ status: "deactivated" }).eq("id", targetId);
        await supabase.from("broker_profiles").update({ application_status: "deactivated" }).eq("user_id", targetId);
        await logActivity(auth.user.id, "broker_application_rejected", "users", targetId, { notes: notes || null });
        break;
      }
      case "approve_listing": {
        await supabase.from("listings").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", targetId);
        await supabase.from("listing_status_history").insert({ listing_id: targetId, status: "approved", changed_by: auth.user.id, note: notes || null });
        await logActivity(auth.user.id, "listing_approved", "listings", targetId, { notes: notes || null });
        break;
      }
      case "reject_listing": {
        await supabase.from("listings").update({ status: "rejected" }).eq("id", targetId);
        await supabase.from("listing_status_history").insert({ listing_id: targetId, status: "rejected", changed_by: auth.user.id, note: notes || null });
        await logActivity(auth.user.id, "listing_rejected", "listings", targetId, { notes: notes || null });
        break;
      }
      case "request_listing_changes": {
        await logActivity(auth.user.id, "listing_changes_requested", "listings", targetId, { notes: notes || null });
        break;
      }
      case "suspend_broker": {
        await supabase.from("users").update({ status: "suspended" }).eq("id", targetId);
        await logActivity(auth.user.id, "broker_suspended", "users", targetId, { notes: notes || null });
        break;
      }
      case "deactivate_broker": {
        await supabase.from("users").update({ status: "deactivated" }).eq("id", targetId);
        await logActivity(auth.user.id, "broker_deactivated", "users", targetId, { notes: notes || null });
        break;
      }
      default:
        return jsonError("Unknown admin action.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Admin action failed.", 500);
  }
}