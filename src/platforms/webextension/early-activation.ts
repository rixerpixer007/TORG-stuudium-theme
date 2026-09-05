import type { ThemeId } from "../../shared/themes";

const EARLY_ACTIVATION_SCRIPT_BY_THEME = {
  "graphite-mint": "activation-graphite-mint.js",
  "graphite-blue": "activation-graphite-blue.js",
} as const satisfies Record<ThemeId, string>;

export function getEarlyActivationScript(themeId: ThemeId): string {
  return EARLY_ACTIVATION_SCRIPT_BY_THEME[themeId];
}
