# Talescape design-system refactor progress

## Objective

Centralize Talescape tokens, geometry, source-owned React Aria primitives and
composites; preserve Button compatibility and story behavior; consolidate the
application UI against supplied references and document reusable components in
Storybook. Full scope/plan: `docs/design-system-refactor.md`.

## Current phase

The centralized application design system is complete. The active follow-up adds
typed decorative graphics, composable surface geometry, component-owned editors,
and scene-owned image layers with scroll/mouse parallax.
Branch: `feature/decorative-graphic-system`; starting commit `aefb0f7`.
Current package version: `1.12.7`.
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
- Migrated the remaining Studio editor and Preview toolbar actions, pane controls,
  workspace switcher, save/import/export/history actions, breakpoint selector and
  preview overlay controls to the shared Button and Select APIs.
- Replaced the custom Studio settings overlay and tab buttons with the accessible
  shared Dialog and Tabs APIs, retaining dismissal, focus, scrolling and sizing.
- Migrated Tale structure, graph, breakpoint and Tale settings fields to shared
  Field, Input, Textarea, Select, Checkbox and Slider controls, and removed the
  obsolete local settings-tab component.
- Added stable Reader and Studio identities to the migrated settings, structure,
  toolbar and Preview control surfaces. The browser color picker and draggable
  Scene row remain native because their platform event behavior is intentional.
- Retuned the centralized light and dark foundations to the supplied visual
  references: neutral paper/surfaces, graphite ink, cyan public actions, magenta
  secondary state, yellow highlights, sharper radii and tighter hard shadows.
- Added shared control-height, content-width, responsive gutter and panel-padding
  tokens and wired them into Button, form-control and Panel primitives.
- Added a scoped Studio semantic palette so editing state remains magenta-led
  while site and Reader actions remain cyan-led without feature-level raw colors.
- Migrated the shared site header, footer, primary navigation, app menu, auth
  status action and compact Reader overlay controls to shared Button behavior,
  centralized spacing and stable Reader instrumentation.
- Added a Storybook theme-context comparison and expanded the spacing foundation
  story to display the actual centralized spacing token scale.
- Migrated the remaining Library Tale, Author and Book form controls to shared
  Field, Select and Checkbox primitives while preserving server-form names and
  submitted values.
- Migrated Reader Hub settings and ordinary Reader Hub/Navigator commands to
  shared Button, Input, Slider and Checkbox behavior while retaining Motion-owned
  animated controls and Reader instrumentation.
- Added Storybook interaction coverage for Select and Checkbox form submission.
- Removed page-level `site-paper` decoration and viewport-height sizing from the
  global Storybook decorator so inline examples render as compact component
  previews; added a browser-story regression assertion for this contract.
- Audited public landing, Codex, Library, authentication and loading surfaces;
  migrated remaining command links and Library navigation to shared Buttons and
  centralized route widths and responsive gutters.
- Reworked the owning authentication shell around genuine tale artwork, removed
  its nested `main`, aligned Clerk controls with shared control-height tokens and
  added responsive mobile category/navigation bands to public routes.
- Removed the accidental `talescape: link:` self-dependency and the obsolete
  lockfile packages it retained; Radix ScrollArea is the only intentional direct
  Radix dependency left.
- Added direct Storybook coverage for ComicPanel shapes/decorations, ComicRail,
  ScrollArea, Separator and ProgressBar, including overflow and accessibility
  assertions. Decorative separators are now hidden from assistive technology.
- Migrated the remaining hand-rolled Studio prompt/confirm surface to the shared
  accessible Dialog, Field, Input and Button APIs, with an explicit high-priority
  overlay class hook and interaction story.
- Visually verified compact Storybook previews at desktop and mobile sizes, plus
  production Home and Codex routes at 1440px and 390px. All checked surfaces have
  exact viewport width, no horizontal document overflow and no page errors;
  mobile navigation and theme switching also pass.
- Rebuilt Home, Library and Codex around the supplied desktop/mobile direction:
  split illustrated heroes, denser angular discovery shelves, responsive mobile
  rails, Codex faction/recent-entry panels and a data-backed Library landing page.
