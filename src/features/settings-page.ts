import { applyTheme } from "./theme-selection";
import { DEFAULT_SETTINGS, type ExtensionSettings, type SettingsStore } from "../shared/settings";
import { getTheme, THEMES, type ThemeId } from "../shared/themes";

const SETTINGS_STATE_ATTRIBUTE = "data-sid-settings-state";

export interface SettingsPageDependencies {
  document: Document;
  settingsStore: SettingsStore;
  cacheTheme?: (themeId: ThemeId) => void;
  returnToStuudium?: () => void;
}

interface SettingsPageElements {
  returnControls: HTMLButtonElement[];
  enabledInput: HTMLInputElement;
  status: HTMLElement;
  searchInput: HTMLInputElement;
  categoryControls: HTMLButtonElement[];
  settingsSections: HTMLElement[];
  emptyState: HTMLElement;
  themeOptions: HTMLElement;
  colorSchemeMeta: HTMLMetaElement;
}

function queryElements(document: Document): SettingsPageElements {
  const returnControls = Array.from(
    document.querySelectorAll<HTMLButtonElement>("[data-return-to-stuudium]"),
  );
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
    returnControls.length === 0 ||
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

  return {
    returnControls,
    enabledInput,
    status,
    searchInput,
    categoryControls,
    settingsSections,
    emptyState,
    themeOptions,
    colorSchemeMeta,
  };
}

export function mountSettingsPage({
  document,
  settingsStore,
  cacheTheme = () => undefined,
  returnToStuudium = () => undefined,
}: SettingsPageDependencies): () => void {
  const elements = queryElements(document);
  let activeCategory = "all";
  let currentSettings: ExtensionSettings = {
    enhancementEnabled: DEFAULT_SETTINGS.enhancementEnabled,
    theme: { ...DEFAULT_SETTINGS.theme },
  };
  let cleanedUp = false;

  function setStatus(message: string, state: "ready" | "saving" | "error" = "ready"): void {
    elements.status.textContent = message;
    elements.status.dataset.state = state;
  }

  function applySettingsTheme(themeId: ThemeId): void {
    const theme = getTheme(themeId);
    applyTheme(document.documentElement, themeId);
    elements.colorSchemeMeta.content = theme.colorScheme;
    document.documentElement.style.colorScheme = theme.colorScheme;
  }

  function revealSettingsPage(): void {
    // Settle the saved control and palette styles while transitions are disabled.
    document.body.getBoundingClientRect();
    document.documentElement.setAttribute(SETTINGS_STATE_ATTRIBUTE, "ready");
    document.body.setAttribute("aria-busy", "false");
  }

  function setThemeControls(themeId: ThemeId): void {
    const controls =
      elements.themeOptions.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    controls.forEach((control) => {
      control.checked = control.value === themeId;
    });
  }

  function setThemeControlsDisabled(disabled: boolean): void {
    const controls =
      elements.themeOptions.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    controls.forEach((control) => {
      control.disabled = disabled;
    });
  }

  function setSettingsControlsDisabled(disabled: boolean): void {
    elements.enabledInput.disabled = disabled;
    setThemeControlsDisabled(disabled);
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
      cacheTheme(themeId);
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

    elements.themeOptions.replaceChildren(fragment);
  }

  async function initialize(): Promise<void> {
    try {
      const settings = await settingsStore.get();
      if (cleanedUp) return;
      currentSettings = settings;
      elements.enabledInput.checked = settings.enhancementEnabled;
      setThemeControls(settings.theme.themeId);
      applySettingsTheme(settings.theme.themeId);
      cacheTheme(settings.theme.themeId);
      setSettingsControlsDisabled(false);
      setStatus(settings.enhancementEnabled ? "Custom theme is on." : "Custom theme is off.");
    } catch (error) {
      if (cleanedUp) return;
      console.error("Unable to read enhancement settings", error);
      elements.enabledInput.checked = currentSettings.enhancementEnabled;
      setThemeControls(currentSettings.theme.themeId);
      applySettingsTheme(currentSettings.theme.themeId);
      cacheTheme(currentSettings.theme.themeId);
      setStatus("Could not read the saved preference.", "error");
    } finally {
      if (!cleanedUp) revealSettingsPage();
    }
  }

  async function saveEnabledPreference(): Promise<void> {
    const previousEnabled = currentSettings.enhancementEnabled;
    setSettingsControlsDisabled(true);
    setStatus("Saving…", "saving");

    try {
      currentSettings = {
        ...currentSettings,
        enhancementEnabled: elements.enabledInput.checked,
      };
      await settingsStore.set(currentSettings);
      setStatus(elements.enabledInput.checked ? "Custom theme is on." : "Custom theme is off.");
    } catch (error) {
      console.error("Unable to save enhancement settings", error);
      currentSettings = {
        ...currentSettings,
        enhancementEnabled: previousEnabled,
      };
      elements.enabledInput.checked = previousEnabled;
      setStatus("Could not save the preference.", "error");
    } finally {
      setSettingsControlsDisabled(false);
    }
  }

  function filterSettings(): void {
    const query = elements.searchInput.value.trim().toLocaleLowerCase();
    let visibleSections = 0;

    elements.settingsSections.forEach((section) => {
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

    elements.emptyState.hidden = visibleSections > 0;
  }

  const handleEnabledChange = (): void => {
    void saveEnabledPreference();
  };
  const handleHomeClick = (): void => {
    returnToStuudium();
  };
  const handleSearchInput = (): void => {
    filterSettings();
  };
  const categoryHandlers = elements.categoryControls.map((control) => {
    const handler = (): void => {
      activeCategory = control.dataset.category ?? "all";

      elements.categoryControls.forEach((candidate) => {
        const selected = candidate === control;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });

      filterSettings();
    };
    control.addEventListener("click", handler);
    return { control, handler };
  });

  elements.returnControls.forEach((control) => {
    control.addEventListener("click", handleHomeClick);
  });
  elements.enabledInput.addEventListener("change", handleEnabledChange);
  elements.searchInput.addEventListener("input", handleSearchInput);
  renderThemeOptions();
  setSettingsControlsDisabled(true);
  void initialize();

  return () => {
    if (cleanedUp) return;
    cleanedUp = true;
    elements.returnControls.forEach((control) => {
      control.removeEventListener("click", handleHomeClick);
    });
    elements.enabledInput.removeEventListener("change", handleEnabledChange);
    elements.searchInput.removeEventListener("input", handleSearchInput);
    categoryHandlers.forEach(({ control, handler }) => {
      control.removeEventListener("click", handler);
    });
  };
}
