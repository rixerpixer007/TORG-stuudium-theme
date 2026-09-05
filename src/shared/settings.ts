import { DEFAULT_THEME_ID, isThemeId, type ThemeId } from "./themes";

export const SETTINGS_STORAGE_KEY = "preferences";

export interface ManualThemeSelection {
  mode: "manual";
  themeId: ThemeId;
}

export interface ExtensionSettings {
  enhancementEnabled: boolean;
  theme: ManualThemeSelection;
}

export type SettingsChangeListener = (settings: ExtensionSettings) => void;

export interface SettingsStore {
  get(): Promise<ExtensionSettings>;
  set(settings: ExtensionSettings): Promise<void>;
  subscribe(listener: SettingsChangeListener): () => void;
}

export const DEFAULT_SETTINGS: Readonly<ExtensionSettings> = Object.freeze({
  enhancementEnabled: true,
  theme: Object.freeze({
    mode: "manual",
    themeId: DEFAULT_THEME_ID,
  }),
});

export function normalizeSettings(value: unknown): ExtensionSettings {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = value as Partial<ExtensionSettings>;
  const themeCandidate = candidate.theme;
  return {
    enhancementEnabled:
      typeof candidate.enhancementEnabled === "boolean"
        ? candidate.enhancementEnabled
        : DEFAULT_SETTINGS.enhancementEnabled,
    theme: {
      mode: "manual",
      themeId:
        themeCandidate?.mode === "manual" && isThemeId(themeCandidate.themeId)
          ? themeCandidate.themeId
          : DEFAULT_SETTINGS.theme.themeId,
    },
  };
}
