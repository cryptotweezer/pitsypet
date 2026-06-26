import { describe, it, expect, beforeEach, vi } from "vitest";

import { makeClient, jsonRequest } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

import { GET, POST } from "../vet-contacts/route";
import { PATCH, DELETE } from "../vet-contacts/[vetId]/route";
import { POST as POST_DOCTOR } from "../vet-contacts/[vetId]/doctors/route";

const vetParams = Promise.resolve({ vetId: "v1" });
const base = "http://localhost/api/vet-contacts";

beforeEach(() => {
  currentClient = undefined;
});

describe("GET /api/vet-contacts", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("200 with the owner's clinics", async () => {
    const vetContacts = [{ vet_contact_id: "v1", clinic_name: "Apex Vet" }];
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: vetContacts, error: null } },
    });
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ vetContacts });
  });
});

describe("POST /api/vet-contacts", () => {
  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await POST(jsonRequest(base, "POST", { clinic_name: "Apex Vet" }));
    expect(res.status).toBe(401);
  });

  it("400 when clinic_name is missing", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST(jsonRequest(base, "POST", { phone: "123" }));
    expect(res.status).toBe(400);
  });

  it("201 with the created clinic (no doctors)", async () => {
    const vetContact = { vet_contact_id: "v1", clinic_name: "Apex Vet" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: vetContact, error: null } },
    });
    const res = await POST(jsonRequest(base, "POST", { clinic_name: "Apex Vet" }));
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ vetContact });
  });

  it("201 with the clinic when doctors are included", async () => {
    const vetContact = { vet_contact_id: "v1", clinic_name: "Apex Vet" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        vet_contacts: { data: vetContact, error: null },
        vet_doctors: { data: null, error: null },
      },
    });
    const res = await POST(
      jsonRequest(base, "POST", {
        clinic_name: "Apex Vet",
        doctors: [{ name: "Dr Smith" }],
      }),
    );
    expect(res.status).toBe(201);
  });

  it("207 when the clinic saves but its doctors fail", async () => {
    const vetContact = { vet_contact_id: "v1", clinic_name: "Apex Vet" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        vet_contacts: { data: vetContact, error: null },
        vet_doctors: { data: null, error: { message: "boom" } },
      },
    });
    const res = await POST(
      jsonRequest(base, "POST", {
        clinic_name: "Apex Vet",
        doctors: [{ name: "Dr Smith" }],
      }),
    );
    expect(res.status).toBe(207);
  });

  it("500 when the clinic insert fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: null, error: { message: "boom" } } },
    });
    const res = await POST(jsonRequest(base, "POST", { clinic_name: "Apex Vet" }));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/vet-contacts/[vetId]", () => {
  it("200 with the updated clinic", async () => {
    const vetContact = { vet_contact_id: "v1", clinic_name: "Apex Vet 2" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: vetContact, error: null } },
    });
    const res = await PATCH(
      jsonRequest(base + "/v1", "PATCH", { clinic_name: "Apex Vet 2" }),
      { params: vetParams },
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ vetContact });
  });

  it("404 when the clinic is not found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: null, error: { message: "no row" } } },
    });
    const res = await PATCH(
      jsonRequest(base + "/v1", "PATCH", { clinic_name: "X" }),
      { params: vetParams },
    );
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/vet-contacts/[vetId] (hard delete)", () => {
  it("200 on success", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: null, error: null } },
    });
    const res = await DELETE(jsonRequest(base + "/v1", "DELETE"), { params: vetParams });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("500 when the delete fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: null, error: { message: "boom" } } },
    });
    const res = await DELETE(jsonRequest(base + "/v1", "DELETE"), { params: vetParams });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/vet-contacts/[vetId]/doctors", () => {
  it("400 when the doctor name is missing", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await POST_DOCTOR(
      jsonRequest(base + "/v1/doctors", "POST", { specialty: "surgery" }),
      { params: vetParams },
    );
    expect(res.status).toBe(400);
  });

  it("404 when the clinic is not owned/found", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: { vet_contacts: { data: null, error: null } },
    });
    const res = await POST_DOCTOR(
      jsonRequest(base + "/v1/doctors", "POST", { name: "Dr Smith" }),
      { params: vetParams },
    );
    expect(res.status).toBe(404);
  });

  it("201 with the created doctor", async () => {
    const doctor = { vet_doctor_id: "d1", name: "Dr Smith" };
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        vet_contacts: { data: { vet_contact_id: "v1" }, error: null },
        vet_doctors: { data: doctor, error: null },
      },
    });
    const res = await POST_DOCTOR(
      jsonRequest(base + "/v1/doctors", "POST", { name: "Dr Smith" }),
      { params: vetParams },
    );
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toEqual({ doctor });
  });
});
