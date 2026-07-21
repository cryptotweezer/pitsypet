import { beforeEach, describe, expect, it, vi } from "vitest";

import { jsonRequest, makeClient } from "./_helpers";

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

const mockCustomerDelete = vi.fn();
vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    customers: { del: mockCustomerDelete },
  }),
}));

import { DELETE } from "../account/route";

const url = "http://localhost/api/account";

beforeEach(() => {
  currentClient = undefined;
  vi.clearAllMocks();
  mockCustomerDelete.mockResolvedValue({ id: "cus_1", deleted: true });
});

describe("DELETE /api/account", () => {
  it("400 for malformed JSON", async () => {
    const response = await DELETE(jsonRequest(url, "DELETE", "{", true));
    expect(response.status).toBe(400);
  });

  it("400 without exact confirmation", async () => {
    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "delete" }),
    );
    expect(response.status).toBe(400);
  });

  it("401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );
    expect(response.status).toBe(401);
  });

  it("500 when the billing profile cannot be checked", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        profiles: { data: null, error: { message: "database unavailable" } },
      },
    });
    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );
    expect(response.status).toBe(500);
  });

  it("cancels Stripe before deleting a paid account", async () => {
    const client = makeClient({
      user: { id: "u1" },
      tables: {
        profiles: {
          data: { stripe_customer_id: "cus_1" },
          error: null,
        },
      },
    });
    currentClient = client;

    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );

    expect(response.status).toBe(200);
    expect(mockCustomerDelete).toHaveBeenCalledWith("cus_1");
    expect(client.rpc).toHaveBeenCalledWith("delete_own_account", {
      confirmation_text: "DELETE",
    });
    expect(mockCustomerDelete.mock.invocationCallOrder[0]).toBeLessThan(
      client.rpc.mock.invocationCallOrder[0]!,
    );
  });

  it("does not delete the account when Stripe cancellation fails", async () => {
    const client = makeClient({
      user: { id: "u1" },
      tables: {
        profiles: {
          data: { stripe_customer_id: "cus_1" },
          error: null,
        },
      },
    });
    currentClient = client;
    mockCustomerDelete.mockRejectedValue(new Error("Stripe unavailable"));

    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );

    expect(response.status).toBe(502);
    expect(client.rpc).not.toHaveBeenCalled();
  });

  it("continues when Stripe has already deleted the customer", async () => {
    const client = makeClient({
      user: { id: "u1" },
      tables: {
        profiles: {
          data: { stripe_customer_id: "cus_missing" },
          error: null,
        },
      },
    });
    currentClient = client;
    mockCustomerDelete.mockRejectedValue({ code: "resource_missing" });

    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );

    expect(response.status).toBe(200);
    expect(client.rpc).toHaveBeenCalledOnce();
  });

  it("500 when the database deletion fails", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      tables: {
        profiles: { data: { stripe_customer_id: null }, error: null },
      },
      rpc: { data: null, error: { message: "delete failed" } },
    });

    const response = await DELETE(
      jsonRequest(url, "DELETE", { confirmation: "DELETE" }),
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error:
        "The account could not be deleted. Please try again or contact support.",
    });
  });
});
