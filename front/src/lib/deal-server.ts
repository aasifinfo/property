import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { SUPABASE_CONFIG } from "@/config";

export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_CONFIG.url || !serviceRoleKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(SUPABASE_CONFIG.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getRequestUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, phone, role, status, agency_id, created_at, updated_at")
    .eq("id", data.user.id)
    .maybeSingle();

  return profile ?? null;
}

export async function requireApprovedBroker(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user || user.status !== "approved") {
    return { error: NextResponse.json({ error: "Broker access required." }, { status: 403 }) };
  }
  return { user };
}

export async function requireAdmin(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user || user.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { user };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