- Retained the full Tale explorer below the new Library discovery composition,
  so the visual redesign does not remove search, filtering or editing entry points.
- Corrected shared active-navigation surfaces to use the primary cyan semantic
  token and completed the responsive public header lockup without duplicating it.
- Removed the orphaned trigger runtime and obsolete element-layer formatter that
  referenced model fields absent from the current schema, restoring a clean
  project typecheck without changing the supported keyframe media runtime.
- Replaced the Library's former aggregate "Frames" count/browser with real Frame
  records and access-aware Frame queries, including Tale and Scene navigation.
- Verified the populated Library against the fully migrated development database
  at desktop and mobile widths; the public total is 39 accessible Frames from 42
  stored records, and the dedicated Frame browser renders the same visible set.
- Corrected the public header to use the light paper surface, automatic wordmark
  treatment and semantic controls in light mode while retaining its dark surface
  in dark mode.
- Reworked the Studio shell around a unified top command bar, ink tool rail,
  angular structural drawer, drafting-grid graph, framed Preview pane and
  responsive Inspector drawer without changing workspace state or Tale behavior.
- Centralized Studio-specific tabs, forms, panel shadows, dialog headings and
  mobile drawer behavior under the existing scoped Studio theme.
- Added a responsive Studio workspace composition to Storybook so the chrome can
  be reviewed without authentication or a live Tale session.
- Reframed Reader-owned chrome as one visual system: matched story and Hub
  drawers, an angular entry rail, a compact page console and browser, semantic
  progress indicators, mobile actions and a distinct diagnostics workspace.
- Kept authored Tale content outside the Reader UI theme boundary and preserved
  all existing panel sizing, camera inset, drag, resize, hover, pin and travel
  behavior.
- Added an isolated responsive Reader workspace composition to Storybook so the
  surrounding navigation can be reviewed independently from Tale rendering.
- Added typed Halftone, SpeedLines and AccentStreak SVG primitives with shared
  positioning, token colors, viewport targeting and decorative accessibility.
- Refined the decoration vocabulary against the final visual references: staged
  corner-dot falloff, irregular tapered grey line fields, and rough layered
  cyan/magenta/yellow paint strokes with satellite marks and splatter. Removed
  the broader scratch, circular, geometric and paper motifs from the public API.
- Reduced the decoration system to restrained comic accents: a single clean
  variable-size halftone field, sparse edge speed lines and compact broken paint
  swipes. Page presets now place these at corners and edges instead of covering
  the interface with centered full-field compositions.
- Made decoration sizing relative to its host and added direct child composition
  through `Decorations`. Halftone position now controls growth direction, with
  seven shapes and six density levels; speed lines and accent streaks expose
  independent geometry, quantity, length, thickness and density controls.
- Made halftone geometry respond to its rendered parent bounds without scaling
  its coordinate units, so different parent ratios add rows or columns while dot
  radii and spacing remain circular and uniform.
- Added a discriminated `Decoration` union, `Decorations` composer and reusable
  preset catalog. Custom items append after preset items and paint above them.
- Added independently composed desktop/mobile page presets for Discover,
  Library, Codex, detail, form, auth and Reader surfaces.
- Added opt-in decoration hosts for PageShell, Panel, Card, ComicPanel,
  DecoratedMedia and Thumbnail without changing the existing Button or singular
  ComicPanel decoration APIs.
- Replaced the public shell's direct background image stack with the centralized
  page composition and applied route-specific presets to Discover, Library,
  Codex, tale detail, Library forms and authentication surfaces.
- Added the canonical Storybook Decorations section with primitive examples,
  interactive composer controls, preset/media/panel/button galleries and typed
  usage documentation. Expanded Button controls with the exact supported object
  shape, values and multi-decoration examples.
- Added preset-order regression tests and visually checked desktop/mobile static
  Storybook output for clipping, overlay layering and compact story canvases.

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
- Decorative custom items append to preset items. Page presets compose desktop
  and mobile entries independently; editor surfaces remain undecorated by
  default, and media decorations use an explicit overlay layer.
- Never run `npm run dev` (standing user instruction).

## Remaining exceptions

