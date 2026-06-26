import { describe, it, expect, beforeEach, vi } from "vitest";

import { makeClient, jsonRequest } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

import { POST } from "../pets/[id]/medications/route";
import { PATCH, DELETE } from "../pets/[id]/medications/[medId]/route";

const params = Promise.resolve({ id: "p1", medId: "m1" });
const base = "http://localhost/api/pets/p1/medications";

beforeEach(() => {
  currentClient = undefined;
});

describe("POST /api/pets/[id]/medications", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await POST(jsonRequest(base, "POST", { name: "Cephalexin" }), { params });
    expect(res.status).toBe(401);
  });

  it("400 on malformed JSON", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(jsonRequest(base, "POST", "{bad", true), { params });
    expect(res.status).toBe(400);
  });

  it("400 when the name is missing (validation)", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(jsonRequest(base, "POST", { dosage: "10" }), { params });
    expect(res.status).toBe(400);
  });

  it("404 when the pet is not owned/found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: null, error: null } },
    });
    const res = await POST(jsonRequest(base, "POST", { name: "Cephalexin" }), { params });
    expect(res.status).toBe(404);
  });

  it("201 with the created medication", async () => {
    const medication = { medication_id: "m1", name: "Cephalexin" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        pets: { data: { pet_id: "p1" }, error: null },
        medications: { data: medication, error: null },
      },
    });
    const res = await POST(jsonRequest(base, "POST", { name: "Cephalexin" }), { params });
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ medication });
  });

  it("500 when the insert fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        pets: { data: { pet_id: "p1" }, error: null },
        medications: { data: null, error: { message: "boom" } },
      },
    });
    const res = await POST(jsonRequest(base, "POST", { name: "Cephalexin" }), { params });
    expect(res.status).toBe(500);
  });

  it("400 when end date precedes start date", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(
      jsonRequest(base, "POST", {
        name: "Cephalexin",
        started_at: "2026-06-10",
        ended_at: "2026-06-01",
      }),
      { params },
    );
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/pets/[id]/medications/[medId]", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await PATCH(jsonRequest(base + "/m1", "PATCH", { dosage: "20" }), { params });
    expect(res.status).toBe(401);
  });

  it("200 with the updated medication", async () => {
    const medication = { medication_id: "m1", dosage: "20" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { medications: { data: medication, error: null } },
    });
    const res = await PATCH(jsonRequest(base + "/m1", "PATCH", { dosage: "20" }), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ medication });
  });

  it("404 when the medication is not found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { medications: { data: null, error: { message: "no row" } } },
    });
    const res = await PATCH(jsonRequest(base + "/m1", "PATCH", { dosage: "20" }), { params });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/pets/[id]/medications/[medId]", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await DELETE(jsonRequest(base + "/m1", "DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("200 (soft delete) on success", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { medications: { data: null, error: null } },
    });
    const res = await DELETE(jsonRequest(base + "/m1", "DELETE"), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("500 when the delete fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { medications: { data: null, error: { message: "boom" } } },
    });
    const res = await DELETE(jsonRequest(base + "/m1", "DELETE"), { params });
    expect(res.status).toBe(500);
  });
});
