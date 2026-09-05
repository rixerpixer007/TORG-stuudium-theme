# Chrome Web Store listing — TORG Stuudium Enhancement

> Last updated: 2026-09-05
>
> Status: Phase 2 draft. Do not submit until every owner-required field and asset below is complete.

This file is the copy-and-review source for the Chrome Web Store dashboard. The complete release procedure, account requirements, and rollback guidance are in
[`docs/EXTENSION_PUBLISHING.md`](docs/EXTENSION_PUBLISHING.md).

## Store listing

**Extension name**

TORG Stuudium Enhancement

**Short description**

Adds selectable Intentional Dark themes and local settings to TORG Stuudium.

**Detailed description**

TORG Stuudium Enhancement gives the genuine TORG Stuudium website a consistent dark appearance with selectable graphite-mint and cool-slate-blue palettes.

FEATURES
• Applies the Intentional Dark appearance across supported TORG Stuudium pages.
• Adds a matching settings shortcut to Stuudium’s main menu.
• Remembers a choice of Graphite Mint or Graphite Blue.
• Provides a local switch for enabling or disabling the complete enhancement.

HOW TO USE

1. Install the extension and open TORG Stuudium.
2. Use Stuudium normally; the dark appearance is enabled by default.
3. Open the extension from the toolbar or select “Teema seaded” in Stuudium’s main menu to choose a palette or change the master setting.

PRIVACY
The extension stores only its local enabled/disabled and selected-theme preferences. It does not collect or transmit analytics, browsing history, grades, attendance, messages, credentials, cookies, page contents, or other student information.

PERMISSIONS
• Access to torg.ope.ee lets the extension apply its appearance and settings shortcut only on the supported school website.
• Local storage keeps the enabled/disabled and selected-theme preferences on this device.
• Script registration lets that preference take effect at the beginning of a supported page load.

SUPPORT
[OWNER REQUIRED: add the approved public support URL or monitored contact address.]

Version 0.1.0 — Initial selectable dark themes and local settings.

**Category**

Productivity — provisional; the owner must confirm the categories currently offered by the dashboard before submission.

**Single purpose**

Improve the local appearance and usability of the genuine TORG Stuudium website.

**Primary language**

English — provisional. Add Estonian localization only when both listings can be maintained accurately.

## Graphics and assets

| Asset                  | Required dimensions  | Status                               | Planned content                                                 |
| ---------------------- | -------------------- | ------------------------------------ | --------------------------------------------------------------- |
| Store icon             | 128×128 PNG          | Owner approval and creation required | Final approved project mark; no Stuudium logo unless authorized |
| Screenshot 1           | 1280×800 or 640×400  | Not created                          | Themed settings page with no student information                |
| Screenshot 2           | 1280×800 or 640×400  | Not created                          | Sanitized or demonstration TORG dashboard                       |
| Screenshot 3           | 1280×800 or 640×400  | Optional                             | Sanitized responsive view                                       |
| Small promotional tile | 440×280 PNG or JPEG  | Not created                          | Approved project branding                                       |
| Marquee image          | 1400×560 PNG or JPEG | Optional                             | Approved project branding                                       |

Create separate 16×16, 32×32, 48×48, and 128×128 PNG extension icons after branding approval. Every screenshot must avoid names, grades, attendance, messages, schedules, class membership, authentication details, and other student data.

## Permissions justification

| Manifest item           | Type            | Store-facing justification                                                                                                  |
| ----------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `storage`               | Permission      | Saves only the user’s local enabled/disabled and selected-theme preferences so they persist between browser sessions.       |
| `scripting`             | Permission      | Registers or removes the early activation marker so the saved preference is honored from the start of supported page loads. |
| `https://torg.ope.ee/*` | Host permission | Applies the dark appearance and local settings shortcut only to the verified TORG Stuudium website.                         |

No tabs, browsing-history, cookies, downloads, geolocation, identity, or broad all-sites permission is requested.

## Privacy and data use

**Does the extension collect user data?** No.

The extension stores one functional preference object locally on the device:

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

This preference is not transmitted off-device or shared. The extension does not include analytics, telemetry, advertising, remote executable code, or a developer-operated server.

- [x] Data is not sold to third parties.
- [x] Data is not used for purposes unrelated to the extension’s single purpose.
- [x] Data is not used for creditworthiness or lending purposes.

The code recognizes supported routes and the navigation location used for its settings shortcut, but it does not copy, persist, log, or transmit Stuudium page contents.

## Privacy policy

**Public privacy-policy URL:** [OWNER REQUIRED]

The published policy must match the source and dashboard answers. It must state what the local preference is, that no school or authentication data is collected or transmitted, how uninstalling removes extension-local storage, and how to contact the maintainer. Verify that the final URL is public and not behind a login before submission.

## Distribution

- Initial store: Chrome Web Store.
- Initial browsers: Google Chrome and Brave.
- Visibility: [OWNER REQUIRED — choose public, unlisted, or a tester-only release deliberately.]
- Regions: [OWNER REQUIRED.]
- Optional later channel: Microsoft Edge Add-ons, only after Edge-specific live testing.

## Developer information

- Publisher name: [OWNER REQUIRED]
- Verified contact email: [OWNER REQUIRED]
- Support URL or email: [OWNER REQUIRED]
- Homepage URL: [OWNER REQUIRED]

Never place store credentials, payment information, recovery codes, identity documents, tokens, or signing keys in this file or repository.

## Version history

| Version | Date       | Changes                                                                                         | Status |
| ------- | ---------- | ----------------------------------------------------------------------------------------------- | ------ |
| 0.1.0   | 2026-09-05 | Initial Manifest V3 delivery, Mint/Blue selection, local settings, and compatibility userstyle. | Draft  |

## Review notes

### Known limitations before submission

- Final icons, listing images, public support details, and privacy-policy URL are not yet approved or created.
- Only `https://torg.ope.ee/*` is supported; other `ope.ee` schools are intentionally not pre-authorized.
- Automatic system-following and light themes are not included in Phase 2.
- Chromium requires an open Stuudium page to be refreshed after an unpacked extension is reloaded or re-enabled during development.
- Chrome and Brave live checks must be complete on the exact production package before submission.

### Rejection history

None. No store submission has been made.
