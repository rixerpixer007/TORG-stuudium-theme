import "../../theme/critical.css";
import "../../generated/theme.css";
import "../../platforms/webextension/settings-menu.css";

import { createSettingsMenuFeature } from "../../features/settings-menu";
import { applyTheme, clearTheme } from "../../features/theme-selection";
import { openExtensionSettings } from "../../platforms/webextension/open-settings";
import { createWebExtensionSettingsStore } from "../../platforms/webextension/settings-storage";
import { EnhancementRuntime } from "../../shared/lifecycle";
import { detectStuudiumRoute } from "../../shared/routes";
import { STUUDIUM_MATCHES } from "../../shared/sites";
import type { ExtensionSettings } from "../../shared/settings";

const ACTIVATION_ATTRIBUTE = "data-sid-enhancement";

type BootstrapGlobal = typeof globalThis & {
  __sidEnhancementCleanup?: () => void;
};

export default defineContentScript({
  matches: [...STUUDIUM_MATCHES],
  runAt: "document_start",
  allFrames: false,
  world: "ISOLATED",

  main(ctx) {
    const extensionGlobal = globalThis as BootstrapGlobal;
    extensionGlobal.__sidEnhancementCleanup?.();

    const settingsStore = createWebExtensionSettingsStore();
    const settingsMenuRuntime = new EnhancementRuntime([
      createSettingsMenuFeature({
        document,
        openSettings: openExtensionSettings,
      }),
    ]);
    let currentUrl = window.location.href;
    let currentSettings: ExtensionSettings | undefined;
    let cleanedUp = false;
    let unsubscribeSettings = (): void => {};

    const apply = (): void => {
      if (cleanedUp || currentSettings === undefined) return;

      const route = detectStuudiumRoute(currentUrl);
      if (route.supported) {
        settingsMenuRuntime.activate({ route });
        if (currentSettings.enhancementEnabled) {
          applyTheme(document.documentElement, currentSettings.theme.themeId);
          document.documentElement.setAttribute(ACTIVATION_ATTRIBUTE, "enabled");
        } else {
          document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
          clearTheme(document.documentElement);
        }
      } else {
        settingsMenuRuntime.cleanup();
        document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
        clearTheme(document.documentElement);
      }
    };

    const updateRoute = (nextUrl: string | URL = window.location.href): void => {
      currentUrl = nextUrl.toString();
      apply();
    };

    const cleanup = (): void => {
      if (cleanedUp) return;
      cleanedUp = true;
      unsubscribeSettings();
      settingsMenuRuntime.cleanup();
      document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
      clearTheme(document.documentElement);
      window.removeEventListener("pagehide", handlePageHide);
      if (extensionGlobal.__sidEnhancementCleanup === cleanup) {
        delete extensionGlobal.__sidEnhancementCleanup;
      }
    };

    const handlePageHide = (event: PageTransitionEvent): void => {
      if (!event.persisted) cleanup();
    };

    ctx.onInvalidated(cleanup);
    ctx.setInterval(() => undefined, 500);

    unsubscribeSettings = settingsStore.subscribe((settings) => {
      currentSettings = settings;
      apply();
    });

    extensionGlobal.__sidEnhancementCleanup = cleanup;
    window.addEventListener("pagehide", handlePageHide);
    ctx.addEventListener(window, "wxt:locationchange", ({ newUrl }) => {
      updateRoute(newUrl);
    });
    ctx.addEventListener(window, "popstate", () => {
      updateRoute();
    });
    ctx.addEventListener(window, "hashchange", () => {
      updateRoute();
    });

    const initializeSettings = async (): Promise<void> => {
      try {
        const settings = await settingsStore.get();
        currentSettings = settings;
        apply();
      } catch (error) {
        console.error("Unable to read extension settings", error);
        settingsMenuRuntime.cleanup();
        document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
        clearTheme(document.documentElement);
      }
    };

    void initializeSettings();
  },
});
