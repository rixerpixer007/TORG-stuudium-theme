# Extension development

This guide starts from a computer that has never built a browser extension. It
covers the Phase 2 Chromium extension for Google Chrome and Brave. The extension
changes only pages under `https://torg.ope.ee/`, stores an enable/disable choice
and a selected theme, and does not read or store student information.

## What the tools do

- **Git** downloads the repository and shows which files have changed.
- **Node.js** runs the build scripts on your computer.
- **npm** downloads the exact development packages recorded in
  `package-lock.json` and runs the project's named commands.
- **TypeScript** checks JavaScript code before it reaches a browser.
- **WXT** turns the source entrypoints into a valid Manifest V3 extension.
- **Vite** is the bundler used by WXT.
- **PostCSS** parses and generates the two theme outputs.
- **Happy DOM** gives DOM-facing unit tests a small simulated browser document.
- **ESLint, Prettier, and Vitest** check code quality, formatting, and behavior.

The extension is not uploaded anywhere by these commands. Building and loading
it locally happen entirely on your computer.

## 1. Install the prerequisites

Install the following:

1. [Git](https://git-scm.com/downloads).
2. [Node.js](https://nodejs.org/en/download) version 22.13.0 or newer. An active
   Node.js LTS release is the easiest choice. npm is installed with Node.js;
   this project requires npm 10 or newer.
3. At least one initially supported browser:
   [Google Chrome](https://www.google.com/chrome/) or
   [Brave](https://brave.com/download/).
4. A code editor. [Visual Studio Code](https://code.visualstudio.com/) is a
   beginner-friendly option, but it is not required.

Open Terminal on macOS or a terminal in your editor and verify the tools:

```sh
git --version
node --version
npm --version
```

Each command prints the installed version. If `node` or `npm` is “not found,”
close and reopen the terminal after installing Node.js.

This repository was verified with Node.js 26.6.0 and npm 11.18.0. The minimums
are declared in `package.json`, so npm warns when an older runtime is used.

## 2. Get the repository and install dependencies

If the repository is not on your computer yet:

```sh
git clone REPOSITORY_URL
cd TORG-stuudium-theme
```

Replace `REPOSITORY_URL` with this repository's clone URL. `git clone` makes a
local copy; `cd` makes it the current working folder.

Install the exact dependency versions from the lockfile:

```sh
npm ci
```

`npm ci` removes and recreates only the local `node_modules` dependency folder,
downloads the locked packages, regenerates the theme outputs, and prepares WXT
types. It does not change Stuudium or install an extension in a browser. Use
`npm ci`, rather than `npm install`, for a reproducible clean setup.

## 3. Understand the important files

```text
Stuudium-Intentional-Dark.user.css  Generated compatibility userstyle
src/
|-- theme/
|   |-- modules/                   Canonical theme CSS and palettes, in source order
|   |-- critical.css               Tiny earliest dark page surface
|   `-- userstyle-header.txt        Userstyle metadata
|-- shared/                        Browser-independent settings, themes, routes, lifecycle
|-- features/                      DOM features with activate/cleanup boundaries
|-- platforms/webextension/        WebExtension API and page-shell adapters
|-- entrypoints/                   Background, content script, and settings page
`-- generated/theme.css            Generated, ignored extension theme CSS
scripts/                            Build and artifact validation programs
tests/                              Fast behavior and generation tests
wxt.config.ts                       Extension metadata and narrow permissions
package.json                        Commands and pinned development dependencies
package-lock.json                   Exact dependency graph for reproducible installs
.output/                            Generated unpacked builds and release ZIPs
docs/                               Project, development, and publishing guides
```

Do not hand-edit `Stuudium-Intentional-Dark.user.css` or
`src/generated/theme.css`; both say that they are generated. Edit the owning
file in `src/theme/modules/` and regenerate instead.

WXT generates `.output/.../manifest.json` from `wxt.config.ts` and the files in
`src/entrypoints/`. There is deliberately no hand-maintained manifest to drift
away from the code.

## 4. Build the extension

Create a production build:

```sh
npm run build
```

This first regenerates both CSS outputs, then asks WXT/Vite to compile the
TypeScript, CSS, options page, and Manifest V3 metadata. Load this generated
folder as an unpacked extension:

```text
.output/chrome-mv3
```

Never select `.output` itself, the repository root, or the release ZIP when the
browser asks for an unpacked-extension folder.

## 5. Use development/watch mode

For repeated editing, run:

```sh
npm run dev
```

This does three things:

1. Generates the current CSS outputs once.
2. Watches the canonical theme modules and regenerates both outputs when they
   change.
3. Runs WXT's development builder for TypeScript, extension pages, and CSS.

The development folder is:

```text
.output/chrome-mv3-dev
```

> **Important:** `npm run dev` updates only `.output/chrome-mv3-dev`. It does
> not update `.output/chrome-mv3`, even if you reload that production extension
> in the browser. Check the extension card's **Loaded from** path before testing.

WXT intentionally does not launch a personal browser profile for this project.
Load that folder manually in a dedicated development browser profile or
session. Keep the terminal command running while editing. Press `Control+C` in
the terminal to stop it cleanly.

If a change does not appear automatically, wait for WXT to print that the build
finished, reload the extension on the extensions page, and refresh the Stuudium
tab. That explicit sequence also tests the same lifecycle used by a production
build.

### Preview the settings page on localhost

While `npm run dev` is running, open this exact URL:

```text
http://localhost:3000/src/entrypoints/options/index.html
```

This displays the real settings HTML, CSS, and TypeScript bundle in an ordinary
browser tab, which is convenient for responsive design and accessibility work.
The localhost preview uses a temporary in-memory settings adapter because an
ordinary web page cannot access extension storage. Choices work for the current
preview tab, but reloading it resets them. Use the installed unpacked extension
for persistence and lifecycle tests.

## 6. Load the unpacked extension in Chrome

Chrome's official development workflow is documented in
[Hello World extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

1. Create or use a Chrome profile dedicated to extension development. This
   avoids mixing tests with everyday extensions.
2. Enter `chrome://extensions` in the address bar.
3. Turn on **Developer mode** in the top-right corner.
4. Select **Load unpacked**.
5. Choose `.output/chrome-mv3` for a production test, or
   `.output/chrome-mv3-dev` while `npm run dev` is running.
6. Confirm that **TORG Stuudium Enhancement** appears and reports no errors.

The browser grants access only to `https://torg.ope.ee/*`. The generated
manifest does not request tabs, browsing history, cookies, downloads, or access
to every website.

## 7. Load the unpacked extension in Brave

Brave supports Chromium extensions; its user-facing extension support is
described in [How can I add extensions to Brave?](https://support.brave.com/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave).

1. Create or use a Brave profile dedicated to extension development.
2. Enter `brave://extensions` in the address bar.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose `.output/chrome-mv3-dev` for watch mode. Choose
   `.output/chrome-mv3` only when testing the result of `npm run build`.
6. Confirm that **TORG Stuudium Enhancement** appears without an error badge.

Published users of Brave can later install the same listing from the Chrome Web
Store; they do not need a separate Brave package.

## 8. Reload after a code or CSS change

For a production-build test:

```sh
npm run build
```

Then return to `chrome://extensions` or `brave://extensions`, select **Reload**
on the extension card, and refresh the Stuudium page.

For watch mode, leave `npm run dev` running. After the terminal reports a fresh
build, use the same **Reload**, then page-refresh sequence whenever you need a
clean lifecycle test. Reloading the extension alone cannot replace code already
running in an open web page; the page refresh is important.

If Stylus is also applying the compatibility userstyle, temporarily disable
that style during an extension-only visual test. Otherwise two equivalent
stylesheets are active and the test cannot prove which one produced the result.
Restore the userstyle after the comparison.

## 9. Open the settings

The settings page has a master **Enable the dark theme** switch and visual cards
for **Graphite Mint** and **Graphite Blue**. Selecting a card changes the complete
color palette immediately. Mint keeps the original green-tinted graphite;
Blue uses cool slate surfaces and text with its blue accent. The card grid wraps
automatically as future themes are added.

Open it in any of these ways:

- Pin the extension and select its toolbar icon.
- On `chrome://extensions` or `brave://extensions`, open **Details**, then
  **Extension options**.
- On an authenticated TORG Stuudium page, open the main hamburger menu and
  select **Teema seaded** (or **Theme settings** on an English page).

Turn the switch off and return to the Stuudium tab. The root activation marker
is removed, which immediately deactivates both the critical and complete theme
without attempting to undo hundreds of CSS properties individually. The
in-page settings shortcut remains in Stuudium's native appearance so the dark
theme can be re-enabled directly from the site.

Only this preference object is stored in `chrome.storage.local`:

```json
{
  "preferences": {
    "enhancementEnabled": true,
    "theme": {
      "mode": "manual",
      "themeId": "graphite-mint"
    }
  }
}
```

No grades, attendance, messages, page contents, credentials, cookies, or
authentication data are stored.

## 10. Inspect errors

Chrome and Brave use nearly identical Chromium developer tools. Chrome's full
reference is [Debug extensions](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug).

### Manifest and build errors

Open the browser's extensions page. An **Errors** button on the extension card
contains manifest, permission, or runtime errors. The terminal running WXT also
shows compile failures.

### Background service-worker errors

On the extension card, select the **service worker** link beside **Inspect
views**. Its DevTools Console shows errors from `background.ts`, including
storage and early-activation registration failures. Close that DevTools window
after debugging because keeping it open keeps the normally event-driven worker
awake.

### Content-script errors

Open the affected TORG Stuudium page, open browser DevTools (`Option+Command+I`
on macOS or `Ctrl+Shift+I` on Windows/Linux), and choose **Console**. Extension
content-script failures appear there with a `chrome-extension://...` source.
Use the **Sources** panel and its content-script section to inspect the loaded
bootstrap.

### Settings-page errors

Open the settings page, right-click inside it, select **Inspect**, and use that
DevTools Console. This is a separate extension page, so its errors do not
necessarily appear in the Stuudium tab's console.

## 11. Test on Stuudium

Use an existing authenticated session. Do not enter credentials into project
tools or save them in the repository.

1. Disable the equivalent Stylus userstyle for an extension-only test.
2. Visit representative routes under `https://torg.ope.ee/`, including the
   dashboard, a subject or journal page, Tera, Suhtlus, applications, and a
   narrow responsive layout that the change can affect.
3. Inspect the page root in DevTools. When enabled, `<html>` must have
   `data-sid-enhancement="enabled"` and either
   `data-sid-theme="graphite-mint"` or `data-sid-theme="graphite-blue"`.
4. In **Sources**, confirm that the loaded CSS and JavaScript have an extension
   URL whose extension ID matches the unpacked extension card.
5. Inspect computed styles on `<html>` or `<body>`. Mint uses canvas token
   `#0f1311` and accent token `#65d6b1`; Blue uses canvas token `#0c1118` and
   accent token `#75a7ff`. Verify that the winning rule comes from the extension
   build.
6. Open the Stuudium hamburger menu and confirm the settings button is directly
   after **Avaldused**. With the theme enabled it uses the theme treatment; with
   the theme disabled it uses Stuudium's native appearance.
7. Exercise hover, keyboard focus, menu close/reopen, and client-side navigation.
8. Check one component unrelated to the change as a negative control.
9. Select each theme and reload the page to prove the choice persists. Repeat
   with the enhancement off, after an extension reload, after disabling and
   re-enabling the extension, and after restarting the browser.
10. Watch hard refreshes and new navigations for a white frame before the dark
    surface. Test with both a warm cache and DevTools **Disable cache** enabled.
11. Check the page, service-worker, and settings consoles after every state.

For a visual-equivalence comparison, capture the same authenticated route at
the same viewport twice: once with only the compatibility userstyle enabled and
once with only the unpacked extension enabled. Compare rendered layout, color,
typography, spacing, responsive behavior, and computed winning styles. Static
source comparison alone is not a visual-equivalence test.

The extension must do nothing on another origin such as `https://example.com/`.
That is the origin-level negative control for the permission boundary.

## 12. Add a future feature without coupling it to Chrome

Keep policy and behavior in `src/shared/` or `src/features/`. Those files must
not import `wxt/browser`, `chrome`, or another platform SDK.

A shared feature implements the small `EnhancementFeature` contract in
`src/shared/lifecycle.ts`:

- `activate(context)` creates its owned state once.
- `navigate(context)` updates it when the current Stuudium route changes.
- `cleanup()` removes listeners and DOM owned by the feature.

The content-script entrypoint composes these features. Browser storage and
opening the options page are injected through adapters in
`src/platforms/webextension/`. A future Android or iOS shell can implement the
same shared contracts with native storage and WebView lifecycle adapters.

When adding a new school, add a verified origin to the registry in
`src/shared/sites.ts`, update its route and DOM tests, and let WXT generate the
matching manifest entries. Do not broaden the manifest to `*.ope.ee` just in
case; each origin should be verified and added deliberately.

To add a future theme, add one catalog entry in `src/shared/themes.ts`, its token
overrides in `src/theme/modules/02-palettes.css`, a tiny synchronous
early-activation entrypoint, and its filename mapping in
`src/platforms/webextension/early-activation.ts`. The settings grid is generated
from the catalog. A close dark variant may deliberately inherit matching tokens,
but each theme should explicitly replace every semantic color that would retain
an unwanted tint. A light theme must declare `colorScheme: "light"` and override
all necessary surface, text, border, shadow, and accent tokens.

## 13. Regenerate and check the compatibility userstyle

After editing a canonical module:

```sh
npm run build:theme
```

This parses all theme modules in filename order and writes:

- `Stuudium-Intentional-Dark.user.css`, wrapped in the Stylus-compatible
  `@-moz-document` block.
- `src/generated/theme.css`, with selectors gated by the extension's root
  activation attribute.

Check that the committed compatibility output exactly matches the modules:

```sh
npm run check:theme
```

This command does not rewrite files. It exits with an error if either generated
file is missing or stale. Commit the canonical module and the regenerated
root-level `.user.css`; do not commit the ignored extension-only generated CSS.

## 14. Run every project check

Run individual checks while working:

```sh
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:watch
npm run check:theme
npm run build
npm run validate:build
npm run package
```

What they do:

- `format` rewrites supported source and documentation to the project's
  Prettier format.
- `format:check` checks formatting without changing files.
- `lint` finds unsafe, unclear, or unused JavaScript/TypeScript patterns.
- `typecheck` checks TypeScript without emitting another build.
- `test` runs the automated test suite once.
- `test:watch` reruns relevant tests while files change; press `Control+C` to
  stop it.
- `check:theme` proves the generated userstyle and extension CSS match the
  canonical modules.
- `build` makes the unpacked production extension.
- `validate:build` checks the generated manifest, permission boundary, CSS
  gating, and file contents. Run `build` first.
- `package` rebuilds, creates the release ZIP, and verifies that the ZIP contains
  exactly the intended extension files.

Before handing work to someone else, run the combined check:

```sh
npm run validate
```

It runs theme reproducibility, formatting, linting, type checking, tests,
production build, and manifest/build validation in a fixed order. Then run:

```sh
npm run package
git diff --check
git status --short
```

`git diff --check` catches whitespace errors. `git status --short` shows every
tracked modification and new file so unrelated work is not included by
accident.

## 15. Remove the development extension

1. Stop `npm run dev` with `Control+C`.
2. Open `chrome://extensions` or `brave://extensions`.
3. Find **TORG Stuudium Enhancement** and select **Remove**.
4. Confirm removal.
5. Refresh open Stuudium tabs. Browser-managed extension CSS and scripts are no
   longer loaded.

Removing the unpacked extension also removes its local extension storage. It
does not remove the repository or the separately installed Stylus userstyle.

## Troubleshooting

### “Cannot find package” or a missing WXT type

Run `npm ci`. Make sure the terminal is in the folder containing `package.json`.

### npm reports an unsupported Node.js engine

Install Node.js 22.13.0 or newer, reopen the terminal, and rerun `node --version`
and `npm ci`.

### “Unable to find a random port on host localhost”

Another process or a restricted environment prevented WXT's local hot-reload
server from opening. Stop old `npm run dev` processes, allow local connections
in the firewall, or use `npm run build` and the production folder instead.

### The browser says the manifest is missing

Run `npm run build`, then choose `.output/chrome-mv3` itself in **Load
unpacked**. Do not choose the ZIP or its parent directory.

### A source change has no visible effect

Wait for the build to finish, reload the extension card, and refresh the web
page. Confirm that you loaded the same development or production folder that
the current command writes:

| Running command | Browser must show **Loaded from** |
| --------------- | --------------------------------- |
| `npm run dev`   | `.output/chrome-mv3-dev`          |
| `npm run build` | `.output/chrome-mv3`              |

These are separate unpacked extension instances. If both are installed, disable
the one that is not under test.

### “Extension context invalidated” after reloading the extension

Reloading or disabling an extension invalidates the code that was already
running in open pages. The bootstrap cleans up its activation marker and owned
menu button when WXT detects this state, but Chromium does not inject the newly
loaded code into an existing tab. Refresh the Stuudium page after every
extension reload or re-enable. If the message remains after that refresh, clear
the extension's old Errors entries and reproduce it once before debugging.

### The page looks too dark or rules appear twice

The Stylus userstyle and extension are probably both enabled. Disable one and
refresh before comparing them.

### The in-page settings button is missing

Refresh the authenticated TORG page and open the main top navigation hamburger
menu. The shortcut remains available when the dark theme is disabled, but it is
not injected on unsupported origins. The toolbar icon and **Extension options**
remain available as a fallback.

### Settings do not persist

Inspect the settings-page and service-worker consoles. Confirm that `storage`
is present, with `scripting`, in the generated manifest and that no other copy
of the unpacked extension is being tested.

### A build works but the store ZIP does not

Run `npm run package`. Its final validator reads the ZIP directory directly and
rejects missing build files, source maps, source directories, documentation,
dependencies, or environment files.
