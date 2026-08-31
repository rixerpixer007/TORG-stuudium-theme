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
| Diary history loader | Dashboard | ✓ | — | — | ✓ | BLOCKED | ✓ | Live 14px CSS pseudo-element spinner captured during read-only history load |
| Historical diary summary | Dashboard | BLOCKED | BLOCKED | — | BLOCKED | BLOCKED | BLOCKED | No populated older entries currently exposed; T1-01 selector change is a strict-subset removal |
| Absence calendar / popover | Dashboard | ✓ | PENDING | BLOCKED | ✓ | BLOCKED | ✓ | Popover opened and closed; attendance values and disabled controls were not changed |
| Tera course cards | Tera index | ✓ | ✓ | PENDING | — | BLOCKED | ✓ | 39 cards; hover border and -2px translation preserved |
| Tera nested containers | Tera resource | ✓ | — | — | ✓ | BLOCKED | ✓ | One parent and one child variant present with their distinct surfaces |
| Suhtlus navigation | Suhtlus inbox | ✓ | △ | ✓ | ✓ | BLOCKED | ✓ | Hover still matches without changing paint; keyboard focus-visible remains styled |
| Suhtlus participant chips | Suhtlus inbox | ✓ | PENDING | — | ✓ | BLOCKED | ✓ | 74 participant and 47 highlighted variants retain the shared chip style |
| Suhtlus posts | Suhtlus inbox / post 25742635 | ✓ | ✓ | PENDING | ✓ | BLOCKED | ✓ | Collapsed default/hover and expanded non-hover states verified; highlighted unavailable |
| Suhtlus overlays | Post 25742635 | ✓ | ✓ | ✓ | ✓ | BLOCKED | ✓ | Author card and reaction picker opened/closed; reaction option hover and focus-visible checked |
| Suhtlus image loaders | Inbox / post 25742635 | ✓ | — | — | ✓ | BLOCKED | ✓ | Live post and search SVG loader states captured; zero-width borders do not double-render |
| Suhtlus merged row | Suhtlus inbox | ✓ | △ | ✓ | — | BLOCKED | ✓ | Existing zero-specificity state paint does not beat the base; global focus ring still works |
| Suhtlus calendar today | Suhtlus calendar | ✓ | PENDING | — | ✓ | BLOCKED | ✓ | One `.cal-day.cal-day-is-today` cell retains the accent-soft state |
| Overlay shells / arrows | Dashboard, subjects, Suhtlus | ✓ | ✓ | ✓ | ✓ | BLOCKED | ✓ | Absence, grade, lesson-teacher, user-card, reaction, and teacher-tooltip negative control checked |
| Grades / semantic states | Grades table | ✓ | PENDING | PENDING | ✓ | BLOCKED | ✓ | Table rendering matches the baseline; representative row hover was exercised |
| Public login | Login | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | The themed external browser redirects the auth URL to the signed-in dashboard |
| Responsive breakpoint | Representative pages | — | — | — | — | BLOCKED | BLOCKED | The external viewport override still reports 2,048px and was reset |
| Reduced-motion loaders | Dashboard / Suhtlus | — | — | — | BLOCKED | — | BLOCKED | Browser media emulation unsupported; no behavioral change made |

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
- The comment-heading branch is classified separately in T2-02b below; the other T2-02 branches remain pending.

## Investigation T2-02b

**Name**

Determine expanded comment-heading ownership.

**Changes**

No CSS change. The grouped comment-heading/generic-notice rule remains intact.

**Root cause**

The expanded-post rule initially gives both the comment heading span and generic notice a small surfaced-panel treatment. A later Suhtlus heading rule resets most of the span treatment to a divider label, but does not reset its radius.

**Verification**

- Opened post 25742635 with one real comment heading and one generic notice.
- Traced matching injected CSS rules and computed values for each element separately.
- The heading span's later owner resets color to `--sid-text-3`, background to transparent, border to zero, and shadow to none; `border-radius: 7px` still comes from the earlier grouped rule.
- The heading is a non-focusable `<span>` (`tabIndex = -1`) displaying “Vastuseid veel pole”.
- The generic notice has no later replacement and still receives its text color, surfaced background, border, radius, and shadow from the grouped rule.

