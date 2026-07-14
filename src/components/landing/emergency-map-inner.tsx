"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

import { EMERGENCY_CLINICS } from "./emergency-clinics";

// Brand-purple SVG teardrop pin (no external image → nothing for the strict CSP
// to block; the default Leaflet marker PNGs load from a CDN, which we avoid).
const PIN_SVG = `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="#450076"/><circle cx="15" cy="15" r="6" fill="#ffffff"/></svg>`;

export default function EmergencyMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, { scrollWheelZoom: false });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: PIN_SVG,
      className: "emergency-pin",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -38],
    });

    const markers: L.Marker[] = [];
    for (const c of EMERGENCY_CLINICS) {
      if (c.lat == null || c.lng == null) continue;
      const tel = c.phone.replace(/\s+/g, "");
      // Tailwind classes only (no inline style attrs) so the strict CSP is happy.
      const popup = `<div class="min-w-[180px] font-sans"><p class="font-bold text-[#450076]">${c.name}</p><p class="mt-0.5 text-xs text-slate-500">${c.address} · ${c.state}</p><a class="mt-1 inline-block font-semibold text-[#450076]" href="tel:${tel}">${c.phone}</a></div>`;
      markers.push(
        L.marker([c.lat, c.lng], { icon }).addTo(map).bindPopup(popup),
      );
    }

    if (markers.length) {
      map.fitBounds(L.featureGroup(markers).getBounds(), { padding: [40, 40] });
    } else {
      map.setView([-25.6, 134.4], 4);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of 24/7 emergency veterinary clinics across Australia"
      className="h-full w-full"
    />
  );
}
