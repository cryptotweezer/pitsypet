import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests cover the deterministic logic (triage safety override, rule-based
// fallback, Zod schemas, symptom-tracker matching, RAG ranking, formatters) —
// pure functions, so a plain node environment is all that's needed. Component
// tests would add jsdom + testing-library later.
export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*" → "src/*" path alias so modules that import
      // via "@/…" resolve under Vitest the same way they do in Next.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
