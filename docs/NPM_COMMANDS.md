# Project npm commands

This is the canonical reference for the npm commands defined by Sinu
Stuudium. Run them from the repository root, where `package.json` is located.
The extension and Android development guides explain the surrounding browser,
device, and release workflows without repeating this command reference.

## Requirements

- Node.js 22.13.0 or newer.
- npm 10 or newer.
- Android Studio and its SDK for commands that invoke Gradle.
- The permanent signing keystore and credentials for a signed Android release.

## Dependency installation

### `npm ci`

Use `npm ci` for a reproducible installation from `package-lock.json`. It
recreates `node_modules`, then npm automatically runs the project's
`postinstall` script. It does not install the browser extension or Android app.

```sh
npm ci
```

Run `npm run` without a script name to let npm list the commands available in
the current checkout.

## Quick command chooser

| Goal                                            | Command                                                   |
| ----------------------------------------------- | --------------------------------------------------------- |
| Install the locked dependencies                 | `npm ci`                                                  |
| Work on the Chromium extension continuously     | `npm run dev`                                             |
| Build the unpacked production extension         | `npm run build`                                           |
| Regenerate theme CSS outputs                    | `npm run build:theme`                                     |
| Check the committed userstyle for staleness     | `npm run check:theme`                                     |
| Run the main project validation                 | `npm run validate`                                        |
| Create and validate the Chrome release ZIP      | `npm run package`                                         |
| Rebuild Android's bundled web assets            | `npm run build:mobile:web`                                |
| Check and validate Android's bundled web assets | `npm run check:mobile:web && npm run validate:mobile:web` |
| Build a debug APK                               | `npm run build:android:debug`                             |
| Run the complete Android debug validation       | `npm run validate:android`                                |
| Build a signed release APK                      | `npm run build:android:release`                           |

## Setup lifecycle

### `npm run postinstall`

Runs automatically after `npm ci` and normal dependency installation. It:

1. Builds the theme outputs.
2. Runs `wxt prepare` to generate WXT types and development metadata.

You normally do not run this command directly.

## Theme commands

The canonical source is `src/theme/modules/*.css`, plus
`src/theme/userstyle-header.txt` for compatibility-userstyle metadata.

### `npm run build:theme`

Parses the canonical modules in filename order and writes both theme outputs:

- `Stuudium-Intentional-Dark.user.css`, the committed Graphite Mint Stylus
  compatibility userstyle;
- `src/generated/theme.css`, the ignored, activation-gated stylesheet used by
  the extension and mobile asset builds.

Run it after changing a canonical theme module or the userstyle header unless
`npm run dev` is already watching those files.

### `npm run watch:theme`

Watches the canonical theme modules and userstyle header, then reruns the theme
build after a change. It watches only theme sources and stays active until
stopped with `Control+C`.

This command does not perform an initial build. Use `npm run build:theme` first
when the outputs might be missing or stale. `npm run dev` already combines that
initial build with this watcher.

### `npm run check:theme`

Rebuilds the expected theme content in memory and compares it with the committed
`Stuudium-Intentional-Dark.user.css`. It does not write files. A failure means
the compatibility userstyle is missing or stale and should be regenerated with
`npm run build:theme`.

The current check does not independently compare the ignored
`src/generated/theme.css`; the extension and mobile build paths regenerate or
consume that output as part of their own workflows.

## Chromium extension commands

### `npm run dev`

Performs one theme build, then runs two long-lived processes together:

- the theme watcher;
- WXT's Chrome development builder.

It writes the unpacked development extension to:

```text
.output/chrome-mv3-dev/
```

Keep the command running while editing and stop it with `Control+C`. This folder
is separate from the production build. Reloading a browser extension installed
from `.output/chrome-mv3/` will not pick up development output.

### `npm run build`

Regenerates the theme outputs, then creates the unpacked Chrome Manifest V3
production extension with WXT at:

```text
.output/chrome-mv3/
```

This is a one-time build, not a watcher.

### `npm run validate:build`

Validates the existing `.output/chrome-mv3/` build. It checks the Manifest V3
shape, version, narrow permissions and host access, entrypoints, icons, options
startup gate, theme content, activation gating, and absence of development or
sensitive files.

It does not create the production build. Run `npm run build` first, or use
`npm run validate`, which runs both in the correct order.

### `npm run package`

Builds the production extension, asks WXT to create its Chrome ZIP, and verifies
that the archive contains exactly the production-build files with no unsafe,
source, documentation, dependency, environment, or source-map entries.

The uploadable artifact is:

```text
.output/sinu-stuudium-<version>-chrome.zip
```

The version comes from `package.json`. Packaging does not publish or upload the
extension.

### Update the project version

`npm version <version> --no-git-tag-version` updates the version in both
`package.json` and `package-lock.json` without creating a Git commit or tag. For
example:

```sh
npm version 0.1.1 --no-git-tag-version
```

Use only an approved release version and inspect both changed files before
building. This is an npm utility command used by this project's extension
release workflow, not a named script from `package.json`.

## Android web-asset commands

Android bundles generated web assets under the ignored directory
`apps/android/app/src/main/assets/mobile/`. Never edit that directory directly.

### `npm run build:mobile:web`

Runs the theme build, then recreates Android's bundled bootstrap, critical and
complete theme CSS, platform CSS, settings-menu CSS, settings page, shared
configuration, and SHA-256 asset manifest.

