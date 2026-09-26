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
