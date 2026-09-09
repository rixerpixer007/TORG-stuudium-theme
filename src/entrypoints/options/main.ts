import { mountSettingsPage } from "../../features/settings-page";
import { createWebExtensionSettingsStore } from "../../platforms/webextension/settings-storage";
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
  type SettingsStore,
} from "../../shared/settings";
import type { ThemeId } from "../../shared/themes";

function createPreviewSettingsStore(): SettingsStore {
  let settings: ExtensionSettings = {
    enhancementEnabled: DEFAULT_SETTINGS.enhancementEnabled,
    theme: { ...DEFAULT_SETTINGS.theme },
  };

  return {
    get() {
      return Promise.resolve(settings);
    },
    set(nextSettings) {
      settings = { ...nextSettings, theme: { ...nextSettings.theme } };
      return Promise.resolve();
    },
    subscribe() {
      return () => undefined;
    },
  };
}

const isLocalPreview =
  import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(window.location.hostname);
const settingsStore = isLocalPreview
  ? createPreviewSettingsStore()
  : createWebExtensionSettingsStore();
const themeCacheKey = document.documentElement.dataset.sidThemeCacheKey;

function cacheTheme(themeId: ThemeId): void {
  if (themeCacheKey === undefined) return;

  try {
    window.localStorage.setItem(themeCacheKey, themeId);
  } catch (error) {
    console.warn("Unable to update the settings-page theme cache", error);
  }
}

const cleanup = mountSettingsPage({
  document,
  settingsStore,
  cacheTheme,
});

window.addEventListener("pagehide", cleanup, { once: true });