**Result**

PASS — classification `KEEP`. The selector arm is mostly overridden but is not wholly dead, and its sibling is required.

**Notes**

The surviving radius is visually inert while the heading remains transparent and borderless. Removing it would still change computed behavior, while relocating it would add a special-purpose rule with no maintenance benefit. This is exactly the kind of low-value theoretical cleanup the refactor should stop short of.

## Investigation T2-02c

**Name**

Complete the remaining Suhtlus state inventory.

**Changes**

No CSS change. Author-card, reaction, participant, and merged-row rules remain in place.

**Root cause**

The remaining rules describe genuine components rather than duplicate patches. One exception is the merged-row state selector: `:where(.post-list-merged:hover, .post-list-merged:focus-visible)` has zero specificity and cannot override the preceding `.post-list-merged` base when both declarations are important.

**Verification**

- Opened and closed the author card on the already-read post 25742635. Its shell, actions, metadata, and avatar each retain distinct computed paint.
- Opened and closed the reaction picker without choosing a reaction. Verified the picker shell, reaction-option default and hover paint, and a keyboard-only focus-visible state after moving the pointer away.
- Inspected the inbox: 25 collapsed posts, one merged event row, and no `.post-in-list.highlighted` posts.
- Deliberately hovered the merged row and keyboard-focused it. Its background, border, and text remain at the base values, while the global mint outline and focus shadow remain visible.
- Traced matching theme rules for the reaction focus state and merged-row cascade.

**Result**

PASS for the inspectable T2-02 scope. Author card, reaction picker, and merged row are classified `KEEP`; highlighted-post coverage remains `REQUIRES MORE INFORMATION`.

**Notes**

- Fixing the merged-row state selector would introduce a visible hover/focus background and border. That is an existing design bug and requires explicit design approval; deleting the rule would preserve today's pixels but erase useful intent, so neither action belongs in this refactor.
- No reaction, favorite, mute, reply, participant, or message state was changed.

## Batch T2-04a

**Name**

Consolidate verified overlay shells and arrow colors.

**Changes**

- Replaced three identical shell implementations with one shared owner for `.page_dashboard_subjects .stuudium-popover`, `.suhtlus .user-card`, and `.suhtlus .post-responses-add-available`.
- Replaced six individual arrow-color rules with one shared `::before` owner and one shared `::after` owner for absence, grade, and lesson-teacher popovers.
- Kept every original full selector, important declaration, radius, arrow DOM, component internal, and distinct overlay implementation.

**Root cause**

The same overlay palette was implemented independently as grade and Suhtlus features were added. Arrow colors were likewise repeated beside three feature modules even though the two-layer arrow treatment is one component decision.

**Verification**

- Confirmed the edited live stylesheet is active: 95,621 characters, fingerprint `ad5b0b5c`, and 438 style rules.
- Grade popover on `/s/520/subjects`: opened and closed; preserved text/background, `0.8px` strong border, 7px radius, shadow, and both arrow colors.
- Absence popover on `/s/520`: opened and toggled closed without changing attendance data; preserved its distinct 11px radius and both arrow colors.
- Lesson-teacher popover on `/subjects/student/944/520`: opened, closed, and reopened; preserved its site-owned 1.6px shell, 8px radius, shadow, and themed arrow colors.
- Suhtlus author card on post 25742635: opened and closed; preserved its shell plus feature-local action, metadata, and avatar paint.
- Suhtlus reaction picker: opened and closed without selecting a reaction; preserved shell, option hover, and keyboard focus-visible behavior.
- Teacher balloon on `/s/520/subjects`: hovered as a negative control; retained its brighter text and separate SVG arrow implementation.
- Visually compared live grade and Suhtlus overlay captures with their pre-change captures.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 445 opening/445 closing braces and 981 opening/981 closing parentheses.
- Diff scope: 26 lines, 6 style rules, and 14 repeated important declarations removed without changing selector coverage.

**Result**

PASS. The shared overlay palette and arrow colors now each have one owner, while component-specific geometry and behavior remain unchanged.

**Notes**

- Mobile remains blocked by the ineffective external-browser viewport override.
- Viewport-edge arrow variants and unexposed legacy overlay types were not claimed as observed and were not changed.

