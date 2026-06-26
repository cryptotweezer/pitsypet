import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Phase 10.6 — route-handler integration tests for GET /api/search.
// Mocks the Supabase server client AND the search rate limiter so we can drive
// the auth → empty-query → 429 → RPC branches without Redis or a live session.

let currentClient: unknown;
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => currentClient,
}));

const mockLimit = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  searchRateLimiter: { limit: (...args: unknown[]) => mockLimit(...args) },
}));

import { GET } from "../search/route";

function makeClient(opts: {
  user: { id: string } | null;
  rpcResult?: { data: unknown; error: unknown };
}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }) },
    rpc: vi.fn().mockResolvedValue(opts.rpcResult ?? { data: [], error: null }),
  };
}

function searchRequest(q?: string) {
  const url = q === undefined ? "http://localhost/api/search" : `http://localhost/api/search?q=${encodeURIComponent(q)}`;
  return new NextRequest(url);
}

beforeEach(() => {
  currentClient = undefined;
  mockLimit.mockReset();
  // Default: under the limit unless a test says otherwise.
  mockLimit.mockResolvedValue({ success: true });
});

describe("GET /api/search", () => {
  it("returns 401 when unauthenticated", async () => {
    currentClient = makeClient({ user: null });
    const res = await GET(searchRequest("cough"));
    expect(res.status).toBe(401);
  });

  it("returns an empty result set (and skips the limiter) for a blank query", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    const res = await GET(searchRequest("   "));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ results: [] });
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limit is exceeded", async () => {
    currentClient = makeClient({ user: { id: "u1" } });
    mockLimit.mockResolvedValue({ success: false });
    const res = await GET(searchRequest("vomiting"));
    expect(res.status).toBe(429);
    expect(mockLimit).toHaveBeenCalledWith("u1");
  });

  it("returns the RPC results on a valid search", async () => {
    const rows = [{ id: "a1", primary_concern: "lethargy" }];
    currentClient = makeClient({
      user: { id: "u1" },
      rpcResult: { data: rows, error: null },
    });
    const res = await GET(searchRequest("lethargy"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ results: rows });
  });

  it("returns 500 when the search RPC errors", async () => {
    currentClient = makeClient({
      user: { id: "u1" },
      rpcResult: { data: null, error: { message: "boom" } },
    });
    const res = await GET(searchRequest("seizure"));
    expect(res.status).toBe(500);
  });
});
