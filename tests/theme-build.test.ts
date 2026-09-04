import fs from "node:fs";
import path from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

describe("generated theme", () => {
  const projectRoot = path.resolve(import.meta.dirname, "..");

  function findRule(css: string, selectorFragment: string) {
    let match: postcss.Rule | undefined;
    postcss.parse(css).walkRules((rule) => {
      if (!match && rule.selector.includes(selectorFragment)) match = rule;
    });
    return match;
  }

  it("keeps root, descendant, pseudo-element, and keyframe selectors valid", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    const parsed = postcss.parse(css);

    expect(css).toContain(':root:where([data-sid-enhancement="enabled"])');
    expect(css).toContain(
      ':where(html[data-sid-enhancement="enabled"]) .st-stuudium-navigation-2021',
    );
    expect(css).toContain(':where(html[data-sid-enhancement="enabled"])::-webkit-scrollbar');

    const keyframeSelectors: string[] = [];
    const ungatedSelectors: string[] = [];
    parsed.walkAtRules(/keyframes$/i, (atRule) => {
      atRule.walkRules((rule) => {
        keyframeSelectors.push(rule.selector);
      });
    });
    parsed.walkRules((rule) => {
      if (keyframeSelectors.includes(rule.selector)) return;
      if (!rule.selector.includes("data-sid-enhancement")) {
        ungatedSelectors.push(rule.selector);
      }
    });
    expect(keyframeSelectors).toContain("0%");
    expect(keyframeSelectors.every((selector) => !selector.includes("data-sid-enhancement"))).toBe(
      true,
    );
    expect(ungatedSelectors).toEqual([]);
  });

  it("keeps dashboard layout overrides stronger than Stuudium's later rules", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    const cardRule = findRule(css, "#dashboard_recent .dr-column :is(.section, .daily-summaries)");
    const layoutRule = findRule(css, "body.page_dashboard_recent #dashboard_recent");

    expect(
      cardRule?.nodes.some(
        (node) => node.type === "decl" && node.prop === "padding" && node.value === "14px",
      ),
    ).toBe(true);
    expect(
      layoutRule?.nodes.some(
        (node) => node.type === "decl" && node.prop === "margin-inline" && node.value === "0",
      ),
    ).toBe(true);
  });

  it("keeps the collapsed lessons label stronger than Stuudium's important link color", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    const labelRule = findRule(css, 'a[data-action="dashboard-lessons-block-expand"]');
    const color = labelRule?.nodes.find(
      (node): node is postcss.Declaration => node.type === "decl" && node.prop === "color",
    );

    expect(labelRule?.selector).toContain(".daily-summaries-segment-block-lessons-collapsed-title");
    expect(color?.value).toBe("var(--sid-text-2)");
    expect(color?.important).toBe(true);
  });
});
