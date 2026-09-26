# Talescape design-system refactor progress

## Objective

Centralize Talescape tokens, geometry, source-owned React Aria primitives and
composites; preserve Button compatibility and story behavior; consolidate the
application UI against supplied references and document reusable components in
Storybook. Full scope/plan: `docs/design-system-refactor.md`.

## Current phase

Phase 2 complete: Storybook foundation and Button compatibility baseline.
Branch: `refactor/app-design-system`; starting commit `08a444b`.
User explicitly requested seeing the audit/plan before large-scale refactoring.

## Completed

- Read full attached request and reviewed supplied images.
- Inspected shared components, theme, routes, Button implementation, usage sites,
  Inspector primitives, dependencies and test configuration.
- AST inventory: 242 TSX files, 60 Button sites, 30 asChild sites (all Next Link).
- Enumerated all six source files importing five Radix packages.
- No React Aria or Storybook currently present.
- Ran Fallow duplication audit; inspected repeated field/header/resize patterns.
- Installed React Aria Components 1.21.1 and Storybook 10.6 with the Next.js Vite,
  Docs, Accessibility and Vitest addons.
- Added production-CSS Storybook configuration with theme and viewport controls.
- Added Button stories covering every current variant, shape and motion mode plus
  decorations, icons, states, composed links, galleries and click interaction.
- Added component-first and same-change Storybook guidance to AGENTS.md.

## Files changed / components / stories

- Added `.storybook/main.ts`, `.storybook/preview.tsx`,
  `src/components/ui/button.stories.tsx`, migration log, audit and this checkpoint.
- Existing Button is documented but not migrated; no production component changed.

## Decisions

- Preserve current Button visual layers/API and Next Link semantics.
- Establish Storybook baseline before Button migration.
- Canonical ts tokens with legacy aliases; cool-neutral app surfaces retain brand
  accents. Do not recolor authored Reader content indiscriminately.
- Keep domain ownership at narrowest shared scope; generic UI knows no story data.
- Component-first and same-change Storybook coverage become repository guidance.
- Use Conventional Commits for stable phases. No changelog/version change.
- Never run `npm run dev` (standing user instruction).

## Remaining migration / Radix

All implementation phases remain. Radix imports: ui/button.tsx, ui/label.tsx,
ui/select.tsx, overlay/dialog.tsx, layout/scroll-area.tsx,
data-display/badge.tsx under src/components. Dependencies remain unchanged.

## Checks and known limitations

- Fallow duplication audit completed; no auto-fixes applied.
- `pnpm typecheck` failed with 12 existing diagnostics: missing TaleTrigger and
  TriggerEffect exports/trigger properties in KeyframeActionRuntime.tsx, and
  obsolete TaleElement.layer in formatElements.ts. No application code changed.
- Targeted Biome check passed.
- `pnpm build-storybook` passed. It reports expected large preview chunks, an empty
  MDX glob and the existing Sentry router-transition configuration notice.
- No live application visual checks performed.
- Baseline trigger/layer errors are confirmed in this checkout.

## Exact next steps

1. Commit the stable audit and Storybook baseline.
2. Extract semantic tokens, Tailwind theme aliases and shared geometry.
3. Add Foundation stories and migrate Button geometry without visual API changes.
4. Migrate Button behavior to React Aria and verify composed links/events.
5. Proceed through controls and subsequent documented phases.

Commands needed: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`;
`pnpm build-storybook` after adding that script. Integration verification should
use an existing app server or production/static server, never npm run dev.
