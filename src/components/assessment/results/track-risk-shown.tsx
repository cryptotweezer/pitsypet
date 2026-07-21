"use client";

import { useEffect, useRef } from "react";

import { trackRiskLevelShown } from "@/lib/analytics";

// Renders nothing — fires the `risk_level_shown` PostHog event once when the
// results page is viewed (including revisits from history). The results page is
// a Server Component, so this small client island carries the event.
export function TrackRiskShown({
  risk,
}: {
  risk: string;
}) {
  const firedRef = useRef(false);
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    trackRiskLevelShown();
  }, [risk]);

  return null;
}
