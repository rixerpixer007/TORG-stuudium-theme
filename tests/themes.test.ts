import { describe, expect, it } from "vitest";

import { applyTheme, clearTheme } from "../src/features/theme-selection";
import { getEarlyActivationScript } from "../src/platforms/webextension/early-activation";
import {
  DEFAULT_THEME_ID,
  getTheme,
  isThemeId,
  THEME_ATTRIBUTE,
  THEMES,
} from "../src/shared/themes";

describe("theme catalog", () => {
  it("has unique IDs and keeps Graphite Mint as the default", () => {
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(THEMES.length);
    expect(DEFAULT_THEME_ID).toBe("graphite-mint");
    expect(getTheme(DEFAULT_THEME_ID).preview.accent).toBe("#65d6b1");
    expect(getTheme("graphite-blue").preview.canvas).toBe("#0c1118");
    expect(getTheme("obsidian-red").preview.accent).toBe("#ff6b7a");
    expect(getTheme("velvet-mauve").preview.accent).toBe("#cba6f7");
    expect(getTheme("midnight-amber").preview.accent).toBe("#f2b84b");
  });

  it("recognizes only catalogued themes", () => {
    expect(isThemeId("graphite-mint")).toBe(true);
    expect(isThemeId("graphite-blue")).toBe(true);
    expect(isThemeId("obsidian-red")).toBe(true);
    expect(isThemeId("velvet-mauve")).toBe(true);
    expect(isThemeId("midnight-amber")).toBe(true);
    expect(isThemeId("unknown-theme")).toBe(false);
  });

  it("maps every theme to a bundled early-activation script", () => {
    expect(THEMES.map((theme) => getEarlyActivationScript(theme.id))).toEqual([
      "activation-graphite-mint.js",
      "activation-graphite-blue.js",
      "activation-obsidian-red.js",
      "activation-velvet-mauve.js",
      "activation-midnight-amber.js",
    ]);
  });
});

describe("theme document attribute", () => {
  it("applies and clears the selected theme through one stable attribute", () => {
    const attributes = new Map<string, string>();
    const target = {
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
      removeAttribute(name: string) {
        attributes.delete(name);
      },
    };

    applyTheme(target, "graphite-blue");
    expect(attributes.get(THEME_ATTRIBUTE)).toBe("graphite-blue");

    clearTheme(target);
    expect(attributes.has(THEME_ATTRIBUTE)).toBe(false);
  });
});
