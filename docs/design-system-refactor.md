# Talescape design-system audit and implementation plan

Status: pre-implementation audit, 2026-09-26.
Branch: `refactor/app-design-system`, based on `08a444b`.

## Scope and visual direction

Create a source-owned React/Tailwind design system with React Aria behavior
behind Talescape components and Storybook coverage. Preserve application logic,
reader animation/layout contracts, routing, persistence, and Button compatibility.
The six supplied images guide visual treatment, not new story data or routes.

Use near-black rails, cool-white surfaces, existing cyan/magenta/yellow accents,
crisp borders, selective angular geometry and hard shadows. Keep dense controls
rectangular. Preserve Geist and Bangers; do not add fonts merely to mimic a mockup.
Reference graph variations are alternatives, not a requirement to implement ten
new graph modes. Narrative pages remain mapped through keyframes.

## Current architecture

- Next 15.3.8 App Router, React 19, TypeScript, Tailwind 4, pnpm 10.6.5.
- `(site)` owns landing, Codex, library browsing/details/forms and auth routes.
- `(tale-app)/_shared` owns Reader and shared story UI; `(studio)/_shared`
  owns Inspector, toolbar and Studio workspace UI. Editor graph has its own scope.
- Global providers include Clerk, tRPC, root store and TaleInteractionMotion.
  Stories must use narrow fixtures/decorators, not boot the entire authenticated app.
- `src/components/ui`: Button, Input, Textarea, Select, Label, icons.
- Other shared folders: data-display (Badge, ProgressBar), layout (ComicPanel,
  ComicRail, Separator, ScrollArea), overlay (Dialog).
- Inspector imports DebugTabs, DebugCard, DebugField and Setting from Reader's
  debug feature. These reusable concepts need shared ownership and compatibility
  exports during migration.
- No React Aria dependency/import or Storybook setup/story files found.
- `components.json` is shadcn generator configuration, not a runtime framework.

## Theme and tokens

`src/styles/globals.css` contains Tailwind imports, `@theme` mappings, light/dark
tokens, geometry, decorations, Reader selectors and Inspector overrides together.
`tailwind.config.ts` contains the UploadThing wrapper; Tailwind 4 CSS is the main
theme entry point. Preserve UploadThing source scanning.

Established colors: ink `#080a09`, cyan `#079ee4`, magenta `#f51d76`, yellow
`#ffd31f`, teal `#188f8b`. Existing paper is warm `#fff8e8`, card `#fffdf5` and
cream `#fff0cd`; references instead call for cool neutral application surfaces.
Keep legacy brand values, introduce semantic surfaces, and migrate consumers
deliberately. Destructive currently aliases magenta; give errors a distinct red.
Dark theme has its own palette and must receive equivalent semantic mappings.

Proposed token families:

- `--ts-background`, surface/subtle/raised/dark, text/secondary/muted/inverse.
- Border/muted/strong/selected/focus/destructive/disabled; primary and foreground.
- Named brand colors and semantic Branch/Scene/Frame/Keyframe/Element/Trigger/
  Part/Entry/Page colors. Domain configuration also resolves icon and label.
- Spacing 2/4/8/12/16/24/32/48/64px; radii none/xs/sm/md/lg with restrained defaults.
- Shadows none/subtle/raised/comic; typography display/headings/body/label/caption/
  metadata/overline; motion duration/easing and reduced-motion behavior.
- Alias existing Tailwind token names to canonical tokens during migration.
  Keep RGB compatibility variables synchronized while their consumers remain.

## Complete direct Radix inventory

| Dependency | Importing files relative to src/components |
| --- | --- |
| @radix-ui/react-dialog | overlay/dialog.tsx |
| @radix-ui/react-label | ui/label.tsx |
| @radix-ui/react-scroll-area | layout/scroll-area.tsx |
| @radix-ui/react-select | ui/select.tsx |
| @radix-ui/react-slot | ui/button.tsx; data-display/badge.tsx |

Select also uses Radix sizing/origin CSS variables. Migrating behavior alone will
not preserve its geometry. Remove dependencies only after all consumers and
compatibility adapters have been checked. Native scrolling may be sufficient for
ScrollArea, but scrollbar layout and ref behavior must first be compared.

## Button compatibility inventory

TypeScript AST scan across 242 TSX files found 60 literal Button sites.
Counts below are explicit attributes, not runtime instance counts or defaults.

