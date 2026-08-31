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
| TODO rows / checkbox | Dashboard | ✓ | ✓ | BLOCKED | ✓ | BLOCKED | ✓ | Checked/unchecked and hover values match; hidden native input was not toggled |
| Grading-guide checkbox | Subject plan 489 | ✓ | ✓ | BLOCKED | ✓ | BLOCKED | ✓ | 20 markers: 1 checked, 19 unchecked; native inputs are hidden decorative markup |
| Notebook | Dashboard | ✓ | PENDING | PENDING | ✓ | BLOCKED | ✓ | Roman numeral tabs remain visible |
| Historical diary summary | Dashboard | BLOCKED | BLOCKED | — | BLOCKED | BLOCKED | BLOCKED | No populated older entries currently exposed; T1-01 selector change is a strict-subset removal |
| Absence calendar / popover | Dashboard | ✓ | PENDING | BLOCKED | ✓ | BLOCKED | ✓ | Popover opened and closed; attendance values and disabled controls were not changed |
| Tera course cards | Tera index | ✓ | ✓ | PENDING | — | BLOCKED | ✓ | 39 cards; hover border and -2px translation preserved |
| Tera nested containers | Tera resource | ✓ | — | — | ✓ | BLOCKED | ✓ | One parent and one child variant present with their distinct surfaces |
| Suhtlus navigation | Suhtlus inbox | ✓ | △ | ✓ | ✓ | BLOCKED | ✓ | Hover still matches without changing paint; keyboard focus-visible remains styled |
| Suhtlus participant chips | Suhtlus inbox | ✓ | PENDING | — | ✓ | BLOCKED | ✓ | 74 participant and 47 highlighted variants retain the shared chip style |
| Suhtlus posts | Suhtlus inbox / post 25742635 | ✓ | ✓ | PENDING | ✓ | BLOCKED | ✓ | Collapsed default/hover and expanded non-hover states verified; highlighted unavailable |
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

## Batch T1-03

**Name**

Consolidate shared custom-checkbox states.

**Changes**

- Moved the TODO checked-state declarations to the existing grading-guide checked-state location and grouped the two original full selectors.
- Moved the TODO focus-visible declarations to the existing grading-guide focus-state location and grouped the two original full selectors.
- Left the two base shells, TODO-only 16px geometry, transition, and `label:active` press scale in their feature sections.

**Root cause**

The same checked and focus-visible appearance was independently owned by the dashboard TODO and grading-guide sections even though the declarations were identical.

**Verification**

- Located five reachable subject-plan pages with live custom-checkbox markup; selected Geography plan 489 because it exposes both checked and unchecked states.
- Captured the pre-change dashboard state (2 TODO checkboxes: 1 checked, 1 unchecked) and grading-guide state (20 markers: 1 checked, 19 unchecked). Neither page currently exposes a disabled example.
- Reloaded both affected pages and confirmed Stylus injected the new body on each: 96,422 characters, fingerprint `bb33c00e`.
- Compared checked and unchecked computed values property-by-property before and after: background, check image, border, radius, shadow, outline, and outline offset are identical for both components.
- Confirmed the TODO transform and transition remain unchanged; its feature-local `label:active` rule was not moved or edited.
- Deliberately hovered an unchecked TODO and an unchecked grading-guide marker; both retained their pre-change control surface and border.
- Visually compared post-change dashboard and Geography plan screenshots with their immediately captured baselines.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 451 opening/451 closing braces and 996 opening/996 closing parentheses.
- Diff scope: two selector additions and removal of two duplicate declaration blocks; 2 insertions and 12 deletions.

**Result**

PASS for the T1-03 batch scope. Both live components retain identical checked, unchecked, and hover rendering, while the duplicate state declarations now have one owner.

**Notes**

