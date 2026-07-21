import posthog from "posthog-js";

// Thin, typed wrappers around posthog.capture for the product events we track
// (Phase 11.2). Keeping the names + payloads in one place avoids typos and makes
// the tracked funnel easy to see. All are safe no-ops when PostHog isn't
// initialised (no key configured) — posthog buffers/ignores the call.

export function trackAssessmentStarted(props: { isFollowUp: boolean }) {
  posthog.capture("assessment_started", props);
}

export function trackAssessmentCompleted(props: {
  isFollowUp: boolean;
}) {
  posthog.capture("assessment_completed", props);
}

export function trackRiskLevelShown() {
  posthog.capture("risk_level_shown");
}
