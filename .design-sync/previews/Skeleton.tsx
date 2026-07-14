import { Skeleton } from "pitsypet";

export function PetCardLoading() {
  return (
    <div className="flex w-80 items-center gap-4 rounded-xl p-4 ring-1 ring-foreground/10">
      <Skeleton className="size-12 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function Lines() {
  return (
    <div className="grid w-72 gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
