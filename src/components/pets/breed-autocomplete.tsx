"use client";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Species } from "@/lib/validations/pet";

type BreedRow = { id: number; name: string; species: string };

interface BreedAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  species: Species;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function BreedAutocomplete({
  value,
  onChange,
  species,
  id,
  ...aria
}: BreedAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<BreedRow[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced fetch on value/species change.
  useEffect(() => {
    const q = value.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/pets/breeds?q=${encodeURIComponent(q)}&species=${species}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as { breeds: BreedRow[] };
        setSuggestions(data.breeds ?? []);
      } catch {
        // aborted or network error — ignore
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, species]);

  // Close on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const trimmed = value.trim();
  const hasExactMatch = suggestions.some(
    (b) => b.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCustom = trimmed.length > 0 && !hasExactMatch;

  // Items = suggestions, plus an optional "use custom breed" row at the end.
  const itemCount = suggestions.length + (showCustom ? 1 : 0);

  function select(name: string) {
    onChange(name);
    setOpen(false);
    setHighlight(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % Math.max(itemCount, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? itemCount - 1 : h - 1));
    } else if (e.key === "Enter") {
      if (open && highlight >= 0) {
        e.preventDefault();
        if (highlight < suggestions.length) {
          select(suggestions[highlight].name);
        } else {
          select(trimmed);
        }
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        autoComplete="off"
        placeholder="Start typing a breed…"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(-1);
        }}
        onFocus={() => value.trim().length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        {...aria}
      />

      {open && itemCount > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover py-1 text-sm shadow-md"
          role="listbox"
        >
          {suggestions.map((b, i) => (
            <li
              key={b.id}
              role="option"
              aria-selected={highlight === i}
              className={`cursor-pointer px-3 py-1.5 ${
                highlight === i ? "bg-muted" : ""
              }`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                select(b.name);
              }}
            >
              {b.name}
            </li>
          ))}
          {showCustom && (
            <li
              role="option"
              aria-selected={highlight === suggestions.length}
              className={`cursor-pointer px-3 py-1.5 text-muted-foreground ${
                highlight === suggestions.length ? "bg-muted" : ""
              }`}
              onMouseEnter={() => setHighlight(suggestions.length)}
              onMouseDown={(e) => {
                e.preventDefault();
                select(trimmed);
              }}
            >
              Use “{trimmed}” as a custom breed
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
