import fs from "node:fs";
import path from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

describe("settings menu styles", () => {
  const projectRoot = path.resolve(import.meta.dirname, "..");
  const css = fs.readFileSync(
    path.join(projectRoot, "src/platforms/webextension/settings-menu.css"),
    "utf8",
  );
  const parsed = postcss.parse(css);
  const primaryNavigation = postcss.parse(
    fs.readFileSync(path.join(projectRoot, "src/theme/modules/30-primary-navigation.css"), "utf8"),
  );

  it("keeps the settings shortcut visible without activating the dark theme", () => {
    const baseRule = parsed.nodes.find(
      (node): node is postcss.Rule =>
        node.type === "rule" && node.selector === ".sid-extension-settings-menu-item",
    );
    const display = baseRule?.nodes.find(
      (node): node is postcss.Declaration => node.type === "decl" && node.prop === "display",
    );
    const background = baseRule?.nodes.find(
      (node): node is postcss.Declaration => node.type === "decl" && node.prop === "background",
    );

    expect(display?.value).toBe("flex");
    expect(display?.important).toBe(true);
    expect(background?.value).toBe("transparent");
    expect(background?.important).not.toBe(true);
    expect(baseRule?.selector).not.toContain("data-sid-enhancement");
  });

  it("keeps dark-theme colors behind the activation marker", () => {
    const tokenRules: postcss.Rule[] = [];
    parsed.walkRules((rule) => {
      if (rule.nodes.some((node) => node.type === "decl" && node.value.includes("var(--sid-"))) {
        tokenRules.push(rule);
      }
    });

    expect(tokenRules).not.toHaveLength(0);
    expect(
      tokenRules.every((rule) => rule.selector.includes('data-sid-enhancement="enabled"')),
    ).toBe(true);
  });

  it("resets both the panel and its native trigger while settings are open", () => {
    const dismissedRules: postcss.Rule[] = [];
    parsed.walkRules((rule) => {
      if (rule.selector.includes("data-sid-settings-menu-dismissed")) dismissedRules.push(rule);
    });

    expect(
      dismissedRules.some(
        (rule) =>
          rule.selector.includes("st-nav-item-expandable-content") &&
          rule.nodes.some(
            (node) => node.type === "decl" && node.prop === "visibility" && node.value === "hidden",
          ),
      ),
    ).toBe(true);
    expect(
      dismissedRules.some(
        (rule) =>
          rule.selector.includes("> .st-nav-item") &&
          rule.nodes.some(
            (node) =>
              node.type === "decl" && node.prop === "background" && node.value === "transparent",
          ),
      ),
    ).toBe(true);
  });

  it("themes Stuudium's native expanded state on touch devices", () => {
    const expandedRule = primaryNavigation.nodes.find(
      (node): node is postcss.Rule =>
        node.type === "rule" &&
        node.selector.includes(
          ".st-nav-is-touch .st-nav-item-expandable.st-nav-item-expanded > .st-nav-item",
        ),
    );

    expect(expandedRule).toBeDefined();
    expect(
      expandedRule?.nodes.some(
        (node) =>
          node.type === "decl" &&
          node.prop === "background" &&
          node.value === "var(--sid-accent-soft)" &&
          node.important,
      ),
    ).toBe(true);
  });

  it("does not paint a missed mobile menu tap as active", () => {
    const desktopHoverRule = primaryNavigation.nodes.find(
      (node): node is postcss.Rule =>
        node.type === "rule" &&
        node.selector.includes(
          ".st-stuudium-navigation-2021:not(.st-nav-is-touch) .st-nav-item-expandable:hover > .st-nav-item",
        ),
    );
    const collapsedTouchRule = primaryNavigation.nodes.find(
      (node): node is postcss.Rule =>
        node.type === "rule" &&
        node.selector.includes('[data-role="st-nav-other-menu"]:not(.st-nav-item-expanded)') &&
        node.selector.includes(":hover") &&
        node.selector.includes("> .st-nav-item"),
    );

    expect(desktopHoverRule).toBeDefined();
    expect(desktopHoverRule?.selector).not.toMatch(
      /(^|,)\s*\.st-nav-item-expandable:hover > \.st-nav-item/,
    );
    expect(
      collapsedTouchRule?.nodes.some(
        (node) =>
          node.type === "decl" &&
          node.prop === "background" &&
          node.value === "transparent" &&
          node.important,
      ),
    ).toBe(true);
  });
});