Run it after changing shared TypeScript, settings UI, supported sites, themes,
preferences, or CSS that Android consumes.

### `npm run check:mobile:web`

Checks the committed compatibility userstyle, generates the expected Android
web assets in a temporary directory, and compares their filenames and bytes
with the existing bundled assets. It does not update the bundled directory.

Use `npm run build:mobile:web` if the assets are missing or stale.

### `npm run validate:mobile:web`

Validates the existing bundled assets and their hashes. It requires the assets
to have been built already. Among other boundaries, it rejects source maps,
TypeScript files, development startup code, localhost or remote settings
scripts, non-exact HTTPS origins, and WebExtension API dependencies in the
mobile bootstrap.

This command checks safety and structure; `npm run check:mobile:web` separately
checks reproducibility and freshness.

## Android app commands

The Android commands use the repository's Gradle Wrapper. The helper locates
Android Studio's Java runtime and the Android SDK through the standard macOS
locations or `JAVA_HOME`, `ANDROID_SDK_ROOT`, and `ANDROID_HOME`.

### `npm run build:android:debug`

Rebuilds the mobile web assets and assembles a debug APK:

```text
apps/android/app/build/outputs/apk/debug/app-debug.apk
```

The APK uses a local debug signature and is for development only.

### `npm run test:android`

Rebuilds the mobile web assets and runs the Kotlin debug unit tests through the
Gradle `:app:testDebugUnitTest` task. It does not run Android lint or assemble
an APK.

### `npm run validate:android`

Rebuilds and validates the mobile web assets, then runs Android lint, Kotlin
debug unit tests, and debug APK assembly. The Gradle tasks are:

```text
:app:lintDebug :app:testDebugUnitTest :app:assembleDebug
```

This is the main automated check for Kotlin, Android resources, the Android
manifest, Gradle configuration, or other Android app changes. It does not build
a release-signed APK or replace physical-device testing.

### `npm run build:android:release`

Builds the signed release APK through the maintainer-facing signing wrapper. It
expects the permanent keystore outside the repository, uses the standard
keystore path and alias unless overridden, and prompts without echoing when the
keystore password is not already provided.

Optional configuration variables are:

- `SINU_STUUDIUM_KEYSTORE_PATH`;
- `SINU_STUUDIUM_KEY_ALIAS`;
- `SINU_STUUDIUM_KEYSTORE_PASSWORD`;
- `SINU_STUUDIUM_KEY_PASSWORD`.

Do not put passwords in shell history, committed files, issues, or logs. The
result is:

```text
apps/android/app/build/outputs/apk/release/app-release.apk
```

See [MOBILE_DEVELOPMENT.md](MOBILE_DEVELOPMENT.md) for keystore policy, device
installation, and release verification.

### `npm run build:android:release:configured`

Rebuilds and validates the mobile web assets, then invokes the Gradle
`:app:assembleRelease` task. This lower-level command expects every required
signing variable to be configured already and fails when the signing setup is
incomplete.

Use `npm run build:android:release` for the normal interactive maintainer
workflow. The configured variant exists so the wrapper and controlled
automation can invoke the final build without another prompt.

## Formatting, linting, types, and tests

### `npm run format`

Runs Prettier in write mode across the repository. It changes supported files
to match the project's formatting rules.

### `npm run format:check`

Checks Prettier formatting without changing files.

### `npm run lint`

Runs ESLint across the repository and allows no warnings.

### `npm run typecheck`

Runs the TypeScript compiler with `--noEmit`, so it reports type errors without
creating build output.

### `npm test` or `npm run test`

Runs the complete Vitest suite once.

### `npm run test:settings-menu`

Runs only `tests/settings-menu.test.ts`. Use it for quick feedback while
changing the injected settings-menu feature; run the broader checks before
handoff when the change affects more than that isolated behavior.

### `npm run test:watch`

Starts Vitest in watch mode and reruns affected tests as files change. It stays
active until stopped with `Control+C`.

## Combined validation

### `npm run validate`

Runs the main extension and shared-code validation in this order:

1. compatibility-userstyle freshness;
2. Android web-asset freshness and reproducibility;
3. Android web-asset safety and structure;
4. Prettier formatting;
5. ESLint;
6. TypeScript type checking;
7. the complete Vitest suite;
8. a production Chromium extension build;
9. production extension validation.

This command may create or replace `.output/chrome-mv3/` through its production
build step. It does not run Android lint or Kotlin tests, assemble an APK,
create the Chrome ZIP, build a signed Android release, or perform browser/device
testing.

Use the validation tier that matches the change:

| Change                                             | Minimum project command set                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Documentation only                                 | No build required; run `npm run format:check`                                               |
| Canonical theme CSS                                | `npm run build:theme`, then `npm run check:theme` and relevant tests                        |
| TypeScript or extension behavior                   | Relevant test, `npm run typecheck`, and `npm run lint`                                      |
| Extension manifest, entrypoint, or build structure | `npm run build`, then `npm run validate:build`                                              |
| Broad shared or extension work                     | `npm run validate`                                                                          |
| Android shared web code or assets                  | `npm run check:mobile:web` and `npm run validate:mobile:web`, plus normal TypeScript checks |
| Android Kotlin, resources, manifest, or Gradle     | `npm run validate:android`                                                                  |
| Chrome release packaging                           | `npm run package`                                                                           |

The npm checks do not replace `git diff --check`, review of the complete diff,
or the live browser and physical-device checks required by the development
guides.