| API | Sites | Risk |
| --- | ---: | --- |
| variant | 51 | Medium: preserve all 11 variants and defaults |
| size | 37 | Medium: four sizes and icon selectors |
| asChild | 30 | High: every current child is Next Link |
| onClick | 24 | High: native event and preventDefault semantics |
| className | 15 | High: shaped buttons place it on outer frame |
| type | 12 | High: preserve explicit and implicit form behavior |
| shape | 7 | High: outer/inner polygon geometry |
| disabled | 3 | High: framed surface and link behavior |
| hoverShape | 1 | High: independent hover surface |
| motion | 1 | Medium: defaults cover additional call sites |
| comicDecorations | 1 | Medium: comic variant also adds defaults |
| onPointerDown | 1 | High: application motion/event composition |
| slant, slanted, innerSlantDecrease | 0 explicit | Still public contracts |
| surfaceClassName, hoverSurfaceClassName, style | 0 explicit | Still public contracts |

`buttonVariants` is internal, not exported. Button is currently not marked as a
client module. Introducing Aria hooks requires checking server/client boundaries.
No separate pasted Button source was present; audited repository implementation
`src/components/ui/button.tsx` is the compatibility baseline.

Retain all shapes, motion modes, pixel slants, decorative positions/colors and
aria-hidden layers. Keep native button behavior separate from link navigation.
Prototype a typed asChild adapter using Aria link/button behavior, merged refs,
class/style composition and explicit event ordering. Do not assign button role to
navigation links or fire actions twice by combining press/click handlers.
Test modified link clicks, Next navigation, cancellation, submit/reset and refs.

Extract a shared geometry definition for Button and ComicPanel, retaining panel
aliases such as corner-top-left and its extra opposite-corner shapes. Keep frame,
inner-surface and hover polygons distinct. Preserve legacy CSS-variable aliases.

## Duplication and accessibility findings

Source inventory: 121 native button sites, 66 inputs, 75 selects, 10 textareas,
59 labels and 537 divs. These are review candidates, not automatic replacements.
Native media, authored tale content and structural layout remain legitimate.

- Ten identical motion-toggle row class strings across frame/element settings.
- Repeated dense input styles across selection, settings and graph panels.
- Repeated close buttons across preview overlays, debug and Studio actions.
- Repeated panel headers, metadata and author/book form callouts.
- Fallow identifies shared resize/drag code in ReaderHub, ReaderContents and
  TaleDebug. Preserve each panel's sizing semantics when consolidating.
- DebugTabs uses ordinary buttons without full tab semantics/keyboard navigation.
- Setting labels are spans; field associations need explicit IDs/labels.
- Graph uses dnd-kit PointerSensor; native draggable sites also exist in structure,
  selection and frame panels. Verify keyboard alternatives at each migration.
- Graph selection/edge colors include local hex literals independent of tokens.
- Global interaction scale, Firefox opacity fallback selectors, Inspector child
  selectors and animation registry attributes create migration coupling.

## Proposed ownership and directories

Dependencies: tokens/geometry -> generic primitives -> composites -> domain UI ->
features. Generic components never read story stores or infer story semantics.

```text
src/styles/tokens.css                 canonical values
src/styles/theme.css                  light/dark and Tailwind compatibility
src/styles/geometry.css               shared geometry application
src/components/ui/geometry.ts         typed shape definitions
src/components/ui/*.tsx               source-owned primitives and composites
src/components/ui/*.stories.tsx       colocated production-component stories
src/app/(tale-app)/_shared/            shared story-domain presentation/config
src/app/(tale-app)/(studio)/_shared/   Studio Inspector and domain compositions
.storybook/                          framework, decorators, addons
docs/design-system/                  usage, exceptions, migration log
```

Keep existing component import paths as compatibility re-exports where moving
ownership is justified. Do not move feature logic into global UI directories.

## Components and migration targets

Immediately reuse/extend Button, Input, Textarea, Select, Label, Badge, Dialog,
ComicPanel and ComicRail. Introduce compact variants before replacing editor
controls; existing 44px comic fields cannot blindly replace dense rows.

Create missing stable concepts as actual consumers migrate:

