import { Redis } from "@upstash/redis";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// PitsyBasic plan limits (PitsyPremium = unlimited). Marketing copy on the
// landing + billing pages mirrors these numbers — change them together.
//
// Design decisions (agreed with the owner):
// - A triage session, once started, is NEVER cut off mid-conversation: the
//   2/month cap gates STARTING a new assessment; messages inside it are free.
//   Follow-ups to an existing assessment count as part of that session.
// - The 10/day cap applies to the ASSISTANT chats (dashboard widget + pet
//   panel) only, and only to Basic users.
// - Vet PDF exports are unlimited on every plan (deterministic, no AI cost).
export const BASIC_LIMITS = {
  triageSessionsPerMonth: 2,
  assistantMessagesPerDay: 10,
  maxPets: 1,
} as const;

export const LIMIT_MESSAGES = {
  triage:
    "You have used your 2 free AI triage sessions this month. Go Premium for unlimited sessions, or come back next month.",
  assistant:
    "You have reached today's 10 free assistant messages. Go Premium for unlimited chat, or come back tomorrow.",
  pets:
    "PitsyBasic includes 1 pet profile. Go Premium to add unlimited pets.",
} as const;

type Client = SupabaseClient<Database>;

// The cookie-scoped client + RLS guarantee we only ever see the caller's own
// row; a missing row (or missing plan) is treated as basic.
export async function getUserPlan(
  supabase: Client,
  userId: string,
): Promise<"basic" | "premium"> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  return data?.plan === "premium" ? "premium" : "basic";
}

// Completed triage sessions in the current calendar month (UTC). Soft-deleted
// assessments still count — deleting a record doesn't refund the session.
export async function triageSessionsThisMonth(
  supabase: Client,
): Promise<number> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  ).toISOString();
  const { count } = await supabase
    .from("assessments")
    .select("assessment_id", { count: "exact", head: true })
    .not("completed_at", "is", null)
    .gte("completed_at", monthStart);
  return count ?? 0;
}

// "Today" for the daily counter, anchored to the user's own timezone (the
// browser sends its IANA tz) so the allowance resets at THEIR midnight, not
// UTC's. A client lying about its tz can at most shift one reset — bounded.
function dayInTimeZone(timeZone: string | undefined): string {
  if (timeZone) {
    try {
      // en-CA formats as YYYY-MM-DD.
      return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      // invalid tz → fall through to UTC
    }
  }
  return new Date().toISOString().slice(0, 10);
}

const redis = Redis.fromEnv();

// Counts one assistant message for the user and says whether it is within the
// daily allowance. Call ONLY for basic users — premium never consumes.
export async function consumeAssistantMessage(
  userId: string,
  timeZone?: string,
): Promise<boolean> {
  const key = `pitsypet:assistant-msgs:${userId}:${dayInTimeZone(timeZone)}`;
  const used = await redis.incr(key);
  if (used === 1) {
    await redis.expire(key, 86400 * 2);
  }
  return used <= BASIC_LIMITS.assistantMessagesPerDay;
}
