export const THEME_ATTRIBUTE = "data-sid-theme";

export interface ThemePreview {
  canvas: string;
  surface: string;
  accent: string;
  text: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  colorScheme: "dark" | "light";
  preview: ThemePreview;
}

export const THEMES = [
  {
    id: "graphite-mint",
    name: "Graphite Mint",
    shortName: "Mint",
    description: "The original graphite theme with its mint accent.",
    colorScheme: "dark",
    preview: {
      canvas: "#0f1311",
      surface: "#202824",
      accent: "#65d6b1",
      text: "#f2f0e9",
    },
  },
  {
    id: "graphite-blue",
    name: "Graphite Blue",
    shortName: "Blue",
    description: "A cool graphite palette with a calm blue accent.",
    colorScheme: "dark",
    preview: {
      canvas: "#0c1118",
      surface: "#202b3a",
      accent: "#75a7ff",
      text: "#eef2f8",
    },
  },
] as const satisfies readonly ThemeDefinition[];

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME_ID: ThemeId = "graphite-mint";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((theme) => theme.id === value);
}

export function getTheme(value: ThemeId): (typeof THEMES)[number] {
  const theme = THEMES.find((candidate) => candidate.id === value);
  if (theme === undefined) throw new Error(`Unknown theme: ${value}`);
  return theme;
}
