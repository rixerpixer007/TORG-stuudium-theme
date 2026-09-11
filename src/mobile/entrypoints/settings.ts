import { mountSettingsPage } from "../../features/settings-page";
import {
  closeWebViewSettings,
  createWebViewAppUpdates,
  createWebViewSettingsStore,
  type WebViewMessagePort,
} from "../../platforms/webview/settings-storage";
import "../platform.css";

type MobileSettingsWindow = Window & {
  sidMobileSettings?: WebViewMessagePort;
};

const bridge = (window as MobileSettingsWindow).sidMobileSettings;

if (bridge === undefined) {
  throw new Error("The trusted mobile settings bridge is unavailable.");
}

const cleanup = mountSettingsPage({
  document,
  settingsStore: createWebViewSettingsStore(bridge),
  appUpdates: createWebViewAppUpdates(bridge),
  returnToStuudium: () => {
    closeWebViewSettings(bridge);
  },
});

window.addEventListener("pagehide", cleanup, { once: true });
