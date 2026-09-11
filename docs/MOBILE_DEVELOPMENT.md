# Android prototype development

This guide starts from a Mac that has never built an Android application. It
covers the Phase 4 feasibility prototype: a native Kotlin shell around the
genuine TORG Stuudium site. The prototype is not a published or signed public
release.

## What the prototype does

The Android app contains two deliberately separate WebViews:

1. The main WebView loads `https://torg.ope.ee/`. Stuudium owns the page,
   authentication, cookies, and student information.
2. The settings WebView loads only files bundled inside the APK under Android's
   reserved `https://appassets.androidplatform.net/` origin.

The app injects the same generated CSS and shared TypeScript feature bundle used
by the desktop extension. It stores only the enable/disable choice and selected
theme. It does not copy grades, attendance, messages, credentials, page HTML, or
cookies into the app's preference storage. Cloud backup and device-to-device
transfer are disabled for all app data so the WebView login session is not
migrated outside the device.

The full-screen native loading surface covers only the first cold page load and
an explicit recovery retry. During ordinary navigation between Stuudium pages,
the existing WebView remains visible while WebView prepares the next document.
The launch cover is removed at `onPageCommitVisible`, Android's callback for the
point where content from the previous navigation will no longer be drawn. This
avoids flashing the launch surface during quick Tera, Suhtlus, and other
same-origin transitions.

At the top of a Stuudium page, pulling downward uses Android's native
swipe-to-refresh indicator and reloads the current allowed Stuudium URL. The
gesture remains owned by the WebView while the page can still scroll upward,
and the indicator stops when the refreshed page finishes or fails to load.

## 1. Install Android Studio on macOS

