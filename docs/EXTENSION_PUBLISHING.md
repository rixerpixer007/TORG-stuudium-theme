# Extension publishing

This is the Phase 1 release guide for the approved distribution plan:

1. Publish first in the **Chrome Web Store** for Google Chrome and Brave users.
2. Document **Microsoft Edge Add-ons** as an optional additional Chromium
   channel; do not open or submit that listing during Phase 1.

No command in this guide publishes automatically. Store registration, identity
or trader declarations, listing approval, payment, upload, and final submission
must be performed by the project owner in the relevant store dashboard.

The dashboard-ready draft text, permission justifications, asset status, and
owner-required fields are tracked in [`CHROMEWEBSTORE.md`](../CHROMEWEBSTORE.md).
Review that file together with this guide before every submission or update.

Store forms and policies change. Items marked **RECHECK BEFORE PUBLISH** were
verified against official documentation on 2026-09-04 but must be checked again
immediately before a real submission.

## What is and is not release-ready in Phase 1

The build is a valid local Manifest V3 extension and produces a validated ZIP.
Before the first public submission, the owner must still approve branding,
create final PNG icons and listing images, choose public support/privacy URLs,
and complete the store account. Do not upload a placeholder icon or a screenshot
that exposes student information.

The extension's single purpose is:

> Improve the appearance and local usability of TORG Stuudium while the user
> continues to use the genuine Stuudium site.

Phase 1 applies the existing Intentional Dark theme and provides a local master
enable setting. It does not proxy Stuudium, collect analytics, execute remote
code, or store student data.

## 1. Create and secure the Chrome Web Store account

These are owner-only steps and cannot be completed from the repository.

1. Choose a Google Account controlled for the long term. Google recommends a
   dedicated, frequently monitored publisher account because its email address
   cannot simply be changed later.
2. Enable 2-Step Verification on that Google Account. It is required to publish
   or update extensions.
