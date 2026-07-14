import { Input, Label } from "pitsypet";

export function WithInput() {
  return (
    <div className="grid w-72 gap-2">
      <Label htmlFor="species">Species</Label>
      <Input id="species" defaultValue="Dog" />
    </div>
  );
}

export function Standalone() {
  return <Label>Symptoms noticed</Label>;
}
