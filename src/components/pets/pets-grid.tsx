"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";

import { PetCard, type PetCardData } from "@/components/pets/pet-card";
import { PetForm } from "@/components/pets/pet-form";

// Pets tab body: name filter + "Add pet" that expands an INLINE create form
// (no navigation away from the dashboard), plus the cards grid / empty state.
export function PetsSection({ pets }: { pets: PetCardData[] }) {
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);

  const q = filter.trim().toLowerCase();
  const visible =
    q === "" ? pets : pets.filter((p) => p.pet_name.toLowerCase().includes(q));
  const hasPets = pets.length > 0;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {hasPets && (
          <div className="relative max-w-sm flex-1 basis-56">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-on-surface-variant"
              aria-hidden
            />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by name…"
              aria-label="Filter pets by name"
              className="h-11 w-full rounded-full border border-outline-variant/30 bg-white pr-4 pl-11 text-sm outline-none transition-all focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className={
            adding
              ? "flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-white px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition-all hover:text-brand"
              : "flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
          }
        >
          {adding ? (
            <>
              <X className="size-4" aria-hidden /> Close form
            </>
          ) : (
            <>
              <Plus className="size-4" aria-hidden /> Add pet
            </>
          )}
        </button>
      </div>

      {adding && (
        <div className="max-w-lg rounded-[2rem] border border-outline-variant/20 bg-white p-6">
          <h2 className="mb-4 font-display text-xl tracking-tight text-brand">
            New pet
          </h2>
          <PetForm
            mode="create"
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {hasPets ? (
        visible.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((pet) => (
              <PetCard key={pet.pet_id} pet={pet} />
            ))}
          </div>
        ) : (
          <p className="rounded-[2rem] border border-dashed border-outline-variant/50 py-10 text-center text-sm font-light text-on-surface-variant">
            No pets match “{filter.trim()}”.
          </p>
        )
      ) : (
        !adding && (
          <div className="glass-card grid place-items-center gap-3 rounded-[2.5rem] border border-dashed border-outline-variant/50 py-16 text-center">
            <p className="font-display text-xl text-brand">No pets yet</p>
            <p className="max-w-sm text-sm font-light text-on-surface-variant">
              Create your first pet profile so PitsyPet can tailor its triage
              to their species, breed, and age.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand/20 active:scale-95"
            >
              Add your first pet
            </button>
          </div>
        )
      )}
    </div>
  );
}
