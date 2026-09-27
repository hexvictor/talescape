# Talescape design-system refactor progress

## Objective

Centralize Talescape tokens, geometry, source-owned React Aria primitives and
composites; preserve Button compatibility and story behavior; consolidate the
application UI against supplied references and document reusable components in
Storybook. Full scope/plan: `docs/design-system-refactor.md`.

## Current phase

Phase 9 in progress: Inspector, graph and domain presentation migration.
Branch: `refactor/app-design-system`; starting commit `08a444b`.
Current package version: `1.11.4`.
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
- Added shared Tag and status-aware StatusBadge display components, including
  semantic success, warning, danger, neutral and fallback information tones.
- Migrated Library tale cards, book cards, node metadata and tale detail headers
  to distinguish lifecycle status from categorical tags.
- Removed the final direct application dependency on Radix Slot; it remains only
  as a transitive dependency of the not-yet-migrated Radix overlays.
- Migrated Element Content text, textarea, media playback, activation scope,
  volume and looping controls to shared compact form primitives.
- Migrated animation selection preset controls, carry-state toggles, hover
  duration, loop Frame bounds and editor actions to shared controls and Buttons.
- Migrated the complete animation-track editor to shared Select, Input, Textarea,
  Slider and Button primitives, with one local adapter for repeated track options.
- Added a reusable x/y ResizeHandle with pointer dragging, optional keyboard
  stepping and stable one-element geometry; the Reader VerticalPaneResizeHandle
  now remains as an instrumentation-preserving compatibility wrapper.
- Migrated the shared Dialog compatibility API from Radix to React Aria while
  preserving controlled/uncontrolled state, composed triggers and closes,
  portal rendering, dismiss behavior, focus containment/return and scroll lock.
- Added Dialog interaction stories for Escape dismissal, explicit close and
  trigger focus return, and removed the direct Radix Dialog dependency.
- Audited the remaining ScrollArea dependency. Native overflow cannot preserve
  its hidden native viewport plus hover-only overlay thumb without changing
  scrollbar visibility, content width and cross-browser behavior, so Radix stays
  encapsulated behind the Talescape ScrollArea API as a documented exception.
- Migrated all Keyframe Inspector native details and action controls to shared
  Field, Input, Textarea, SearchField, Select, Checkbox and Button components.
- Migrated the recursive Frame hierarchy search, result rows, expansion controls
  and Frame/Element rows to shared SearchField and Button behavior while retaining
  recursive groups, compact geometry and selection callbacks.
- Added the required Studio identity attributes to the Frame hierarchy and branch
  surfaces while preserving their existing Reader instrumentation.
- Migrated the Frame Inspector summary, visibility toggles, group defaults,
  layout fields, nested child controls and add-element workflow to shared design
  system components. The add-element overlay now uses the accessible Dialog API.
- Retained the native draggable Keyframe row because its HTML drag event contract
  is behaviorally significant, and added stable Reader/Studio instrumentation.
- Migrated Element Placement position mode, parent Frame, overflow, anchor and
  unit controls to the shared compact Select API while preserving placement data.
- Migrated Element Motion default state, phase visibility and range controls to
  shared Field, Select, Checkbox and Slider components, and added stable Studio
  instrumentation to the settings surface.
- Migrated every remaining native control in the Scene Inspector folder: scene
  phases, sizing, placement flow, camera paths, transition presets, previous-scene
  animation behavior and directional snapping now use shared compact controls.
- Added Studio identity attributes to the Scene Motion, Camera Path and Scene Snap
  settings surfaces without introducing new DOM wrappers.
- Finished the visible general Inspector control migration across Style, image
  uploads, narrative mapping, Frame progression, snapping, hierarchy editing and
  Keyframe-length distribution. The browser-owned hidden file input and native
  draggable Keyframe row remain intentionally native.
- Added a narrow reusable Inspector Select adapter and expanded optional numeric
  fields so dense domain forms share one compact control contract.
- Migrated the branch graph toolbar, node actions, Scene travel controls, branch
  and path forms, narrative tabs, hierarchy rail and asset inventory interactions
  to shared Button, Tabs, Field, Input, Textarea, Select, Slider, Thumbnail and
  Checkbox components.
- Preserved native branch and Scene drag targets where React Aria event composition
  could alter React Flow or dnd-kit pointer/drag behavior, and added Studio
  instrumentation to graph, node, collection and timing surfaces.

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
- Use Conventional Commits for stable phases. Bump the patch version once for
  each user-requested continuation; do not edit the changelog without approval.
- Never run `npm run dev` (standing user instruction).

## Remaining migration / Radix

Composites and broader application migration remain. The only remaining direct
source import of Radix is the intentionally retained layout/scroll-area.tsx
implementation; feature code continues to consume the Talescape wrapper.

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
- Tag and status stories pass in the same 6-file, 58-test Chromium suite; the
  Storybook production build also passes after the Library display migration.
- A frozen offline pnpm install confirms package.json and pnpm-lock.yaml agree
  after removing the direct Radix Slot dependency.
- Element Content and animation-selection migrations pass targeted Biome checks,
  the 68-test unit suite, Storybook production build and 58 browser stories.
- Animation-track controls pass targeted Biome and baseline typecheck comparison,
  the 68-test unit suite and the Storybook production build.
- ResizeHandle passes targeted Biome and baseline typecheck comparison, the
  68-test unit suite, Storybook production build and 59 browser stories including
  keyboard step behavior.
- Dialog passes targeted Biome and baseline typecheck comparison, the 68-test
  unit suite, Storybook production build and 62 browser stories across 7 files.
- A frozen offline pnpm install confirms package.json and pnpm-lock.yaml agree
  after removing the direct Radix Dialog dependency.
- The Keyframe Inspector control migration passes targeted Biome and baseline
  typecheck comparison, the 68-test unit suite and Storybook production build.
- The Frame hierarchy control migration passes targeted Biome and baseline
  typecheck comparison plus the 68-test unit suite.
- The Frame Inspector migration and `1.11.1` version bump pass targeted Biome,
  baseline typecheck comparison, the 68-test unit suite, Storybook production
  build and a frozen offline install.
- The Element Placement and Motion migration and `1.11.2` version bump pass
  targeted Biome, baseline typecheck comparison, the 68-test unit suite,
  Storybook production build and a frozen offline install.
- The Scene Inspector control migration and `1.11.3` version bump pass targeted
  Biome, baseline typecheck comparison, the 68-test unit suite, Storybook
  production build and a frozen offline install.
- The remaining Inspector plus graph/domain collection migration and `1.11.4`
  version bump pass targeted Biome, baseline typecheck comparison, the 68-test
  unit suite, Storybook production build and a frozen offline install.
- Full `pnpm lint` reaches 605 files and reports only five existing findings: one
  autofocus finding in TaleStudioProvider and four non-null assertion findings
  in the Library tale-detail query.
- `pnpm test` passed: 18 files and 68 tests.
- Typecheck after Button migration reports only the same 12 scene-model diagnostics.
- No live application visual checks performed.
- Baseline trigger/layer errors are confirmed in this checkout.

## Exact next steps

1. Migrate the remaining Studio toolbar, settings, Preview and workspace chrome.
2. Audit remaining site/library/auth/Reader chrome and mobile surfaces.
3. Complete route-level visual, responsive and interaction verification, then
   perform the final dependency and Storybook coverage audit.

Commands needed: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`;
`pnpm build-storybook` after adding that script. Integration verification should
use an existing app server or production/static server, never npm run dev.
