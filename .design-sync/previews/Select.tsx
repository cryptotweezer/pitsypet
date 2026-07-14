import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "pitsypet";

export function SpeciesPicker() {
  return (
    <div className="grid w-56 gap-2">
      <Label>Species</Label>
      <Select defaultValue="dog">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose species" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dog">Dog</SelectItem>
          <SelectItem value="cat">Cat</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function Placeholder() {
  return (
    <div className="w-56">
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a pet…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="bella">Bella</SelectItem>
          <SelectItem value="max">Max</SelectItem>
          <SelectItem value="luna">Luna</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