The only remaining direct source import of Radix is the intentionally retained
`layout/scroll-area.tsx` implementation; feature code consumes the Talescape
wrapper. Native file/color inputs, HTML drag targets, resize handles, authored
Reader choice controls and low-level Button compatibility output remain native
because their platform event, styling or DOM contracts are behaviorally relevant.

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
- The Studio toolbar, settings, Preview and workspace chrome migration and
  `1.11.5` version bump pass targeted Biome, baseline typecheck comparison, the
  68-test unit suite, 62-test Storybook browser suite, Storybook production build
  and a frozen offline install.
- The theme/token and shared application-chrome migration and `1.11.6` version
  bump pass targeted Biome, baseline typecheck comparison, the 68-test unit suite,
  63-test Storybook browser suite, Storybook production build and a frozen offline
  install.
- The Library form and deeper Reader Hub/Navigator migration and `1.11.7` version
  bump pass targeted Biome, baseline typecheck comparison, the 68-test unit suite,
  64-test Storybook browser suite and Storybook production build.
- The public route, authentication, mobile and Storybook preview migration and
  `1.11.8` version bump pass targeted Biome, baseline typecheck comparison, the
  68-test unit suite, 64-test Storybook browser suite and Storybook production
  build.
- The final dependency, route and Storybook coverage audit and `1.11.9` version
  bump pass the production Next build, 68-test unit suite, 71-test Storybook
  browser suite, Storybook production build and frozen offline lockfile check.
- Static Storybook screenshot checks confirm compact content-sized examples at
  1440x900 and 390x844, with no global decorative background or horizontal
  overflow. Production Home and Codex checks pass at the same widths.
- The development database is current through migration 17 and contains one Tale,
  15 Scenes, 42 Frames, 146 Elements and 49 Keyframes. The populated Library and
  dedicated Frame browser render successfully from that model.
- Full `pnpm lint` reaches 605 files and reports only four existing non-null
  assertion findings in the Library tale-detail query. The prior Studio autofocus
  finding was removed with the shared Dialog migration.
- `pnpm test` passed: 18 files and 68 tests.
- `pnpm typecheck` passes after removing the two stale scene-model remnants.
- Live production visual checks were performed for Home, Codex and the populated
  Library. The Studio route renders its signed-out boundary correctly, but its
  authenticated workspace cannot be exercised without a signed-in browser session.
- The `1.11.10` public-page redesign passes targeted Biome, the 68-test unit
  suite, all 71 Storybook browser tests and the production Next build. Home and
  Codex were rechecked at 1440x1000 and 390x844 with no document overflow.
- The production-configured database remains at migration 7 with the old
  Block/Node/Fragment tables. Applying migrations 8-17 is intentionally pending
  explicit authorization because it mutates production-configured data.
- The `1.11.12` header and Studio-shell checkpoint passes typecheck, the 68-test
  unit suite, all 72 Storybook browser tests, the Storybook production build and
  the Next production build. Light-mode header screenshots pass at 1440px and
  390px; the isolated Studio composition passes at both widths.
- The `1.11.13` Reader workspace checkpoint passes typecheck, the 68-test unit
  suite, all 73 Storybook browser tests, the Storybook production build and the
  Next production build. The isolated Reader composition passes desktop and
  mobile screenshot review without document overflow.
- The final `1.12.0` release gate passes lint across 606 files, typecheck, the
  68-test unit suite, all 73 Storybook browser tests, the Storybook production
  build, a clean Next production build and HTTP smoke checks for Home, Codex,
  Library and Reader routes.
- The clean production build removed the stale generated Clerk-chunk failure.
  Production-configured data still uses the pre-migration schema, so populated
  Reader and Library data checks remain intentionally separate from this merge.
- The `1.12.4` decoration correction passes full lint, typecheck, all 71 unit
  tests, all 86 Storybook browser tests, the Storybook production build and the
  Next production build. The three retained SVG primitives were checked in
  rendered Storybook canvases at full-field and compact gallery sizes.
- The `1.12.5` responsive-halftone correction passes typecheck, all 71 unit
  tests, all 87 Storybook browser tests and the Storybook production build.
  Wide, square and tall rendered canvases confirm invariant circular dots and
  uniform spacing while the generated field expands with its parent.
