import { createSettingsMenuFeature } from "../../features/settings-menu";
import { applyTheme, clearTheme } from "../../features/theme-selection";
import { EnhancementRuntime } from "../../shared/lifecycle";
import { detectStuudiumRoute } from "../../shared/routes";
import { normalizeSettings, type ExtensionSettings } from "../../shared/settings";
import { applyMobileDeveloperControls, clearMobileDeveloperControls } from "../developer-controls";

const ACTIVATION_ATTRIBUTE = "data-sid-enhancement";

interface MobileShellMessagePort {
  postMessage(message: string): void;
}

type MobileBootstrapGlobal = typeof globalThis & {
  __sidMobileInitialSettings?: unknown;
  __sidMobileApplySettings?: (settings: unknown) => void;
  __sidMobileCleanup?: () => void;
  sidMobileShell?: MobileShellMessagePort;
};

function startMobileBootstrap(): void {
  if (window.top !== window) return;

  const mobileGlobal = globalThis as MobileBootstrapGlobal;
  mobileGlobal.__sidMobileCleanup?.();
  applyMobileDeveloperControls(document.documentElement);

  let currentSettings: ExtensionSettings = normalizeSettings(
    mobileGlobal.__sidMobileInitialSettings,
  );
  let currentUrl = window.location.href;
  let cleanedUp = false;

  const settingsMenuRuntime = new EnhancementRuntime([
    createSettingsMenuFeature({
      document,
      openSettings: () => {
        const bridge = mobileGlobal.sidMobileShell;
        if (bridge === undefined) return Promise.resolve(false);
        bridge.postMessage("open-settings");
        return Promise.resolve(true);
      },
    }),
  ]);

  const apply = (): void => {
    if (cleanedUp) return;

    const route = detectStuudiumRoute(currentUrl);
    if (!route.supported) {
      settingsMenuRuntime.cleanup();
      document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
      clearTheme(document.documentElement);
      return;
    }

    settingsMenuRuntime.activate({ route });
    if (currentSettings.enhancementEnabled) {
      applyTheme(document.documentElement, currentSettings.theme.themeId);
      document.documentElement.setAttribute(ACTIVATION_ATTRIBUTE, "enabled");
    } else {
      document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
      clearTheme(document.documentElement);
    }
  };

  const updateRoute = (): void => {
    if (currentUrl === window.location.href) return;
    currentUrl = window.location.href;
    apply();
  };

  const handleNavigation = (): void => {
    currentUrl = window.location.href;
    apply();
  };

  const cleanup = (): void => {
    if (cleanedUp) return;
    cleanedUp = true;
    window.clearInterval(routePoll);
    window.removeEventListener("popstate", handleNavigation);
    window.removeEventListener("hashchange", handleNavigation);
    window.removeEventListener("pagehide", handlePageHide);
    settingsMenuRuntime.cleanup();
    clearMobileDeveloperControls(document.documentElement);
    document.documentElement.removeAttribute(ACTIVATION_ATTRIBUTE);
    clearTheme(document.documentElement);

    if (mobileGlobal.__sidMobileCleanup === cleanup) {
      delete mobileGlobal.__sidMobileCleanup;
    }
    delete mobileGlobal.__sidMobileApplySettings;
  };

  const handlePageHide = (event: PageTransitionEvent): void => {
    if (!event.persisted) cleanup();
  };

  const routePoll = window.setInterval(updateRoute, 250);
  mobileGlobal.__sidMobileApplySettings = (settings: unknown): void => {
    let parsed = settings;
    if (typeof settings === "string") {
      try {
        parsed = JSON.parse(settings) as unknown;
      } catch {
        parsed = undefined;
      }
    }
    currentSettings = normalizeSettings(parsed);
    apply();
  };
  mobileGlobal.__sidMobileCleanup = cleanup;

  window.addEventListener("popstate", handleNavigation);
  window.addEventListener("hashchange", handleNavigation);
  window.addEventListener("pagehide", handlePageHide);
  apply();
}

startMobileBootstrap();
