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

  it("keeps expanded dark-theme coverage for live Stuudium component variants", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    const favoriteRule = findRule(css, ".post-in-list.post-is-favorite");
    const emptyFolderRule = findRule(css, ".add_to_folder .is_empty_indicator");
    const responseLinkRule = findRule(css, ".response_node_inner .node_time em");
    const responseMetaRule = findRule(css, ".single_node_is_response .node-meta");
    const unexcusedAbsenceRule = findRule(css, ".absences .custom-checkbox-v2 + em");
    const excusedAbsenceRule = findRule(css, ".absences .custom-checkbox-v2:checked + em");
    const rejectedExcuseRule = findRule(css, ".excuse.excuse_rejected");
    const lessonBordersRule = findRule(css, ".student_subject_grades :where(tr, th, td)");

    expect(favoriteRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ prop: "border-image", value: "none", important: true }),
      ]),
    );
    expect(emptyFolderRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ prop: "color", value: "var(--sid-text-3)", important: true }),
      ]),
    );
    expect(responseLinkRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ prop: "color", value: "inherit", important: true }),
      ]),
    );
    expect(responseMetaRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "background",
          value: "transparent",
          important: true,
        }),
      ]),
    );
    expect(unexcusedAbsenceRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "background-color",
          value: "var(--sid-danger-soft)",
          important: true,
        }),
        expect.objectContaining({
          prop: "border",
          value: "1px solid var(--sid-danger)",
          important: true,
        }),
      ]),
    );
    expect(excusedAbsenceRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "background-image",
          value: "var(--sid-checkmark-image)",
          important: true,
        }),
        expect.objectContaining({
          prop: "border-color",
          value: "var(--sid-accent)",
          important: true,
        }),
      ]),
    );
    expect(rejectedExcuseRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "color",
          value: "var(--sid-danger)",
          important: true,
        }),
      ]),
    );
    expect(lessonBordersRule?.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "border-color",
          value: "var(--sid-border)",
          important: true,
        }),
      ]),
    );
  });

  it("leaves dashboard timeline heading box geometry to Stuudium", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    let headingColorRule: postcss.Rule | undefined;
    let framedHeadingRule: postcss.Rule | undefined;
    let dashboardHeadingRule: postcss.Rule | undefined;

    postcss.parse(css).walkRules((rule) => {
      if (!rule.selector.includes(".daily-summaries-segment-heading")) return;

      if (rule.selector.includes("body.page_dashboard_recent")) dashboardHeadingRule = rule;
      else if (rule.selector.includes("body:not(.page_dashboard_recent)")) framedHeadingRule = rule;
      else headingColorRule = rule;
    });
    const colorDeclarations = Object.fromEntries(
      headingColorRule?.nodes
        .filter((node): node is postcss.Declaration => node.type === "decl")
        .map((node) => [node.prop, { value: node.value, important: node.important }]) ?? [],
    );
    const framedDeclarations = Object.fromEntries(
      framedHeadingRule?.nodes
        .filter((node): node is postcss.Declaration => node.type === "decl")
        .map((node) => [node.prop, node.value]) ?? [],
    );
    const dashboardDeclarations = Object.fromEntries(
      dashboardHeadingRule?.nodes
        .filter((node): node is postcss.Declaration => node.type === "decl")
        .map((node) => [node.prop, { value: node.value, important: node.important }]) ?? [],
    );

    expect(colorDeclarations).toEqual({
      color: { value: "var(--sid-text)", important: true },
    });
    expect(framedDeclarations).toMatchObject({
      padding: "7px 10px",
      background: "var(--sid-surface-2)",
      border: "1px solid var(--sid-border)",
    });
    expect(dashboardDeclarations).toEqual({
      "background-color": { value: "transparent", important: true },
    });
  });

  it("includes every gated selectable palette while retaining Mint as the fallback", () => {
    const css = fs.readFileSync(path.join(projectRoot, "src/generated/theme.css"), "utf8");
    const mintFallback = findRule(css, ":root:where([data-sid-enhancement");
    const palettes = [
      ["graphite-blue", "#0c1118", "#75a7ff", "#eef2f8"],
      ["obsidian-red", "#0d0d0f", "#ff6b7a", "#f5f0f2"],
      ["velvet-mauve", "#11111b", "#cba6f7", "#cdd6f4"],
      ["midnight-amber", "#11100d", "#f2b84b", "#f3ead7"],
    ] as const;

    expect(css).toContain("--sid-accent: #65d6b1");
    palettes.forEach(([themeId, canvas, accent, text]) => {
      const palette = findRule(css, `[data-sid-theme="${themeId}"]`);
      expect(palette?.selector).toContain('data-sid-enhancement="enabled"');
      expect(palette?.selector).toContain(`data-sid-theme="${themeId}"`);
      expect(
        palette?.nodes.some(
          (node) => node.type === "decl" && node.prop === "--sid-accent" && node.value === accent,
        ),
      ).toBe(true);
      expect(
        palette?.nodes.some(
          (node) => node.type === "decl" && node.prop === "--sid-canvas" && node.value === canvas,
        ),
      ).toBe(true);
      expect(
        palette?.nodes.some(
          (node) => node.type === "decl" && node.prop === "--sid-text" && node.value === text,
        ),
      ).toBe(true);
    });
    expect(mintFallback).toBeDefined();
  });

  it("keeps Mint-specific accent values inside palette modules", () => {
    const modulesDirectory = path.join(projectRoot, "src/theme/modules");
    const componentCss = fs
      .readdirSync(modulesDirectory)
      .filter(
        (file) => file.endsWith(".css") && !["01-tokens.css", "02-palettes.css"].includes(file),
      )
      .map((file) => fs.readFileSync(path.join(modulesDirectory, file), "utf8"))
      .join("\n");

    expect(componentCss).not.toMatch(/#65d6b1|#7ce8c3|101 214 177|25 78 60|%2365d6b1/i);
  });

  it("keeps Mint-specific neutral values inside palette modules", () => {
    const modulesDirectory = path.join(projectRoot, "src/theme/modules");
    const componentCss = fs
      .readdirSync(modulesDirectory)
      .filter(
        (file) => file.endsWith(".css") && !["01-tokens.css", "02-palettes.css"].includes(file),
      )
      .map((file) => fs.readFileSync(path.join(modulesDirectory, file), "utf8"))
      .join("\n");

    expect(componentCss).not.toMatch(
      /#0f1311|#171c19|#202824|#2a332e|#3a4740|#f2f0e9|#c1c0b8|15 19 17|23 28 25|25 31 27|32 40 36|193 192 184|242 240 233|%23(?:1b211e|c1c0b8)/i,
    );
  });
});
