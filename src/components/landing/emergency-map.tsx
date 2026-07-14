"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` at import time, so the actual map must never render on
// the server. `ssr: false` is only allowed inside a client component — hence this
// thin "use client" wrapper, which the server page can import normally.
const EmergencyMapInner = dynamic(() => import("./emergency-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container text-sm font-light text-on-surface-variant">
      Loading map…
    </div>
  ),
});

export function EmergencyMap() {
  return <EmergencyMapInner />;
}
