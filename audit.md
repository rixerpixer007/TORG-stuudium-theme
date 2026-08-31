The stylesheet is substantially healthier than “500 lines of duplicates” suggests. The primary debt is not literal duplication; it is a broad global dark-theme layer combined with pervasive `!important`, followed by increasingly specific component corrections.

No file was modified. The working tree remains clean, and the file hash is unchanged.

Risk legend:

- **A — Definitely safe**
- **B — Probably safe; visually verify**
- **C — Dangerous; inspect DOM/computed styles**
- **D — Do not touch without a full behavioral test**

Key inventory:

| Metric | Result |
|---|---:|
| Lines | 2,872 |
| Style rules | 447 |
| Selector instances / unique selectors | 477 / 472 |
| Declarations | 1,321 |
| `!important` declarations | 1,118 — 84.6% |
| Exact duplicate rule headers | 0 |
| Repeated individual selectors | 5 |
| Duplicate properties inside one rule | 0 |
| Design tokens | 37 |
| Media-query blocks | 3 |
| Growth since initial commit | +1,400 lines across 37 commits |

## 1. Architecture assessment

The current architecture is approximately:

1. Metadata and domain boundary
2. Design tokens
3. Global page/type/link rules
4. Login
5. Navigation and tabs
6. Shared surfaces/notices/controls/icons
7. Dashboard and feature-specific sections
8. Tera
9. Suhtlus
10. Registrations
11. Generic tables, overlays and legacy exceptions
12. Responsive and accessibility rules

Strengths:

- The palette is already strongly tokenized at [design tokens](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:28).
- The file has clear feature comments and generally keeps related rules together.
- `:where()` is used 153 times, showing deliberate specificity control.
- Feature roots such as `.suhtlus`, `.page_subjects_student`, and `.content-container` limit many risky rules.
- Mobile behavior is concentrated in one media query rather than scattered throughout the file.
- There are no obvious syntax-level structural problems: braces are balanced 454/454.

Weaknesses:

- The global link, button, field, icon, heading and status layers are wider than the component model beneath them.
- `!important` largely substitutes for explicit knowledge of the original site’s cascade.
- Reusable visual concepts—elevated surface, flat panel, chip, semantic state, custom checkbox—are implemented repeatedly under page-specific selectors.
- Generic legacy rules appear after feature modules, so source order still acts as an implicit architecture.
- Some rules alter structure or functionality, not merely theme colors.

Overall assessment: **good token architecture, reasonable feature organization, but weak cascade ownership**.

## 2. Main sources of technical debt

### Global paint rules force downstream corrections — C

The global anchor rule at [line 107](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:107) colors every link mint with `!important`. Navigation, tabs, cards, buttons, Suhtlus, registrations and headings then restate link colors with higher-specificity `!important`.

The same pattern exists for:

- Generic buttons at [line 800](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:800)
- Fields at [line 865](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:865)
- Icons at [line 900](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:900)
- Generic `.important` and `.warning` classes at [line 786](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:786)

Narrowing these could remove roughly 30–80 reinforcing declarations and make future changes easier, but it requires computed-style inspection across all major pages.

### `!important` has become the default contract — C

All 127 `border-color` declarations, 254 of 255 `color` declarations, and 215 of 221 `background` declarations are important.

Some of that is expected in a UserCSS fighting an external site. However, it means:

- Specificity mistakes are harder to see.
- Component variants need both specificity and `!important`.
- Moving a rule can silently change which equally important declaration wins.
- Removing `!important` cannot safely be done as a batch.

The goal should be reducing the number of places that need it, not mechanically removing the marker.

### Feature ownership is stronger than component ownership — B/C

The same five-declaration “small surface” appears in subject plans, Tera responses, Suhtlus comments and notices. These look identical, but grouping all of them would create a new unrelated mega-selector.

The useful abstractions are components such as “custom checkbox” or “popover shell,” not “everything sharing these five declarations.”

### Theme and behavioral customization are mixed — D

Examples include:

- Replacing notebook labels with Roman numerals at [lines 1187–1208](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:1187)
- Hiding Suhtlus event parameters and no-results hints at [lines 2154–2164](/C:/Users/User/Documents/SideProjects/TORG-stuudium-theme/Stuudium-Intentional-Dark.user.css:2154)
- Replacing native icons with masks and Fontello glyphs
- Repositioning avatars, dividers, toggles and loading indicators

These need a separate “behavior/structural overrides” ownership section eventually.

