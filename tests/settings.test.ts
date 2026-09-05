import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, normalizeSettings } from "../src/shared/settings";

describe("normalizeSettings", () => {
  it("uses the enabled default for missing or invalid storage", () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ enhancementEnabled: "yes" })).toEqual(DEFAULT_SETTINGS);
  });

  it("preserves valid stored preferences", () => {
    expect(
      normalizeSettings({
        enhancementEnabled: false,
        theme: { mode: "manual", themeId: "graphite-blue" },
      }),
    ).toEqual({
      enhancementEnabled: false,
      theme: { mode: "manual", themeId: "graphite-blue" },
    });
  });

  it("migrates Phase 1 settings to the default theme", () => {
    expect(normalizeSettings({ enhancementEnabled: false })).toEqual({
      enhancementEnabled: false,
      theme: { mode: "manual", themeId: "graphite-mint" },
    });
  });

  it("rejects unknown theme identifiers and modes", () => {
    expect(
      normalizeSettings({
        enhancementEnabled: true,
        theme: { mode: "automatic", themeId: "graphite-blue" },
      }),
    ).toEqual(DEFAULT_SETTINGS);
    expect(
      normalizeSettings({
        enhancementEnabled: true,
        theme: { mode: "manual", themeId: "paid-rainbow" },
      }),
    ).toEqual(DEFAULT_SETTINGS);
  });
});
