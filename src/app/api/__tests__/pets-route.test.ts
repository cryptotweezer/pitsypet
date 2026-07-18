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
//   .from("pets").insert({...}).select().single()          → insertResult
//   .from("pets").select("*").is(...).order(...)            → listResult
//   .from("pets").select("slug").eq(...).like(...)          → slugResult (nextPetSlug)
//   .from("profiles").select("plan").eq(...).maybeSingle()  → planResult (plan gate)
//   .from("pets").select("pet_id", {count}).is(...)         → countResult (pet cap; awaited)
function makeClient(opts: {
  user: { id: string } | null;
  insertResult?: InsertResult;
  listResult?: InsertResult;
  slugResult?: InsertResult;
  planResult?: InsertResult;
  countResult?: { count: number };
}) {
  const single = vi.fn().mockResolvedValue(opts.insertResult ?? { data: null, error: null });
  const order = vi.fn().mockResolvedValue(opts.listResult ?? { data: [], error: null });
  const like = vi.fn().mockResolvedValue(opts.slugResult ?? { data: [], error: null });
  const maybeSingle = vi.fn().mockResolvedValue(opts.planResult ?? { data: null, error: null });
  // `.is()` is both awaited directly (head-count query) and chained with
  // `.order()` (GET list) — a promise carrying an `order` method covers both.
  const is = vi.fn(() =>
    Object.assign(
      Promise.resolve({ count: opts.countResult?.count ?? 0, data: null, error: null }),
      { order },
    ),
  );
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }) },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })),
      select: vi.fn(() => ({
        is,
        eq: vi.fn(() => ({ like, maybeSingle })),
      })),
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

  it("returns 403 when a basic user already has their 1 pet", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      planResult: { data: { plan: "basic" }, error: null },
      countResult: { count: 1 },
    });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.code).toBe("plan_limit");
  });

  it("lets a premium user create pets past the basic cap", async () => {
    const created = { id: "p9", ...validBody, user_id: "u1" };
    currentClient = makeClient({
      user: { id: "u1" },
      planResult: { data: { plan: "premium" }, error: null },
      countResult: { count: 5 },
      insertResult: { data: created, error: null },
    });
    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(201);
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
