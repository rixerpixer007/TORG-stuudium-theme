import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS, normalizeSettings } from "../src/shared/settings";

describe("normalizeSettings", () => {
  it("uses the enabled default for missing or invalid storage", () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ enhancementEnabled: "yes" })).toEqual(DEFAULT_SETTINGS);
  });

  it("preserves a stored boolean preference", () => {
    expect(normalizeSettings({ enhancementEnabled: false })).toEqual({
      enhancementEnabled: false,
    });
  });
});
