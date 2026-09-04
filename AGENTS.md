# TORG Stuudium project agent guide

## Start here

Before changing files:

1. Inspect `git status --short --branch --untracked-files=all` and preserve all unrelated or pre-existing work.
2. Read `docs/PROJECT_DIRECTION.md`. Its agreed decisions and phase boundaries are constraints.
3. Inspect the canonical source, generated outputs, tests, and documentation relevant to the requested change.
4. Ask the user about genuinely unresolved decisions that would be difficult to reverse. Do not ask about safe internal implementation details.

Do not commit, publish, submit to a store, change live Stuudium data, or begin a later project phase unless the user explicitly requests it.

## Current project state and phase boundary

Phase 1 is implemented as a WXT 0.21 Chromium Manifest V3 extension written in TypeScript and built with npm. It delivers the existing graphite-and-mint theme, adds an early critical dark surface, uses a small idempotent content bootstrap, and stores only an `enhancementEnabled` preference.

Phase 2 theme switching is not implemented. Phase 3 release hardening and store publication have not started. Bug fixes and maintenance must preserve those boundaries.

The project enhances the genuine Stuudium interface. It must never become a proxy for Stuudium authentication or student data, a replacement client, a source of remote executable code, or an unrestricted page-to-extension/native bridge. Do not add analytics or telemetry by default.

## Sources of truth and generated files

- `src/theme/modules/*.css` is the canonical full-theme source. Edit the owning module here.
- `src/theme/userstyle-header.txt` is the canonical compatibility-userstyle metadata.
- `Stuudium-Intentional-Dark.user.css` is a generated, supported Stylus compatibility output. Never edit it directly.
- `src/generated/theme.css` is the generated, activation-gated extension stylesheet. Never edit it directly; it is intentionally ignored by Git.
- `src/theme/critical.css` is the small early dark surface. Keep it minimal and never use it to replace Stuudium's structural CSS.

Run `npm run build:theme` after changing canonical theme modules. Run `npm run check:theme` to prove both generated CSS outputs are current and deterministic.

## Architecture map

- `src/shared/`: platform-neutral settings, route recognition, supported-site registry, and lifecycle contracts. Do not import browser APIs here.
- `src/features/`: reusable DOM-facing feature logic with explicit activation and cleanup boundaries.
- `src/platforms/webextension/`: small adapters around extension storage and runtime APIs.
- `src/entrypoints/`: WXT background, early activation marker, content bootstrap, and options-page entrypoints.
- `src/shared/sites.ts`: single registry for verified Stuudium origins. Add an origin here only after it is explicitly verified and approved; keep manifest access narrow.
- `wxt.config.ts`: extension manifest/build configuration.
- `scripts/`: deterministic theme, packaging, and validation tooling.
- `tests/`: unit and build-regression tests.

Keep shared feature logic independent of Chrome, Android, and iOS APIs. Browser API access belongs behind a small adapter so future native WebViews can reuse the core.

## Required skills and documentation lookup

- For HTML, CSS, or client-side JavaScript work, use `.agents/skills/modern-web-guidance/SKILL.md` first as its instructions require.
- For theme CSS, rendered appearance, DOM/cascade debugging, or visual-equivalence claims, use `.agents/skills/maintain-stuudium-theme/SKILL.md`.
- For extension manifests, content scripts, browser APIs, permissions, or Chrome Web Store work, use `.agents/skills/chrome-extensions/SKILL.md` and its routed reference.
- Follow the repository's Context7 instructions for current library, framework, API, SDK, and CLI documentation. Use first-party sources for browser/store rules and other requirements that may change.

## Theme and cascade workflow

Preserve the existing visual design unless the user explicitly approves a redesign. Reuse matching `--sid-*` tokens and place changes in the owning module, ordered as base, variants, interactions, and responsive behavior.

The generated extension CSS gates selectors with zero-specificity `:where(html[data-sid-enhancement="enabled"])`. Static extension CSS can lose an equal-specificity, equal-importance tie to Stuudium CSS loaded later, even when the same canonical rule wins through Stylus. Therefore:

1. Inspect the live element, real DOM contract, matched competition, and computed winner before editing.
2. Compare extension delivery with the generated Stylus output at the same route and viewport when migration equivalence is relevant.
3. Fix the narrow component owner with a stable semantic class, attribute, or route anchor. Do not raise specificity for the entire generated theme.
4. Keep `:where(...)` where its zero specificity is intentional. Do not introduce `@layer`, a global reset, a broad specificity rewrite, or a zero-`!important` goal.
5. Audit analogous rules in code for the same root cause, then verify representative live components. Do not silently fix unrelated CSS defects.

Never mutate attendance, TODOs, messages, grades, registrations, or other Stuudium data merely to test styling without the user's approval.

## Extension behavior and security

- Keep Manifest V3 permissions and host access at the minimum verified scope. Do not request broad browsing permissions for convenience.
- Store preferences only. Never read or store grades, attendance, messages, authentication material, or other student information.
- Keep the bootstrap safe to run more than once and maintain explicit activation and cleanup boundaries.
- Treat install, reload, disable, re-enable, client-side navigation, and preference changes as required lifecycle states.
- Keep generated packages free of secrets, development-only files, source maps, and unrelated repository content.

## Commands

- `npm ci`: install exactly the locked dependency graph from a fresh state.
- `npm run dev`: regenerate theme CSS and start WXT development mode.
- `npm run watch:theme`: rebuild only the theme outputs when canonical CSS changes.
- `npm run build:theme`: deterministically regenerate the Stylus and extension CSS outputs.
- `npm run check:theme`: fail if either generated theme output is stale.
- `npm run format` / `npm run format:check`: write or verify Prettier formatting.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run TypeScript checking without emitting files.
- `npm test`: run the Vitest suite once.
- `npm run build`: create the unpacked Chromium extension at `.output/chrome-mv3/`.
- `npm run package`: create the uploadable ZIP at `.output/torg-stuudium-enhancement-<version>-chrome.zip` and validate its contents.
- `npm run validate`: run theme freshness, formatting, linting, type checking, tests, and unpacked-build validation.

Beginner setup and testing instructions live in `docs/EXTENSION_DEVELOPMENT.md`. Release preparation lives in `docs/EXTENSION_PUBLISHING.md`.

## Verification and handoff

For every meaningful change, run the applicable checks, `git diff --check`, inspect the complete diff, and confirm relevant delimiters remain balanced. After theme/build changes, verify that the compatibility userstyle regenerates exactly and inspect the packaged ZIP contents.

Browser claims require a dedicated test profile or isolated session and the actual local build. Test the affected route and state, one unaffected negative control, and a relevant responsive width. Check page and extension consoles. If browser automation cannot access a protected `chrome://` or `chrome-extension://` surface, ask the user to perform that narrow check and report it as `BLOCKED` until confirmed; do not bypass the restriction with another control path.

When handing off, state the root cause, exact changes, commands and automated results, live routes/browsers/viewports/states tested, startup-flash result when relevant, security/permission impact, all changed files, and every blocked or unverified item. Static inspection alone does not establish live visual equivalence.
