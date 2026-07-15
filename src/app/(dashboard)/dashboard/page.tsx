import Link from "next/link";
import {
  Activity,
  CalendarClock,
  Cat,
  Dog,
  PawPrint,
  Pill,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { cn, petHref } from "@/lib/utils";

export const metadata = { title: "Dashboard · PitsyPet" };

// Status colors carry an explicit text label everywhere (never color alone).
const RISK_PILL: Record<string, string> = {
  High: "border-destructive/40 bg-destructive/10 text-destructive",
  Medium: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  Low: "border-green-500/40 bg-green-600/10 text-green-700",
};

const SYMPTOM_PILL: Record<string, string> = {
  worsening: "border-destructive/40 bg-destructive/10 text-destructive",
  active: "border-amber-500/40 bg-amber-500/10 text-amber-700",
  improving: "border-green-500/40 bg-green-600/10 text-green-700",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

type LatestAssessment = {
  assessment_id: string;
  risk: string;
  action: string | null;
  created_at: string;
};

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();
  const [
    { data: profile },
    { data: pets },
    { data: symptomRows },
    { data: assessmentRows },
    { data: apptRows },
    { data: medRows },
    { data: clinicRows },
  ] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user!.id).maybeSingle(),
    supabase
      .from("pets")
      .select("pet_id, pet_name, slug, species")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("active_symptoms")
      .select("pet_id, name, status, severity")
      .neq("status", "resolved")
      .is("deleted_at", null)
      .order("detected_at", { ascending: false }),
    supabase
      .from("assessments")
      .select(
        "assessment_id, pet_id, risk_classification, recommended_action, follow_ups, created_at",
      )
      .not("completed_at", "is", null)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("appointment_id, pet_id, title, scheduled_at, vet_contact_id, doctor_name")
      .gte("scheduled_at", nowIso)
      .is("deleted_at", null)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("medications")
      .select("pet_id, name, dosage, dosage_unit, frequency, active, ended_at")
      .is("deleted_at", null),
    supabase
      .from("vet_contacts")
      .select("vet_contact_id, clinic_name")
      .is("deleted_at", null),
  ]);

  const displayName = profile?.name ?? user?.email ?? "there";
  const activePets = pets ?? [];
  const clinicName = new Map(
    (clinicRows ?? []).map((c) => [c.vet_contact_id, c.clinic_name]),
  );

  // Latest completed assessment per pet; a follow-up that re-classified the
  // case overrides the initial risk (same rule as the pet page's risk tag).
  const latestByPet = new Map<string, LatestAssessment>();
  for (const a of assessmentRows ?? []) {
    if (latestByPet.has(a.pet_id)) continue; // rows are newest-first
    const followUps = Array.isArray(a.follow_ups)
      ? (a.follow_ups as unknown[])
      : [];
    const last = followUps[followUps.length - 1];
    const risk =
      last &&
      typeof last === "object" &&
      "risk_classification" in last &&
      (last as { risk_classification: unknown }).risk_classification
        ? String((last as { risk_classification: unknown }).risk_classification)
        : (a.risk_classification ?? "—");
    latestByPet.set(a.pet_id, {
      assessment_id: a.assessment_id,
      risk,
      action: a.recommended_action,
      created_at: a.created_at,
    });
  }

  // Current medications: honour the explicit active=false flag (mark-finished)
  // and a past end date.
  const todayStr = nowIso.slice(0, 10);
  const currentMeds = (medRows ?? []).filter(
    (m) => m.active !== false && (!m.ended_at || m.ended_at >= todayStr),
  );

  const symptomsByPet = new Map<string, { name: string; status: string }[]>();
  for (const s of symptomRows ?? []) {
    const list = symptomsByPet.get(s.pet_id) ?? [];
    list.push({ name: s.name, status: s.status });
    symptomsByPet.set(s.pet_id, list);
  }
  const medsByPet = new Map<string, typeof currentMeds>();
  for (const m of currentMeds) {
    const list = medsByPet.get(m.pet_id) ?? [];
    list.push(m);
    medsByPet.set(m.pet_id, list);
  }
  const nextApptByPet = new Map<string, (typeof apptRows & object)[number]>();
  for (const a of apptRows ?? []) {
    if (!nextApptByPet.has(a.pet_id)) nextApptByPet.set(a.pet_id, a); // asc order
  }

  // Pets that need a look first: worsening > any active symptom > High/Medium risk.
  function attentionScore(petId: string): number {
    const symptoms = symptomsByPet.get(petId) ?? [];
    const risk = latestByPet.get(petId)?.risk;
    let score = 0;
    if (symptoms.some((s) => s.status === "worsening")) score += 4;
    if (symptoms.length > 0) score += 2;
    if (risk === "High") score += 3;
    else if (risk === "Medium") score += 1;
    return score;
  }
  const sortedPets = [...activePets].sort(
    (a, b) => attentionScore(b.pet_id) - attentionScore(a.pet_id),
  );

  const stats = [
    { label: "Pets", value: activePets.length, icon: PawPrint },
    {
      label: "Active symptoms",
      value: (symptomRows ?? []).length,
      icon: Activity,
    },
    {
      label: "Upcoming appointments",
      value: (apptRows ?? []).filter((a) =>
        activePets.some((p) => p.pet_id === a.pet_id),
      ).length,
      icon: CalendarClock,
    },
    { label: "Active medications", value: currentMeds.length, icon: Pill },
  ];

  return (
    <section className="grid gap-8">
      <div className="grid gap-1.5">
        <span className="block text-label-caps font-bold text-brand opacity-70">
          OVERVIEW
        </span>
        <h1 className="font-display text-3xl tracking-tight text-brand md:text-4xl">
          Welcome, {displayName}
        </h1>
        <p className="font-light text-on-surface-variant">
          A snapshot of every pet — symptoms, appointments, and medications.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-[2rem] border border-outline-variant/20 bg-white p-5"
          >
            <Icon className="mb-3 size-5 text-brand" aria-hidden />
            <p className="font-display text-3xl text-brand">{value}</p>
            <p className="text-xs font-medium tracking-wide text-on-surface-variant">
              {label}
            </p>
          </div>
        ))}
      </div>

      {activePets.length === 0 ? (
        <div className="glass-card grid place-items-center gap-3 rounded-[2.5rem] border border-dashed border-outline-variant/50 py-16 text-center">
          <p className="font-display text-xl text-brand">No pets yet</p>
          <p className="max-w-sm text-sm font-light text-on-surface-variant">
            Add your first pet to start tracking symptoms, appointments, and
            medications here.
          </p>
          <Link
            href="/dashboard/pets"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
          >
            Go to Pets
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {sortedPets.map((pet) => {
            const Icon = pet.species === "Cat" ? Cat : Dog;
            const symptoms = symptomsByPet.get(pet.pet_id) ?? [];
            const latest = latestByPet.get(pet.pet_id);
            const nextAppt = nextApptByPet.get(pet.pet_id);
            const meds = medsByPet.get(pet.pet_id) ?? [];
            const needsAttention = attentionScore(pet.pet_id) >= 2;

            return (
              <div
                key={pet.pet_id}
                className={cn(
                  "grid content-start gap-4 rounded-[2rem] border bg-white p-6 transition-all hover:shadow-lg",
                  needsAttention
                    ? "border-amber-400/50"
                    : "border-outline-variant/20 hover:border-brand/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <Link
                      href={petHref(pet.slug)}
                      className="font-display text-lg text-brand hover:underline"
                    >
                      {pet.pet_name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {needsAttention && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Check on
                      </span>
                    )}
                    {latest && (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-medium",
                          RISK_PILL[latest.risk] ?? "text-muted-foreground",
                        )}
                      >
                        {latest.risk}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-1">
                  <p className="text-xs font-bold tracking-widest text-brand/60 uppercase">
                    Active symptoms
                  </p>
                  {symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {symptoms.map((s, i) => (
                        <span
                          key={`${s.name}-${i}`}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-xs font-medium",
                            SYMPTOM_PILL[s.status] ?? "text-muted-foreground",
                          )}
                        >
                          {s.name} · {s.status}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-light text-on-surface-variant">
                      None — all clear.
                    </p>
                  )}
                </div>

                {latest?.action && (
                  <div className="grid gap-1">
                    <p className="text-xs font-bold tracking-widest text-brand/60 uppercase">
                      Latest recommendation
                    </p>
                    <p className="line-clamp-2 text-sm font-light">
                      {latest.action}
                    </p>
                    <Link
                      href={`/assessment/${latest.assessment_id}/results?from=history`}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      View assessment →
                    </Link>
                  </div>
                )}

                <div className="grid gap-1">
                  <p className="text-xs font-bold tracking-widest text-brand/60 uppercase">
                    Next appointment
                  </p>
                  {nextAppt ? (
                    <p className="text-sm font-light">
                      <CalendarClock
                        className="mr-1.5 inline size-4 text-brand"
                        aria-hidden
                      />
                      {formatWhen(nextAppt.scheduled_at)} — {nextAppt.title}
                      {nextAppt.vet_contact_id &&
                        clinicName.get(nextAppt.vet_contact_id) && (
                          <span className="text-on-surface-variant">
                            {" "}
                            · {clinicName.get(nextAppt.vet_contact_id)}
                          </span>
                        )}
                    </p>
                  ) : (
                    <p className="text-sm font-light text-on-surface-variant">
                      None scheduled.
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <p className="text-xs font-bold tracking-widest text-brand/60 uppercase">
                    Medications
                  </p>
                  {meds.length > 0 ? (
                    <ul className="grid gap-0.5">
                      {meds.map((m, i) => (
                        <li key={`${m.name}-${i}`} className="text-sm font-light">
                          <Pill
                            className="mr-1.5 inline size-4 text-brand"
                            aria-hidden
                          />
                          {m.name}
                          {m.dosage && (
                            <span className="text-on-surface-variant">
                              {" "}
                              · {m.dosage}
                              {m.dosage_unit ? ` ${m.dosage_unit}` : ""}
                              {m.frequency ? ` · ${m.frequency}` : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-light text-on-surface-variant">
                      None active.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
