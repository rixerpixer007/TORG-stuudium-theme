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
    name: "Grafiit ja münt",
    shortName: "Münt",
    description: "Algupärane grafiiditoonides kujundus mündirohelise aktsendiga.",
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
    name: "Grafiit ja sinine",
    shortName: "Sinine",
    description: "Jahedates grafiiditoonides kujundus rahuliku sinise aktsendiga.",
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
    name: "Obsidiaan ja punane",
    shortName: "Punane",
    description: "Peaaegu mustad söetoonid erksa karmiinpunase aktsendiga.",
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
    name: "Samet ja lillakas",
    shortName: "Lillakas",
    description: "Pehme tume mokapalett lavendlililla aktsendiga.",
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
    name: "Kesköö ja merevaik",
    shortName: "Merevaik",
    description: "Soojad tindimustad toonid rikkaliku merevaigukarva aktsendiga.",
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
