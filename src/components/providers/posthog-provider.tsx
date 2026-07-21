"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// Product analytics. The project token is public/client-safe (it can only send
// events, not read them). No-op when the key is unset, so dev/preview without
// the env var simply don't track. Pageviews are captured manually because the
// App Router does client-side navigation that posthog can't auto-detect.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      person_profiles: "never",
      autocapture: false,
      disable_session_recording: true,
      cookieless_mode: "always",
      respect_dnt: true,
      capture_pageview: false, // captured manually below
      // Never send private route values such as pet slugs, assessment ids,
      // checkout session ids, referrers, or full URLs to analytics.
      sanitize_properties: (properties) => {
        const safe = { ...properties };
        for (const key of [
          "$current_url",
          "$pathname",
          "$referrer",
          "$referring_domain",
          "$initial_current_url",
          "$initial_referrer",
          "$initial_referring_domain",
        ]) {
          delete safe[key];
        }
        return safe;
      },
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Fire a $pageview on every App Router navigation. useSearchParams needs a
// Suspense boundary (provided above) so it doesn't opt the whole tree out of
// static rendering.
function PostHogPageView() {
  const pathname = usePathname();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    ph.capture("$pageview", { route: publicRouteName(pathname) });
  }, [pathname, ph]);

  return null;
}

function publicRouteName(pathname: string): string {
  if (pathname.startsWith("/assessment/")) return "/assessment/[pet]";
  if (/^\/pets\/[^/]+\/results\//.test(pathname)) {
    return "/pets/[pet]/results/[assessment]";
  }
  if (/^\/pets\/[^/]+\/edit$/.test(pathname)) return "/pets/[pet]/edit";
  if (/^\/pets\/[^/]+$/.test(pathname)) return "/pets/[pet]";
  return pathname;
}
