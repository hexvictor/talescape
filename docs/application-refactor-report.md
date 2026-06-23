# Application Architecture Refactor Report

This report records the repository-wide architecture audit performed alongside
the architecture map in `docs/application-architecture.md`.

## Domains Reviewed

- Main application: landing, authentication, codex, shared layout, and UI
  primitives.
- Library: browse routes, detail routes, metadata management, access-aware
  queries, counts, and mutations.
- Tale reader: formatted tale data, compilation, measurement, viewport,
  scrolling, overlays, navigation, contextual hub, debug, and progress.
- Tale editor: independent workspace store, preview, graph, inspectors, draft
  editing, and explicit persistence.
- Server: tRPC context and routers, Clerk middleware, database access,
  formatters, queries, mutations, schema support, and seeds.
- Tooling: Biome, TypeScript, Vitest, Fallow, package metadata, and architecture
  documentation.

## Changed Responsibilities by File

### Reader runtime

- `ReaderOverlayUi.tsx`: now only composes coherent runtime features.
- `ReaderOverlayRuntime.tsx`: owns progress, navigation, cue, debug, and UI
  visibility subscriptions at feature boundaries.
- `ReaderProgress.tsx`: remains a prop-driven display component.
- `ReaderViewport.tsx`: consumes derived hub/layout state without routing child
  UI state.
- `ReaderStage.tsx`: uses a visible local shallow selector for its render data.
- `ReaderLoading.tsx` and `ReaderMotionReadiness.tsx`: use direct local runtime
  selectors instead of hidden aggregate hooks.
- `ReaderNavigationModal.tsx`, `EntryNavigator.tsx`, `PageNavigator.tsx`,
  `ReaderHub.tsx`, and `ReaderHubSettings.tsx`: expose their actual flat store
  dependencies locally.
- `useReaderViewportController.ts`, `usePrepareReaderLayout.ts`, and
  `useViewportSize.ts`: no longer hide one-consumer selector contracts or store
  a derived layout label.
- `uiSlice.ts`: stores viewport dimensions and visibility preferences, while
  viewport category and visibility conditions are derived.
- `readerUiSelectors.ts`: defines shared domain derivations for reader
  navigation, progress, tools, hub visibility, and viewport layout.
- `scrollSlice.ts` and `taleSlice.ts`: public slice responsibilities now have
  explicit TSDoc contracts.

### Editor runtime

- `TaleEditorPreview.tsx`: owns preview rendering, width, preview viewport,
  resize refs, and resize interaction; visibility comes from `TaleAppStore`.
- `TaleEditorWorkspace.tsx`: delegates preview and graph behavior to their
  feature components instead of routing callbacks and preview DOM policy.
- `TaleBranchGraph.tsx`: is runtime-connected and reads graph state/actions from
  the editor store directly.
- `editorSlice.ts`: provides atomic branch, block, path, and clear-selection
  actions so mutually exclusive selections cannot drift.
- `AnimationSelectionEditor.tsx`: owns collection-level preset and append
  behavior only.
- `AnimationTrackFields.tsx`: owns one track's property, timing, easing,
  visibility, playback, and value controls.
- The creator and official editor route-local `types.ts` files were removed as
  unused aliases.

### Library

- `taleDetailViews.ts`: owns supported detail views and URL normalization.
- `createTaleNodeRows.tsx`: owns pure projection from authorized detail data to
  generic list rows.
- `TaleDetailContent.tsx`: now composes metadata, navigation, and overview
  panels without containing every row-building branch.
- `nodes/page.tsx`, `LibraryNodePanels.tsx`, `LibraryCards.tsx`, and the tale
  detail page use only current schema concepts.
- `sections/page.tsx` was removed because sections are not a current persisted
  domain entity.
- `counts.ts`, `lists.ts`, and `taleDetail.ts` no longer return zero counts,
  synthetic section records, or fake block/fragment section relationships.
- `userLibrary.ts` and `counts.ts` no longer export unused inferred aliases.
- The add-tale copy now names the actual created structure: branches, blocks,
  and fragments.
- Legacy author/book access modules were removed after Fallow proved they were
  unreachable from current routes and queries.

### Shared, server, and tooling

- `image.ts`: image creation is authenticated and ownership comes from the
  Clerk session; unused tutorial procedures were removed.
- `book.ts`: the private input schema is no longer exported and the router has
  a public responsibility contract.
- `middleware.ts`: private configuration is no longer exported and development
  request logging/stale example code was removed.
- Layout/auth barrels expose only symbols imported through those barrels.
- Badge, button, and scroll-area modules retain their components while removing
  unused implementation-detail exports.
- `icons.tsx` exports only aliases currently used by the application.
- `nanoid` and its unused wrapper were removed from source and package metadata.
- Unused upload-image, hook, intersection-observer, utility, legacy data, and
  tRPC server modules were removed.
- `.fallowrc.json` ignores the schema helper reached only from ignored schema
  files and suppresses intentional duplicate transport/runtime type names.
- `application-architecture.md` documents routes, providers, stores, client and
  server boundaries, runtime ownership, services, and derived-state flow.

## Selector Hooks

Removed:

- `useReaderRuntimeSelectors.ts`: one-consumer aggregate hooks concealed local
  dependencies.
- `useReaderNavigationSelectors.ts`: large selector wrappers were replaced by
  flat local selectors at their consumers.
- `useReaderHubLayout.ts`: a one-line, one-use property wrapper.

Retained:

- `useReaderDebugSelectors.ts`: combines reader diagnostics with the canonical
  document title without depending on editor state.
- `useReaderLocationContext.ts`: reused resolution of the current location into
  block, branch, entry, page, and part entities.

