import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Phase 10.6 — route-handler integration tests for POST /api/pets.
// The cookie-scoped Supabase server client and the auth check are the route's
// only external dependencies, so we mock the client module and drive each
// branch (401 unauth → 400 validation → 201 created → 409 dup) deterministically.

// `createClient` is awaited inside the handler; the mock returns whatever the
// current test installs in `currentClient`.
let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

import { POST, GET } from "../pets/route";

type InsertResult = { data: unknown; error: unknown };

// A chainable stand-in for the supabase-js builder used by the route:
//   .from("pets").insert({...}).select().single()  → InsertResult
//   .from("pets").select("*").is(...).order(...)    → InsertResult
function makeClient(opts: {
  user: { id: string } | null;
  insertResult?: InsertResult;
  listResult?: InsertResult;
}) {
  const single = vi.fn().mockResolvedValue(opts.insertResult ?? { data: null, error: null });
  const order = vi.fn().mockResolvedValue(opts.listResult ?? { data: [], error: null });
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }) },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })),
      select: vi.fn(() => ({ is: vi.fn(() => ({ order })) })),
    })),
  };
}

const validBody = {
  pet_name: "Rex",
  species: "Dog",
  breed: "Labrador",
  age_years: 3,
  age_months: 4,
  weight_kg: 28,
  medical_conditions: [],
};

function postRequest(body: unknown, raw = false) {
  return new NextRequest("http://localhost/api/pets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  currentClient = undefined;
});

describe("POST /api/pets", () => {
  it("returns 401 when there is no authenticated user", async () => {
    currentClient = makeClient({ user: null });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 400 on a malformed JSON body", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(postRequest("{not-json", true));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid JSON" });
  });

  it("returns 400 when validation fails (empty body)", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(postRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
    expect(json.issues).toBeDefined();
  });

  it("returns 400 when the weight is out of species bounds", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    // 200kg cat — over the Cat max (15kg) — should fail the superRefine.
    const res = await POST(postRequest({ ...validBody, species: "Cat", weight_kg: 200 }));
    expect(res.status).toBe(400);
  });

  it("returns 201 and the created pet on a valid request", async () => {
    const created = { id: "p1", ...validBody, user_id: "u1" };
    currentClient = makeClient({
      user: { id: "u1" },
      insertResult: { data: created, error: null },
    });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ pet: created });
  });

  it("returns 409 on a duplicate pet name (unique violation)", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      insertResult: { data: null, error: { code: "23505" } },
    });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("returns 500 when the insert fails for another reason", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      insertResult: { data: null, error: { code: "XXXXX" } },
    });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/pets", () => {
  it("returns 401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns the user's pets when authenticated", async () => {
    const pets = [{ id: "p1", pet_name: "Rex" }];
    currentClient = makeClient({
      user: { id: "u1" },
      listResult: { data: pets, error: null },
    });
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ pets });
  });
});