- Controls: IconButton, SearchField, Checkbox, RadioGroup, Switch, Slider.
- Display: Card, Tag, Thumbnail, StatusBadge, EmptyState, Skeleton.
- Structure: Panel/Header/Content, SectionHeader, PropertyRow/Group,
  InspectorSection, Tabs, Breadcrumbs, Stats, NavigationItem, ResizablePanel.
- Overlays: Tooltip, Popover, Menu/ContextMenu, Sheet/Drawer and Toast.
- Collections: ListItem/SearchToolbar with search/filter/sort/selection/reorder
  composition. Do not build a universal story-aware collection component.
- Domain: centralized content-type configuration, Scene/Frame items and thumbnails,
  icon-based Keyframe/Trigger items, element thumbnails, BranchNode,
  NarrativeTree, InspectorHeader and context-preserving previews.

Thumbnail owns ratio, fit, loading/error/empty, selection and disabled states.
Domain adapters choose assets. Preserve contextual Scene > Frame > Element preview.
Inspector uses breadcrumbs and consistent Details/Hierarchy/Narrative organization
while retaining all current motion/style/actions controls through appropriate tabs
and sections. Graph engine, connection semantics and selection state remain owned
by graph code. Restyle node/edge presentation and accessible controls only.

## Storybook and verification

Use the Next.js Vite Storybook framework with production Tailwind CSS, existing
fonts and local fixtures. Confirm package peer requirements before installation.
Configure Controls, Actions, Docs, Accessibility and desktop/tablet/mobile viewport
tools; theme/density decorators consume production tokens.

Catalog: Foundations, Primitives, Composites, Tale Domain, Studio, Patterns.
Include palette/typography/spacing/radii/borders/shadows/geometry/motion/type colors.
Button gets every requested named variant/shape/motion/decoration/state story,
full API controls and variants/shapes/motions galleries, including asChild links.
Add interactions for keyboard tabs, dialogs/focus return, menus, disabled controls,
selection and reorder. Every created or changed reusable component gets stories
in that same phase. Responsive stories cover panels, navigation and Inspector.

Baseline and final gates: `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test`,
then `pnpm build-storybook` once added. Use targeted checks per phase and browser
screenshots/keyboard testing against Storybook and representative application
routes. Test Chromium and Firefox, narrow/mobile widths, dark mode, reduced motion,
focus, clipping and layout shifts. Do not run `npm run dev`; use an existing app
server or a production/static test server when runtime verification is possible.
An isolated story cannot prove authenticated Studio integration works.

## Implementation phases and checkpoints

1. Audit and plan (this document); record baseline checks and progress.
2. Establish Storybook plus legacy Button visual/behavior fixtures before changing
   primitives; add component-first/Storybook rules to AGENTS.md.
3. Add semantic tokens, theme compatibility and geometry with foundation stories.
4. Migrate Button behavior, preserve asChild API and compare baseline stories.
5. Migrate basic controls and display primitives; add compact editor density.
6. Consolidate panels, headers, properties, tabs, breadcrumbs and resizing.
7. Migrate overlays and menus with focus/portal/scroll-lock verification.
8. Consolidate accessible collections, thumbnails and content-type presentation.
9. Migrate Inspector, graph, narrative and contextual preview presentation.
10. Migrate remaining site/library/auth/Reader chrome and mobile surfaces.
11. Audit every route/shared component, remove unused Radix dependencies, check
    story coverage, run all gates and report remaining exceptions honestly.

Update CODEX_PROGRESS.md and migration log at every meaningful checkpoint. Commit
stable phases with repo Conventional Commits, e.g. `refactor(ui): add design tokens`.
Do not edit the changelog, merge branches or bump the version without release scope.

## Principal risks

Button ref/event/link composition; React server boundaries; overlay focus and
scroll-lock parity; native select event compatibility; graph drag interactions;
global token changes affecting user-authored tale content; font rendering in
Storybook; coupled Reader DOM selectors and animation measurements. Keep authored
content styling separate from application chrome. Preserve stable instrumentation
without adding wrappers solely for attributes. New primitives must not cause
double interaction scaling or reparent nodes required by the scroll engine.

## Sources checked for implementation direction

- https://react-aria.adobe.com/Button/useButton.html
- https://react-aria.adobe.com/Link/useLink
- https://react-aria.adobe.com/customization
- https://storybook.js.org/docs/get-started/frameworks/nextjs-vite

This audit maps the source tree and representative patterns; a route-by-route
visual audit and complete runtime baseline remain implementation work.