Download the current stable Android Studio from the
[official installation page](https://developer.android.com/studio/install). On
an Apple Silicon Mac, select **Mac with Apple chip**.

1. Open the downloaded `.dmg` file.
2. Drag **Android Studio** into **Applications**.
3. Launch Android Studio.
4. Choose the standard or recommended setup in the Setup Wizard.
5. Allow the wizard to download the Android SDK and platform tools.

Android Studio includes the Java runtime used by this project. Do not install a
separate Java package merely for this repository.

Open **Tools → SDK Manager** and verify these components:

- **SDK Platforms:** Android 17 / API 37.
- **SDK Tools:** Android SDK Build-Tools, Android SDK Platform-Tools, and Android
  SDK Command-line Tools (latest).
- **Android Emulator:** optional. The physical Samsung S25 is the primary
  prototype device, but an emulator is useful for Android 8 and Android 10
  compatibility checks later.

The exact latest tool revision can change. Recheck the official Android Studio
and [Android 17 SDK setup](https://developer.android.com/about/versions/17/setup-sdk)
pages before upgrading the project's pinned build versions.

## 2. Install the repository dependencies

From the repository root, run:

```sh
npm ci
```

`npm ci` installs exactly the Node packages recorded in `package-lock.json`,
regenerates the theme outputs, and prepares the desktop extension. It does not
install anything on the phone.

Verify that the Android tools can be found:

```sh
npm run build:mobile:web
npm run build:android:debug
```

The first command bundles the shared CSS, JavaScript, settings page, theme
catalog, default preferences, and exact supported-origin registry for Android.
The second command repeats that asset build, lets the Gradle Wrapper download
the pinned Android build dependencies, and creates a debug APK.

The helper script automatically finds Android Studio's bundled Java runtime and
the normal macOS SDK location. If it cannot, complete the Android Studio Setup
Wizard before retrying.

## 3. Understand the mobile files

```text
apps/android/
|-- app/build.gradle.kts                 Android version, SDK, and dependencies
|-- app/src/main/AndroidManifest.xml     App components and INTERNET permission
|-- app/src/main/java/.../
|   |-- MainActivity.kt                  Genuine Stuudium WebView shell
|   |-- SettingsActivity.kt              Bundled settings WebView shell
|   |-- MobileConfig.kt                  Generated shared catalog reader
|   |-- AppPreferences.kt                Preference-only native storage
|   |-- NavigationPresentationPolicy.kt  Cold-start loading-cover boundary
|   |-- SupportedOriginPolicy.kt         Exact HTTPS origin checks
|   `-- WebViewRuntime.kt                Secure setup and early asset injection
|-- app/src/main/res/                    Layout, launch surface, icon, and colors
|-- gradle/wrapper/                      Pinned, reproducible Gradle launcher
`-- gradlew                              macOS/Linux Gradle Wrapper command

src/mobile/entrypoints/bootstrap.ts      Shared DOM runtime for Stuudium
src/mobile/entrypoints/settings.ts       Mobile adapter for the shared settings UI
src/mobile/entrypoints/config.ts         Shared catalog exported for Kotlin
src/mobile/platform.css                  Android-only touch presentation
src/platforms/webview/                   WebView-facing TypeScript adapters
scripts/build-mobile-assets.mjs          Deterministic mobile web-asset generator
scripts/validate-mobile-assets.mjs       Generated-asset security checks
```

The generated directory
`apps/android/app/src/main/assets/mobile/` is intentionally ignored by Git. Do
not edit it. Regenerate it from the canonical sources.

The generated configuration comes directly from `src/shared/sites.ts`,
`src/shared/themes.ts`, and `src/shared/settings.ts`. Adding a future verified
school or theme therefore updates Android and the extension from the same source
instead of creating a second mobile catalog.

## 4. How the security boundary works

AndroidX injects the bundled script at document start only for exact origins
from the shared registry. The app checks support for both document-start scripts
and origin-aware web messages before it loads Stuudium. The relevant APIs are
documented under
[`WebViewCompat`](https://developer.android.com/reference/androidx/webkit/WebViewCompat).

The remote Stuudium main frame can send exactly one recognized message:
`open-settings`. It cannot read preferences or invoke arbitrary Android methods.
Only the bundled settings origin can send `get-settings` and `set-settings`
messages. Every message is checked for its origin and whether it came from the
main frame.

The implementation does not use the legacy `addJavascriptInterface` API. Android
warns that the legacy interface is exposed to every frame and lacks reliable
origin verification; see
[Access native APIs with a JavaScript bridge](https://developer.android.com/develop/ui/views/layout/webapps/native-api-access-jsbridge).

Top-level links outside the approved Stuudium origin open in the system browser.
Cross-origin subframes remain separate and do not receive the theme or native
bridge.

## 5. Build and validate the bundled web assets

```sh
npm run build:mobile:web
```

This command first regenerates the compatibility userstyle and extension CSS.
It then creates:

- the document-start mobile bootstrap;
- critical and complete theme CSS;
- the shared settings page;
- the theme and supported-site configuration;
- SHA-256 hashes for every generated mobile web asset.

Check that a second clean generation is byte-for-byte identical:

```sh
npm run check:mobile:web
```

Inspect the security rules and asset hashes:

```sh
npm run validate:mobile:web
```

Validation rejects source maps, TypeScript source files, development startup
scripts, localhost references, remote settings-page scripts, wildcard origins,
and accidental WebExtension API dependencies in the mobile bootstrap.

## 6. Build the debug APK

```sh
npm run build:android:debug
```

The APK is written to:

```text
apps/android/app/build/outputs/apk/debug/app-debug.apk
```

This is signed automatically with a local debug key and is suitable only for
development. No public release key or store credential belongs in this
repository.

To run the complete Android validation in one command:

```sh
npm run validate:android
```

It regenerates and validates the shared mobile assets, runs Android lint and
the Kotlin unit tests, and assembles the debug APK.

### Build a signed release APK

Keep the permanent keystore outside the repository. Supply its path, alias, and
passwords only in the shell that performs the build:

```sh
export SINU_STUUDIUM_KEYSTORE_PATH="/absolute/path/to/sinu-stuudium-release.p12"
export SINU_STUUDIUM_KEY_ALIAS="sinu-stuudium-release"
export SINU_STUUDIUM_KEYSTORE_PASSWORD="..."
export SINU_STUUDIUM_KEY_PASSWORD="..."
npm run build:android:release
unset SINU_STUUDIUM_KEYSTORE_PASSWORD SINU_STUUDIUM_KEY_PASSWORD
```

Do not place literal passwords in a committed script, Gradle file, shell-history
example, issue, or build log. The release command fails before assembly when the
required signing values are absent. Its output is:

```text
apps/android/app/build/outputs/apk/release/app-release.apk
```

The first published signing certificate is permanent for direct APK updates.
Back up its keystore and credentials separately before publishing.

## 7. Open the existing project in Android Studio

1. Launch Android Studio.
2. Select **Open**.
3. Choose the repository's `apps/android` folder, not the repository root and
   not the `app` subfolder.
4. Wait for **Gradle sync** and indexing to finish.
5. If Android Studio asks whether to trust the project, verify the path and then
   trust this local checkout.

Run `npm run build:mobile:web` before pressing Android Studio's Run button after
changing shared TypeScript or CSS. The Android build deliberately fails with a
clear message if the generated asset manifest is absent.

## 8. Prepare the Samsung S25

These settings affect only development access and can be turned off afterward:

1. On the phone, open **Settings → About phone → Software information**.
2. Tap **Build number** seven times and confirm the phone PIN.
3. Return to Settings and open **Developer options**.
4. Enable **USB debugging**.
5. Connect the phone to the Mac with a data-capable USB cable.
6. Unlock the phone and approve the **Allow USB debugging?** fingerprint dialog.
   Selecting **Always allow from this computer** is optional.

Check the connection from Terminal:

```sh
~/Library/Android/sdk/platform-tools/adb devices -l
```

The phone should be listed as `device`. `unauthorized` means the confirmation
dialog is still waiting on the phone. An empty list usually means the cable is
charge-only or USB debugging is disabled.

## 9. Install and run the prototype

In Android Studio, select the Samsung device in the device menu and press the
green **Run** button.

Or install the already-built APK from Terminal:

```sh
~/Library/Android/sdk/platform-tools/adb install -r apps/android/app/build/outputs/apk/debug/app-debug.apk
```

`install -r` keeps the app's existing preferences and WebView session while
replacing the debug APK. It does not alter the normal Chrome browser's cookies.

The approved application ID is `io.github.rixerpixer007.stuudium`. It must stay
unchanged after the first signed public release so later versions can be
installed as normal Android updates.

## 10. Inspect Android and WebView errors

### Native Kotlin errors

In Android Studio, open **View → Tool Windows → Logcat**, select the Samsung
device and this app process, then reproduce the problem. Do not paste logs that
contain student page content, credentials, cookies, or authentication URLs with
sensitive query values.

From Terminal, the equivalent filtered stream is:

```sh
~/Library/Android/sdk/platform-tools/adb logcat --pid=$(~/Library/Android/sdk/platform-tools/adb shell pidof io.github.rixerpixer007.stuudium)
```

Stop it with `Control+C`.

### WebView HTML, CSS, and JavaScript errors

Debug builds enable WebView inspection. With the phone connected and the app
open, visit `chrome://inspect/#devices` in desktop Chrome. Under the app's
WebView, select **inspect**. Use the Console, Elements, Network, and Computed
panels just as you would for a normal browser tab.

Confirm that `<html>` has:

- `data-sid-enhancement="enabled"` when the enhancement is on;
- either `data-sid-theme="graphite-mint"` or
  `data-sid-theme="graphite-blue"`;
- style elements named `sid-mobile-critical`, `sid-mobile-theme`, and
  `sid-mobile-settings-menu`.

Production builds must not enable WebView debugging.

## 11. Prototype verification checklist

Use a real existing Stuudium account, but never copy its credentials into source
code, test files, screenshots, logs, or issue descriptions.

Test at minimum:

1. Fresh launch while signed out and the complete login flow.
2. Closing and reopening the app after login to check session persistence.
3. Dashboard, a subject/journal page, Tera, Suhtlus, applications, and settings.
4. Portrait and landscape orientation.
5. Text entry with the on-screen keyboard visible.
6. Android back gesture through WebView history, then app exit.
7. A normal internal Stuudium link and a client-side navigation.
8. A foreign top-level link, which must open outside the app.
9. A file-upload control, including cancellation.
10. A download link. The prototype currently hands downloads to the system
    browser; confirm whether authenticated Stuudium downloads survive that
    boundary before designing a native download adapter.
11. Embedded Tera or Office content as a cross-origin negative control. It must
    render normally without receiving the theme or native message objects.
12. Open **Teema seaded**, select Mint and Blue, disable and re-enable the
    enhancement, close settings, reload, and restart the app.
13. Cold-start both themes while watching specifically for a white, Mint, Blue,
    or black flash.
14. Check Logcat and both WebView consoles for errors.

The first physical-device run is a feasibility test, not permission to change
attendance, grades, messages, registrations, or other live Stuudium data.

## 12. Android 8 compatibility policy

The project currently declares `minSdk = 26`, which means Android 8.0. AndroidX
WebKit itself supports this baseline. The crucial document-start and
origin-aware message capabilities depend on the separately updated Android
System WebView provider, so the app feature-detects them at runtime.

If those capabilities are missing, the app asks the user to update Android
System WebView or Chrome and closes. It does not install a large late-injection
fallback that would weaken origin isolation or reintroduce startup flashing.

Before public distribution, test an Android 8 emulator with a maintained WebView.
If ordinary Android 8 platform behavior still requires a disproportionate
workaround, raise `minSdk` to Android 10 as agreed and document the exact failing
behavior.

## 13. Make a future shared feature

Keep reusable policy and DOM behavior in `src/shared/` or `src/features/`.
Those modules must not import Android, Chrome, WXT, or iOS APIs.

Platform code should remain small:

- TypeScript under `src/platforms/webview/` translates a narrow WebView message
  into a shared interface.
- Kotlin under `apps/android/` owns Android lifecycle, navigation, and storage.
- A future Swift shell can implement the same boundaries for WKWebView while
  reusing the generated web assets.

Do not add a general bridge because a future feature might need it. Add one
validated command only when that feature has a specific native requirement.

## 14. GitHub update notification

The Android shell checks for a new public version after the first Stuudium page
becomes visible. It performs this check at most once every 24 hours, never blocks
startup, and remains silent when the device is offline or the update metadata is
unavailable. When a higher numeric `versionCode` is published, the app shows a
native **Later** / **View update** dialog. **View update** opens the allowlisted
GitHub Releases page in the system browser; the app does not download or install
packages itself and therefore does not request package-install or storage
permissions.

The metadata source is the small machine-readable `release/android.json` file,
served directly from the public repository at:

```text
https://raw.githubusercontent.com/rixerpixer007/TORG-stuudium-theme/main/release/android.json
```

This does not require GitHub Pages and does not publish the development
documentation as a website. Until the first signed public release, the
checked-in file deliberately contains `"published": false`, so installed builds
do not advertise a nonexistent APK.

Android betas may be marked as GitHub prereleases. The updater reads this
explicit metadata rather than GitHub's `releases/latest` endpoint, which omits
prereleases.

For a real release, publish metadata in this shape:

```json
{
  "schemaVersion": 1,
  "published": true,
  "versionCode": 2,
  "versionName": "0.1.1-beta",
  "releaseUrl": "https://github.com/rixerpixer007/TORG-stuudium-theme/releases/tag/android-v0.1.1-beta",
  "sha256": "the-lowercase-64-character-sha256-of-the-signed-apk"
}
```

Release in this order so users are never directed to an incomplete download:

1. Increment `versionCode` and update the human-facing `versionName`.
2. Build, sign, and validate the release APK with the permanent release key.
3. Create the GitHub Release and upload the signed APK, checksum, and notes.
4. Download the uploaded APK and confirm its application ID, version, signing
   certificate, and SHA-256 digest.
5. Change `published` to `true`, copy the exact values and release URL into the
   metadata file, and deploy that small metadata change last.

The update checker accepts only HTTPS release URLs under this repository's
`/releases` path, validates the manifest schema and checksum shape, and compares
numeric version codes rather than version-name strings. The remote file cannot
inject scripts or change app behavior.

The first release-signed APK cannot normally update an installed debug APK,
because their signing certificates differ. Uninstall the debug build once, then
install the first public APK. Later public APKs will update it normally as long
as `io.github.rixerpixer007.stuudium`, the release signing identity, and the
increasing version-code sequence remain unchanged.

Test the complete browser handoff on Android 16 and the eventual minimum Android
version. Confirm that the system presents **Update**, preserves the WebView
session and preferences, and stops offering the update after installation. Also
test a missing or malformed manifest, offline startup, an equal or lower version
code, a wrong-signature APK, and browsers without unknown-app installation
approval.

## 15. Remove the development app cleanly

Long-press the app icon on the Samsung phone and choose **Uninstall**, or run:

```sh
~/Library/Android/sdk/platform-tools/adb uninstall io.github.rixerpixer007.stuudium
```

Uninstalling removes the prototype's WebView session and stored preferences. It
does not remove or alter the normal Chrome browser's Stuudium session.

After testing, disable **USB debugging** in Developer options if you do not use
it for other development work. You can also choose **Revoke USB debugging
authorizations** to remove the Mac's authorization.

## Troubleshooting

### Android Studio says an SDK is missing

Open **Tools → SDK Manager**, install API 37 and the latest SDK Build-Tools, then
select **File → Sync Project with Gradle Files**.

### Terminal says Java cannot be found

Use the npm commands in this guide. `scripts/run-android-gradle.mjs` locates
Android Studio's bundled Java automatically. Running `./gradlew` directly
requires `JAVA_HOME` to be configured separately.

### The Android build says mobile assets are missing

Run:

```sh
npm run build:mobile:web
```

Then build again. Generated assets are deliberately not committed.

### A source change does not appear on the phone

Rebuild the mobile assets and APK, then reinstall with `adb install -r`. Merely
refreshing Stuudium cannot replace JavaScript or CSS already bundled inside the
installed APK.

### The phone is `unauthorized`

Unlock it and approve the USB debugging dialog. If it never appears, revoke USB
debugging authorizations, reconnect the cable, and approve the new fingerprint.

### The app requests a WebView update

Update **Android System WebView** and **Google Chrome** in Google Play, reboot the
phone if Android requests it, and reopen the app. The prototype deliberately
does not use the unsafe legacy bridge as a fallback.
