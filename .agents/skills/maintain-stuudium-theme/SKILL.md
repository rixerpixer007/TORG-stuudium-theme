---
name: maintain-stuudium-theme
description: Edit, refactor, review, or live-verify TORG Stuudium theme CSS and DOM-dependent presentation while preserving the established design. Use for stylesheet changes, selector or cascade debugging, responsive and interaction-state styling, CSS injection equivalence, and visual regressions; do not use for platform code or documentation that does not affect rendered styling.
---

# Maintain the Stuudium theme

Preserve the current colors, typography, spacing, layout, sizing, borders, shadows, radii, motion, and responsive behavior unless the user explicitly approves a design change.

## Sources of truth

Use both:

1. The signed-in, rendered Stuudium site with the relevant local build or stylesheet active.
2. The actual theme source in this repository.

Until a modular source build is introduced, `Stuudium-Intentional-Dark.user.css` is the primary theme source. If it later becomes a generated compatibility artifact, identify and edit its declared source files instead; do not hand-edit generated output. Always confirm which local artifact the browser is actually loading.

## Before editing

- Inspect `git status` and the relevant existing rules. Preserve unrelated and pre-existing changes.
- Inspect the real DOM, original-site competition, computed styles, and the element's semantic role. Do not infer that a node is a control, container, label, or state wrapper from its class name alone.
- Treat screenshots as symptom and visual-reference evidence, not selector evidence.
- Form one component or cascade hypothesis per batch; do not combine unrelated cleanup.

## CSS changes

- Put rules in the owning component section, ordered as base, variants, interaction states, then responsive differences. Do not append a generic patch block at the end.
- Trace the winning cascade and inheritance. Fix the earliest incorrect owner when evidence supports it instead of compensating at every descendant.
- Reuse an existing `--sid-*` token when its semantic meaning matches. Add a token only for a repeated design decision.
- Preserve selector specificity, source order, and legitimate `!important` declarations unless live evidence proves a simpler rule wins safely. Keep `:where(...)` when removing it would raise specificity.
- Do not introduce `@layer`, a global reset, a broad specificity rewrite, a zero-`!important` goal, or a line-count target.
- Do not silently fix an existing design defect while implementing another request.
- Keep follow-up fixes within the current page or release version unless the user requests another version bump.

## Components, states, and responsive behavior

- Identify the owning page, component, semantic states, and responsive behavior before implementing a visual feature.
- Extend the nearest existing component rule or add one clearly named component block.
- Cover every relevant state, including states not currently visible: default, hover, focus-visible, active, selected or checked, expanded or collapsed, disabled, loading, and mobile.
- Keep feature-specific geometry local.
- When another component looks reusable, inspect both DOM contracts first. Share an owner only when they represent the same component decision; matching values alone do not justify a broad or fragile shared selector.

## Safe live testing

Never change attendance, TODOs, messages, grades, reactions, registrations, or other Stuudium data merely to test CSS without the user's approval. Ask immediately before a narrow live side effect, minimize it, and restore the original state after inspection when restoration is possible.

## Verification

After every meaningful CSS change:

1. Confirm the intended local stylesheet or extension build is injected, then reload the affected page.
2. Compare against the pre-change page at the same route and viewport.
3. Exercise affected interaction and semantic states, including relevant states that require a controlled fixture, plus one unaffected negative-control component.
4. Test the relevant responsive breakpoint. If unavailable, record `BLOCKED`; do not claim mobile equivalence.
5. Inspect the injected rules and computed winning styles rather than relying only on screenshots.
6. Run applicable project checks, `git diff --check`, inspect the complete diff, and confirm CSS braces and parentheses remain balanced.
7. If the repository contains a verification matrix or `REFACTOR_LOG.md` relevant to the batch, update it as required by its local conventions.

Do not call a change visually equivalent based only on static CSS inspection. If asked to commit, commit only a verified, logically isolated batch; otherwise do not commit. Record uncertain equivalence as `REQUIRES REVIEW` or revert the uncertain change.

## Handoff

Report the root cause, exact CSS or source change, routes and states tested, viewport or responsive coverage, negative control, result, and every unverified limitation.
