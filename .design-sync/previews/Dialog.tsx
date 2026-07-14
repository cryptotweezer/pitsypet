import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "pitsypet";

export function ConfirmDelete() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bella?</DialogTitle>
          <DialogDescription>
            This permanently removes Bella and all of her assessments. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive">Delete pet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
