import { browser } from "wxt/browser";

import { isOpenSettingsMessage } from "../platforms/webextension/open-settings";
import { createWebExtensionSettingsStore } from "../platforms/webextension/settings-storage";
import { STUUDIUM_MATCHES } from "../shared/sites";

const ACTIVATION_SCRIPT_ID = "sid-early-activation";
const ACTIVATION_SCRIPT_FILE = "activation-marker.js";
const OPTIONS_PAGE_FILE = "/options.html";
const OPTIONS_PAGE_LOAD_TIMEOUT_MS = 5_000;
let activationReconciliation = Promise.resolve();

function waitForTabToFinishLoading(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = (): void => {
      browser.tabs.onUpdated.removeListener(handleUpdated);
      browser.tabs.onRemoved.removeListener(handleRemoved);
      clearTimeout(timeoutId);
    };

    const finish = (): void => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const fail = (error: unknown): void => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const handleUpdated = (
      updatedTabId: number,
      changeInfo: { status?: "unloaded" | "loading" | "complete" },
    ): void => {
      if (updatedTabId === tabId && changeInfo.status === "complete") finish();
    };

    const handleRemoved = (removedTabId: number): void => {
      if (removedTabId === tabId) fail(new Error("The settings tab was closed before it loaded."));
    };

    browser.tabs.onUpdated.addListener(handleUpdated);
    browser.tabs.onRemoved.addListener(handleRemoved);
    const timeoutId = setTimeout(finish, OPTIONS_PAGE_LOAD_TIMEOUT_MS);

    void browser.tabs
      .get(tabId)
      .then((tab) => {
        if (tab.status === "complete") finish();
      })
      .catch(fail);
  });
}

async function openSettingsTab(openerTabId?: number, windowId?: number): Promise<void> {
  const settingsTab = await browser.tabs.create({
    active: false,
    url: browser.runtime.getURL(OPTIONS_PAGE_FILE),
    ...(openerTabId === undefined ? {} : { openerTabId }),
    ...(windowId === undefined ? {} : { windowId }),
  });

  if (settingsTab.id === undefined) {
    throw new Error("Unable to identify the new settings tab.");
  }

  await waitForTabToFinishLoading(settingsTab.id);
  await browser.tabs.update(settingsTab.id, { active: true });
  await browser.windows.update(settingsTab.windowId, { focused: true });
}

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

  browser.action.onClicked.addListener((tab) => {
    runSafely("Unable to open extension settings", openSettingsTab(tab.id, tab.windowId));
  });

  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    if (sender.id !== browser.runtime.id || !isOpenSettingsMessage(message)) return;
    runSafely(
      "Unable to open extension settings",
      openSettingsTab(sender.tab?.id, sender.tab?.windowId),
    );
  });

  settingsStore.subscribe((settings) => {
    void scheduleEarlyActivation(settings.enhancementEnabled);
  });

  runSafely("Unable to initialize extension settings", initialize());
});
