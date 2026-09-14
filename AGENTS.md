# TORG Stuudium project agent guide

## Start here

Before changing files:

1. Inspect `git status --short --branch --untracked-files=all` and preserve all unrelated or pre-existing work.
2. Read `docs/PROJECT_DIRECTION.md`. Its agreed decisions and phase boundaries are constraints.
3. Inspect the canonical source, generated outputs, tests, and documentation relevant to the requested change.
4. Ask the user about genuinely unresolved decisions that would be difficult to reverse. Do not ask about safe internal implementation details.

Do not commit, publish, submit to a store, change live Stuudium data, or begin a later project phase unless the user explicitly requests it.

## Current project state and phase boundary

Phase 1 is implemented as a WXT 0.21 Chromium Manifest V3 extension written in TypeScript and built with npm. It delivers the existing dark theme, adds an early critical dark surface, and uses a small idempotent content bootstrap.

Phase 2 adds manual, remembered switching among Graphite Mint, Graphite Blue, Obsidian Red, Velvet Mauve, and Midnight Amber. Each dark theme owns a complete semantic color palette rather than inheriting another theme's neutrals. The theme contract already distinguishes dark and light families so future light themes can replace the full token set, but automatic system-following is not implemented. The Stylus compatibility output deliberately remains Graphite Mint only.

Phase 3 release hardening and store publication have not started. Bug fixes and maintenance must preserve that boundary.

Phase 4 now has a focused native Kotlin Android WebView prototype. It reuses the
generated theme, shared content runtime, settings contract, and settings UI.
Physical-device verification is still required before treating Android as a
supported release target. Signed releases, an updater, and iOS implementation
remain out of scope unless explicitly requested.

The project enhances the genuine Stuudium interface. It must never become a proxy for Stuudium authentication or student data, a replacement client, a source of remote executable code, or an unrestricted page-to-extension/native bridge. Do not add analytics or telemetry by default.

## Sources of truth and generated files

- `src/theme/modules/*.css` is the canonical full-theme source. Edit the owning module here.
- `src/theme/userstyle-header.txt` is the canonical compatibility-userstyle metadata.
- `Stuudium-Intentional-Dark.user.css` is a generated, supported Stylus compatibility output. Never edit it directly.
- `src/generated/theme.css` is the generated, activation-gated extension stylesheet. Never edit it directly; it is intentionally ignored by Git.
- `src/theme/critical.css` is the small early dark surface. Keep it minimal and never use it to replace Stuudium's structural CSS.
- `src/theme/modules/01-tokens.css` contains the default Graphite Mint tokens; `02-palettes.css` contains attribute-gated complete palette overrides.

Run `npm run build:theme` after changing canonical theme modules, unless `npm run dev` is already watching them. Run `npm run check:theme` to prove the committed compatibility userstyle is current and deterministic. See `docs/NPM_COMMANDS.md` for the exact scope of each command.

## Architecture map

- `src/shared/`: platform-neutral settings, theme catalog, route recognition, supported-site registry, and lifecycle contracts. Do not import browser APIs here.
- `src/features/`: reusable DOM-facing feature logic with explicit activation and cleanup boundaries.
- `src/platforms/webextension/`: small adapters around extension storage and runtime APIs.
- `src/entrypoints/`: WXT background, per-theme early activation markers, content bootstrap, and options-page entrypoints.
- `src/mobile/entrypoints/`: platform-neutral WebView bundle entries for
  Stuudium, the local settings page, and generated shared configuration. Keep
  these outside WXT's `src/entrypoints/` discovery directory.
- `src/platforms/webview/`: narrow TypeScript adapters for an origin-checked
  native host; do not expose a general page-to-native bridge.
- `apps/android/`: native Kotlin WebView shell, preference storage, navigation,
  origin policy, Android resources, tests, and Gradle Wrapper.
- `apps/android/app/src/main/assets/mobile/`: generated, ignored mobile web
  assets. Never edit these directly; regenerate them from shared sources.
- `src/shared/sites.ts`: single registry for verified Stuudium origins. Add an origin here only after it is explicitly verified and approved; keep manifest access narrow.
- `wxt.config.ts`: extension manifest/build configuration.
- `scripts/`: deterministic theme, packaging, and validation tooling.
- `tests/`: unit and build-regression tests.

