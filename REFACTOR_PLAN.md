# Stuudium Intentional Dark — Refactor Plan

## Baseline

- Known-good stylesheet: `Stuudium-Intentional-Dark.user.css` v2.6.1.
- Git checkpoint: commit `8ec50bb` (`v1-before-refactor`).
- Baseline size: 2,872 lines, 447 style rules, 1,118 `!important` declarations.
- Live Brave verification: the injected Stylus body is exactly 97,096 characters and has the same FNV-1a fingerprint (`db7c79af`) as the repository stylesheet body.
- Live baseline pages inspected: dashboard, the open **Veel** menu, the absence popover, Tera index/course/nested resource, Suhtlus inbox, and the grades table.
- Current verification limitations:
  - Browser security policy blocks direct access to the Stylus extension editor. No bypass will be attempted.
  - The external-browser viewport override currently leaves the page at 2,048 CSS px, so mobile checks require a supported browser resize or user-assisted viewport change.
  - Historical diary content is not currently populated by the visible older-entry control; those states remain pending.

## Refactor rules

1. Preserve visual output and behavior. Existing design bugs are recorded, not silently redesigned.
2. Work in small batches with one cascade hypothesis per batch.
3. Preserve full selectors and source order unless browser evidence supports changing them.
4. Keep legitimate `!important` declarations used to beat Stuudium's CSS.
5. Prefer component ownership over value-based mega-selectors.
6. Do not introduce `@layer`, a global specificity rewrite, or a broad `!important` cleanup.
7. A batch is complete only after the edited stylesheet is active on the live site and the required states pass.

## Tier 1 — Safe cleanup

### T1-01 — Remove provably redundant selector branches

**Objective**

Remove misleading selector branches and one duplicate mobile block without moving declarations or changing any intended winner.

**Relevant pre-refactor selectors/ranges**

- `:where(a, a:visited)`, lines 107–110.
- `:where(.st-nav-item, .st-nav-item:visited, ...)`, lines 606–609.
- `.stream-entry.ng-grade-is-summary-wrapper` inside the base summary group, lines 1071–1077.
- `select` inside `.absences_popover :where(select, textarea)::placeholder`, lines 1406–1409.
- `.content-container.with-parent` and `.content-container.content-container-is-parent` inside the base Tera group, lines 1857–1862.
- `.suhtlus-nav a.nav-active` inside the hover group, lines 2227–2230.
- `.bl-p.highlighted` and `.post-participants .bl-p` inside `.suhtlus :where(...)`, lines 2301–2308.
- `.cal-day.cal-day-is-today` inside the today group, lines 2514–2518.
- Duplicate mobile login-background rule, lines 2783–2785; the unconditional owner is lines 154–156.

**Root cause**

Incremental state coverage added selector variants that are already subsets of another selector in the same rule. The mobile login rule repeated an unconditional rule, and native `select` elements do not expose `::placeholder`.

**Proposed change**

Remove only the redundant selector arms and the duplicate mobile block. Keep single-arm `:where(...)` wrappers so specificity remains zero.

**Expected benefit**

- Fewer false cascade branches.
- Clearer selector ownership.
- One ineffective pseudo-element target and one duplicate responsive block removed.
- No declaration movement.

**Risk**

Tier A / very low. All changes are selector-set equivalences or removal of an ineffective target.

**Verification requirements**

- Dashboard: ordinary links; primary navigation default/active/hover/focus; **Veel** expanded.
- Historical diary: summary-grade wrapper when available.
- Absence popover: select default/focus and textarea placeholder/focus without submitting attendance changes.
- Tera nested resource: base, `with-parent`, and `content-container-is-parent` surfaces.
- Suhtlus: active navigation, participant/highlighted chips, calendar today cell when available.
- Public login: desktop and `<=760px` background.

**Dependencies**

Baseline checkpoint and visual/computed-state capture. No dependency on later batches.

### T1-02 — Consolidate duplicated login provider palettes

**Objective**

Give ID-card and Passkey/WebAuthn palettes one owner per provider while preserving both login markup generations.

**Relevant pre-refactor selectors/ranges**

- ID card: lines 305–309 and 360–364.
- Passkey/WebAuthn: lines 311–315 and 348–352.
- Generic chooser button base: lines 341–346.

**Root cause**

The separate login controls and newer method chooser were themed at different times with identical provider values.

**Proposed change**

Group each provider pair using both original full selectors, after the generic chooser-button base. Do not alter the login toggle reconstruction.

**Expected benefit**

One explicit owner for each provider palette and fewer repeated raw colors.

**Risk**

Tier A/B. Grouping preserves selector specificity but moves one branch across generic login rules.

**Verification requirements**

Separate ID-card/Passkey controls and chooser ID-card/WebAuthn controls: default, hover, focus, disabled, and opened panel; password, Smart-ID, and remote-passkey as negative controls; desktop and mobile.

**Dependencies**

Both login markup generations must be observable with the edited stylesheet active. Defer if they cannot be reached.

### T1-03 — Consolidate shared custom-checkbox states

**Objective**

Share only the truly identical accent, base paint, checked, and keyboard-focus states between dashboard TODOs and the grading guide.

