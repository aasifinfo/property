import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase, jsonError } from "@/lib/deal-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requiredFields = ["firstName", "lastName", "email", "phone", "password", "agencyName", "reraBrn", "speciality", "experienceYears"];

    for (const field of requiredFields) {
      if (!body[field]) return jsonError(`${field} is required.`);
    }

    if (!Array.isArray(body.coveredAreaIds) || !body.coveredAreaIds.length) {
      return jsonError("At least one covered area is required.");
    }

    const supabase = getServiceSupabase();
    const { data: existingAgency } = await supabase
      .from("agencies")
      .select("id, name")
      .ilike("name", body.agencyName)
      .maybeSingle();

    let agencyId = existingAgency?.id;
    if (!agencyId) {
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .insert({ name: body.agencyName, rera_brn: body.reraBrn, status: "pending" })
        .select("id")
        .single();
      if (agencyError || !agency) return jsonError("Failed to create agency.", 500);
      agencyId = agency.id;
    }

    const { data: createdUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        display_name: `${body.firstName} ${body.lastName}`,
      },
    });

    if (createUserError || !createdUser.user) {
      return jsonError(createUserError?.message || "Failed to create broker account.", 400);
    }

    const userId = createdUser.user.id;
    await supabase.from("users").upsert({
      id: userId,
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      role: "broker",
      status: "pending",
      agency_id: agencyId,
    });

    await supabase.from("broker_profiles").upsert({
      user_id: userId,
      agency_id: agencyId,
      rera_brn: body.reraBrn,
      covered_area_ids: body.coveredAreaIds,
      speciality: body.speciality,
      experience_years: Number(body.experienceYears),
      whatsapp_number: body.phone,
      application_status: "pending",
      application_submitted_at: new Date().toISOString(),
    });

    await supabase.from("activity_log").insert({
      actor_user_id: userId,
      action: "broker_application_submitted",
      target_table: "broker_profiles",
      target_id: userId,
      metadata: { agencyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Application failed.", 500);
  }
}

