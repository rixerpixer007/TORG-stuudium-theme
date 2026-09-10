import { describe, expect, it } from "vitest";

import { isExtensionContextInvalidatedError } from "../src/platforms/webextension/extension-context";
import {
  isOpenSettingsMessage,
  isReturnToStuudiumMessage,
  OPEN_SETTINGS_MESSAGE,
  RETURN_TO_STUUDIUM_MESSAGE,
} from "../src/platforms/webextension/open-settings";

describe("settings message", () => {
  it("accepts only the internal open-settings message shape", () => {
    expect(isOpenSettingsMessage({ type: OPEN_SETTINGS_MESSAGE })).toBe(true);
    expect(isOpenSettingsMessage({ type: OPEN_SETTINGS_MESSAGE, unexpected: true })).toBe(false);
    expect(isOpenSettingsMessage({ type: "anything-else" })).toBe(false);
    expect(isOpenSettingsMessage(null)).toBe(false);
  });

  it("accepts only the internal return-to-Stuudium message shape", () => {
    expect(isReturnToStuudiumMessage({ type: RETURN_TO_STUUDIUM_MESSAGE })).toBe(true);
    expect(isReturnToStuudiumMessage({ type: RETURN_TO_STUUDIUM_MESSAGE, unexpected: true })).toBe(
      false,
    );
    expect(isReturnToStuudiumMessage({ type: OPEN_SETTINGS_MESSAGE })).toBe(false);
  });

  it("recognizes only extension-context invalidation failures", () => {
    expect(isExtensionContextInvalidatedError(new Error("Extension context invalidated."))).toBe(
      true,
    );
    expect(isExtensionContextInvalidatedError(new Error("Storage failed"))).toBe(false);
    expect(isExtensionContextInvalidatedError("Extension context invalidated.")).toBe(false);
  });
});