## 3. Patch clusters

| Cluster | Evidence and likely root cause | Risk |
|---|---|---|
| Login, lines 146–581 | Multiple generations of login UI, ID-heavy original markup, custom toggle reconstruction, provider-specific colors. Mostly self-contained, but structurally fragile. | C |
| Dashboard/todos/notebook, lines 946–1278 and 2718–2759 | Generic diary coverage was followed by stronger TODO rules and four iterations of notebook/loading fixes. This is a genuine specificity reinforcement chain. | B/C |
| Absences, lines 1280–1415 | Calendar, popover and custom toggles restate global control behavior. Focus rules locally undo the global focus ring. | C |
| Subjects/grades, lines 1417–1848 | Several grade systems share class names but intentionally display them differently. Later page-specific rules undo global semantic colors. | C |
| Tera, lines 1850–2110 | Reasonably coherent. The shared file-upload abstraction at lines 2027–2054 is one of the better component extractions. | A/B |
| Suhtlus, lines 2112–2536 | Largest patch chain: composer, participants, expanded posts, comments, events, loaders, custom icons, calendar. Several rules overwrite earlier broad Suhtlus rules. | C |
| Registrations, lines 2538–2639 | Mostly self-contained and predictable. Some badge styling overlaps the final global badge rule. | B |
| Tables/overlays/final exceptions, lines 2641–2765 | Broad generic rules placed after feature modules. Their position is carrying semantic meaning. | C |
| Mobile, lines 2774–2860 | Compact and generally clean. Only one demonstrably duplicate block was found. | A/B |

The history supports this structure: the stylesheet doubled through rapid feature/state coverage rather than copy/paste duplication.

## 4. Duplicate and overridden rules

### Definitely safe cleanup — A

These alternatives are logically subsumed by another selector in the same rule:

- `a:visited` is already matched by `a` at line 107.
- `.st-nav-item:visited` is already matched by `.st-nav-item` at line 606.
- `.stream-entry.ng-grade-is-summary-wrapper` is already matched by `.ng-grade-is-summary-wrapper` at line 1071.
- `.content-container.with-parent` and `.content-container.content-container-is-parent` are already matched by `.content-container` at line 1857.
- `.bl-p.highlighted` and `.post-participants .bl-p` are already matched by `.bl-p` inside the same `.suhtlus` scope at line 2301.
- `.cal-day.cal-day-is-today` is already matched by `.cal-day-is-today` at line 2514.
- `select::placeholder` at line 1406 is ineffective; native `select` elements do not expose a placeholder pseudo-element.
- The mobile `#bg > :is(#bg-img, #bg-img-full)` rule at lines 2783–2785 exactly repeats the unconditional rule at lines 154–156.
- The `.suhtlus-nav a.nav-active` alternative at line 2227 has both declarations unconditionally replaced by the stronger active rule at line 2232.

What this fixes: removes provably dead selector text and one duplicate block.

What could break: nothing under normal selector semantics.

Estimated reduction: about 8–15 physical lines and nine misleading selector branches.

### Exact repeated selectors are mostly intentional

Only five individual selectors occur twice:

- `html`
- `body`
- `.page_subjects_student .lesson_grade_history .grade_param_is_notify`
- `.notebook-is-saving::before`
- `.daily-summaries-navigate.is_loading::after`

None redeclare the same property. They split base properties from variant geometry. They should not be treated as accidental duplicates.

### Equivalent component blocks — A/B

Two login method palettes are exactly duplicated:

- ID-card rules at lines 305–309 and 360–364
- Passkey/WebAuthn rules at lines 311–315 and 348–352

Grouping each pair with their original full selectors is cascade-equivalent.

Estimated reduction: around 8 lines; clearer ownership of provider palettes.

Custom checkbox checked/focus blocks are also duplicated between TODOs and the grading guide:

- Checked: lines 1013–1018 and 1838–1843
- Focus: lines 1020–1023 and 1845–1848

Using comma-separated original selectors preserves specificity. This is visually safe, but placing the shared block should still receive a quick check.

Estimated reduction: around 8–12 lines and one duplicated component implementation.

### Override chains requiring verification