## Batch T1-03b

**Name**

Complete the shared custom-checkbox base primitive.

**Changes**

- Grouped the identical native `accent-color` owners for dashboard TODO and grading-guide checkboxes.
- Moved the six identical visual-shell declarations into one grouped owner using both original full selectors.
- Kept TODO-only width, height, transform, transform origin, transition, and pressed-state rule in the TODO section.
- Kept the already-shared checked and focus-visible state owners unchanged.

**Root cause**

T1-03 initially consolidated only checked and focus states because the two components have different geometry. Live property-by-property inspection showed that the geometry differs but the accent and entire base paint shell do not.

**Verification**

- Dashboard exposes two TODO controls: one checked and one unchecked. Both retained their exact 16px geometry, background/check image, border, 4px radius, shadow, transform, and TODO-specific transition.
- Geography plan 489 exposes 20 guide controls: one checked and 19 unchecked. Representative controls retained their exact 14px site-owned geometry and transition plus the shared paint values.
- Hovered an unchecked control in each component. Both retained the same control background, strong border, inset hairline, and component-specific transform.
- Traced the live CSSOM after the edit: TODO now matches one geometry owner plus one shared shell owner; the guide matches only the shared shell owner.
- Confirmed the edited live stylesheet on both pages: 95,408 characters, fingerprint `e9976f76`, and 437 style rules.
- Visually compared both pages with the immediately captured baselines.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 444 opening/444 closing braces and 977 opening/977 closing parentheses.
- Diff scope: 7 lines, 1 style rule, and 7 duplicate important declarations removed.

**Result**

PASS. Both checkbox implementations now share one complete paint/state primitive while retaining their genuine geometry and motion differences.

**Notes**

- The hidden native inputs are skipped by keyboard traversal on the live site, so focus-visible could not be newly exercised. Its selectors and declarations were not changed in this follow-up.
- No checkbox was toggled and no Stuudium task or grading-guide data was changed.
- Mobile remains blocked by the ineffective external-browser viewport override.

## Batch T3-03a

**Name**

Extract the verified accent-pill shell.

**Changes**

- Added one shared structural owner for grade help, Suhtlus participant pills, registration success status, and registration-count pills.
- Moved only the three identical declarations: accent-soft background, 1px accent border, and pill radius.
- Kept component text colors, padding, shadows, text decoration, expanded behavior, and link behavior in their feature sections.
- Left neutral inactive, danger/excluded, warning, archived, small-radius, category, and generic bright badges out of the primitive.

**Root cause**

Four independently themed features implemented the same accent-pill shell, while nearby badge variants only looked related and actually had different geometry or semantic colors. Grouping the exact shell removes duplication without turning all badges into one fragile mega-selector.

**Verification**

- Grades `/grades/student/520`: verified the help pill in default, hover, keyboard focus-visible, expanded, and collapsed states.
- Suhtlus post 25742635: verified both participant pills in default, hover, and keyboard focus-visible states without opening their destinations.
- Ended registration 296: verified one success status pill and nine registration-count pills; preserved their distinct text and padding.
- Registration inactive badge was checked as a negative control and retained its neutral surface, strong border, muted text, and pill radius.
- Traced the pre-change live CSSOM for all four included selectors and the inactive negative control before moving declarations.
- Confirmed the edited live stylesheet on all affected pages: 95,175 characters, fingerprint `a47f31c7`, and 438 style rules.
- Visually compared the expanded grades help and registration collection with their pre-change rendering.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 445 opening/445 closing braces and 969 opening/969 closing parentheses.
- Diff scope: one explicit component rule added and nine duplicate important declarations removed; net stylesheet length reduced by 2 lines.

**Result**

PASS. The four exact accent-pill shells now have one structural owner, and every observed semantic/state difference remains local.

**Notes**

- No registration choice, participant link, message, or grade data was changed.
- Mobile remains blocked by the ineffective external-browser viewport override.
- The increase of one style rule is intentional: component ownership improved while repeated declarations fell. Rule count is not treated as a standalone quality metric.

## Investigation T2-03

**Name**

Classify loader mechanisms and reduced-motion ownership.

**Changes**

No CSS change. The image-placeholder registry, global `.loading-spinner` color rule, CSS pseudo-element spinners, and reduced-motion block remain intact.