3. Open the [Chrome Web Store Developer
   Dashboard](https://chrome.google.com/webstore/devconsole), accept the
   agreement, and register as a developer. Google's
   [registration guide](https://developer.chrome.com/docs/webstore/register/)
   says a one-time registration fee is required.
4. **RECHECK BEFORE PUBLISH:** the fee is currently US$5. Google reserves the
   right to set the amount, so trust the amount and supported payment methods
   shown by the dashboard at registration time.
5. Complete the [developer account
   setup](https://developer.chrome.com/docs/webstore/set-up-account): choose the
   publisher name, add a monitored contact email, and verify that email using
   the link Google sends.
6. Declare whether the publisher is a trader or non-trader. Every publisher must
   make this declaration; Google cannot decide the legal classification for
   the owner. EU publishers should review the current
   [trader verification FAQ](https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq).
7. Complete any identity, payment-profile, address, phone, or trader verification
   the dashboard requests. Requirements depend on account type, location, and
   trader status. Use truthful owner or organization information.

Never put the Google password, recovery codes, payment details, OAuth tokens,
store keys, or signing keys in this repository, an issue, a CI log, or an npm
environment file.

## 2. Prepare the listing material

Chrome's [listing editor reference](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
and [listing requirements](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements)
are the source of truth. Prepare and have the owner approve all of the following
before upload.

### Text

- **Name:** `TORG Stuudium Enhancement`, unless the owner approves a final public
  product name. The manifest and listing must agree.
- **Short description:** at most 132 characters. A suitable Phase 1 draft is:
  `Applies Intentional Dark and local enhancement settings to TORG Stuudium.`
- **Detailed description:** explain the single purpose, that it works only on
  TORG Stuudium, how to open settings, what is stored locally, and the exact
  permissions. Do not advertise Phase 2 theme switching before it exists.
- **Primary language:** choose the language actually used by the listing. Add
  localized Estonian/English listing text only when both are maintained.
- **Category:** choose the closest current dashboard category after reviewing
  the available list; do not choose a misleading category for visibility.

Keep all claims factual. Do not call the extension official unless Stuudium and
the school have explicitly authorized that claim.

### Images and icons

Chrome's [image requirements](https://developer.chrome.com/docs/webstore/images)
currently require:

- A 128×128 PNG extension icon in the uploaded extension package. For a square
  icon, Google recommends 96×96 artwork with 16 transparent pixels on every
  side.
- At least one screenshot, up to five, at 1280×800 or 640×400 pixels. 1280×800
  is preferred.
- A 440×280 PNG or JPEG small promotional tile.
- A 1400×560 marquee image and a YouTube demonstration video are optional for
  ordinary publication but can improve the listing.

Prepare matching 16×16, 32×32, 48×48, and 128×128 PNG icons for browser UI and
the manifest. Add them to a deliberate `public/icons/` source set and configure
them in `wxt.config.ts`; then rebuild and verify that the 128×128 file is in the
ZIP. This is not done in Phase 1 because final branding has not been approved.

Screenshots must show the real current extension experience without exposing a
student's name, grades, attendance, messages, schedule, class membership,
authentication state, or other private school data. Prefer the extension's
settings page and a purpose-built, non-sensitive demonstration account or
fixture. Cropping or blurring after capture is less reliable than avoiding
sensitive data at capture time.

### URLs and support ownership

Prepare public HTTPS URLs for:

- A homepage explaining the project and linking to its source or releases.
- A support page or monitored issue tracker that users can access without school
  credentials.
- A privacy policy that states exactly what is processed and stored.

The privacy policy should say, in plain language:

- The extension runs only on `https://torg.ope.ee/*`.
- It changes presentation locally in the browser.
- It stores only the local `enhancementEnabled` preference.
- It does not collect, transmit, sell, or share analytics, browsing history,
  grades, attendance, messages, page contents, credentials, cookies, or other
  student information.
- It has no developer-operated server and no remote executable code.
- Uninstalling the extension removes its extension-local preference.
- How to contact the maintainer about privacy or support.

Chrome's [user-data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
requires accurate disclosure even when information is processed or stored only
on the user's device. **RECHECK BEFORE PUBLISH:** verify whether the current
dashboard requires a privacy-policy URL for this exact declared data handling;
providing a clear public policy is recommended regardless.

## 3. Prepare the privacy and permission answers

The dashboard's Privacy practices tab asks for the single purpose, permission
justifications, data handling, and remote-code declaration. Follow the current
[privacy-fields guide](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

Use these project-specific explanations as drafts:

| Manifest item           | Reason                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| `storage`               | Saves only the user's local master enable/disable preference.                                               |
| `scripting`             | Registers or removes the tiny early activation marker so the saved preference is applied at document start. |
| `https://torg.ope.ee/*` | Injects the theme and local settings shortcut only on the verified TORG Stuudium origin.                    |

Declare **No remote code**. Every executable file is bundled in the ZIP; the
extension does not use `eval`, download code, or run logic supplied by a remote
server. Manifest V3's bundled-code model is explained in
[What is Manifest V3?](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3).

Do not declare data collection that does not occur, but do not hide local
processing either. The extension checks the current URL and a few navigation
elements to recognize supported routes and place its settings button. It does
not copy, persist, log, or transmit page content.

Before each release, compare these answers with the actual source and generated
manifest. If a future feature changes data handling or permissions, update the
code, policy, and disclosures together before submission.

## 4. Choose and update the version

The source of the extension version is the top-level `version` in
`package.json`. WXT writes it into the generated manifest and artifact name.

Use three numeric parts for this project:

- Patch, such as `0.1.0` to `0.1.1`: compatible fixes or documentation/build
  corrections.
- Minor, such as `0.1.0` to `0.2.0`: a backward-compatible feature.
- Major, such as `0.9.0` to `1.0.0`: the first stable public contract or a later
  intentionally breaking change.

Every ZIP uploaded for an existing store item must have a version greater than
the store's last uploaded version. Chrome versions use one to four dot-separated
integers; do not add labels such as `-beta` to the manifest version. Review the
current [manifest version
format](https://developer.chrome.com/docs/extensions/reference/manifest/version)
before changing conventions.

Update the version with npm so `package.json` and `package-lock.json` stay in
sync:

```sh
npm version 0.1.1 --no-git-tag-version
```

This edits the two version fields but deliberately creates neither a Git commit
nor a tag. Replace `0.1.1` with the approved release version. Inspect both files
before building.

## 5. Create a reproducible production package

Start from the exact reviewed commit with no unrelated working-tree files. A
release maintainer should clone that revision into a fresh directory, then run:

```sh
npm ci
npm run validate
npm run package
git diff --check
git status --short
```

- `npm ci` installs exactly `package-lock.json`.
- `npm run validate` checks formatting, lint, types, tests, generated theme
  reproducibility, the production build, manifest, permissions, and CSS gate.
- `npm run package` rebuilds, makes a maximum-compression ZIP, and rejects any
  unexpected or missing file in it.
- The Git commands expose whitespace problems and unreviewed changes.

For version 0.1.0, upload exactly:

```text
.output/torg-stuudium-enhancement-0.1.0-chrome.zip
```

For a later version, the middle number changes to match `package.json`. Never
upload the repository ZIP from GitHub, `.output/chrome-mv3`,
`Stuudium-Intentional-Dark.user.css`, or the `-sources.zip` artifact WXT may
produce for other workflows.

The project validator checks the ZIP directory itself and requires it to match
the production build exactly. For a human-readable second inspection:

```sh
unzip -l .output/torg-stuudium-enhancement-0.1.0-chrome.zip
```

Confirm that `manifest.json` is at the ZIP root and that the archive contains
only built HTML, CSS, and JavaScript. It must not contain:

- `src/`, `tests/`, `scripts/`, `docs/`, or `node_modules/`;
- `.git`, `.env*`, credentials, cookies, store tokens, or signing keys;
- source maps (`*.map`);
- unrelated screenshots, fixtures, or private Stuudium data.

Also load the production folder `.output/chrome-mv3` in a dedicated Chrome and
Brave profile and complete the live checklist in
[EXTENSION_DEVELOPMENT.md](EXTENSION_DEVELOPMENT.md) before uploading.

## 6. Submit the first Chrome Web Store version

Google's current end-to-end instructions are in
[Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish/)
and [Prepare your extension](https://developer.chrome.com/docs/webstore/prepare).

1. Sign in to the Chrome Web Store Developer Dashboard with the owner account.
2. Select **Add new item**.
3. Choose the generated release ZIP above and upload it.
4. Complete the **Store listing** tab with the approved description, language,
   category, icons, screenshots, promotional tile, homepage, and support URL.
5. Complete **Privacy practices** using the reviewed declarations above and add
   the public privacy-policy URL if requested.
6. Choose distribution visibility and regions. Use public visibility only when
   the release is genuinely ready for anyone; trusted testers are safer for a
   store-hosted pre-release.
7. Save every tab and resolve all dashboard warnings.
8. Re-read the generated manifest shown by the dashboard. Host permission must
   still be only `https://torg.ope.ee/*`; permissions must still be only
   `storage` and `scripting`.
9. Prefer **deferred/manual publish** for the first release if the current
   dashboard offers it. That allows one final approval after review rather than
   publishing immediately on approval.
10. Select **Submit for review**. This is the external side effect that starts
    store review; do it only with explicit owner approval.

## 7. Review and publication

All submissions receive automated review and some receive manual review.
Google's [review-process guide](https://developer.chrome.com/docs/webstore/review-process)
says most reviews finish within a few days but some can take weeks. New
publishers, new extensions, broader permissions, sensitive permissions, and
hard-to-review code can take longer. This project deliberately avoids broad
host access.

Watch the dashboard and the verified publisher email. The status can be
Pending, Published, Rejected, or Taken Down; see
[Check review status](https://developer.chrome.com/docs/webstore/check-review).
Do not promise a launch date until review is complete.

After approval:

- With automatic publication, the approved version becomes available without a
  separate owner action.
- With deferred publication, an authorized owner must select the publish action
  in the dashboard.
- Chrome users install from the public listing using **Add to Chrome**.
- Brave users open the same Chrome Web Store listing and use **Add to Brave**;
  Brave documents this flow in its
  [extension guide](https://support.brave.com/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave).

Check both installs from the public listing, not just the unpacked build.

## 8. Publish an update

1. Fix or implement the approved change and complete repository review.
2. Increase `package.json` with `npm version ... --no-git-tag-version`.
3. Run the fresh production and live-browser verification above.
4. In the existing store item, upload the newly generated ZIP under the package
   or new-package action.
5. Update listing text, screenshots, privacy statements, support information,
   and permission justifications if behavior changed.
6. Submit the update for review.
7. Use a partial/staged rollout when the dashboard offers it and the change has
   meaningful risk. Increase the percentage only after monitoring support and
   browser checks.

Chrome's current update, rollout, and rollback controls are documented in
[Update your Chrome Web Store item](https://developer.chrome.com/docs/webstore/update).

After publication, existing users normally receive the newer version through
the browser's automatic extension-update process. They do not reinstall it and
their `chrome.storage.local` preference remains. If a new version requests
additional permissions, browsers may disable it pending user approval; avoid
permission expansion unless a released feature truly needs it.

## 9. Handle a rejected submission

Do not create a new store item to bypass a rejection.

1. Read the dashboard notice and publisher email; identify the cited policy and
   affected version.
2. If the finding is correct, make the smallest compliant source or listing
   change. Remove unused permissions rather than merely explaining them.
3. Increase the version if a new ZIP must be uploaded, rebuild from a fresh
   install, inspect it, and resubmit.
4. If the finding is factually wrong, use the item's **Appeal** action and
   provide concise evidence: the relevant source file, manifest permission, and
   accurate data flow. The official
   [review-process guide](https://developer.chrome.com/docs/webstore/review-process)
   explains appeals and support.

When an update is rejected, the previously published version normally remains
the public version unless Google separately takes enforcement action against
it. Verify the actual dashboard state before communicating with users.

## 10. Respond to a broken release

Choose the least disruptive safe response:

1. Confirm the failure in the public store build, not only in source or an
   unpacked extension.
2. If the dashboard offers **Rollback**, roll back to the previous known-good
   package. Google's [update guide](https://developer.chrome.com/docs/webstore/update#rollback)
   documents this as the fastest supported recovery.
3. If rollback is unavailable or the old release is also unsafe, use the
   dashboard's unpublish control to stop new installations while preparing a
   fix. **RECHECK BEFORE ACTION:** confirm current effects on existing users in
   the dashboard/help text before unpublishing.
4. Prepare a higher-version hotfix from the known-good source, run all automated
   and live checks, and submit it for review.
5. Update the support page with the affected versions, safe workaround, and
   recovery status without disclosing student data.

Never attempt to “hot patch” a release by downloading or executing remote code.
Never publish an unreviewed permission expansion as a shortcut.

## 11. Optional Microsoft Edge Add-ons distribution

This is documentation only for Phase 1. Do not create an Edge account or listing
until the owner explicitly chooses to add that channel and the extension has
been tested in Microsoft Edge.

Microsoft's current
[Edge developer registration guide](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/create-dev-account)
requires a personal Microsoft Account (MSA) to enroll in the Edge program in
Partner Center. The owner chooses Individual or Company during enrollment; that
choice cannot simply be changed later. Company registration has a longer
verification process and may require company and approver evidence.

**RECHECK BEFORE REGISTERING:** Microsoft's current new Partner Center
onboarding documentation says there is no developer registration fee. Confirm
the exact flow and terms at registration time. Company publishers must complete
Microsoft's [company verification](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/verify-microsoft-edge-program)
before publishing.

If this channel is approved later:

1. Install Microsoft Edge and load the unpacked production build.
2. Repeat the full live-route, responsive, startup-flash, settings, disable, and
   console checklist in Edge.
3. Confirm every API used by the Chrome build is supported in the chosen Edge
   minimum version.
4. Register and verify the owner account.
5. Follow Microsoft's current
   [publish-an-extension guide](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/publish-extension)
   for listing assets, privacy answers, visibility, ZIP upload, certification,
   publication, and updates.
6. Upload the same reproducible ZIP only if Edge testing confirms it is truly
   identical. Otherwise add a deliberate WXT Edge target and a separately named,
   validated artifact.

Publishing in Edge Add-ons is not necessary for initial Brave users because
Brave can install the Chrome Web Store listing.

## Owner-only checklist

The following cannot be completed until the owner supplies or verifies the
external accounts and public assets:

- Pay the current Chrome Web Store registration fee.
- Enable and verify the publisher's 2-Step Verification, contact email, trader
  declaration, and any required identity/payment profile.
- Approve the public name, icon, screenshots, promotional image, descriptions,
  category, regions, privacy policy, homepage, and support URL.
- Decide between immediate and deferred publication.
- Upload the ZIP, submit it for review, respond to store communication, and
  publish the approved item.
- Optionally create and verify a Microsoft Partner Center account later.

Repository contributors can prepare and validate source and artifacts, but they
must never receive or store these account credentials.
