# Repository Guidelines

## Project Structure & Module Organization

PitsyPet is a Next.js 15 App Router application written in TypeScript. Pages, layouts, route handlers, and middleware-facing flows live in `src/app`; reusable UI is organized by feature in `src/components`. Shared business logic, validation, AI helpers, and Supabase clients belong in `src/lib`. Keep tests close to the code in `__tests__` directories. Static images and other browser assets live in `public`, operational scripts in `scripts`, project notes in `docs`, and database changes in `supabase/migrations`.

## Build, Test, and Development Commands

- `npm run dev` starts the local application at `http://localhost:3000`.
- `npm run build` creates the production build and catches framework/type errors.
- `npm run lint` runs the configured Next.js ESLint checks.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` reruns Vitest as files change.
- `npx tsc --noEmit` performs a focused TypeScript check.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, and semicolons, matching the existing source. Name React components and exported types in PascalCase, functions and variables in camelCase, and source files in kebab-case (for example, `active-symptoms.ts`). Prefer the `@/*` alias for imports from `src`. Reuse existing feature modules and `src/components/ui` primitives before introducing new abstractions.

## Testing Guidelines

Vitest runs in a Node environment and discovers `src/**/*.test.ts`. Name tests after the subject, such as `medications.test.ts`, and use behavior-focused `describe`/`it` cases. Add focused coverage for changed deterministic logic and API route behavior. Before submitting, run `npm test`, `npx tsc --noEmit`, and `npm run lint`; use `docs/manual_testing.md` for user-flow checks when relevant.

## Commit & Pull Request Guidelines

Follow the repository's Conventional Commit style: `feat:`, `fix:`, `test:`, `docs:`, or `chore:`; add a scope when useful, as in `feat(landing):`. Keep commits focused. Pull requests should explain the behavioral change, list verification performed, link related issues, and include screenshots for visible UI changes.

## Security & Configuration

Copy `.env.example` to a local untracked environment file and never commit secrets. Treat migration files as the Supabase schema source of truth. The service-role key bypasses RLS and must remain limited to ingestion scripts, never application routes or components.
