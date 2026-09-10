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
  {
    id: "obsidian-red",
    name: "Obsidian Red",
    shortName: "Red",
    description: "Near-black charcoal surfaces with a vivid crimson accent.",
    colorScheme: "dark",
    preview: {
      canvas: "#0d0d0f",
      surface: "#282429",
      accent: "#ff6b7a",
      text: "#f5f0f2",
    },
  },
  {
    id: "velvet-mauve",
    name: "Velvet Mauve",
    shortName: "Mauve",
    description: "A soft mocha-dark palette with a lavender-purple accent.",
    colorScheme: "dark",
    preview: {
      canvas: "#11111b",
      surface: "#313244",
      accent: "#cba6f7",
      text: "#cdd6f4",
    },
  },
  {
    id: "midnight-amber",
    name: "Midnight Amber",
    shortName: "Amber",
    description: "Warm ink-black neutrals lit by a rich amber accent.",
    colorScheme: "dark",
    preview: {
      canvas: "#11100d",
      surface: "#2b261d",
      accent: "#f2b84b",
      text: "#f3ead7",
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
