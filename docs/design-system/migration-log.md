# Design-system migration log

## Storybook foundation and Button baseline

Page / feature: shared UI development environment.

Existing UI: production components had no isolated visual catalog or interaction
baseline. Button behavior and geometry were only visible through application pages.

Replaced with: Storybook using the Next.js Vite framework, production global CSS,
light/dark toolbar themes and desktop/tablet/mobile viewports.

New primitive: none. Existing Button remains unchanged as the compatibility baseline.

Story added: `src/components/ui/button.stories.tsx`, covering all variants, shapes,
motion modes, decorations, icon states, disabled/invalid/focus states, asChild link
composition and a click interaction.

Notes: React Aria is installed for subsequent primitive migration. The application
still uses Radix until each behavior is migrated and verified. Baseline TypeScript
errors from the scene-model branch remain outside this phase.

## Tokens, geometry and Button behavior

Page / feature: application-wide UI foundations and shared Button.

Existing UI: brand values, Tailwind aliases and component geometry lived together
in globals.css. Button used Radix Slot for composition and duplicated all polygon
definitions in Tailwind class strings.

Replaced with: semantic `--ts-*` tokens, Tailwind theme aliases, a shared geometry
vocabulary, React Aria Button behavior for actions and React Aria Link behavior for
the existing `asChild` Next Link contract.

New primitive: typed geometry shapes/slant resolution in `geometry.ts`, backed by
`geometry.css`. The existing Button now consumes this shared geometry.

Story added: Foundations stories for colors, content-type colors, typography,
spacing, radius, shadows, geometry and motion. Button link and click stories now
run as Chromium interaction tests.

Notes: Button's variants, sizes, shapes, motion modes, outer frame, inner surface,
hover surface, decorations, custom classes/styles and legacy props remain. It also
accepts React Aria `onPress`. Radix Slot is no longer used by Button; Badge still
uses it. Existing application token names remain compatibility aliases.

## Inspector, graph and domain collections

Page / feature: Tale Studio Inspector, branch graph, selection panel and left rail.

Existing UI: visible native inputs, selects, textareas and one-off buttons used
duplicated styling across scene, frame, keyframe, element, style, narrative,
branch and path editing surfaces.

Replaced with: compact Talescape Field, Input, Textarea, Select, Checkbox, Slider,
Tabs, Button and Thumbnail composition. Graph state, scene ordering, placement,
animation, upload and draft update callbacks are unchanged.

New primitive: none. A domain-scoped `InspectorSelect` adapter centralizes the
compound shared Select markup used by dense Inspector forms.

Story added: none; this checkpoint migrates consumers without adding a shared
primitive or variant. Existing primitive interaction stories and the Storybook
production build remain the component verification baseline.

Notes: the hidden image file input remains native because it invokes the browser
file picker. Native Keyframe, branch and Scene drag targets remain where replacing
their event surface could change HTML drag, React Flow or dnd-kit behavior. These
exceptions retain stable Reader and Studio instrumentation.

## Studio workspace chrome and settings

Page / feature: Tale Studio editor toolbar, Preview toolbar, workspace navigation,
settings dialog and Tale structure/configuration forms.

Existing UI: native buttons, selects, inputs, checkboxes and range controls were
styled independently across the editor and Preview headers and the settings modal.
The settings overlay also implemented dismissal and tabs locally.

Replaced with: shared Button, Dialog, Tabs, Field, Input, Textarea, Select,
Checkbox and Slider composition. Existing state updates, history actions, viewport
selection, workspace routing, modal sizing and scroll behavior remain unchanged.

New primitive: none. This checkpoint consolidates consumers on the existing
Talescape component APIs and removes the obsolete local settings-tab button.

Story added: none; no new reusable primitive or variant was introduced. Existing
component stories and the Storybook production build remain the verification
baseline.

Notes: the Tale background color input remains native to retain the browser color
picker. The draggable Scene row remains native to preserve its HTML drag event
contract. Both exceptions stay within instrumented Studio surfaces.

## Theme foundations and shared application chrome

Page / feature: global light/dark themes, site shell, authentication status and
compact Reader overlay controls.

Existing UI: the centralized palette used warm cream surfaces and teal legacy
aliases that no longer matched the supplied white, graphite, cyan, magenta and
yellow direction. Shared chrome still mixed native buttons, rounded glass panels,
hard-coded content widths and one-off spacing.

Replaced with: neutral paper and raised surfaces, cyan-led public semantics,
magenta-led scoped Studio semantics, sharper radii, tighter hard shadows and
central control-height/content-width/gutter/panel-spacing tokens. Header, footer,
navigation, app menu, auth status and Reader audio/autoplay/visibility/mobile
actions now compose shared Button behavior.

New primitive: none. Button, form-control and Panel sizing now consume the new
foundation tokens rather than repeating fixed dimensions.

Story added: a site/Reader versus Studio semantic-context comparison, plus an
expanded spacing scale that reads every spacing token directly.

Notes: authored Tale element styles are not recolored by this migration. The
Studio palette swap is scoped to the existing Studio workspace root, preserving
cyan public actions while retaining magenta editing-selection conventions.

## Final route, dependency and coverage audit

Page / feature: public routes, authentication shell, Library forms, Reader Hub,
Reader Navigator and the complete shared component catalog.

Existing UI: public and Reader surfaces retained isolated command links, fixed
route gutters and several native form controls. Storybook previews inherited the
full page-paper decoration and minimum viewport height. The package manifest also
contained an accidental self-referential `talescape: link:` dependency.

