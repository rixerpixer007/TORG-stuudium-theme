import { browser } from "wxt/browser";

import { isOpenSettingsMessage } from "../platforms/webextension/open-settings";
import { createWebExtensionSettingsStore } from "../platforms/webextension/settings-storage";
import { STUUDIUM_MATCHES } from "../shared/sites";

const ACTIVATION_SCRIPT_ID = "sid-early-activation";
const ACTIVATION_SCRIPT_FILE = "activation-marker.js";
let activationReconciliation = Promise.resolve();

async function reconcileEarlyActivation(enabled: boolean): Promise<void> {
  const registered = await browser.scripting.getRegisteredContentScripts({
    ids: [ACTIVATION_SCRIPT_ID],
  });

  if (!enabled) {
    if (registered.length > 0) {
      await browser.scripting.unregisterContentScripts({ ids: [ACTIVATION_SCRIPT_ID] });
    }
    return;
  }

  const registration = {
    id: ACTIVATION_SCRIPT_ID,
    matches: [...STUUDIUM_MATCHES],
    js: [ACTIVATION_SCRIPT_FILE],
    allFrames: false,
    persistAcrossSessions: true,
    runAt: "document_start" as const,
    world: "ISOLATED" as const,
  };

  if (registered.length === 0) {
    await browser.scripting.registerContentScripts([registration]);
  } else {
    await browser.scripting.updateContentScripts([registration]);
  }
}

function scheduleEarlyActivation(enabled: boolean): Promise<void> {
  const previousReconciliation = activationReconciliation;
  activationReconciliation = (async () => {
    await previousReconciliation;
    try {
      await reconcileEarlyActivation(enabled);
    } catch (error) {
      console.error("Unable to reconcile early theme activation", error);
    }
  })();
  return activationReconciliation;
}

export default defineBackground(() => {
  const settingsStore = createWebExtensionSettingsStore();

  const runSafely = (context: string, task: Promise<void>): void => {
    void task.catch((error: unknown) => {
      console.error(context, error);
    });
  };

  const initialize = async (): Promise<void> => {
    const settings = await settingsStore.get();
    await settingsStore.set(settings);
    await scheduleEarlyActivation(settings.enhancementEnabled);
  };

  browser.runtime.onInstalled.addListener(() => {
    runSafely("Unable to initialize extension settings", initialize());
  });

  browser.action.onClicked.addListener(() => {
    runSafely("Unable to open extension settings", browser.runtime.openOptionsPage());
  });

  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    if (sender.id !== browser.runtime.id || !isOpenSettingsMessage(message)) return;
    runSafely("Unable to open extension settings", browser.runtime.openOptionsPage());
  });

  settingsStore.subscribe((settings) => {
    void scheduleEarlyActivation(settings.enhancementEnabled);
  });

  runSafely("Unable to initialize extension settings", initialize());
});
