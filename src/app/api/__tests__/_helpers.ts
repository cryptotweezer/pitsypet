import { vi } from "vitest";
import { NextRequest } from "next/server";

// Shared scaffolding for the Phase 10.6 route-handler integration tests.
// NOTE: this file is intentionally NOT named `*.test.ts`, so Vitest's
// include glob (`src/**/*.test.ts`) skips it — it holds helpers only.

type Result = { data: unknown; error: unknown };

// A chainable stand-in for the supabase-js query builder. Every builder method
// (select/insert/update/delete/eq/is/order/limit) returns the same builder, so
// any chain length works; `.single()`/`.maybeSingle()` resolve to the table's
// configured result, and the builder itself is awaitable (thenable) for the
// soft-delete/list chains that `await` without a terminal `.single()`.
export function queryBuilder(result: Result) {
  const builder: Record<string, unknown> = {};
  for (const m of ["select", "insert", "update", "delete", "eq", "neq", "is", "in", "not", "like", "order", "limit"]) {
    builder[m] = () => builder;
  }
  builder.single = () => Promise.resolve(result);
  builder.maybeSingle = () => Promise.resolve(result);
  builder.then = (resolve: (v: Result) => unknown, reject?: (e: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

// Build a mock cookie-scoped Supabase client. `tables` maps a table name to the
// result every query against it should resolve to; unlisted tables resolve to
// an empty success. `rpc` configures `.rpc()`.
export function makeClient(opts: {
  user: { id: string } | null;
  tables?: Record<string, Result>;
  rpc?: Result;
}) {
  const tables = opts.tables ?? {};
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }) },
    from: vi.fn((table: string) => queryBuilder(tables[table] ?? { data: null, error: null })),
    rpc: vi.fn().mockResolvedValue(opts.rpc ?? { data: [], error: null }),
  };
}

// Build a NextRequest with a JSON body. Pass `raw: true` to send a malformed
// body string (to exercise the JSON-parse 400 branch).
export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  raw = false,
) {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : raw ? (body as string) : JSON.stringify(body),
  });
}
