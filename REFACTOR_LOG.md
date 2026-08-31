# Stuudium Intentional Dark — Refactor Log

## Status legend

- `✓` — observed and matches the known-good baseline.
- `△` — partially observed or an existing issue/limitation was found.
- `—` — not applicable.
- `PENDING` — not yet tested.
- `BLOCKED` — current environment cannot perform the check safely.

## Baseline B0

**Name**

Pre-refactor v2.6.1 baseline.

**Changes**

No stylesheet change. Added `audit.md` to Git and created checkpoint commit `8ec50bb` with message `v1-before-refactor`.

**Root cause**

The refactor needs a reversible known-good state before any cascade changes.

**Verification**

- Confirmed the live Brave page is signed in and the theme is active.
- Confirmed the repository stylesheet body and injected Stylus body both have length 97,096 and fingerprint `db7c79af`.
- Captured desktop visual baselines for dashboard, **Veel**, absence popover, Tera index/nested resource, Suhtlus inbox, and grades.
- Opened the dashboard **Veel** dropdown.
- Opened and closed the absence popover without changing attendance data.
- Verified real Tera DOM for both `.content-container.with-parent` and `.content-container.content-container-is-parent`.
- Verified Suhtlus has one active navigation item, 74 participant chips, and 47 highlighted chips on the current inbox.
- Verified the grades table currently contains positive, danger, summary, and important grade states.

**Result**

PASS as a desktop baseline. Mobile, public-login, and populated historical-diary baselines remain pending.

**Notes**

- Direct Stylus-editor access is blocked by browser security policy; no bypass will be attempted.
- The documented external-browser viewport override did not change the 2,048px page viewport and was reset.
- The visible older-diary control advanced its date range but did not expose populated historical entries; a subsequent interaction timed out after the page state was inspected.
- Suhtlus `:hover` matched the unread navigation link, but its computed color/background remained the default state. Record this as a pre-existing cascade observation; do not silently fix it during cleanup.

## Verification matrix

| Component | Page | Default | Hover | Focus | Active / expanded | Mobile | Post-refactor | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---|
| Primary navigation | Dashboard | ✓ | ✓ | ✓ | ✓ | BLOCKED | ✓ | Default, Tera hover, and keyboard focus-visible checked after T1-01 |
| Page tabs / Veel | Dashboard | ✓ | △ | ✓ | ✓ | BLOCKED | ✓ | 4 menu segments and 7 links; the first link's pre-existing hover-paint issue remains |
| Dashboard cards | Dashboard | ✓ | PENDING | — | — | BLOCKED | ✓ | Two-column desktop rendering matches the baseline |
| TODO rows / checkbox | Dashboard | ✓ | PENDING | PENDING | ✓ | BLOCKED | ✓ | Checked and unchecked states remain visible; no state was changed |
| Notebook | Dashboard | ✓ | PENDING | PENDING | ✓ | BLOCKED | ✓ | Roman numeral tabs remain visible |
| Historical diary summary | Dashboard | BLOCKED | BLOCKED | — | BLOCKED | BLOCKED | BLOCKED | No populated older entries currently exposed; T1-01 selector change is a strict-subset removal |
| Absence calendar / popover | Dashboard | ✓ | PENDING | BLOCKED | ✓ | BLOCKED | ✓ | Popover opened and closed; attendance values and disabled controls were not changed |
| Tera course cards | Tera index | ✓ | ✓ | PENDING | — | BLOCKED | ✓ | 39 cards; hover border and -2px translation preserved |
| Tera nested containers | Tera resource | ✓ | — | — | ✓ | BLOCKED | ✓ | One parent and one child variant present with their distinct surfaces |
| Suhtlus navigation | Suhtlus inbox | ✓ | △ | ✓ | ✓ | BLOCKED | ✓ | Hover still matches without changing paint; keyboard focus-visible remains styled |
| Suhtlus participant chips | Suhtlus inbox | ✓ | PENDING | — | ✓ | BLOCKED | ✓ | 74 participant and 47 highlighted variants retain the shared chip style |
| Suhtlus posts | Suhtlus inbox | ✓ | PENDING | PENDING | PENDING | BLOCKED | ✓ | Feed default state matches the baseline; no post was expanded |
| Suhtlus calendar today | Suhtlus calendar | ✓ | PENDING | — | ✓ | BLOCKED | ✓ | One `.cal-day.cal-day-is-today` cell retains the accent-soft state |
| Grades / semantic states | Grades table | ✓ | PENDING | PENDING | ✓ | BLOCKED | ✓ | Table rendering matches the baseline; representative row hover was exercised |
| Public login | Login | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | The themed external browser redirects the auth URL to the signed-in dashboard |
| Responsive breakpoint | Representative pages | — | — | — | — | BLOCKED | BLOCKED | The external viewport override still reports 2,048px and was reset |

