<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->

## Repository workflow

Use three-number Semantic Versioning: `major.minor.patch`.

Branch model:

- `main` is stable released code.
- `develop` is the integration branch for the next release.
- `feature/*` branches are for new functionality and should branch from `develop`.
- `fix/*` branches are for non-urgent bug fixes and should branch from `develop`.
- `release/*` branches are for version bumping, changelog preparation, and final release polishing from `develop`.
- `hotfix/*` branches are for urgent production fixes and should branch from `main`.

Commit naming:

- Use Conventional Commit format: `type(scope): description`.
- Preferred types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `build`, `ci`.
- Preferred scopes for this repo: `reader`, `editor`, `scroll`, `animation`, `store`, `db`, `schema`, `seed`, `library`, `ui`, `auth`, `release`, `docs`, `license`.

Working rules:

- Keep unrelated work in separate branches and separate commits.
- If unrelated work is requested while there are uncommitted changes, preserve the current work with a WIP commit before switching branches.
- WIP commits are allowed during active work. Before finishing a feature, fix, release, or hotfix, squash WIP commits into a clean final commit unless the user asks otherwise.
- Do not merge a feature, fix, release, or hotfix branch until the user explicitly asks.
- Ask the user before adding or updating `CHANGELOG.md` entries for completed features, fixes, or meaningful behavior changes.
- Upgrade the version only when it is appropriate for the release scope: patch for fixes, minor for backward-compatible features, major for breaking changes.
- Use feature flags for unfinished, risky, or partially rolled-out application behavior. Remove stale feature flags once the feature is fully enabled or abandoned.
