---
name: chrome-extensions
description: Build, modify, debug, or prepare this Chromium Manifest V3 extension when work involves manifests, permissions, browser APIs, service workers, messaging, storage, lifecycle, build artifacts, or Chrome Web Store publication. Do not use for pure presentation maintenance inside an established injected DOM component.
---

# Chrome extensions

Apply current Manifest V3 constraints without loading guidance for unrelated extension capabilities.

## Start with the actual project

- Read the repository `AGENTS.md`, `docs/PROJECT_DIRECTION.md`, and the relevant source and tests.
- Inspect the generated manifest or bundle when behavior depends on emitted configuration.
- Use Context7 for WXT or other library-specific questions. Use current first-party Chrome documentation for browser and store requirements that may have changed.
- Preserve the current project phase and do not add permissions, publication work, telemetry, or new extension surfaces unless the request requires them.

## Development artifact identity

- `npm run dev` writes and watches `.output/chrome-mv3-dev/`.
- `npm run build` writes `.output/chrome-mv3/` once.
- Confirm which exact folder the browser loaded before debugging stale behavior. Reloading a production instance cannot pick up the development folder's changes.
- Disable duplicate extension instances and the Stylus compatibility userstyle during extension-only verification.

## Core invariants

- Use Manifest V3 and bundle executable code with the extension. Do not add remote executable code, `eval()`, or inline scripts.
- Keep permissions and host access at the minimum verified scope. Do not request broad browsing access for convenience.
- Put browser APIs behind the existing platform adapter boundary when shared feature code must remain reusable.
- Treat service workers as ephemeral. Persist only state that must survive shutdown, and store preferences rather than Stuudium data.
- Keep content bootstrap and feature mounting idempotent, with explicit activation, navigation, invalidation, and cleanup behavior.
- Reference only files that exist in the generated extension. Validate the emitted artifact instead of assuming source configuration was reproduced correctly.
- Do not mutate live school data to construct a test state without explicit approval.

## Verification routing

- For an injected Stuudium UI build, use `../verify-stuudium-extension-ui/SKILL.md` after the targeted automated checks.
- For a manifest, entrypoint, permission, or build-configuration change, inspect the emitted manifest and run the build-validation tier from `AGENTS.md`.
- For a narrowly scoped adapter or feature change, prefer targeted tests plus type checking and linting over packaging the extension.
- Exercise install or initial load, reload, disable and re-enable, client-side navigation, preference changes, and cleanup when the affected lifecycle crosses those states.

## Store work

Enter the store workflow only when the user asks to publish, prepare a release or listing, or address a review issue. Follow `docs/EXTENSION_PUBLISHING.md`, validate the package, and keep store-facing claims consistent with actual permissions and data handling.