## Batch T1-01

**Name**

Remove provably redundant selector branches.

**Changes**

- Removed the subsumed `a:visited` arm from the global anchor rule.
- Removed the subsumed `.st-nav-item:visited` arm.
- Removed the subsumed compound historical-summary arm from its base rule.
- Removed the ineffective native-`select` placeholder arm while retaining the textarea branch.
- Removed the two subsumed Tera container variants from the `.content-container` base rule; the real parent variant rule remains unchanged.
- Removed active Suhtlus navigation from the earlier hover rule; the later stronger active owner remains unchanged.
- Removed two subsumed Suhtlus participant-chip arms.
- Removed the subsumed compound Suhtlus today-cell arm.
- Removed the mobile copy of the unconditional login-background hiding rule.

**Root cause**

Incremental coverage added subset selectors, an ineffective native-select placeholder arm, and a duplicate mobile block.

**Verification**

- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 453 opening/453 closing braces and 1,000 opening/1,000 closing parentheses.
- Diff scope: 8 selector-line replacements and deletion of one 4-line duplicate block; 8 insertions and 12 deletions total.
- Current local stylesheet body: 96,755 characters, fingerprint `054601c2`.
- Confirmed the active Stylus body is the edited file (96,755 characters, fingerprint `054601c2`) on the dashboard, Tera resource, Suhtlus inbox, and grades table.
- Compared post-change desktop rendering with the saved baseline on the dashboard, Tera index/resource, Suhtlus inbox/calendar, and grades table.
- Exercised primary-navigation default, hover, active, and keyboard focus-visible states.
- Opened **Veel**, exercised link hover and keyboard focus-visible, and confirmed its 4 segments and 7 links remain intact.
- Opened and closed the absence popover without changing attendance data; the surviving textarea placeholder branch retains the muted placeholder color.
- Verified 39 Tera course cards plus hover, and verified one `.content-container.content-container-is-parent` and one `.content-container.with-parent` retain their distinct computed surfaces.
- Verified Suhtlus retains one active navigation item, 74 participant chips, 47 highlighted chips, unread-link hover/focus behavior, and one current-day calendar cell with the expected accent state.
- Rechecked the grades table as a negative-control page and deliberately hovered a representative row.
- Retried the 760px browser viewport override on both an existing page and a newly opened page; both remained 2,048px, so the override was reset.
- Public-login rendering remains unavailable because the themed external browser redirects the auth URL to the signed-in dashboard.
- Populated historical-summary rendering remains unavailable. The removed compound arm is nevertheless a strict subset of the surviving `.ng-grade-is-summary-wrapper` arm.

**Result**

PASS for the T1-01 batch scope. The edited file is active, desktop rendering and relevant interaction states pass, and every selector removal is either a strict subset, an ineffective native-select placeholder arm, or an exact duplicate.

**Notes**

- Mobile rendering, public login, and a populated historical summary are not claimed as visually observed.
- The only responsive deletion is an exact copy of an identical unconditional `#bg > :is(#bg-img, #bg-img-full) { display: none !important; }` rule, so it cannot change the mobile cascade even though the browser viewport capability is ineffective.
- The Suhtlus unread link and first **Veel** link still match `:hover` without a computed paint change. This reproduces the pre-refactor observation and is not a T1-01 regression.
- Do not replace surviving single-arm `:where(...)` wrappers with plain selectors; that would increase specificity.