- Added intrinsic decoration canvases, expanded masked/radial/fan/laser speed
  compositions, paint/splash/fracture accent variants, and a side-by-side
  Storybook workbench with controls scoped to the selected decoration type.
- The `1.12.6` decoration workbench and geometry expansion passes full lint,
  typecheck, all 71 unit tests, all 92 Storybook browser tests, the Storybook
  production build and the Next production build. Rendered galleries verify
  stable halftone ratios and correct corner, center and radial speed origins.
- The `1.12.7` anchor and expressive-controls checkpoint removes the decoration
  size cap, centers primitives exactly on parent anchors, adds percentage/pixel
  offsets, halftone size/opacity decay, feathered vignette masks, tapered line
  endpoints and broad textured brush/lightning accents. Storybook interaction
  screenshots verify oversized clipping, center-right halftones, radial fading
  and fuller opt-in panel compositions. Full lint, typecheck, all 71 unit tests,
  all 92 Storybook browser tests, the Storybook production build and the Next
  production build pass.

### Decoration Composition Checkpoint

- Added independent halftone growth origins, including one-axis rectangular
  decay from each edge. Density now scales explicit spacing and quantity.
- Numeric inputs complement wider sliders. Radial/fan/laser lines honor angle,
  direction, seed, jitter, spread and extended length. Optional seeded modulation
  changes width and opacity along each ray; electric rays have branching bolts.
- Rebuilt accents as pressure-shaped brush strokes, paint splashes, fragmented
  lightning and connected branching fractures. Every style supports length and
  stretch; added ink, comet and radial-fracture variations.
- Added the Storybook Composition Editor with independent button, panel, image
  and page layers, target highlighting, visibility/reordering, preset insertion,
  button styling and JSX/JSON clipboard export. Defaults are not overwritten.
- Canonical integration is now a nested Decorations child on any parent. The
  wrapper owns framing and layering; application pages and examples use it.
  Older host props remain deprecated compatibility adapters. Fixed Button's SVG
  icon selector so decorations retain their intended dimensions.
- Verification: full lint (620 files), typecheck, 91 unit tests, 93 Storybook
  browser tests and production Storybook/Next builds pass. Desktop (1400px) and
  mobile (390px) visual checks found no document overflow or browser exceptions;
  inspected brush/bolt/crack geometry, directional halftone, radial modulation,
  target highlighting and button framing. Static preview runs on port 6008.

### Surface Decoration Checkpoint

- Added BackgroundTexture with seeded paper fibers, fine grain, irregular grunge,
  scratches, scuffs and vertical wear. Pixel-sized tiles wrap edge marks so the
  texture fills any parent without aspect distortion or clipped tile seams.
- Added GeometricShape with ten angular shapes/patterns and CircularLinework
  with open arcs, broken rings, concentric circles and partial sweeps. They share
  the existing Decorations anchoring, clipping, color and viewport contracts.
- Added six mixed/surface presets, dedicated editors, galleries, reference-style
  panel compositions and decorated button states. All families can be added to
  button, panel, image or page layers and exported as JSX/JSON without changing
  application defaults.
- Fixed editable numeric fields so clearing/replacing a value works. Separated
  texture positioning from anchored SVG positioning after production screenshots
  exposed a CSS compilation issue that displaced textures by half their size.
- Verification: full lint (622 files), typecheck, 101 unit tests, 101 Storybook
  browser tests, focused decoration rechecks and production Storybook/Next builds
  pass. Inspected 1400px/390px screenshots of textures, geometry, rings, panels
  and the composer; verified full texture alignment, no document overflow or
  browser exceptions, and JSX export of all new families. Static preview: 6008.

### Color And Slider Checkpoint

- Added a Talescape-owned ColorPicker backed by the already-installed React Aria
  color primitives. Supports arbitrary CSS colors, hue/saturation/brightness,
  alpha, semantic swatches, manual entry, inherited values and validation. Its
  wrapper, popover, area and palette are customizable; default styling uses
  semantic tokens, sharp frames and restrained ink shadows.
