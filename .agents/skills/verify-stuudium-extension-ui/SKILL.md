---
name: verify-stuudium-extension-ui
description: Live-verify UI injected into genuine Stuudium pages by the local extension, including artifact freshness, DOM placement, computed geometry, interaction states, responsive behavior, and console health. Use after an extension UI build; do not use for options-page-only work or logic with no rendered Stuudium surface.
---

# Verify Stuudium extension UI

Prove that the actual local development build behaves correctly on the genuine signed-in Stuudium page. Use a dedicated browser profile or isolated session when available, and never mutate school data merely to construct a visual state.

## Fast path

1. Run `npm run dev` and confirm the browser has `.output/chrome-mv3-dev/` loaded. The production folder `.output/chrome-mv3/` is not updated by the watcher.
2. Before detailed inspection, confirm an unmistakable changed selector, value, markup node, or bundle-specific signal is present. If the old artifact remains after one refresh, reload the correct extension and refresh once; do not keep diagnosing stale output as current code.
3. Inspect the component's real DOM contract, direct siblings or parent owner, matched competition, computed winners, and element rectangles.
4. Compare the affected item with its nearest native peer rather than hard-coding a screenshot-derived value.
5. Exercise the applicable default, hover, focus-visible, active, expanded, disabled, and cleanup states. Check one unaffected native control and one relevant responsive width.
6. Check page and extension consoles. Report the route, viewport, states, negative control, injected-artifact proof, and any blocked protected-browser step.

For a navigation-menu item, record direct-child DOM order plus item, icon, and label rectangles. Confirm that repeated mounting does not duplicate or needlessly reinsert the owned node.

Do not claim visual equivalence from source inspection, generated output, or screenshots alone.
