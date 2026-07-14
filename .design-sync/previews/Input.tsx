import { Input, Label } from "pitsypet";

export function Default() {
  return (
    <div className="w-72">
      <Input placeholder="Search your pets…" />
    </div>
  );
}

export function WithLabel() {
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="pet-name">Pet name</Label>
      <Input id="pet-name" defaultValue="Bella" />
    </div>
  );
}

export function Invalid() {
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="pet-weight">Weight (kg)</Label>
      <Input id="pet-weight" aria-invalid defaultValue="-3" />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="w-72">
      <Input disabled defaultValue="Read only" />
    </div>
  );
}
