# Talescape design-system refactor progress

## Objective

Centralize Talescape tokens, geometry, source-owned React Aria primitives and
composites; preserve Button compatibility and story behavior; consolidate the
application UI against supplied references and document reusable components in
Storybook. Full scope/plan: `docs/design-system-refactor.md`.

## Current phase

Phase 6 in progress: structural primitives and Inspector composition.
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
- Added semantic color, surface, content-type, spacing, radius, shadow, typography
  and motion tokens, plus Tailwind aliases and reduced-motion durations.
- Added shared typed angular geometry and Foundation stories.
- Migrated Button from Radix Slot to React Aria Button/Link while preserving the
  current compatibility API and rendered visual layers.
- Added an isolated Storybook Vitest browser project.
- Added React Aria-backed Input, Textarea, Label, Select, SearchField, Checkbox,
  Switch, RadioGroup and Slider primitives with default and compact densities.
- Preserved the existing Input and compound Select compatibility APIs used by
  Library forms while moving interaction behavior behind Talescape components.
- Added form-control stories for default, compact, disabled, invalid, empty,
  responsive and keyboard/change interaction states.
- Migrated Scene Details and Scene Container controls to shared compact-density
  components as the representative Studio slice.
- Migrated the Library tale explorer to the shared SearchField and named Select
  controls as the representative shared application slice.
- Added semantic Panel, PanelHeader, PanelHeading, PanelContent, SectionHeader,
  PropertyGroup and PropertyRow primitives with compact/responsive stories.
- Migrated the Scene Details, Frame Layout and Scene Structure Inspector sections
  to shared structural primitives while preserving their comic panel treatment.
- Removed the unused Radix Label and Select packages and their lockfile-only
  transitive dependencies.
- Added React Aria-backed Tabs, TabList, Tab and TabPanel primitives plus semantic
  actionable Breadcrumbs with compact, overflow and keyboard stories.
- Migrated shared Reader DebugTabs to the Tabs primitives while preserving the
  `debug-tab-list` selector contract and adding Studio instrumentation only in
  Inspector consumers.
- Migrated InspectorHeader hierarchy navigation to Breadcrumbs and retained a
  semantic Inspector heading with stable styling hooks.
- Added shared Thumbnail, EmptyState and Skeleton display components with stories
  for fit, selection, disabled, missing-image, action and responsive states.
- Migrated Studio Element thumbnails, Library empty states and site loading
  placeholders to the shared display components.
- Added semantic Field and React Aria-backed CollapsibleSection primitives with
  compact Inspector interaction coverage.
- Migrated Reader/Studio DebugCard disclosures and all Setting field groups to
  shared structure while preserving Reader instrumentation and comic geometry.
- Migrated core Inspector text, number and dimension value editors to shared
  compact Input and Select controls.

## Files changed / components / stories

- Added Storybook configuration, Button/Foundation/Form Control stories,
  tokens/theme/geometry, browser-test configuration, migration log, audit and
  this checkpoint.
- Migrated `src/components/ui/button.tsx` and shared form primitives.
- Migrated Scene Details text fields and Scene Container selects without changing
  tale data behavior.
- Migrated Library search/filter controls without changing filtering behavior.

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

Composites and broader application migration remain. Source imports of Radix now
remain in overlay/dialog.tsx, layout/scroll-area.tsx and data-display/badge.tsx.

## Checks and known limitations

- Fallow duplication audit completed; no auto-fixes applied.
- `pnpm typecheck` failed with 12 existing diagnostics: missing TaleTrigger and
  TriggerEffect exports/trigger properties in KeyframeActionRuntime.tsx, and
  obsolete TaleElement.layer in formatElements.ts. No application code changed.
- Targeted Biome check passed.
- `pnpm build-storybook` passed. It reports expected large preview chunks, an empty
  MDX glob and the existing Sentry router-transition configuration notice.
- `pnpm build` reached Next.js production compilation but could not fetch Google
  Fonts because this workspace has no external DNS access.
- `pnpm test:storybook` passed after the control migration: 3 story files and 46
  Chromium tests, including opening and changing the React Aria Select.
- Structural stories pass in Chromium: 4 story files and 50 tests total.
- Navigation stories pass in Chromium: 5 story files and 54 tests, including
  keyboard tab selection and breadcrumb actions.
- Display stories pass in Chromium: 6 story files and 57 tests total.
- Inspector structure stories pass in Chromium: 6 story files and 58 tests total,
  including disclosure expand/collapse and accessible numeric field lookup.
- `pnpm test` passed: 18 files and 68 tests.
- Typecheck after Button migration reports only the same 12 scene-model diagnostics.
- No live application visual checks performed.
- Baseline trigger/layer errors are confirmed in this checkout.

## Exact next steps

1. Add Tag and StatusBadge while migrating their first domain consumers.
2. Continue replacing remaining Inspector-native selects, inputs and textareas
   with the shared controls in focused slices.
3. Continue through resizing, overlays, collections, domain UI and application
   audit.

Commands needed: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`;
`pnpm build-storybook` after adding that script. Integration verification should
use an existing app server or production/static server, never npm run dev.
