import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SymptomItem = {
  name: string;
  severity?: string;
  onset?: string;
  frequency?: string;
  status?: string;
};

// Shown for all risk levels: the headline concern, the detected symptoms, the
// reasoning behind the classification, and a plain-English explainer.
export function ClinicalReasoning({
  primaryConcern,
  clinicalReasoning,
  aboutSymptoms,
  symptoms = [],
}: {
  primaryConcern: string | null;
  clinicalReasoning: string | null;
  aboutSymptoms: string | null;
  symptoms?: SymptomItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          {primaryConcern ?? "Assessment summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {symptoms.length > 0 && (
          <div className="grid gap-1.5">
            <p className="font-medium">Symptoms detected</p>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s, i) => {
                const status =
                  s.status && s.status !== "present" ? s.status : undefined;
                const detail = [s.severity, s.onset, s.frequency, status]
                  .filter((d) => d && d !== "unknown")
                  .join(" · ");
                return (
                  <Badge key={`${s.name}-${i}`} variant="secondary">
                    {s.name}
                    {detail && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        ({detail})
                      </span>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        {clinicalReasoning && (
          <p className="text-muted-foreground">{clinicalReasoning}</p>
        )}
        {aboutSymptoms && (
          <div className="grid gap-1">
            <p className="font-medium">About These Symptoms</p>
            <p className="text-muted-foreground">{aboutSymptoms}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
