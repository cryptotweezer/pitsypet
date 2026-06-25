import { defineConfig } from "vitest/config";

// Unit tests cover the deterministic triage logic (safety override, rule-based
// fallback, Zod schemas) — pure functions, so a plain node environment is all
// that's needed. Component tests would add jsdom + testing-library later.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
