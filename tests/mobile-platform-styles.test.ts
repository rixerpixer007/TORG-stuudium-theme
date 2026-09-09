import fs from "node:fs";
import path from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

describe("mobile platform styles", () => {
  const projectRoot = path.resolve(import.meta.dirname, "..");
  const css = fs.readFileSync(path.join(projectRoot, "src/mobile/platform.css"), "utf8");
  const parsed = postcss.parse(css);

  it("disables only the inherited native tap highlight", () => {
    const rootRule = parsed.nodes.find(
      (node): node is postcss.Rule => node.type === "rule" && node.selector === "html",
    );
    const tapHighlight = rootRule?.nodes.find(
      (node): node is postcss.Declaration =>
        node.type === "decl" && node.prop === "-webkit-tap-highlight-color",
    );

    expect(tapHighlight?.value).toBe("transparent");
    expect(css).not.toMatch(/outline|focus/);
  });
});
