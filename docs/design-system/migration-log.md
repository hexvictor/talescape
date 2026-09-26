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
