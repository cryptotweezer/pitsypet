import { describe, it, expect, beforeEach, vi } from "vitest";

import { makeClient, jsonRequest } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

// The reconcile route delegates the actual write to reconcileActiveSymptoms;
// mock it so we can drive its success/failure without the DB.
const mockReconcile = vi.fn();
vi.mock("@/lib/active-symptoms", () => ({
  reconcileActiveSymptoms: (...args: unknown[]) => mockReconcile(...args),
}));

import { POST } from "../pets/[id]/symptoms/route";
import { PATCH, DELETE } from "../pets/[id]/symptoms/[symptomId]/route";
import { POST as RECONCILE } from "../pets/[id]/symptoms/reconcile/route";

const params = Promise.resolve({ id: "p1", symptomId: "s1" });
const base = "http://localhost/api/pets/p1/symptoms";

beforeEach(() => {
  currentClient = undefined;
  mockReconcile.mockReset();
  mockReconcile.mockResolvedValue(undefined);
});

describe("POST /api/pets/[id]/symptoms", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await POST(jsonRequest(base, "POST", { name: "Limping" }), { params });
    expect(res.status).toBe(401);
  });

  it("400 when the name is missing", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(jsonRequest(base, "POST", { severity: "mild" }), { params });
    expect(res.status).toBe(400);
  });

  it("404 when the pet is not owned/found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: null, error: null } },
    });
    const res = await POST(jsonRequest(base, "POST", { name: "Limping" }), { params });
    expect(res.status).toBe(404);
  });

  it("201 with the created symptom", async () => {
    const symptom = { symptom_id: "s1", name: "Limping" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        pets: { data: { pet_id: "p1" }, error: null },
        active_symptoms: { data: symptom, error: null },
      },
    });
    const res = await POST(jsonRequest(base, "POST", { name: "Limping" }), { params });
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ symptom });
  });
});

describe("PATCH /api/pets/[id]/symptoms/[symptomId]", () => {
  it("200 with the updated symptom", async () => {
    const symptom = { symptom_id: "s1", status: "resolved" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { active_symptoms: { data: symptom, error: null } },
    });
    const res = await PATCH(
      jsonRequest(base + "/s1", "PATCH", { status: "resolved" }),
      { params },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ symptom });
  });

  it("404 when the symptom is not found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { active_symptoms: { data: null, error: { message: "no row" } } },
    });
    const res = await PATCH(
      jsonRequest(base + "/s1", "PATCH", { status: "worsened" }),
      { params },
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/pets/[id]/symptoms/[symptomId]", () => {
  it("200 (soft delete) on success", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { active_symptoms: { data: null, error: null } },
    });
    const res = await DELETE(jsonRequest(base + "/s1", "DELETE"), { params });
    expect(res.status).toBe(200);
  });

  it("500 when the delete fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { active_symptoms: { data: null, error: { message: "boom" } } },
    });
    const res = await DELETE(jsonRequest(base + "/s1", "DELETE"), { params });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/pets/[id]/symptoms/reconcile", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await RECONCILE(
      jsonRequest(base + "/reconcile", "POST", { symptoms: [{ name: "Limping" }] }),
      { params },
    );
    expect(res.status).toBe(401);
  });

  it("400 when the symptoms array is empty", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await RECONCILE(
      jsonRequest(base + "/reconcile", "POST", { symptoms: [] }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("404 when the pet is not owned/found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: null, error: null } },
    });
    const res = await RECONCILE(
      jsonRequest(base + "/reconcile", "POST", { symptoms: [{ name: "Limping" }] }),
      { params },
    );
    expect(res.status).toBe(404);
  });

  it("200 and calls reconcileActiveSymptoms on success", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: { pet_id: "p1" }, error: null } },
    });
    const res = await RECONCILE(
      jsonRequest(base + "/reconcile", "POST", {
        symptoms: [{ name: "Limping", status: "improving" }],
      }),
      { params },
    );
    expect(res.status).toBe(200);
    expect(mockReconcile).toHaveBeenCalledTimes(1);
  });

  it("500 when reconciliation throws", async () => {
    mockReconcile.mockRejectedValue(new Error("db down"));
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: { pet_id: "p1" }, error: null } },
    });
    const res = await RECONCILE(
      jsonRequest(base + "/reconcile", "POST", { symptoms: [{ name: "Limping" }] }),
      { params },
    );
    expect(res.status).toBe(500);
  });
});
