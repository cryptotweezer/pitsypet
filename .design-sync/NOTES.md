# design-sync notes — PitsyPet UI

Repo-specific gotchas for future re-syncs. Append as you learn more.

## Setup / build shape
- **This is a Next.js app, not a published component package.** There is no `dist/` and no `package.json` `main`/`module`/`exports`. The converter runs in **synth-entry mode** off a barrel: `--entry .design-sync/ui-barrel.ts` (re-exports every `src/components/ui/*.tsx`). The barrel is what anchors `PKG_DIR` at the repo root (its `package.json` name = `pitsypet`); without `--entry`, the converter looks for `node_modules/pitsypet` and crashes.
- **Components are discovered via `componentSrcMap`** (13 explicit pins), because there is no shipped `.d.ts` for the converter's export scan to find. Sub-components (CardHeader, DialogContent, SelectItem, …) are all on `window.PitsyPetUI` via `export *`; only the 13 roots get cards.
- **CSS is compiled Tailwind, not the source `globals.css`.** These components style entirely with Tailwind v4 utility classes, so previews render unstyled unless a *compiled* stylesheet ships. Regenerate before every build:
  `node .ds-sync/node_modules/@tailwindcss/cli/dist/index.mjs -i .design-sync/tw-input.css -o .design-sync/compiled.css`
  `tw-input.css` imports `../src/app/globals.css` (theme + tokens) and `@source`s `src/components/ui` + `.design-sync/previews` so every utility class used by components AND authored previews is emitted. **If you add previews with new utility classes, recompile the CSS or they render unstyled.**
- **Form preview needs `useForm`**, which isn't exported from the UI kit. Wired via `cfg.extraEntries: ["./.design-sync/rhf-shim.ts"]` (re-exports `useForm` from react-hook-form onto the global).

## Known render warns (benign — do not re-chase)
- `[RENDER_THIN]` on **Dialog** and **Sheet**: both are Base UI overlays rendered `defaultOpen`. Their popup is `position: fixed`, so measured height is 0px even though the card renders fully (confirmed in the review sheets). Handled with `cfg.overrides.{Dialog,Sheet}.cardMode = "single"`.

## Floor cards (unauthored by design)
- **Toaster** (sonner): an imperative `toast()` API with no static render — ships the floor card. Authoring it would need a live toast trigger, which doesn't capture statically. Leave as-is unless sonner adds a static story.

## Playwright
- Render check uses the machine's cached chromium build **1228**, pinned by **playwright 1.61.1** (installed in `.ds-sync/node_modules`). If the cache build changes, install the matching playwright.

## Re-sync risks (watch-list for the next run)
- **Tailwind CSS is a generated artifact**: `.design-sync/compiled.css` is NOT committed and must be regenerated (command above) before `package-build.mjs`, or previews lose styling silently.
- **The barrel + synth-entry path is load-bearing**: keep `--entry .design-sync/ui-barrel.ts`. If new UI components are added, regenerate the barrel and add them to `componentSrcMap`.
- Component styling uses the **shadcn base tokens** (`--primary` = near-black), NOT the landing-page purple brand tokens (`--brand`). This is correct — the UI kit and the marketing landing use different palettes.
