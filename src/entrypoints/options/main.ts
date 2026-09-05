import { createWebExtensionSettingsStore } from "../../platforms/webextension/settings-storage";
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
  type SettingsStore,
} from "../../shared/settings";

const enabledInput = document.querySelector<HTMLInputElement>("#enhancement-enabled");
const status = document.querySelector<HTMLElement>("#status");
const searchInput = document.querySelector<HTMLInputElement>("#settings-search");
const categoryControls = Array.from(
  document.querySelectorAll<HTMLButtonElement>("[data-category]"),
);
const settingsSections = Array.from(
  document.querySelectorAll<HTMLElement>("[data-settings-section]"),
);
const emptyState = document.querySelector<HTMLElement>(".settings-empty");

if (
  enabledInput === null ||
  status === null ||
  searchInput === null ||
  categoryControls.length === 0 ||
  settingsSections.length === 0 ||
  emptyState === null
) {
  throw new Error("Settings page controls are missing");
}

const enabledControl = enabledInput;
const statusElement = status;
const searchControl = searchInput;
const noResults = emptyState;
let activeCategory = "all";
const isLocalPreview =
  import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(window.location.hostname);

function createPreviewSettingsStore(): SettingsStore {
  let settings: ExtensionSettings = { ...DEFAULT_SETTINGS };

  return {
    get() {
      return Promise.resolve(settings);
    },
    set(nextSettings) {
      settings = { ...nextSettings };
      return Promise.resolve();
    },
    subscribe() {
      return () => undefined;
    },
  };
}

const settingsStore = isLocalPreview
  ? createPreviewSettingsStore()
  : createWebExtensionSettingsStore();

function setStatus(message: string, state: "ready" | "saving" | "error" = "ready"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

async function initialize(): Promise<void> {
  try {
    const settings = await settingsStore.get();
    enabledControl.checked = settings.enhancementEnabled;
    enabledControl.disabled = false;
    setStatus(settings.enhancementEnabled ? "Intentional Dark is on." : "Intentional Dark is off.");
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
    setStatus(enabledControl.checked ? "Intentional Dark is on." : "Intentional Dark is off.");
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

function filterSettings(): void {
  const query = searchControl.value.trim().toLocaleLowerCase();
  let visibleSections = 0;

  settingsSections.forEach((section) => {
    const matchesCategory =
      activeCategory === "all" || section.dataset.settingsSection === activeCategory;
    const settingItems = Array.from(section.querySelectorAll<HTMLElement>("[data-setting-item]"));
    let hasMatchingItem = false;

    settingItems.forEach((settingItem) => {
      const searchableText = `${settingItem.dataset.searchTerms ?? ""} ${settingItem.textContent}`
        .toLocaleLowerCase()
        .trim();
      const matchesSearch = query.length === 0 || searchableText.includes(query);

      settingItem.hidden = !matchesSearch;
      if (matchesSearch) hasMatchingItem = true;
    });

    const sectionSearchText = `${section.dataset.searchTerms ?? ""} ${section.textContent}`
      .toLocaleLowerCase()
      .trim();
    const matchesSearch =
      settingItems.length > 0
        ? hasMatchingItem
        : query.length === 0 || sectionSearchText.includes(query);
    const visible = matchesCategory && matchesSearch;

    section.hidden = !visible;
    if (visible) visibleSections += 1;
  });

  noResults.hidden = visibleSections > 0;
}

categoryControls.forEach((control) => {
  control.addEventListener("click", () => {
    activeCategory = control.dataset.category ?? "all";

    categoryControls.forEach((candidate) => {
      const selected = candidate === control;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });

    filterSettings();
  });
});

searchControl.addEventListener("input", filterSettings);

void initialize();