- Decoration editors now accept custom colors rather than only token menus.
  Studio text/background/border editing and light/dark tale backgrounds use the
  same picker. Background gradients remain editable; border changes preserve
  authored width/style, and background edits clear conflicting legacy values.
  Freeform shadow/custom-CSS expressions remain text-based advanced controls.
- Reworked shared Slider and native Input ranges with slim tracks, small angular
  handles, visible focus/disabled states and comfortable interaction hit areas.
  Existing Studio and Reader slider consumers inherit the shared styling.
- Added picker state/styling stories, horizontal/vertical/native slider examples,
  Studio style-color interactions and arbitrary decoration-color regression.
- Verification: lint (627 files), typecheck, 101 unit tests, 112 Storybook browser
  tests and production Storybook/Next builds pass. Static 1400px/390px checks
  verified custom alpha colors, slider pointer values, mobile popover bounds and
  no document overflow/browser exceptions. Authenticated Studio session behavior
  was not exercised; Studio color bindings were tested through shared stories.

### Forms, Media And Geometry Checkpoint

- Rounded the shared Switch rail/thumb, with conventional pointer/keyboard
  behavior, compact density, disabled states and Talescape ink borders.
- Added individual Forms entries for Slider, Toggle, Radio Buttons, Select,
  Combobox, Calendar, Checkbox and Text Input; kept the combined Overview and
  moved Color Picker into the same Forms group. New combobox/calendar APIs wrap
  the installed React Aria primitives.
- Added generic FileUpload and searchable/filterable AssetLibrary components,
  with image/video/audio previews and empty/loading/error/disabled states. The
  Studio image field uses the same upload UI and library, with the existing
  authenticated UploadThing route and image queries. Local-preview stories do
  not persist files. The live upload story uses the real endpoint; Storybook's
  API proxy defaults to localhost:3000 and accepts
  TALESCAPE_STORYBOOK_APP_ORIGIN. Authenticated persistence was not exercised.
- Removed comicDecorations from Button. Decorations now compose as children
  inside the actual action. ButtonPart provides left/right slanted icon segments
  within one accessible action; link/onClick/onPress compatibility is preserved.
- Shared shape geometry now supports stepped lower edges and a central notch,
  with adjustable step position/depth. Panels and DecoratedMedia retain shaped
  shadows; buttons retain lift behavior. The homepage featured-tale action fits
  beneath the stepped image with breathing room on mobile and desktop.
- Migrated remaining old hero/halftone classes and panel decoration callers to
  Decorations children. Site page backgrounds use a fixed viewport frame with
  subtle paper texture, lower-left dots and large diagonal upper-right strokes.
  Corrected ComicPanel background/decorations stacking and polygon clipping.
- Direct parent elements with a `<Decorations />` child now receive the same
  host positioning, isolation and content layering as explicit
  `ts-decoration-host` surfaces, so ordinary composition does not require a
  host class.
- Expanded the composition editor with card targets, surface colors, shared
  geometry, button variants/motion/icons/segments, image URL/ratio/fit and page
  padding, including JSX/JSON exports. Caller DOM instrumentation is preserved.
- Replaced modal animation utilities with coordinated, fill-preserving exit
  animations. A browser regression samples opacity across exit and checks focus
  restoration; frame-by-frame production checks show no rebound/flash.
- Verification: lint, typecheck and 101 unit tests pass; 167 full-suite Storybook
  tests plus five focused upload-state tests pass. Production Storybook and Next
  builds pass (one transient Next prerender bundle failure cleared after moving
  generated webpack cache aside). Static component screenshots, media playback,
  and actual production /, /library and /codex were checked at 1400px/390px:
  no horizontal overflow, viewport-sized background frames and correctly fitted
  featured action. Authenticated Studio/upload flows remain unverified.

## Story Composition And Combined Media Clipping Checkpoint

- Added a global Storybook Composition Editor toolbar mode for every story,
  with selectable rendered targets, component args, surface colors and geometry,
  independent decoration layers, presets, visibility/order/duplication controls,
  reset and JSX/JSON export. Buttons, panels, layout surfaces and shaped images
  also have direct Composition Editor entries. Native leaf controls use their
  preview surface as the decoration frame.
