import { Phone, MapPin, AlertTriangle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Reliability requirement (proposal NFR-3): if the AI triage stalls or fails,
// the owner must get emergency contact info fast. This block is fully STATIC —
// no fetch, no props from the network — so it renders instantly (well under the
// 2s target) regardless of API/DB state.
const NATIONAL_HOTLINE = "1300 226 226";

function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

export function EmergencyFallback({ note }: { note?: string }) {
  return (
    <div className="grid gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <p className="flex items-center gap-2 font-medium text-destructive">
        <AlertTriangle className="size-4" aria-hidden />
        {note ?? "Taking longer than usual. If this might be an emergency, don't wait."}
      </p>
      <p className="text-muted-foreground">Contact an emergency vet now:</p>
      <a
        href={telHref(NATIONAL_HOTLINE)}
        className="flex w-fit items-center gap-2 font-medium underline-offset-2 hover:underline"
      >
        <Phone className="size-4" aria-hidden /> Animal Emergency Australia —{" "}
        {NATIONAL_HOTLINE}
      </a>
      <a
        href="https://www.google.com/maps/search/emergency+vet+near+me"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
      >
        <MapPin className="size-4" aria-hidden /> Search emergency vet near me
      </a>
    </div>
  );
}
