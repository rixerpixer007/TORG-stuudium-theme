import { applyTheme } from "../../features/theme-selection";
import { createWebExtensionSettingsStore } from "../../platforms/webextension/settings-storage";
import {
  DEFAULT_SETTINGS,
  type ExtensionSettings,
  type SettingsStore,
} from "../../shared/settings";
import { getTheme, THEMES, type ThemeId } from "../../shared/themes";

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
const themeOptions = document.querySelector<HTMLElement>("#theme-options");
const colorSchemeMeta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');

if (
  enabledInput === null ||
  status === null ||
  searchInput === null ||
  categoryControls.length === 0 ||
  settingsSections.length === 0 ||
  emptyState === null ||
  themeOptions === null ||
  colorSchemeMeta === null
) {
  throw new Error("Settings page controls are missing");
}

const enabledControl = enabledInput;
const statusElement = status;
const searchControl = searchInput;
const noResults = emptyState;
const themeOptionsContainer = themeOptions;
const colorSchemeMetadata = colorSchemeMeta;
const SETTINGS_STATE_ATTRIBUTE = "data-sid-settings-state";
const themeCacheKey = document.documentElement.dataset.sidThemeCacheKey;
let activeCategory = "all";
let currentSettings: ExtensionSettings = {
  enhancementEnabled: DEFAULT_SETTINGS.enhancementEnabled,
  theme: { ...DEFAULT_SETTINGS.theme },
};
const isLocalPreview =
  import.meta.env.DEV && ["localhost", "127.0.0.1"].includes(window.location.hostname);

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

const settingsStore = isLocalPreview
  ? createPreviewSettingsStore()
  : createWebExtensionSettingsStore();

function setStatus(message: string, state: "ready" | "saving" | "error" = "ready"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

function applySettingsTheme(themeId: ThemeId): void {
  const theme = getTheme(themeId);
  applyTheme(document.documentElement, themeId);
  colorSchemeMetadata.content = theme.colorScheme;
  document.documentElement.style.colorScheme = theme.colorScheme;
}

function cacheSettingsTheme(themeId: ThemeId): void {
  if (themeCacheKey === undefined) return;

  try {
    window.localStorage.setItem(themeCacheKey, themeId);
  } catch (error) {
    console.warn("Unable to update the settings-page theme cache", error);
  }
}

function revealSettingsPage(): void {
  // Settle the saved control and palette styles while transitions are disabled.
  void document.body.offsetHeight;
  document.documentElement.setAttribute(SETTINGS_STATE_ATTRIBUTE, "ready");
  document.body.setAttribute("aria-busy", "false");
}

function setThemeControls(themeId: ThemeId): void {
  const controls = themeOptionsContainer.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  controls.forEach((control) => {
    control.checked = control.value === themeId;
  });
}

function setThemeControlsDisabled(disabled: boolean): void {
  const controls = themeOptionsContainer.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function setSettingsControlsDisabled(disabled: boolean): void {
  enabledControl.disabled = disabled;
  setThemeControlsDisabled(disabled);
}

function renderThemeOptions(): void {
  const fragment = document.createDocumentFragment();

  THEMES.forEach((theme) => {
    const label = document.createElement("label");
    label.className = "theme-option";
    label.title = theme.description;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "theme";
    input.value = theme.id;
    input.setAttribute("aria-label", theme.name);

    const preview = document.createElement("span");
    preview.className = "theme-option__preview";
    preview.setAttribute("aria-hidden", "true");
    preview.style.setProperty("--theme-preview-canvas", theme.preview.canvas);
    preview.style.setProperty("--theme-preview-surface", theme.preview.surface);
    preview.style.setProperty("--theme-preview-accent", theme.preview.accent);
    preview.style.setProperty("--theme-preview-text", theme.preview.text);

    const sampleSurface = document.createElement("span");
    sampleSurface.className = "theme-option__surface";
    const sampleLine = document.createElement("span");
    sampleLine.className = "theme-option__line";
    const sampleAccent = document.createElement("span");
    sampleAccent.className = "theme-option__accent";
    const selectedMark = document.createElement("span");
    selectedMark.className = "theme-option__selected";
    selectedMark.textContent = "✓";
    preview.append(sampleSurface, sampleLine, sampleAccent, selectedMark);

    const name = document.createElement("span");
    name.className = "theme-option__name";
    name.textContent = theme.shortName;

    input.addEventListener("change", () => {
      if (!input.checked) return;
      void saveThemePreference(theme.id);
    });

    label.append(input, preview, name);
    fragment.append(label);
  });

  themeOptionsContainer.append(fragment);
}

async function initialize(): Promise<void> {
  try {
    const settings = await settingsStore.get();
    currentSettings = settings;
    enabledControl.checked = settings.enhancementEnabled;
    setThemeControls(settings.theme.themeId);
    applySettingsTheme(settings.theme.themeId);
    cacheSettingsTheme(settings.theme.themeId);
    setSettingsControlsDisabled(false);
    setStatus(settings.enhancementEnabled ? "Intentional Dark is on." : "Intentional Dark is off.");
  } catch (error) {
    console.error("Unable to read extension settings", error);
    enabledControl.checked = currentSettings.enhancementEnabled;
    setThemeControls(currentSettings.theme.themeId);
    applySettingsTheme(currentSettings.theme.themeId);
    cacheSettingsTheme(currentSettings.theme.themeId);
    setStatus("Could not read the saved preference.", "error");
  } finally {
    revealSettingsPage();
  }
}

async function savePreference(): Promise<void> {
  const previousEnabled = currentSettings.enhancementEnabled;
  setSettingsControlsDisabled(true);
  setStatus("Saving…", "saving");

  try {
    currentSettings = {
      ...currentSettings,
      enhancementEnabled: enabledControl.checked,
    };
    await settingsStore.set(currentSettings);
    setStatus(enabledControl.checked ? "Intentional Dark is on." : "Intentional Dark is off.");
  } catch (error) {
    console.error("Unable to save extension settings", error);
    currentSettings = {
      ...currentSettings,
      enhancementEnabled: previousEnabled,
    };
    enabledControl.checked = previousEnabled;
    setStatus("Could not save the preference.", "error");
  } finally {
    setSettingsControlsDisabled(false);
  }
}

async function saveThemePreference(themeId: ThemeId): Promise<void> {
  const previousThemeId = currentSettings.theme.themeId;
  setSettingsControlsDisabled(true);
  currentSettings = {
    ...currentSettings,
    theme: { mode: "manual", themeId },
  };
  applySettingsTheme(themeId);
  setStatus(`Applying ${getTheme(themeId).name}…`, "saving");

  try {
    await settingsStore.set(currentSettings);
    cacheSettingsTheme(themeId);
    setStatus(`${getTheme(themeId).name} is selected.`);
  } catch (error) {
    console.error("Unable to save theme preference", error);
    currentSettings = {
      ...currentSettings,
      theme: { mode: "manual", themeId: previousThemeId },
    };
    setThemeControls(previousThemeId);
    applySettingsTheme(previousThemeId);
    setStatus("Could not save the theme preference.", "error");
  } finally {
    setSettingsControlsDisabled(false);
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

renderThemeOptions();
setSettingsControlsDisabled(true);
void initialize();
