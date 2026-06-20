import { Phone, MapPin, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/components/assessment/results/risk-badge";

export type FirstAid = {
  symptom_name: string;
  recommendation_text: string;
};

export type EmergencyContact = {
  contact_id: string;
  name: string;
  phone: string;
  address: string | null;
  is_24h: boolean;
  website: string | null;
};

const NATIONAL_HOTLINE = "1300 226 226";

// E.164-ish href: strip everything but digits and a leading +.
function telHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

function RedFlags({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;
  return (
    <div className="grid gap-1">
      <p className="font-medium">When to seek care</p>
      <ul className="list-inside list-disc text-muted-foreground">
        {flags.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </div>
  );
}

export function Recommendations({
  risk,
  recommendedAction,
  redFlags,
  firstAid,
  emergencyContacts,
}: {
  risk: RiskLevel;
  recommendedAction: string | null;
  redFlags: string[];
  firstAid: FirstAid[];
  emergencyContacts: EmergencyContact[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Recommended next steps
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {recommendedAction && (
          <p
            className={cn(
              risk === "High"
                ? "font-medium text-destructive"
                : "text-muted-foreground",
            )}
          >
            {recommendedAction}
          </p>
        )}

        {risk === "Low" && firstAid.length > 0 && (
          <div className="grid gap-3">
            {firstAid.map((fa) => (
              <div key={fa.symptom_name} className="grid gap-1">
                <p className="font-medium capitalize">{fa.symptom_name}</p>
                <p className="text-muted-foreground">{fa.recommendation_text}</p>
              </div>
            ))}
            <p className="text-muted-foreground">
              Keep monitoring at home. If anything worsens or new symptoms
              appear, contact your vet.
            </p>
          </div>
        )}

        {risk === "Medium" && (
          <p className="text-muted-foreground">
            Schedule a vet appointment within 24 hours. Keep a close eye on your
            pet and note any changes to share with the vet.
          </p>
        )}

        <RedFlags flags={redFlags} />

        {risk === "High" && (
          <div className="grid gap-3">
            <p className="font-medium">Emergency veterinary contacts</p>
            {emergencyContacts.length > 0 ? (
              <ul className="grid gap-3">
                {emergencyContacts.map((c) => (
                  <li
                    key={c.contact_id}
                    className="grid gap-1 rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.name}</span>
                      {c.is_24h && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" aria-hidden /> 24h
                        </span>
                      )}
                    </div>
                    {c.address && (
                      <span className="text-muted-foreground">{c.address}</span>
                    )}
                    <a
                      href={telHref(c.phone)}
                      className="flex items-center gap-2 font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      <Phone className="size-4" aria-hidden /> {c.phone}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="grid gap-1 rounded-lg border p-3">
                <span className="font-medium">
                  Animal Emergency Australia (National Hotline)
                </span>
                <a
                  href={telHref(NATIONAL_HOTLINE)}
                  className="flex items-center gap-2 font-medium underline-offset-2 hover:underline"
                >
                  <Phone className="size-4" aria-hidden /> {NATIONAL_HOTLINE}
                </a>
              </div>
            )}
            <a
              href="https://www.google.com/maps/search/emergency+vet+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            >
              <MapPin className="size-4" aria-hidden /> Search emergency vet near me
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
