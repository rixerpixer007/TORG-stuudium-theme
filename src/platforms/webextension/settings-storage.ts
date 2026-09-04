import { browser } from "wxt/browser";

import {
  normalizeSettings,
  SETTINGS_STORAGE_KEY,
  type ExtensionSettings,
  type SettingsStore,
} from "../../shared/settings";
import { isExtensionContextInvalidatedError } from "./extension-context";

type StorageChangedEvent = Pick<typeof browser.storage.onChanged, "addListener" | "removeListener">;

export function subscribeToSettingsChanges(
  storageChanges: StorageChangedEvent | undefined,
  listener: (settings: ExtensionSettings) => void,
): () => void {
  if (storageChanges === undefined) return () => {};

  const handleChange = (
    changes: Record<string, Browser.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== "local") return;
    const change = changes[SETTINGS_STORAGE_KEY];
    if (change === undefined) return;
    listener(normalizeSettings(change.newValue));
  };

  try {
    storageChanges.addListener(handleChange);
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) return () => {};
    throw error;
  }

  let subscribed = true;
  return () => {
    if (!subscribed) return;
    subscribed = false;
    try {
      storageChanges.removeListener(handleChange);
    } catch (error) {
      if (!isExtensionContextInvalidatedError(error)) throw error;
    }
  };
}

export function createWebExtensionSettingsStore(): SettingsStore {
  return {
    async get() {
      const stored = await browser.storage.local.get(SETTINGS_STORAGE_KEY);
      return normalizeSettings(stored[SETTINGS_STORAGE_KEY]);
    },

    async set(settings: ExtensionSettings) {
      await browser.storage.local.set({ [SETTINGS_STORAGE_KEY]: normalizeSettings(settings) });
    },

    subscribe(listener) {
      const storage = browser.storage as typeof browser.storage | undefined;
      return subscribeToSettingsChanges(storage?.onChanged, listener);
    },
  };
}