- The generic TODO hover at lines 951–953 and the stronger TODO-specific hover at lines 966–968 produce the same result. The latter may exist solely to beat original-site specificity. **C**
- Good grade classes are accent-colored at lines 1588–1590, then deliberately returned to neutral text inside `.student_subject_grades` at lines 1737–1739. **C**
- Expanded posts receive the same background at lines 2250–2252 and 2310–2315. The stronger rule may be specificity reinforcement. **C**
- Expanded comment-heading spans receive a panel surface at lines 2346–2352, then Suhtlus comment-heading spans are reset to transparent at lines 2475–2481. If every expanded post is below `.suhtlus`, the earlier span branch is dead. **B/C**
- The generic focus-visible rule at lines 859–863 is overridden by `outline: 0` and a very faint shadow in the absence popover at lines 1411–1415. This is both a cascade contradiction and likely accessibility regression. **B/C**
- `.loading-spinner` inside Suhtlus can receive the data-image spinner at lines 2390–2403 and border colors from lines 2713–2716. Confirm whether this creates two competing spinner mechanisms. **C**

## 5. Specificity problems

The file is not uniformly high-specificity; `:where()` is doing valuable work. The problem is concentrated in exceptions.

High-pressure selectors include:

- Grade comment glyph reconstruction at lines 1503–1539
- `tr:has(> #student_subject_grades_mode_toggle)` at line 1712
- Subject-grade summary chains at lines 1703–1709
- Suhtlus membership-search chains at lines 2166–2219
- Mobile current-section selectors at lines 2842–2849

Problems:

- IDs, multiple page roots and state selectors are combined with `!important`.
- Component internals are selected through four to six classes.
- Some specific selectors exist only to reassert a value already supplied by a zero-specificity base.
- Generic class names such as `.important`, `.warning`, `.icon`, `.button` and `.section` have broader meaning than this theme assumes.

Recommended direction: keep low-specificity component bases, but place state variants immediately after their base component. Do not attempt a global specificity rewrite.

Introducing `@layer` is **C/D**. Layered rules interact differently with the site’s unlayered CSS—especially for important declarations—and could change nearly every winner in the stylesheet.

## 6. Candidate design tokens

The existing palette is already good: 698 token references and relatively few raw colors outside login-provider styling.

| Candidate | Purpose | Risk | Benefit |
|---|---|---:|---|
| `--sid-radius-xs: 4px` | Five repeated compact radii in checkboxes, file previews, response badges and selectize tags | B | Removes a stray mini-radius convention; no meaningful line reduction |
| Semantic aliases such as `--sid-bg-card`, `--sid-bg-overlay`, `--sid-bg-hover` | Replace ambiguous numbered surface ownership while initially aliasing existing values | B | Major clarity improvement; little/no line reduction |
| `--sid-idcard-*` and `--sid-passkey-*` | Own duplicated provider color triplets | A/B | Centralizes six repeated raw values; roughly six literals removed |
| `--sid-inset-hairline` | Shared checkbox inset shadow at lines 1000 and 1835 | A | Small consistency gain |
| `--sid-duration-fast: 140ms` | Repeated control/card transitions | B | Centralized motion tuning |
| A spacing scale | Would replace values such as 4, 6, 8, 10, 12 and 14px | B | Only worthwhile after components are normalized; currently risks hiding intentional geometry |

Do not tokenize every one-off measurement. Typography values are sparse enough that a typography-token layer would add indirection without solving current debt.

## 7. Candidate component abstractions

| Abstraction | What it fixes | Safety and possible breakage | Estimated effect |
|---|---|---|---:|
| Shared custom-checkbox primitive | Removes duplicated checked/focus/base styling between TODOs and grading guide | **A/B.** Preserve full selectors and page-specific geometry. Incorrect placement could affect site checkbox defaults. | 10–20 lines; medium complexity reduction |
| Overlay/popover shell | Consolidates surface, border, radius, shadow and arrow colors used by absence, grade, teacher and user-card overlays | **B.** Arrow DOM and pseudo-elements differ. | 15–30 lines |
| Provider login-method palette | Owns ID-card/passkey colors once | **A.** Original full selectors can be grouped directly. | ~8 lines |
| Semantic chip/badge families | Normalizes participant, registration, category and help badges without grouping unrelated containers | **B.** Preserve danger/warning/archived variants. | 20–40 lines |
| Spinner registry | Separates border spinners, pseudo-element spinners and image-backed loading placeholders | **C.** Dynamic loading states and element dimensions differ. | 20–40 lines; high conceptual gain |
| Interactive row primitive | Could unify hover and border behavior across TODOs, courses, posts, calendars and registrations | **C.** Original site specificity differs per component. | Potentially 30–60 declarations |
| Grade semantic-state map | Makes positive, danger, warning, absence and summary states explicit | **C.** The neutral subject-grade override demonstrates that identical classes do not always mean identical presentation. | High clarity; uncertain line reduction |