- Added combined left-slant/lower-step shapes to shared geometry, with an
  independent edge slant. DecoratedMedia clips image and decoration children
  together while preserving its shadow. The existing sample-page composer
  exposes independent edge-slant editing and exports the same geometry.
- Moved HomeContent's image-only desktop polygon to the DecoratedMedia frame:
  a responsive left slant plus bottom-right step. Its top-right brush points
  inward. Desktop and mobile production screenshots confirm shared clipping,
  space around the featured action and no horizontal overflow.
- Verification: lint, typecheck, Storybook production build and Next production
  build pass. All 175 Storybook tests pass, including target persistence/reset,
  layer insertion and combined media clipping. Static Storybook screenshots at
  1400px/390px show no horizontal overflow or browser errors. Added react-dom
  prebundling to prevent the browser test runner reloading during portal setup.

## Composable Shapes, Editors And Scene Layers Checkpoint

- Supersedes the earlier global DOM-based composition editor and DecoratedMedia
  checkpoints. Component editors now edit React configuration directly, with
  separate Component, Decorations and Shapes tabs. The independent composition
  canvas supports insertion, removal, ordering, nesting and per-element editing.
  Settings scroll independently while previews remain visible on desktop/mobile.
- Added shared composable shape treatments for corners, horizontal/vertical
  corner slots, center notches/steps and full sides. Outward-step baselines and
  side overrides share one geometry implementation across shaped surfaces.
  The same outline drives clipping, borders and shaped shadows.
- Button hover/focus shapes morph from the current outline, including the legacy
  named hoverShape API. Interrupted transitions reverse smoothly. Resizes and
  reduced-motion preferences bypass morphing; disconnected outlines snap safely.
- Replaced DecoratedMedia with TaleImage, preserving Next Image props while
  clipping image and decorations together. Production decoration usage now uses
  component-appropriate presets; explicit Decorations children remain supported.
- Scene Inspector now has an Elements tab for direct scene-owned image, text and
  audio creation. Ownership edits synchronize frame child lists. Scene image
  defaults cover the scene behind frames without inflating camera measurements.
- Positioned images have source, depth, scroll-basis, mouse-travel and overscan
  controls in Motion. Reader camera/timeline variables and normalized pointer
  movement drive a separate parallax layer without replacing animation transforms.
  Overscan bounds movement; Edit Mode and reduced motion disable the effect.
  Existing placement JSON persists these settings without a database migration.
- Verification: 119 unit tests and 216 Storybook browser tests pass. Typecheck,
  focused Biome checks, diff whitespace checks, static Storybook build and Next
  production build pass. Desktop/mobile browser checks cover sidebar containment,
  shape morphing/reversal/focus, actual parallax image rendering, scroll/mouse
  movement, overscan and reduced motion. Production /, /library and /codex
  screenshots at 1400px/390px confirm no horizontal overflow and shared media
  clipping. Authenticated Studio creation/save/reload
  and the complete reader camera/parallax workflow remain live-validation gaps.

## Page Surfaces, Library And Shared Configuration Checkpoint

- PageShell now supplies viewport-height layout; fullscreen feedback surfaces
  escape transformed Reader ancestors. Missing, forbidden, unauthorized and
  library error pages use shared shells and shaped panels.
- Standardized application shape usage on `shapes`, accepting preset names or
  treatment arrays. Legacy `shape` remains compatible. ComicPanel now uses the
  shared outline renderer, including cut-opposite corners, borders and shadows.
  Panel padding belongs to the clipped surface, not the outline wrapper.
- Button, Panel, Card, TaleImage, Thumbnail and PageShell accept component-scoped
  decoration presets or item arrays. Buttons also accept hover/pressed shape and
  decoration configurations. Geometry morphs; supported decoration dimensions,
  color and opacity transition with reduced-motion handling. Different path
  topologies can still snap rather than morph. Storybook can insert preset layers.
- Reworked library navigation, searchable tale browsing, real book/author media
  and a focused creation form with optional inline book/author creation. New tales
  initialize one branch, one solid-background scene, one frame and title/intro
  text, retaining internal compatibility scaffolding without exposing it in forms.
- Added authorized scene/frame/element visual snapshots, reader scene links and
  permission-gated Studio inspection links. Removed official-private access
  bypasses and restricted grant checks to the current user; added permission tests.
