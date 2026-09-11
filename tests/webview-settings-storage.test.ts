// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";

import {
  closeWebViewSettings,
  createWebViewAppUpdates,
  createWebViewSettingsStore,
  type WebViewMessageEvent,
  type WebViewMessagePort,
} from "../src/platforms/webview/settings-storage";
import type { ExtensionSettings } from "../src/shared/settings";

class FakeWebViewBridge implements WebViewMessagePort {
  readonly listeners = new Set<(event: WebViewMessageEvent) => void>();
  settings: ExtensionSettings = {
    enhancementEnabled: true,
    theme: { mode: "manual", themeId: "graphite-mint" },
  };

  postMessage(message: string): void {
    const request = JSON.parse(message) as {
      id: string;
      type: "get-settings" | "set-settings" | "get-app-info" | "check-for-updates";
      settings?: ExtensionSettings;
    };
    if (request.type === "set-settings" && request.settings !== undefined) {
      this.settings = request.settings;
    }

    queueMicrotask(() => {
      const response = JSON.stringify({
        id: request.id,
        ok: true,
        settings: this.settings,
        version: request.type === "get-app-info" ? "0.1.0-beta" : undefined,
        updateStatus: request.type === "check-for-updates" ? "up-to-date" : undefined,
      });
      this.listeners.forEach((listener) => {
        listener({ data: response });
      });
    });
  }

  addEventListener(_type: "message", listener: (event: WebViewMessageEvent) => void): void {
    this.listeners.add(listener);
  }

  removeEventListener(_type: "message", listener: (event: WebViewMessageEvent) => void): void {
    this.listeners.delete(listener);
  }
}

describe("WebView settings storage adapter", () => {
  it("requests that the native settings activity close", () => {
    const bridge = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } satisfies WebViewMessagePort;

    closeWebViewSettings(bridge);

    expect(bridge.postMessage).toHaveBeenCalledWith("close-settings");
  });

  it("reads, writes, normalizes, and publishes preferences through the narrow bridge", async () => {
    const bridge = new FakeWebViewBridge();
    const store = createWebViewSettingsStore(bridge);
    const listener = vi.fn();
    store.subscribe(listener);

    await expect(store.get()).resolves.toEqual(bridge.settings);

    const nextSettings: ExtensionSettings = {
      enhancementEnabled: false,
      theme: { mode: "manual", themeId: "graphite-blue" },
    };
    await store.set(nextSettings);

    expect(bridge.settings).toEqual(nextSettings);
    expect(listener).toHaveBeenCalledWith(nextSettings);
  });

  it("reads Android app information and requests a manual update check", async () => {
    const appUpdates = createWebViewAppUpdates(new FakeWebViewBridge());

    await expect(appUpdates.getCurrentVersion()).resolves.toBe("0.1.0-beta");
    await expect(appUpdates.checkForUpdates()).resolves.toBe("up-to-date");
  });
});
