import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Shown for all risk levels: the headline concern, the reasoning behind the
// classification, and a plain-English "about these symptoms" explainer.
export function ClinicalReasoning({
  primaryConcern,
  clinicalReasoning,
  aboutSymptoms,
}: {
  primaryConcern: string | null;
  clinicalReasoning: string | null;
  aboutSymptoms: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          {primaryConcern ?? "Assessment summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
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
