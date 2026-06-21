import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { appointmentUpdateSchema } from "@/lib/validations/appointment";

// PATCH = edit an appointment (reschedule, change reason, etc.).
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; apptId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = appointmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const update = {
    ...parsed.data,
    ...(parsed.data.scheduled_at
      ? { scheduled_at: new Date(parsed.data.scheduled_at).toISOString() }
      : {}),
  };

  const { data: appointment, error } = await supabase
    .from("appointments")
    .update(update)
    .eq("appointment_id", params.apptId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Appointment not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ appointment });
}

// DELETE = soft delete an appointment.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; apptId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("appointments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("appointment_id", params.apptId)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
