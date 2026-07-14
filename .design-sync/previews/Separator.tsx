import { Separator } from "pitsypet";

export function Horizontal() {
  return (
    <div className="w-72">
      <div className="text-sm font-medium">Clinical history</div>
      <Separator className="my-3" />
      <div className="text-sm text-muted-foreground">
        Medications, appointments and past assessments.
      </div>
    </div>
  );
}

export function Vertical() {
  return (
    <div className="flex h-6 items-center gap-3 text-sm">
      <span>Dashboard</span>
      <Separator orientation="vertical" />
      <span>Pets</span>
      <Separator orientation="vertical" />
      <span>History</span>
    </div>
  );
}
