# Chrome Web Store'i kirje — Sinu Stuudium

> Last updated: 2026-09-10
>
> Status: Phase 2 draft. Do not submit until every owner-required field and asset below is complete.

This file is the copy-and-review source for the Chrome Web Store dashboard. The complete release procedure, account requirements, and rollback guidance are in
[`EXTENSION_PUBLISHING.md`](EXTENSION_PUBLISHING.md).

## Store listing

**Extension name**

Sinu Stuudium

**Short description**

Kohanda TORG Stuudium enda moodi – läbimõeldud tume kujundus ja praktilised täiustused.

**Detailed description**

Sinu Stuudium on TORGi õpilase loodud mitteametlik brauserilaiendus, mis kohandab päris TORG Stuudiumi välimust ja kasutuskogemust. Vali endale sobiv tume kujundus ning kasuta praktilisi täiustusi otse oma brauseris.

OMADUSED
• Läbimõeldud tume kujundus toetatud TORG Stuudiumi lehtedel.
• Valik erinevate tumedate kujunduste vahel.
• Teema seaded otse Stuudiumi peamenüüs.
• Meelde jääv valik ja võimalus kogu täiendus välja lülitada.

KASUTAMINE

1. Paigalda laiendus ja ava TORG Stuudium.
2. Kasuta Stuudiumit tavapäraselt; tume kujundus on vaikimisi sisse lülitatud.
3. Kujunduse valimiseks või täiustuse väljalülitamiseks ava laiendus brauseri tööriistaribalt või vali Stuudiumi peamenüüst „Teema seaded”.

PRIVAATSUS
Sinu kooliandmeid ei koguta ega saadeta arendajale. Sinu Stuudium salvestab ainult vajalikud seaded sinu seadmesse. Sisselogimist ja kooliandmeid töötleb päris Stuudium.

ÕIGUSED
• Juurdepääs aadressile torg.ope.ee võimaldab rakendada kujundust ja seadete otseteed ainult toetatud kooli veebilehel.
• Kohalik salvestusruum hoiab sisse- ja väljalülitamise ning valitud kujunduse eelistusi selles seadmes.
• Skripti registreerimine võimaldab salvestatud valiku rakendada toetatud lehe laadimise alguses.

TUGI
https://github.com/rixerpixer007/TORG-stuudium-theme/issues

Versioon 0.1.0 — esimene avalik beeta.

**Category**

Productivity — provisional; the owner must confirm the categories currently offered by the dashboard before submission.

**Single purpose**

Kohandada päris TORG Stuudiumi kohalikku välimust ja kasutuskogemust.

**Primary language**

Estonian.

## Graphics and assets

| Asset                  | Required dimensions  | Status      | Planned content                                    |
| ---------------------- | -------------------- | ----------- | -------------------------------------------------- |
| Store icon             | 128×128 PNG          | Created     | Approved Sinu Stuudium mark; no Stuudium logo used |
| Screenshot 1           | 1280×800 or 640×400  | Not created | Themed settings page with no student information   |
| Screenshot 2           | 1280×800 or 640×400  | Not created | Sanitized or demonstration TORG dashboard          |
| Screenshot 3           | 1280×800 or 640×400  | Optional    | Sanitized responsive view                          |
| Small promotional tile | 440×280 PNG or JPEG  | Not created | Sinu Stuudium name, tagline, graphite, and mint    |
| Marquee image          | 1400×560 PNG or JPEG | Optional    | Approved project branding                          |

The extension package contains separate 16×16, 32×32, 48×48, and 128×128 PNG icons generated from the approved dark logo. Every screenshot must avoid names, grades, attendance, messages, schedules, class membership, authentication details, and other student data.

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

**Public privacy-policy URL:** `https://github.com/rixerpixer007/TORG-stuudium-theme/blob/main/docs/PRIVACY.md`

The published policy must match the source and dashboard answers. It must state what the local preference is, that no school or authentication data is collected or transmitted, how uninstalling removes extension-local storage, and how to contact the maintainer. Verify that the final URL is public and not behind a login before submission.

## Distribution

- Initial store: Chrome Web Store.
- Browser family: Chrome and other compatible Chromium-based browsers.
- Independently tested before release: Google Chrome and Brave.
- Visibility: [OWNER REQUIRED — choose public, unlisted, or a tester-only release deliberately.]
- Regions: [OWNER REQUIRED.]
- Optional later channel: Microsoft Edge Add-ons, only after Edge-specific live testing.

## Developer information

- Publisher name: Sinu Stuudium — confirm against the account identity shown by the dashboard.
- Verified contact email: [OWNER REQUIRED]
- Support URL or email: [OWNER REQUIRED]
- Homepage URL: [OWNER REQUIRED]

Never place store credentials, payment information, recovery codes, identity documents, tokens, or signing keys in this file or repository.

## Version history

| Version | Date       | Changes                                                                   | Status |
| ------- | ---------- | ------------------------------------------------------------------------- | ------ |
| 0.1.0   | 2026-09-10 | First Sinu Stuudium beta with selectable dark designs and local settings. | Draft  |

## Review notes

### Known limitations before submission

- Final icons, listing images, public support details, and privacy-policy URL are not yet approved or created.
- Only `https://torg.ope.ee/*` is supported; other `ope.ee` schools are intentionally not pre-authorized.
- Automatic system-following and light themes are not included in Phase 2.
- Chromium requires an open Stuudium page to be refreshed after an unpacked extension is reloaded or re-enabled during development.
- Chrome and Brave live checks must be complete on the exact production package before submission. Other Chromium-based browsers are not described as independently tested until checked.

### Rejection history

None. No store submission has been made.