**Root cause**

Three loading mechanisms were added at different times: animated SVG backgrounds for Suhtlus placeholders, CSS border spinners for notebook/history states, and site-provided loader geometry. Their overlapping selector names made the SVG and border systems appear to compete even where one mechanism has no visible border.

**Verification**

- Inventoried loader DOM on dashboard, Suhtlus inbox/single-post, and a Tera resource.
- Captured an already-read Suhtlus post expanding: the active `.loading-spinner` became a 698.8×60px area with a centered 16px SVG; all four borders remained `0 none`, so the later border-color rule did not render a second spinner.
- Submitted and then cleared a harmless no-match Suhtlus search. During `.is-searching`, the input received the SVG at 14×14px on its right edge and returned to `background-image: none` after completion.
- Triggered dashboard history loading read-only and captured `.daily-summaries-navigate.is_loading::after`: 14×14px, circular border, mint top edge, and `sid-spin 0.75s linear infinite`.
- Loaded older Suhtlus messages read-only. The request completed too quickly to capture its transient class, so that specific state is not claimed.
- Inspected a fully loaded attachment preview: the image is complete at 1200×675 natural pixels and retains the SVG only as its background placeholder underneath the rendered image.
- Confirmed a hidden notebook-saving element, a hidden reaction-name loading indicator, and an idle upload container exist. They were not activated because doing so would require editing notebook/message/upload data.
- Attempted browser reduced-motion emulation; the browser-control surface does not expose that capability.
- Static cascade review confirms the specific important spinner animation shorthand has greater specificity than the generic reduced-motion animation-duration/iteration declarations. The SVG animation is SMIL and outside CSS animation control.
- Restored dashboard and Suhtlus inbox routes with an empty search after testing.

**Result**

PASS — classification only. The live mechanisms are separate and should remain `KEEP`; no root-cause CSS deletion is justified. Reduced-motion loader behavior is `REQUIRES DESIGN APPROVAL`.

**Notes**

- No notebook, message, upload, reaction, registration, or attendance data was changed.
- A future accessibility change should explicitly decide whether reduced-motion users see a static loader, a finite animation, or no animation. That is behavior design, not invisible refactoring.

## Batch T3-01a

**Name**

Introduce semantic overlay background ownership.

**Changes**

- Added `--sid-bg-overlay` as an alias of the existing `--sid-surface-2` value.
- Migrated only verified overlay backgrounds and inner arrow fill: absence popover, teacher balloon, shared grade/Suhtlus shell, shared overlay arrows, and the intentional legacy overlay fallback.
- Added no unused card, hover, spacing, or typography aliases.

**Root cause**

The overlay component family was structurally consolidated in T2-04a, but its background still referred to a numbered surface token that did not communicate ownership. The alias makes future overlay changes discoverable without changing the palette.

**Verification**

- Confirmed the live alias and source token both resolve to `#1b211e`.
- Confirmed the edited live stylesheet: 95,224 characters and fingerprint `246fd52a`.
- Grade popover: opened/closed; preserved background, strong border, 7px radius, shadow, and inner arrow fill.
- Teacher balloon: hovered; preserved brighter text, background, strong border, 7px radius, shadow, and its separate SVG arrow.
- Lesson-teacher popover: opened; preserved legacy shell geometry plus themed outer/inner arrow colors.
- Suhtlus author card and reaction picker: opened/closed; preserved backgrounds, borders, radii, and shadows.
- Absence popover: opened/closed without changing attendance data; preserved background, 11px radius, border, shadow, and arrows.
- `git diff --check`: no whitespace errors; only the existing LF/CRLF working-copy notice.
- CSS structure: 445 opening/445 closing braces and 970 opening/970 closing parentheses.
- Diff scope: one meaningful token plus five component references; important and style-rule counts unchanged.

**Result**

PASS. Overlay background ownership is now semantically named with no visual or behavioral change.

**Notes**

- The teacher balloon arrow is an embedded SVG with a literal `#1b211e` fill. CSS custom properties cannot be consumed inside that data URI, so it remains intentionally hard-coded and was checked as a negative control.
- Mobile remains blocked by the ineffective external-browser viewport override.
