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
