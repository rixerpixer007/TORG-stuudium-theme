import { browser } from "wxt/browser";

import { isExtensionContextInvalidatedError } from "./extension-context";

export const OPEN_SETTINGS_MESSAGE = "sid-extension:open-settings";

export function isOpenSettingsMessage(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.keys(value).length === 1 &&
    "type" in value &&
    value.type === OPEN_SETTINGS_MESSAGE
  );
}

export async function openExtensionSettings(): Promise<boolean> {
  try {
    await browser.runtime.sendMessage({ type: OPEN_SETTINGS_MESSAGE });
    return true;
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) return false;
    throw error;
  }
}