**Relevant pre-refactor selectors/ranges**

- TODO checked/focus: lines 1013–1023.
- Grading-guide checked/focus: lines 1838–1848.
- TODO-only geometry/press animation: lines 992–1011.
- Grading-guide base shell: lines 1829–1836.

**Root cause**

The same Stuudium checkbox state was independently themed in two feature sections; only the TODO version has custom dimensions and press animation.

**Proposed change**

Group the original full accent, base-paint, checked, and focus selectors after the feature-local geometry. Keep dimensions, transition, and pressed behavior feature-local.

**Expected benefit**

One paint/state implementation with page-specific geometry retained.

**Risk**

Tier A/B because the operation moves state rules through the source order.

**Verification requirements**

TODO and grading-guide checkboxes: default, hover, keyboard focus, checked, unchecked, disabled if available, TODO pointer-down scale, marked-row line-through, and mobile.

**Dependencies**

T1-01 complete; live grading-guide checkbox and dashboard TODO checkbox available.

**Disposition:** **COMPLETE.** T1-03 consolidated checked and focus states; follow-up T1-03b consolidated the remaining identical accent and six-declaration base shell. TODO keeps its 16px sizing, transform, transition, and pressed rule; the grading guide keeps its site-owned 14px geometry and transition. Live checked, unchecked, and hover paint is unchanged. Keyboard focus and pointer-down remain untriggerable without interacting with hidden native inputs, so those untouched rules retain the earlier static/live cascade evidence rather than a new behavioral claim.

## Tier 2 — Root-cause patch fixes

### T2-01 — TODO hover ownership

- **Selectors/ranges:** generic diary hover at 951–953; TODO-specific hover at 966–968.
- **Root cause:** zero-specificity generic coverage may not beat the original site's TODO selector.
- **Proposed change:** compare matched/computed winners. Remove the stronger rule only if the generic rule already owns the live hover state.
- **Benefit:** one hover owner instead of a reinforcement chain.
- **Risk:** C.
- **Verification:** TODO default/hover/checked/marked on desktop and mobile.
- **Dependency:** T1-03 should be settled first.
- **Disposition after live inspection:** **KEEP.** The generic hover rule does not own the state. With `!important` on all three declarations, `.section.todos .todo_container { background: transparent; }` outranks `:where(...):hover`; the feature-specific hover rule is what restores `--sid-surface-3` for both marked and unmarked rows. Removing it would be a regression, while changing the base selector would expand this batch beyond safe consolidation.

### T2-02 — Suhtlus post-state ownership

- **Selectors/ranges:** broad post base/hover/expanded at 2244–2252; expanded shell at 2310–2315; comment-heading surface at 2346–2352; later heading reset at 2458–2481.
- **Root cause:** expanded, highlighted, comment, and generic-notice states were patched in separate passes.
- **Proposed change:** give expanded background one verified owner; determine whether the early heading-span surface is dead while preserving `.generic-notice`.
- **Benefit:** fewer order-dependent state corrections.
- **Risk:** C.
- **Verification:** collapsed, hover, highlighted, expanded, comments, event time, reactions, participant chips, user card, and merged rows.
- **Dependency:** edited stylesheet must be active; representative posts must be available.
- **Disposition:** **COMPLETE WITH ONE UNAVAILABLE STATE.** T2-02a removed the duplicate expanded-background declaration after live CSSOM tracing proved the shared state rule owns it. The comment-heading arm is `KEEP`: its radius survives the later reset and its grouped generic-notice branch remains fully active. The author card and reaction picker were opened and checked in default, hover, keyboard-focus, and close states. The live inbox exposes one merged event row; its intended hover/focus paint rule cannot outrank its own base rule because the state is wrapped in zero-specificity `:where(...)`. This is a pre-existing visual bug, not refactorable dead code: changing it would alter the design, while deleting it would erase the documented intent, so it remains `REQUIRES DESIGN APPROVAL`. No `.post-in-list.highlighted` example is currently available; that untouched selector remains `REQUIRES MORE INFORMATION`.

### T2-03 — Spinner registry and reduced motion

- **Selectors/ranges:** `--sid-spinner-image` at 63; Suhtlus image-backed loaders at 2390–2407; border/pseudo-element spinners at 2707–2759; reduced motion at 2862–2870.
- **Root cause:** three loader mechanisms were added independently. The embedded SVG uses SMIL and is not controlled by the reduced-motion rule.
- **Proposed change:** first inventory live loader DOM and computed paint; then separate image placeholders from CSS spinners. Treat reduced-motion behavior as an explicit behavior decision.
- **Benefit:** understandable loader ownership and honest accessibility behavior.
- **Risk:** D.
- **Verification:** every loader type in normal and reduced-motion modes, including dimensions and empty/loading transitions.
- **Dependency:** triggerable loading states and reduced-motion emulation.

### T2-04 — Overlay shell and arrow ownership

