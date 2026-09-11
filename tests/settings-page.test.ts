// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { mountSettingsPage } from "../src/features/settings-page";
import type { ExtensionSettings, SettingsStore } from "../src/shared/settings";

function createStore(): SettingsStore & { value: ExtensionSettings } {
  return {
    value: {
      enhancementEnabled: true,
      theme: { mode: "manual", themeId: "graphite-blue" },
    },
    get() {
      return Promise.resolve(this.value);
    },
    set(settings) {
      this.value = settings;
      return Promise.resolve();
    },
    subscribe() {
      return () => undefined;
    },
  };
}

describe("shared settings page", () => {
  beforeEach(() => {
    document.documentElement.innerHTML = `
      <head><meta name="color-scheme" content="dark"></head>
      <body aria-busy="true">
        <button class="app-home" type="button" data-return-to-stuudium></button>
        <button class="settings-return" type="button" data-return-to-stuudium></button>
        <button data-category="all" aria-pressed="true"></button>
        <button data-category="appearance" aria-pressed="false"></button>
        <button data-category="updates" aria-pressed="false"></button>
        <input id="settings-search">
        <section data-settings-section="appearance">
          <div data-setting-item data-search-terms="theme">
            <input id="enhancement-enabled" type="checkbox">
            <div id="theme-options"></div>
          </div>
        </section>
        <section data-settings-section="privacy"></section>
        <section data-settings-section="updates">
          <div data-setting-item data-search-terms="version update">
            <span id="app-version">Loading…</span>
            <button id="check-for-updates" type="button">Check now</button>
            <p id="update-check-status"></p>
          </div>
        </section>
        <p id="status"></p>
        <p class="settings-empty" hidden></p>
      </body>
    `;
  });

  it("renders the shared catalog and persists theme and enable changes", async () => {
    const store = createStore();
    const cleanup = mountSettingsPage({ document, settingsStore: store });
    await Promise.resolve();

    const themeInputs = document.querySelectorAll<HTMLInputElement>('input[name="theme"]');
    expect(themeInputs).toHaveLength(5);
    expect(themeInputs[1]?.checked).toBe(true);
    expect(document.documentElement.dataset.sidTheme).toBe("graphite-blue");
    expect(document.documentElement.dataset.sidSettingsState).toBe("ready");

    const mint = themeInputs[0];
    if (mint === undefined) throw new Error("Mint theme control is missing");
    mint.checked = true;
    mint.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(store.value.theme.themeId).toBe("graphite-mint");

    const enabled = document.querySelector<HTMLInputElement>("#enhancement-enabled");
    if (enabled === null) throw new Error("Enable control is missing");
    enabled.checked = false;
    enabled.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(store.value.enhancementEnabled).toBe(false);

    cleanup();
  });

  it("returns to Stuudium from both back controls", () => {
    const returnToStuudium = vi.fn();
    const cleanup = mountSettingsPage({
      document,
      settingsStore: createStore(),
      returnToStuudium,
    });

    document.querySelector<HTMLButtonElement>(".app-home")?.click();
    document.querySelector<HTMLButtonElement>(".settings-return")?.click();

    expect(returnToStuudium).toHaveBeenCalledTimes(2);
    cleanup();
  });

  it("uses extension placeholders without enabling update checks", async () => {
    const cleanup = mountSettingsPage({ document, settingsStore: createStore() });
    await Promise.resolve();

    expect(document.querySelector("#app-version")?.textContent).toBe("0.0.0");
    expect(document.querySelector<HTMLButtonElement>("#check-for-updates")?.disabled).toBe(true);
    cleanup();
  });

  it("shows the native version and runs a manual Android update check", async () => {
    const appUpdates = {
      getCurrentVersion: vi.fn().mockResolvedValue("0.1.0-beta"),
      checkForUpdates: vi.fn().mockResolvedValue("up-to-date" as const),
    };
    const cleanup = mountSettingsPage({
      document,
      settingsStore: createStore(),
      appUpdates,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(document.querySelector("#app-version")?.textContent).toBe("0.1.0-beta");
    document.querySelector<HTMLButtonElement>("#check-for-updates")?.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(appUpdates.checkForUpdates).toHaveBeenCalledOnce();
    expect(document.querySelector("#update-check-status")?.textContent).toBe(
      "Sinu Stuudium is up to date.",
    );
    cleanup();
  });
});