Replaced locally:

- Viewport, stage, loading, navigation, and hub consumers now use either one
  narrow selector or one flat shallow selector visible at the usage site.
- Editor inspection controls now select the independent editor store directly;
  `useTaleInspectorControls` and the editor bridge were removed.

## Shared Pure Selectors

- `selectShowsReaderNavigation`: visibility mode permits navigation UI.
- `selectShowsReaderProgress`: visibility mode permits progress UI.
- `selectShowsReaderTools`: visibility mode permits runtime tools.
- `selectIsReaderHubOpen`: the hub is open and allowed by visibility policy.
- `selectReaderViewportLayout`: viewport dimensions resolve to desktop, mobile
  portrait, or mobile landscape.

Raw property reads such as `state.reader.compiled` remain local and were not
wrapped in shared selectors.

## Runtime Wrappers

- `ReaderProgressRuntime`: mounts progress only when compiled data and progress
  visibility are available.
- `ReaderNavigationOverlay`: owns navigation visibility for the navigation
  modal, page navigator, and entry navigator group.
- `ReaderScrollCueRuntime`: owns cue visibility and value selection.
- `TaleDebugRuntime`: owns tool visibility for diagnostics.
- `ReaderUiVisibilityControlRuntime`: owns visibility-control mounting.
- `TaleEditorPreview`: owns the editor-specific preview reader boundary while
  shared application/activity state remains in `TaleAppStore`.
- `TaleBranchGraph`: owns its editor runtime connection rather than accepting a
  store-action prop surface.

## Intentionally Prop-Driven Components

- `ReaderProgress`: generic progress presentation; the runtime wrapper owns its
  store dependency.
- Library cards, breadcrumbs, node lists, detail panels, and reader previews:
  server components own authorized data and pass explicit presentation models.
- Inspector field primitives and animation track fields: explicit values and
  callbacks form a reusable controlled-field API.
- Route dialogs, UI primitives, and layout components: public composition and
  DOM-instance configuration remain external.

## Values Kept Derived

- Reader navigation, progress, and tools visibility from `visibilityMode`.
- Reader hub effective visibility from hub open state plus visibility policy.
- Desktop/mobile portrait/mobile landscape from viewport dimensions.
- Current entry/page collections and filtered navigation lists.
- Library detail rows, labels, badges, and links.
- Editor graph node/edge presentation from canonical tale and editor graph
  state.

No DOM refs, scroll roots, camera frame values, filtered collections, display
labels, or combined visibility flags were added to mutable Zustand state.

## Retained Prop Chains

- Route components pass server-loaded tale/progress data into runtime providers;
  this is a server/client and runtime-instance boundary.
- `ReaderViewport` passes refs to stage and measurement components; preview
  behavior is derived from `TaleAppStore`, while refs and DOM ownership remain
  in React.
- Library routes pass authorized query results to presentation components;
  binding those components to a client store would duplicate server state.
- Controlled inspector fields pass `value` and `onChange`; this is their public
  reusable contract rather than store-action routing.
- React Flow node data contains callbacks required by React Flow's node API;
  this is third-party render-instance configuration.

## TSDoc Audit

Public contracts improved in:

- `readerUiSelectors.ts`
- `ReaderOverlayRuntime.tsx`
- `TaleEditorPreview.tsx`
- `AnimationTrackFields.tsx`
- `createTaleNodeRows.tsx`
- `taleDetailViews.ts`
- `scrollSlice.ts`
- `taleSlice.ts`
- `image.ts`
- `book.ts`

Existing reader geometry, compiler, scroll-engine, editor inspector, formatter,
and draft-editing APIs already contain substantial TSDoc and were retained.
Framework route handlers and trivial internal constants were not given
boilerplate documentation.

## Fallow Results

Baseline:

- Health: 76.4, grade B.
- Unused files: 22.
- Unused exports: 37.
- Unused types: 27.
- Unused dependency: 1.

Final full health run:

- Health: 78.2, grade B.
- Maintainability average: 92.4.
- Unused files: 0.
- Unused exports: 8.
- Unused types: 22.
- Unused dependencies: 0.
- Circular dependencies, unresolved imports, boundary violations, and re-export
  cycles: 0.
- Duplicate groups with at least three occurrences: 0.
- Fallow dry-run fixes remaining: 0.

The eight remaining unused value exports are intentionally retained Radix UI
primitive surface (`DialogClose`, overlay/portal primitives, and select group,
label, scroll, and separator primitives). Remaining type findings are public
framework contracts or schema/transport type surfaces and were not deleted
mechanically.

Selector-shaped duplicate findings were not used as refactor instructions. No
selector hook or shared result type was created to satisfy duplication metrics.
The configured minimum occurrence threshold keeps pair-only local selector
similarity out of the actionable duplicate report.

## Remaining Risks

- `createReaderScrollEngine`, `TaleBranchGraph`, `EntryNavigator`,
  `AnimationTrackFields`, and `readerAnimations` remain large, high-effort
  modules. They should be split by stable behavior boundaries alongside focused
  tests, not by line count alone.
- `formatSize.ts` is the current churn/complexity hotspot and needs direct unit
  coverage before further layout-model changes.
- Reader compiler, geometry, animation, and input services have high static
  CRAP estimates because runtime coverage is not supplied to Fallow.
- The editor graph still transports callbacks through React Flow node data,
  which is valid for the library API but remains a concentrated integration
  boundary.
- The full Biome formatter reports pre-existing formatting drift in unrelated
  files. Lint passes; this refactor intentionally avoided committing generated
  migration snapshot and unrelated formatting churn.
