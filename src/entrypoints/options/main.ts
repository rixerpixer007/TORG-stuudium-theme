import "../../theme/modules/01-tokens.css";
import "./style.css";

import { createWebExtensionSettingsStore } from "../../platforms/webextension/settings-storage";

const enabledInput = document.querySelector<HTMLInputElement>("#enhancement-enabled");
const status = document.querySelector<HTMLElement>("#status");

if (enabledInput === null || status === null) {
  throw new Error("Settings page controls are missing");
}

const enabledControl = enabledInput;
const statusElement = status;
const settingsStore = createWebExtensionSettingsStore();

function setStatus(message: string, state: "ready" | "saving" | "error" = "ready"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

async function initialize(): Promise<void> {
  try {
    const settings = await settingsStore.get();
    enabledControl.checked = settings.enhancementEnabled;
    enabledControl.disabled = false;
    setStatus(settings.enhancementEnabled ? "Dark theme enabled." : "Dark theme disabled.");
  } catch (error) {
    console.error("Unable to read extension settings", error);
    setStatus("Could not read the saved preference.", "error");
  }
}

enabledControl.disabled = true;
async function savePreference(): Promise<void> {
  enabledControl.disabled = true;
  setStatus("Saving…", "saving");

  try {
    await settingsStore.set({ enhancementEnabled: enabledControl.checked });
    setStatus(enabledControl.checked ? "Dark theme enabled." : "Dark theme disabled.");
  } catch (error) {
    console.error("Unable to save extension settings", error);
    enabledControl.checked = !enabledControl.checked;
    setStatus("Could not save the preference.", "error");
  } finally {
    enabledControl.disabled = false;
  }
}

enabledControl.addEventListener("change", () => {
  void savePreference();
});

void initialize();
