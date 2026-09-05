# Project direction

Status: agreed direction, Phase 2 theme switching implemented

Last updated: 2026-09-05

## Purpose

Evolve the current CSS-only Stuudium theme into a maintainable enhancement project that can add features such as theme switching while remaining straightforward for ordinary students to install and use.

The project enhances the real Stuudium interface. It is not intended to become an independent Stuudium client, reproduce Stuudium's backend, or proxy student data through a separate server.

## Decision summary

The project will have one shared theme and feature core with different delivery targets:

```text
Shared enhancement core
|-- Theme CSS, tokens, and palettes
|-- Route and DOM adapters
|-- JavaScript feature modules
|-- Platform-neutral settings interface
|
|-- Desktop: browser extension
|-- Android: dedicated WebView application
|-- iOS: dedicated WebView application later
`-- Compatibility: existing CSS userstyle
```

The first public product scope is desktop plus Android. iOS compatibility must be considered from the beginning, but public iOS distribution is deferred until sustainable Apple signing is available.

## Platform plan

| Platform               | Delivery                           | Initial status                        | Update direction                                                                       |
| ---------------------- | ---------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| Chromium desktop       | WXT-based Manifest V3 WebExtension | First public target: Chrome and Brave | Chrome Web Store first; Microsoft Edge Add-ons documented as an optional later channel |
| Firefox desktop        | WebExtension compatibility build   | Desired follow-up                     | Browser-supported distribution                                                         |
| Safari desktop         | Safari WebExtension port           | Desired follow-up                     | Apple-supported distribution                                                           |
| Android                | Dedicated WebView app              | First public mobile target            | Signed APK releases from GitHub with an update checker and system installer handoff    |
| iOS                    | Dedicated WebView app              | Deferred public target                | Apple-supported signing and distribution after funding or institutional support        |
| Existing installations | `.user.css`                        | Retained during transition            | Current userstyle update mechanism                                                     |

### iOS decision

Ship desktop and Android first, architect for iOS from day one, privately test iOS with free development signing, and launch iOS publicly only when the real WebView app can be distributed sustainably.

Free Apple Personal Team signing is suitable for development on a small number of personal devices, not public distribution, because its provisioning expires frequently. The preferred eventual route is a school-owned Apple Developer account with an educational fee waiver, or another funded and properly governed account.

An iOS userscript may be produced later for motivated testers, but it is not part of the supported first release. Requiring an unrelated userscript manager, Safari permissions, and manual setup would recreate the installation friction this project is intended to remove.

## Why the targets differ

Desktop browsers support extensions well. An extension lets users keep Stuudium in their normal browser while granting the project narrowly scoped permission to inject CSS and JavaScript.

Mobile browser-extension support is inconsistent. A dedicated WebView app can load the genuine Stuudium site and inject the same enhancement core inside an app designed for phone use.

An independently hosted Progressive Web App is not a substitute. A PWA on another domain can be installed without native signing, but browser same-origin rules prevent it from modifying Stuudium. Stuudium also prevents its mobile application from being embedded in an iframe. Stuudium's own PWA works because Stuudium controls its frontend, authentication flow, API, and allowed origins.

## Shared-core requirements

Feature code must not directly depend on Chrome, Android, or iOS APIs. Platform-specific behavior belongs behind small adapters.

The shared core should contain:

- The existing `--sid-*` design tokens and component styling.
- Additional palettes for theme switching.
- Route detection and verified DOM contracts.
- Independent feature modules with explicit activation and cleanup.
- A platform-neutral settings contract.
- Shared validation and diagnostic behavior that does not collect student data.

Platform adapters should provide:

- Preference storage.
- CSS and script startup.
- Navigation lifecycle events.
- Update presentation.
- Only the minimum native integration required by that platform.

The Phase 1 implementation uses WXT, TypeScript, npm, and small platform
adapters around WebExtension APIs. Semantic CSS modules under
`src/theme/modules/` are the canonical theme source. A deterministic build
continues to generate both the extension stylesheet and the supported
`Stuudium-Intentional-Dark.user.css` compatibility output.

Supported Stuudium sites are declared in one registry so more verified schools
can be added deliberately later. The extension currently grants access only to
`https://torg.ope.ee/*`; it does not pre-authorize every `ope.ee` school.

## First feature after the extension foundation

Theme switching requires JavaScript execution, persistent settings, and a user-facing control. It therefore comes after a minimal desktop extension foundation has proven CSS injection, JavaScript injection, storage, permissions, and startup timing on the live site.

Theme switching is the first product feature built on that foundation because the current stylesheet already centralizes its palette in CSS custom properties.

The Phase 2 implementation:

1. Preserve the existing graphite-and-mint theme as the default.
2. Select palettes by setting a stable attribute on the document root.
3. Store only the selected preference.
4. Apply the preference early enough to avoid a white startup flash.
5. Avoid duplicating component rules for each palette.

It initially offers Graphite Mint and Graphite Blue. They intentionally share
the complete graphite neutral palette and differ only in accent tokens. The
catalog records a theme's light/dark color-scheme family so a future light
theme can replace every required surface and text token without changing the
selection UI or stored preference shape. Selection is manual and remembered;
a future system-following mode can be added alongside the current `manual`
mode without changing existing saved choices.

## CSS loading decision

Do not block Stuudium's built-in CSS initially.

The current theme overrides Stuudium's presentation but still relies on the original stylesheet for layout, responsive behavior, component geometry, and new upstream components. Replacing it entirely would turn this project into a fragile fork of Stuudium's frontend.

Prevent the white loading flash with early application instead:

- Inject a tiny critical stylesheet at document start.
- Set `color-scheme` and the page background before content is displayed.
- Load the full theme immediately afterward.
- On mobile, give the native window and WebView the same dark background.
- Keep the WebView behind a matching dark launch surface until initial styling is active.