- Added stable component/role instrumentation to shared interaction surfaces
  while preserving caller identity overrides. Consolidated InspectorSelect and
  separated Studio store context to remove dependency cycles.
- Fallow: removed four traced-unused files; zero unused files, dependencies,
  unresolved imports or dependency cycles remain. Retained 50 export, 60 type and
  seven duplicate-export candidates pending ownership review. Duplication is
  2.84 percent; complex Reader/navigation code remains a separate audit concern.
- Verification: 123 unit tests and 225 Storybook browser tests pass. Next
  production build, typecheck, focused Biome and diff whitespace checks pass.
  Production pages using the development database were checked at 1440px/390px:
  homepage, codex, library, books, scenes, frames, elements and missing pages have
  no horizontal overflow or browser errors; scene dialogs render actual content.
  Fullscreen feedback and shared homepage image/action clipping were inspected.
- Live authenticated create/save/reload and Studio inspection remain unverified.
  The production database lacks scene/element tables; no production migration or
  reset was performed. Production schema rollout is a separate release operation.

## PageShell Remaining-Space Sizing Correction

- PageShell grows within its parent's flex layout instead of imposing a viewport
  minimum on every nested page. Only the outer site layout owns `min-h-dvh`, so
  header, page content and footer share the viewport and long content still grows.
- SiteLayout's main surface is a column flex container. Explicit fullscreen
  feedback retains its fixed inset sizing without a redundant viewport minimum.
- Added a Storybook regression case checking the space remaining between header
  and footer, with no unnecessary container overflow.
- Verification: all four PageShell stories, typecheck, focused Biome and diff
  whitespace checks pass. A broader Storybook run was interrupted by a browser
  connection closing; it is not counted as a successful full-suite verification.

## Scene Parallax And Inspector Style Targets Correction

- Removed the Edit Mode parallax suppression from scene pointer tracking and
  absolute element rendering. Fixed scene elements now share the parallax layer
  too. Ambient/keyframe animation targets remain separate from this transform.
- Unscaled graphics can translate; overscan greater than one still bounds scaled
  background motion. Reduced-motion CSS continues to disable the effect.
- Image figures and captions no longer impose unauthored background, borders,
  rounding or shadows, including the Firefox alpha-background fallback.
- Style controls now select Element box/Image and Scene content/Scene outer box
  separately. Every group names its target; layout is collapsed by default and
  image fitting is shown only for the image target. Positioned element offsets
  remain in Placement instead of competing with wrapper CSS position controls.
- Verification: 124 unit tests, three focused Storybook browser regressions,
  typecheck and focused Biome/diff checks pass. The absolute-image regression
  renders the actual positioned/image chain, verifies a transparent figure,
  scroll movement and pointer movement with scale one. Authenticated Studio
  save/reload and the full compiled tale scroll workflow remain unverified.

## Explicit Size Limits And Frame-Owned Absolute Placement

- Explicit scene sizing now exposes minimum/maximum width and height alongside
  authored dimensions. Constraints survive sizing-mode changes and draft/database
  formatting; measurement applies them to both scene sizes and measurement DOM.
  Minimum bounds win contradictory maximum bounds, matching CSS sizing behavior.
- Absolute elements owned by a valid frame now render inside that frame rather
  than the scene-wide layer. Parent proportions resolve against the frame, while
  scene-owned viewport positioning and fixed-scene placement remain unchanged.
  Frame roots retain a positioning context and shared positioned rendering keeps
  parallax and animation identities intact.
- Verification: 127 unit tests, four focused Storybook browser regressions and
  typecheck pass. A rendered 320x240 frame positions its 25-percent child at
  80x60 pixels and clamps child width to 160 pixels without duplicate rendering.
  Authenticated Studio save/reload remains a live-validation gap.

## Exact next steps

1. Verify authenticated Studio scene-element creation, ownership changes and
   save/reload when a signed-in browser session is available.
2. Review component decoration presets and validate parallax in complete tales.
   Branch integration remains a separate user-approved operation.
3. Treat production database migration as a separate release operation, not as
   part of this development refactor.

Use a production/static server for integration verification, never npm run dev.
