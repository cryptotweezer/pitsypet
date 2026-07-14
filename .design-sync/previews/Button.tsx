import { Button } from "pitsypet";

export function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Start assessment</Button>
      <Button variant="outline">View history</Button>
      <Button variant="secondary">Add pet</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete pet</Button>
      <Button variant="link">Learn more</Button>
    </div>
  );
}

export function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Saving…</Button>
      <Button variant="outline" disabled>
        Unavailable
      </Button>
    </div>
  );
}