The four identical five-declaration surface blocks at lines 1809, 2065, 2324 and 2346 should not automatically be grouped. They are visually identical but have unrelated component ownership.

## 8. Rules that appear obsolete

Definitely obsolete or redundant:

- The repeated mobile login-background hiding rule, lines 2783–2785 — **A**
- The ineffective `select::placeholder` branch, line 1406 — **A**
- The eight subsumed selector alternatives listed in section 4 — **A**
- The active Suhtlus-nav branch inside the generic hover/active rule — **A**

Probably obsolete:

- Expanded comment-heading span styling at line 2346, if live DOM confirms `.suhtlus` is always the ancestor — **B/C**
- The stronger TODO hover declaration at line 966, if computed styles show the zero-specificity base already defeats the site — **C**
- One of the two expanded-post background declarations at lines 2250 and 2313, after computed-style inspection — **C**

No complete 20–50-line block can honestly be declared dead from static analysis alone.

## 9. Rules that must not be touched

Until representative DOM states are inspected:

- Navigation/dropdown stacking at lines 584–688
- Historical diary and dynamically loaded lesson selectors at lines 1042–1145
- Notebook tab replacement and saving indicators
- Absence popover toggles and checkmark geometry
- Grade state mappings, summaries, absences and notification history
- Fontello comment-glyph reconstruction
- Tera folder/response masks and Suhtlus icon masks
- Expanded/collapsed Suhtlus event-time differences
- File-upload loading selectors and loader geometry
- Generic table/overlay rules at the end, despite their architectural awkwardness
- Print-view behavior at lines 2767–2772
- Reduced-motion handling at lines 2862–2870
- Vendor-paired `-webkit-mask` and `mask` declarations
- Any broad removal of `!important`
- Rules hiding Suhtlus composer controls or replacing notebook text; these alter behavior and content presentation

The reduced-motion block should eventually be reviewed, because the animated SVG stored in `--sid-spinner-image` is not stopped by CSS animation rules. That is a real inconsistency, but changing loader behavior is not safe statically.

## 10. Prioritized refactoring plan

1. **Create a visual/computed-style baseline — C prerequisite.**  
   Inspect desktop and mobile login, dashboard, loaded historical diary, notebook saving, absence popover, subject grades/history, grading guide, Tera forms/uploads, Suhtlus collapsed/expanded/composer/calendar, registrations, overlays, loading states, report card and reduced motion.  
   Fixes uncertainty; removes no code.

2. **Apply only the A cleanup set.**  
   Remove subsumed alternatives, invalid placeholder branch, duplicated mobile rule, and dead active-nav branch. Group the duplicated login palettes.  
   Nothing should visually change. Estimated removal: 15–25 lines and several false cascade branches.

3. **Extract the true shared components.**  
   Start with custom checkboxes, then overlay arrows and provider palettes. Preserve full selectors so specificity does not change accidentally.  
   Estimated removal: 25–50 lines; meaningful ownership improvement.

4. **Introduce semantic surface aliases.**  
   Alias existing values first, then migrate one component section at a time.  
   Little line reduction, but substantially clearer intent.

5. **Resolve patch chains one feature at a time.**  
   Recommended order: TODOs → notebook/loaders → grades → Suhtlus. For each duplicated declaration, use computed styles to determine whether it is visual intent or specificity reinforcement.  
   Potential removal: 50–120 lines, but the main gain is predictable cascading.

6. **Narrow global rules.**  
   Begin with global links and generic `.important`/`.warning`, then buttons and `.icon`. Do not start with form controls.  
   Potentially eliminates dozens of downstream overrides; highest regression risk.

7. **Move final generic rules into explicit ownership.**  
   Tables, overlays, badges and footer styles should live in component sections or an intentionally documented exceptions section.  
   This reduces dependence on source order, even if line count remains similar.

8. **Audit `!important` only after ownership is fixed.**  
   Remove it declaration-by-declaration using the site’s actual competing selector and computed winner. A numeric reduction target would be counterproductive.

The correct first refactor is therefore small: roughly 15–25 lines of proven dead material, followed by component extraction with visual checkpoints. A large consolidation pass would threaten the 90% finished appearance without addressing the actual root cause.