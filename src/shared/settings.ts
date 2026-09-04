export const SETTINGS_STORAGE_KEY = "preferences";

export interface ExtensionSettings {
  enhancementEnabled: boolean;
}

export type SettingsChangeListener = (settings: ExtensionSettings) => void;

export interface SettingsStore {
  get(): Promise<ExtensionSettings>;
  set(settings: ExtensionSettings): Promise<void>;
  subscribe(listener: SettingsChangeListener): () => void;
}

export const DEFAULT_SETTINGS: Readonly<ExtensionSettings> = Object.freeze({
  enhancementEnabled: true,
});

export function normalizeSettings(value: unknown): ExtensionSettings {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = value as Partial<ExtensionSettings>;
  return {
    enhancementEnabled:
      typeof candidate.enhancementEnabled === "boolean"
        ? candidate.enhancementEnabled
        : DEFAULT_SETTINGS.enhancementEnabled,
  };
}