A complete replacement stylesheet can be reconsidered only after deliberately implementing and verifying every structural and responsive responsibility currently supplied by Stuudium.

## Security boundaries

The enhancement operates on sensitive school pages. Its default security posture is:

- Limit browser and WebView access to explicitly verified HTTPS Stuudium origins.
- Let the genuine Stuudium page handle authentication.
- Never read, store, proxy, or log passwords.
- Store preferences, not grades, messages, attendance, or other school data.
- Do not send analytics or telemetry by default.
- Do not expose unrestricted native capabilities to remote page JavaScript.
- Open unrelated domains in the system browser on mobile.
- Bundle executable project code with each release.
- Treat cross-origin frames as separate security boundaries.

Any future native bridge must be narrowly scoped, origin-checked where the platform permits it, and justified by a specific feature.

## Delivery and updates

### Desktop extension

The extension bundles the theme, feature runtime, and settings UI. Chrome and
Brave are the initial Chromium browsers. Chrome Web Store publication is the
first distribution route because both browsers can install its Chromium
extensions. Microsoft Edge Add-ons is documented as an optional additional
channel, but Phase 1 does not create or submit an Edge listing.

The settings surface is a themed options page with a master enable preference
and a responsive visual theme-card grid. It opens from the extension toolbar
and from a button added to Stuudium's main overflow menu. The grid is generated
from the shared theme catalog and is designed to wrap cleanly with roughly ten
themes rather than hard-coding a two-choice layout.

The existing `Abi` link remains CSS-hidden in Phase 1. Replacing that visual
hide with JavaScript DOM removal is viable, but it is intentionally deferred
because Phase 1's bootstrap must not change existing page behavior. Any later
implementation should use the feature lifecycle's explicit activation and
cleanup boundaries.

### Android application

GitHub Releases will provide signed APKs. All releases must retain the same application ID and signing key so Android accepts them as updates. The initial updater may simply notify users and open the release page; a later version can download the APK and hand it to Android's installer for explicit user approval.

Release signing keys must never be committed to the repository.

### iOS application

Development can use free personal-device signing. Public distribution waits for a durable Apple signing arrangement. This constraint must not lead to Android-only assumptions in the shared core.

## Rollout

### Phase 1: Shared source and desktop extension foundation

- Establish a modular source structure without redesigning the theme.
- Continue producing the existing CSS userstyle.
- Add platform-neutral feature and settings interfaces.
- Create a minimal Chromium WebExtension with narrowly scoped Stuudium permissions.
- Inject critical CSS at document start, followed by the complete existing theme.
- Run a minimal JavaScript bootstrap and confirm it can observe supported Stuudium routes without changing page behavior.
- Implement extension-backed preference storage and the smallest viable settings surface.
- Verify that enabling and disabling the extension cleanly applies and removes the enhancement.
- Confirm that the existing graphite-and-mint theme remains visually equivalent when delivered by the extension.

### Phase 2: First feature

- Implement manual, remembered switching between Graphite Mint and Graphite
  Blue. **Implemented.**
- Verify persistence, initial rendering, navigation, and responsive behavior.
- Keep the existing theme visually unchanged when selected and retain Graphite
  Mint as the only compatibility-userstyle palette.

### Phase 3: Desktop extension hardening and release

- Exercise default, interaction, error, and update behavior on representative live Stuudium routes.
- Complete the approved Chrome Web Store listing and release process.
- Evaluate Microsoft Edge Add-ons as an additional channel after an Edge-specific live test.
- Add Firefox and desktop Safari compatibility deliberately rather than assuming equivalence.

### Phase 4: Android app

- Select the WebView application framework through a focused prototype.
- Verify login, session persistence, navigation, file handling, external links, Tera, and responsive behavior.
- Establish signed GitHub releases and the update flow.

### Phase 5: iOS preparation and release

- Exercise the same mobile shell privately on physical iPhones using development signing.
- Resolve platform-specific authentication, navigation, file, and WebView behavior.
- Pursue school fee-waived or funded signing.
- Release the dedicated iOS WebView app when distribution is sustainable.

## Explicit non-goals

- Do not build a reverse proxy for Stuudium authentication or student data.
- Do not reverse-engineer a private Stuudium API into a new client.
- Do not use a separately hosted PWA as though it could inject into Stuudium.
- Do not make an iOS userscript a supported first-release product.
- Do not remove Stuudium's structural CSS merely to reduce the loading flash.
- Do not choose a cross-platform framework before a prototype verifies the actual Stuudium login and rendering path.
- Do not remove the current userstyle before replacement targets are proven.

## Open decisions

These choices remain intentionally unresolved:

- The Android/iOS WebView framework.
- The long-term Android updater implementation.
- The organization and governance of the eventual Apple developer account.
- The post-theme-switching feature roadmap.
- Which future theme should first exercise full light-palette overrides and
  whether automatic system-following belongs in that same phase.

Resolve each through the smallest relevant prototype and live Stuudium verification rather than selecting technology from feature lists alone.

## Context for future contributors and AI agents

Treat the decisions above as product constraints, not permission to implement every target in one batch.

For each change:

1. Inspect the actual rendered Stuudium page, DOM, and winning style cascade.
2. Make one component or platform hypothesis per batch.
3. Preserve the current visual language unless a design change is explicitly approved.
4. Keep shared logic independent of delivery-platform APIs.
5. Verify affected states, a negative control, and relevant responsive behavior.
6. Preserve unrelated and uncommitted work.
7. Do not commit unless explicitly requested.

When reporting work, state the root cause or goal, exact change, platforms and states tested, result, and any unverified limitation.
