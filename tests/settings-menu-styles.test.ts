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
});