Replaced with: shared Button and form behavior, responsive semantic route tokens,
compact component-only Storybook previews, and the shared accessible Dialog stack
for Studio prompts and confirms. The package self-link and its obsolete lockfile
packages were removed.

New primitive: no new primitive. DialogContent now accepts `overlayClassName` so
high-priority workspaces can preserve their stacking contract without reimplementing
modal behavior.

Story added: layout stories cover ComicPanel shapes and decorations, ComicRail,
ScrollArea overflow and decorative Separators. Display stories now cover bounded
ProgressBar values. Dialog stories cover the high-priority overlay hook.

Notes: the retained Radix ScrollArea is encapsulated behind the Talescape wrapper;
it preserves overlay scrollbar geometry that native overflow cannot match. Native
file/color inputs, drag targets, resize handles and authored Reader controls remain
where platform or story DOM behavior is intentional. Production Home and Codex
pass desktop/mobile screenshot and overflow checks. Populated Library and Studio
verification remains blocked by pre-existing database/schema and scene-model type
drift, not by this design-system migration.

## Reference-led public discovery pages

Page / feature: Home, Library, Codex and the shared responsive site header.

Existing UI: the Home hero occupied most of the viewport, discovery cards were
too tall for the supplied editorial direction, Codex ended in two unrelated large
panels, and Library opened directly into a generic browse shell.

Replaced with: compact split-image heroes, angular horizontal story cards, dense
world/category shelves, a Codex faction-watch rail and recent-entry strip, and a
database-backed Library landing composition for featured tales, books, authors,
content types, model relationships and recent updates. The existing searchable
Tale explorer remains available on the same Library page.

New primitive: none. The routes compose ComicPanel, ComicRail, Button,
ProgressBar and semantic design tokens. The shared `navActive` surface now uses
the primary cyan token consistently with its public navigation meaning.

Story added: none; no reusable component or public variant was introduced. The
existing Button and layout stories cover the shared behavior changed here.

Notes: Home and Codex pass production screenshot checks at 1440x1000 and 390x844
without horizontal document overflow. The Library route compiles but its live
data render remains blocked by the configured database missing the current Scene,
Element and Tale schema changes; repairing that drift is the next phase.

## Scene-model integration and populated Library

Page / feature: Reader keyframe runtime, Tale element formatting and the Library
Frame count/browser.

Existing UI: two stale scene-model remnants kept typecheck red after the design
system migration. The Library also labeled an aggregate of branches, scenes and
elements as "Frames" and reused that aggregate view for `/library/frames`.

Replaced with: the supported keyframe media runtime without unreachable trigger
fields, the current element formatter without the removed layer field, and
access-aware Frame count/list queries backed by the Frame table. The Frame browser
now identifies root/group records and links each Frame to its Tale and Scene.

New primitive: none. Existing Library list and navigation components own the new
domain presentation.

Story added: none; no reusable design-system API changed in this checkpoint.

Notes: typecheck and the production build pass. The migrated development database
renders the populated Library at desktop and mobile sizes with 39 publicly
accessible Frames from 42 stored records. The production-configured database is
still at migration 7; migrations 8-17 require explicit authorization before they
are applied. Authenticated Studio verification also requires a signed-in browser
session; its signed-out boundary renders correctly.

## Public header and Studio workspace chrome

Page / feature: shared site header plus the Studio editor and Preview workspace
shells, navigation rail, graph surface, Inspector, command controls and settings
dialog.

Existing UI: the site header forced an ink background in both themes. Studio
controls used the shared primitives but still read as separate utility surfaces,
with inconsistent shadows, panel borders, active states and mobile hierarchy.

Replaced with: a theme-aware public header and a scoped Studio workspace language:
paper command bars, an ink tool rail, cyan structural accents, magenta editing
state, a restrained drafting grid, angular floating graph tools, framed Preview
and Inspector panes, and mobile rail/drawer layouts. Existing Buttons, Tabs,
Dialogs, Fields and Reader rendering remain in place.

New primitive: none. The checkpoint centralizes presentation through semantic
Studio shell classes and the existing Talescape component APIs.

Story added: a responsive Studio workspace composition covering the top command
bar, navigation rail, graph tools, Inspector tabs and compact form controls.

Notes: the light header and Studio composition were visually checked at 1440px
and 390px. Typecheck, 68 unit tests, 72 Storybook browser tests, Storybook build
and Next production build pass. A live authenticated Studio interaction pass
still requires a signed-in browser session.

## Reader workspace chrome

Page / feature: Reader Hub, story navigation, entry navigation, page navigation,
progress indicators, compact controls and Reader Debug.

Existing UI: Reader behavior was complete, but the Hub, Contents drawer, floating
entry controls, page browser and diagnostics panel used several unrelated rounded
and translucent treatments. Their hierarchy was harder to scan than the public
site and redesigned Studio.

Replaced with: a Reader-scoped angular chrome language using matching ink drawer
headers, paper content surfaces, cyan primary actions, magenta support shadows,
part-aware page accents and a drafting-grid diagnostics workspace. The Reader
overlay is now the visual theme boundary, so authored Scene, Frame and Element
styles remain untouched.

New primitive: none. Existing Button, Tabs and Reader motion surfaces retain
their APIs and DOM ownership; stable `data-reader-role` hooks own presentation.

Story added: a responsive Reader workspace composition covering the story drawer,
entry rail, page console, quick actions and debug affordance without requiring a
live Tale or application store.

Notes: camera insets, panel resizing, bottom-sheet dragging, hover previews,
pinning, page travel and visibility behavior are unchanged. Live Reader behavior
still needs final production-browser regression against a populated Tale.
