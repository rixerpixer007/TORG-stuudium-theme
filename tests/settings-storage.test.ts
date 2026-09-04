import { describe, expect, it, vi } from "vitest";

import { subscribeToSettingsChanges } from "../src/platforms/webextension/settings-storage";

describe("WebExtension settings subscription", () => {
  it("removes its captured listener once without rereading the browser API", () => {
    const storageChanges = {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
    const unsubscribe = subscribeToSettingsChanges(storageChanges, vi.fn());

    unsubscribe();
    unsubscribe();

    expect(storageChanges.addListener).toHaveBeenCalledTimes(1);
    expect(storageChanges.removeListener).toHaveBeenCalledTimes(1);
    expect(storageChanges.removeListener).toHaveBeenCalledWith(
      storageChanges.addListener.mock.calls[0]?.[0],
    );
  });

  it("treats invalidated-context cleanup as already complete", () => {
    const storageChanges = {
      addListener: vi.fn(),
      removeListener: vi.fn(() => {
        throw new Error("Extension context invalidated.");
      }),
    };
    const unsubscribe = subscribeToSettingsChanges(storageChanges, vi.fn());

    expect(unsubscribe).not.toThrow();
  });

  it("does not hide unexpected listener cleanup failures", () => {
    const storageChanges = {
      addListener: vi.fn(),
      removeListener: vi.fn(() => {
        throw new Error("Unexpected storage failure");
      }),
    };
    const unsubscribe = subscribeToSettingsChanges(storageChanges, vi.fn());

    expect(unsubscribe).toThrow("Unexpected storage failure");
  });
});