Keep shared feature logic independent of Chrome, Android, and iOS APIs. Browser API access belongs behind a small adapter so future native WebViews can reuse the core.

## Required skills and documentation lookup

- For new UI architecture, unfamiliar web APIs, accessibility patterns, performance work, or compatibility-sensitive frontend techniques, use `.agents/skills/modern-web-guidance/SKILL.md`. Do not invoke it for routine maintenance that follows an established local component pattern.
- For theme CSS, rendered appearance, DOM/cascade debugging, or visual-equivalence claims, use `.agents/skills/maintain-stuudium-theme/SKILL.md`.
- For extension manifests, content scripts, browser APIs, permissions, or Chrome Web Store work, use `.agents/skills/chrome-extensions/SKILL.md`.
- After building UI injected into a genuine Stuudium page, use `.agents/skills/verify-stuudium-extension-ui/SKILL.md` for live verification.
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

`docs/NPM_COMMANDS.md` is the canonical reference for every project-specific npm
command, its prerequisites, outputs, side effects, and composition. Keep command
descriptions there instead of duplicating them in this guide. The verification
tiers below remain authoritative for choosing which commands a change requires.

Beginner setup and testing instructions live in `docs/EXTENSION_DEVELOPMENT.md`. Release preparation lives in `docs/EXTENSION_PUBLISHING.md`.
Android Studio, physical-device setup, building, inspection, and removal are
documented in `docs/MOBILE_DEVELOPMENT.md`.

## Development artifact identity

Before diagnosing a stale browser result, confirm which unpacked folder the browser is actually loading:

- `npm run dev` continuously writes `.output/chrome-mv3-dev/`.
- `npm run build` writes `.output/chrome-mv3/` once.

The two folders are different extension builds. Running `npm run dev` cannot update a browser instance loaded from `.output/chrome-mv3/`, even after reloading that extension card. Keep only the intended test instance enabled, and disable the Stylus compatibility userstyle during extension-only checks.

## Verification and handoff

Use the smallest verification tier that proves the change, then inspect the complete diff and run `git diff --check`:

- Documentation or agent guidance only: inspect rendered structure where relevant; no extension build is required.
- Canonical theme CSS: run `npm run check:theme` after regeneration and the relevant targeted tests.
- TypeScript or extension UI behavior: run the targeted test, `npm run typecheck`, and `npm run lint`.
- Manifest, entrypoint, build configuration, or generated extension structure: run `npm run build` and `npm run validate:build` in addition to relevant targeted checks.
- Broad, cross-cutting, or release-candidate work: run `npm run validate`.
- Android shared-web changes: run `npm run check:mobile:web` and
  `npm run validate:mobile:web` in addition to the normal TypeScript checks.
- Android Kotlin, resources, manifest, or Gradle changes: run
  `npm run validate:android`, inspect the APK contents and permissions, and test
  the exact APK on a dedicated device or emulator.
- Packaging or publication work only: run `npm run package` and inspect the packaged ZIP contents.

Do not run packaging checks for an ordinary CSS or documentation edit. Do not manually count delimiters when the relevant parser, formatter, compiler, or build already validates them; count only when the format lacks a normal parser or an error indicates structural imbalance.

Browser claims require a dedicated test profile or isolated session and the exact local build under test. Before detailed visual inspection, prove freshness with an unmistakable changed value, selector, or DOM marker. Test the affected route and state, one unaffected negative control, and a relevant responsive width. Check page and extension consoles. If browser automation cannot access a protected `chrome://` or `chrome-extension://` surface, ask the user to perform that narrow check and report it as `BLOCKED` until confirmed; do not bypass the restriction with another control path.

Android claims require the exact debug APK under test and its bundled
`asset-manifest.json`. Verify login and session persistence without recording
credentials, exercise internal and external navigation, settings persistence,
theme startup, back behavior, file boundaries, orientation, one cross-origin
negative control, Logcat, and both WebView consoles. The Samsung S25 running
Android 16 is the initial physical test device. Android 8 compatibility remains
`BLOCKED` until an API 26 emulator or device is tested with a maintained WebView.

When handing off, state the root cause, exact changes, commands and automated results, live routes/browsers/viewports/states tested, startup-flash result when relevant, security/permission impact, all changed files, and every blocked or unverified item. Static inspection alone does not establish live visual equivalence.