- **Selectors/ranges:** absence popover 1318–1332; teacher balloon 1480–1493; grade popover 1542–1556; lesson teacher popover 1652–1658; Suhtlus user/reaction overlays 2277–2283 and 2439–2445; legacy overlays 2694–2699.
- **Root cause:** related overlay shells use different DOM and arrow implementations.
- **Proposed change:** consolidate only the verified shared shell declarations, preserving selector specificity, radii, arrow DOM, and feature ownership.
- **Benefit:** one maintainable overlay palette without a broad unrelated mega-selector.
- **Risk:** B/C.
- **Verification:** open/close, arrow direction, stacking, hover, keyboard focus, and viewport-edge placement.
- **Dependency:** T2-02 for Suhtlus overlays.
- **Progress:** T2-04a complete. The grade popover, Suhtlus author card, and reaction picker now share one exact five-declaration shell owner using their original full selectors. Absence, grade, and lesson-teacher arrows now share two exact color owners. Distinct absence radius, teacher-tooltip text/arrow implementation, lesson-teacher shell geometry, overlay internals, and the broad legacy fallback remain feature-owned. Live open/close, shell paint, arrows, reaction hover/focus, and a teacher-tooltip negative control passed. Viewport-edge variants and currently unavailable legacy overlay types remain pending.

## Tier 3 — Structural improvements

### T3-01 — Semantic surface aliases

Alias current values first (card, overlay, hover/interactive) and migrate one component at a time. This is a naming clarification, not a palette change.

### T3-02 — Small justified tokens

Consider only demonstrated conventions: compact `4px` radius, checkbox inset hairline, and `140ms` fast transition. Do not introduce a spacing or typography scale without component normalization.

### T3-03 — Chip and badge families

Map participant, registration, category, and help chips by semantic variant. Preserve warning, danger, archived, excluded, and inactive variants.

**Progress:** T3-03a complete at the shared-geometry boundary. Grade help, Suhtlus participant pills, registration success status, and registration counts now share one exact accent-pill shell: accent-soft background, 1px accent border, and pill radius. Text, padding, shadows, links, and expanded/focus behavior remain local. Registration inactive, Suhtlus excluded/small-radius members, subject-plan category, TODO warning, archived, and generic bright badges remain intentionally separate because their geometry or semantic palette differs. No broader value-based badge selector is planned without new live evidence.

### T3-04 — Explicit legacy ownership

Move late table/overlay/badge exceptions only after recording each live winner. If source order is required, keep a documented exceptions section instead of forcing relocation.

## Tier 4 — High-risk cascade work

1. Narrow the global anchor rule after an anchor-role inventory.
2. Narrow generic `.important`/`.warning`, then buttons and `.icon`.
3. Handle fields and focus last; the absence popover currently contradicts the global focus ring.
4. Reduce `!important` declaration-by-declaration against the site's actual competing selector.
5. Do not introduce `@layer` or reorganize behavioral overrides for aesthetics.

## Patch-cluster disposition

| Cluster | Classification | Planned direction |
|---|---|---|
| Global page/link layer, 69–145 | REPLACE WITH ROOT FIX | Tier 4; inventory link roles first |
| Login, 146–581 | CONSOLIDATE / KEEP | T1-02 palettes; keep structural toggle rules |
| Navigation/tabs, 584–720 | REMOVE / KEEP | T1-01 redundant branch; keep stacking rules |
| Shared controls/icons, 722–944 | REQUIRES MORE INFORMATION | Narrow only after component evidence |
| Dashboard/TODO/notebook, 946–1278 and 2718–2759 | REMOVE / CONSOLIDATE / KEEP | T1-01 and T1-03 complete; T2-01 hover rule kept after live cascade trace; T2-03 pending |
| Absences, 1280–1415 | REMOVE / KEEP | T1-01 invalid target; preserve geometry pending tests |
| Subjects/grades, 1417–1848 | CONSOLIDATE / KEEP | T1-03 only; preserve contextual grade semantics |
| Tera, 1850–2110 | REMOVE / KEEP | T1-01 base branches; retain coherent feature rules |
| Suhtlus, 2112–2536 | REMOVE / REPLACE WITH ROOT FIX / KEEP | T1-01 and inspectable T2-02 complete; T2-04a/T3-03a complete; highlighted post unavailable |
| Registrations, 2538–2639 | CONSOLIDATE / KEEP | T3-03a accent-pill shell complete; inactive and collection-specific variants remain local |
| Tables/overlays/final exceptions, 2641–2772 | KEEP / REPLACE WITH ROOT FIX | Preserve order until live winners are known |
| Mobile, 2774–2860 | REMOVE / KEEP | Remove only duplicate login block in T1-01 |
| Reduced motion, 2862–2870 | REQUIRES MORE INFORMATION | Treat with spinner registry, not safe cleanup |

## Batch verification protocol

For every batch:

1. Record exact selectors and baseline state.
2. Apply only the batch diff.
3. Run structural validation and inspect the diff.
4. Activate the edited stylesheet in the live browser using a supported path.
5. Reload affected pages.
6. Compare default, interactive, responsive, and negative-control states.
7. Record PASS / REQUIRES REVIEW / REVERTED in `REFACTOR_LOG.md`.
8. Commit only when the required live states pass; otherwise keep the checkpoint and document the blocker.
