"use client";

import { useState } from "react";
import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function closeDialog() {
    if (deleting) return;
    setOpen(false);
    setConfirmation("");
    setError(null);
  }

  async function deleteAccount() {
    if (confirmation !== "DELETE") return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Account deletion failed.");
      }

      // Supabase access tokens can remain readable until expiry after a user
      // row is deleted. Clear this browser's local session before leaving.
      await createClient().auth.signOut({ scope: "local" });
      window.location.replace("/");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Account deletion failed. Please try again.",
      );
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-[2.5rem] border border-error/20 bg-white p-8 md:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-error-container text-error">
                <Trash2 className="size-5" aria-hidden />
              </span>
              <h2 className="font-display text-2xl tracking-tight text-error">
                Delete account
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed font-light text-on-surface-variant">
              Permanently remove your account, pet profiles, clinical records,
              assessments, medications, appointments and saved vet contacts.
              Any active PitsyPremium subscription is cancelled immediately.
            </p>
            <p className="mt-3 text-sm font-semibold text-error">
              This cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setOpen(true)}
            className="h-auto rounded-full px-5 py-3 font-bold"
          >
            Delete my account
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && closeDialog()}>
        <DialogContent className="gap-5 rounded-[2rem] p-6 sm:max-w-md">
          <DialogHeader className="gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-error-container text-error">
              <TriangleAlert className="size-6" aria-hidden />
            </span>
            <DialogTitle className="font-display text-2xl tracking-tight text-error">
              Permanently delete your account?
            </DialogTitle>
            <DialogDescription className="leading-relaxed text-on-surface-variant">
              All PitsyPet data linked to your account will be removed. If you
              have Premium, Stripe will cancel it immediately and no future
              subscription charges will be made.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <label
              htmlFor="delete-account-confirmation"
              className="text-sm font-semibold text-on-surface"
            >
              Type <span className="font-black text-error">DELETE</span> to confirm
            </label>
            <Input
              id="delete-account-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              disabled={deleting}
              aria-describedby={error ? "delete-account-error" : undefined}
              className="h-11 rounded-xl border-outline-variant/40 bg-white px-4 uppercase focus-visible:border-error focus-visible:ring-error/20"
            />
            {error && (
              <p
                id="delete-account-error"
                role="alert"
                className="text-sm font-medium text-error"
              >
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="-mx-6 -mb-6 px-6 py-5">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={deleting}
              className="h-auto rounded-full px-5 py-3"
            >
              Keep my account
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteAccount}
              disabled={confirmation !== "DELETE" || deleting}
              className="h-auto rounded-full px-5 py-3 font-bold"
            >
              {deleting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Deleting account...
                </>
              ) : (
                "Delete permanently"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
