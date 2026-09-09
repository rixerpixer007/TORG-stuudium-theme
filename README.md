# TORG Stuudium Theme

An intentional dark theme and planned client-side enhancement layer for TORG Stuudium.

- [Project direction and platform plan](docs/PROJECT_DIRECTION.md)
- [Current userstyle](Stuudium-Intentional-Dark.user.css)

## Extension development

Phase 2 adds remembered Graphite Mint and Graphite Blue theme selection to the
local Chromium extension foundation. Start with the
[beginner development guide](docs/EXTENSION_DEVELOPMENT.md). The separate
[publishing guide](docs/EXTENSION_PUBLISHING.md) explains Chrome Web Store
releases and the optional Microsoft Edge Add-ons route. Store-facing draft copy
and readiness gaps are tracked in [CHROMEWEBSTORE.md](CHROMEWEBSTORE.md).

## Android prototype development

Phase 4 begins with a native Kotlin Android feasibility app that reuses the
same generated theme, shared feature runtime, settings contract, and themed
settings interface. Start with the
[beginner Android development guide](docs/MOBILE_DEVELOPMENT.md). Public APK
signing, updating, and distribution remain deferred until the real Stuudium
login and WebView behavior have been verified on physical devices.
