import { describe, it, expect, beforeEach, vi } from "vitest";

import { makeClient, jsonRequest } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

import { POST } from "../pets/[id]/appointments/route";
import { PATCH, DELETE } from "../pets/[id]/appointments/[apptId]/route";

const params = Promise.resolve({ id: "p1", apptId: "a1" });
const base = "http://localhost/api/pets/p1/appointments";
const validBody = { title: "Annual checkup", scheduled_at: "2026-12-01T10:00" };

beforeEach(() => {
  currentClient = undefined;
});

describe("POST /api/pets/[id]/appointments", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await POST(jsonRequest(base, "POST", validBody), { params });
    expect(res.status).toBe(401);
  });

  it("400 when required fields are missing", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(jsonRequest(base, "POST", { title: "X" }), { params });
    expect(res.status).toBe(400);
  });

  it("400 on an unparseable scheduled_at", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(
      jsonRequest(base, "POST", { title: "X", scheduled_at: "not-a-date" }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  it("404 when the pet is not owned/found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { pets: { data: null, error: null } },
    });
    const res = await POST(jsonRequest(base, "POST", validBody), { params });
    expect(res.status).toBe(404);
  });

  it("201 with the created appointment", async () => {
    const appointment = { appointment_id: "a1", title: "Annual checkup" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        pets: { data: { pet_id: "p1" }, error: null },
        appointments: { data: appointment, error: null },
      },
    });
    const res = await POST(jsonRequest(base, "POST", validBody), { params });
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ appointment });
  });
});

describe("PATCH /api/pets/[id]/appointments/[apptId]", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await PATCH(jsonRequest(base + "/a1", "PATCH", { title: "New" }), { params });
    expect(res.status).toBe(401);
  });

  it("200 with the updated appointment", async () => {
    const appointment = { appointment_id: "a1", title: "Rescheduled" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { appointments: { data: appointment, error: null } },
    });
    const res = await PATCH(
      jsonRequest(base + "/a1", "PATCH", { title: "Rescheduled", scheduled_at: "2026-12-05T09:00" }),
      { params },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ appointment });
  });

  it("404 when the appointment is not found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { appointments: { data: null, error: { message: "no row" } } },
    });
    const res = await PATCH(jsonRequest(base + "/a1", "PATCH", { title: "X" }), { params });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/pets/[id]/appointments/[apptId]", () => {
  it("200 (soft delete) on success", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { appointments: { data: null, error: null } },
    });
    const res = await DELETE(jsonRequest(base + "/a1", "DELETE"), { params });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("500 when the delete fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { appointments: { data: null, error: { message: "boom" } } },
    });
    const res = await DELETE(jsonRequest(base + "/a1", "DELETE"), { params });
    expect(res.status).toBe(500);
  });
});