- No checkbox was toggled: the TODO checkbox changes real task data, and the subject-plan checkboxes are presentation markup. Existing checked/unchecked examples supplied both visual states safely.
- The native inputs compute to `display: none`, so keyboard focus-visible cannot be reached on the current live markup. The original focus selectors and declarations were preserved exactly; this pre-existing accessibility limitation is recorded rather than changed during the refactor.
- Pointer-down animation was not directly sampled because the available browser control cannot hold the pointer while inspecting computed style without clicking the real TODO control. The TODO-only press selector and declaration remain byte-for-byte unchanged.
- Mobile remains unobserved because the external viewport override is ineffective. There are no custom-checkbox declarations in the mobile media block, and no intervening custom-checkbox owner exists between the old and new source positions.

## Investigation T2-01

**Name**

Determine TODO hover ownership.

**Changes**

No CSS change. The feature-specific hover rule remains in place.

**Root cause**

The broad diary hover selector uses `:where(...)` and cannot override the more specific TODO base rule when both declarations are `!important`.

**Verification**

- Hovered the live unmarked and marked TODO rows.
- Traced the accessible injected stylesheet through CSSOM. Each hovered row matches the generic hover owner, the transparent TODO base owner, and the feature-specific TODO hover owner.
- Confirmed the live winning background is `rgb(32, 40, 36)` (`--sid-surface-3`) only because `.section.todos .todo_container:hover` outranks the transparent base declaration.
- Confirmed the marked row retains muted text and its `line-through 1px rgba(193, 192, 184, 0.55)` decoration while hovered.

**Result**

PASS — classification `KEEP`. Removing the feature-specific hover owner would make hovered TODO rows transparent.

**Notes**

A root-level rewrite would need to change how the TODO default transparent state is selected, then re-test touch/mobile hover behavior. That is not justified merely to remove one intentional reinforcement rule.

## Batch T2-02a

**Name**

Remove the duplicate expanded-post background owner.

**Changes**

Removed only `background: var(--sid-surface-interactive) !important` from the stronger `.post-in-list.post-expanded` shell. Padding, margin, border, shadow, comments, notices, event time, reactions, and all other Suhtlus rules remain unchanged.

**Root cause**

The expanded state was first included in the shared hover/expanded/highlighted background rule and then given the same background again when the expanded shell geometry was added.

**Verification**

- Baseline inbox contained 25 collapsed posts and no expanded or highlighted post; exercised a collapsed post's transparent default and `--sid-surface-interactive` hover states.
- Opened real post 25742635, moved the pointer outside it, and traced the live CSSOM cascade. The shared `.suhtlus :where(.post-in-list:hover, .post-in-list.post-expanded, .post-in-list.highlighted)` rule matched the non-hovered expanded post and already followed the transparent base owner.
- Captured the pre-change expanded shell: `rgb(25, 31, 27)` background, `0.8px solid rgb(58, 71, 64)` border, 18px padding, zero bottom margin, and no shadow.
- Reloaded the stable single-post route after the edit and confirmed the new active Stylus body: 96,363 characters, fingerprint `3c94334b`; the stronger expanded shell no longer contains a background declaration.
- Confirmed the post-change expanded shell has the same computed background, border, padding, margin, and shadow, with the pointer outside the post.
- Confirmed the post still renders one comment, its transparent comment heading, its surfaced generic notice, and its bordered event-time chip.
- Returned to the inbox and rechecked all 25 collapsed posts: default remains transparent and hover remains `rgb(25, 31, 27)`.
- Waited for dynamic content to finish and visually compared both expanded and collapsed states with the baseline captures.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 451 opening/451 closing braces and 995 opening/995 closing parentheses.
- Diff scope: one declaration removed.

**Result**

PASS for T2-02a. The shared state rule is now the single expanded-background owner and the expanded shell retains only its genuine geometry and border differences.

**Notes**

- The inbox currently exposes no `.post-in-list.highlighted` example, so that state remains unobserved; its selector was not changed.
- Mobile remains blocked by the ineffective browser viewport override. There is no mobile-specific post background owner in the stylesheet.
- Opening the initially unread post for the required expanded-state test caused Stuudium to mark it read. No message content, reaction, favorite, mute, participant, or reply state was changed.
- The later comment-heading reset and other T2-02 branches remain pending; this batch does not classify them.
