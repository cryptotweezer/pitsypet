import { Badge } from "pitsypet";

export function RiskLevels() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary">Low risk</Badge>
      <Badge variant="outline">Medium risk</Badge>
      <Badge variant="destructive">High risk</Badge>
    </div>
  );
}

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  );
}
