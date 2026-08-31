# Stuudium theme agent guide

## Mission

Maintain `Stuudium-Intentional-Dark.user.css` without redesigning it. Preserve the current colors, typography, spacing, layout, sizing, borders, shadows, radii, motion, and responsive behavior unless the user explicitly approves a design change.

## Sources of truth

1. The signed-in, rendered Stuudium site with this exact local stylesheet active.
2. `Stuudium-Intentional-Dark.user.css`.

## Change workflow

1. Start from a clean Git checkpoint and inspect the relevant existing rules.
2. Inspect the real DOM, original-site competition, and computed styles before editing.
3. Make one component or cascade hypothesis per batch. Do not mix unrelated cleanup.
4. Put new rules in the existing component section, ordered as base, variants, interaction states, then responsive differences. Do not append a generic patch block at the end.
5. Fix the earliest incorrect owner when evidence supports it; otherwise keep a necessary specific override and document why.
6. Reuse an existing `--sid-*` token when its meaning matches. Add a token only for a repeated design decision, not every repeated value.
7. Preserve selector specificity, source order, and legitimate `!important` declarations unless live evidence proves a simpler rule wins safely. Keep `:where(...)` when removing it would raise specificity.

Do not introduce `@layer`, a global reset, a broad specificity rewrite, a zero-`!important` goal, or a line-count target. Do not silently fix an existing design bug while implementing another request.

## New features

- First identify the owning page, component, states, and responsive behavior from the live site.
- Extend the nearest existing component rule or add one clearly named component block.
- Cover every relevant state: default, hover, focus-visible, active, selected/checked, expanded/collapsed, disabled, loading, and mobile.
- Keep feature-specific geometry local. Share only declarations that are genuinely the same component decision.
- Never change attendance, TODOs, messages, grades, reactions, or other Stuudium data merely to test CSS unless the user approves it.

## Verification

After every meaningful CSS change:

1. Confirm the local file is the stylesheet injected by Stylus, then reload the affected page.
2. Compare with the pre-change page at the same route and viewport.
3. Exercise the affected interaction states and one unaffected negative-control component.
4. Test the relevant responsive breakpoint. If the environment cannot do so, record `BLOCKED`; do not claim mobile equivalence.
5. Run `git diff --check`, inspect the complete diff, and confirm braces and parentheses remain balanced.
6. Update the existing verification matrix and add a concise entry to `REFACTOR_LOG.md` for refactor batches.
7. Commit only a verified, logically isolated batch. Revert or record `REQUIRES REVIEW` when equivalence is uncertain.

When handing off, state the root cause, exact change, pages/states tested, result, and any unverified limitation. Do not call a change visually equivalent based only on static CSS inspection.
