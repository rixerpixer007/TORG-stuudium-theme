import { THEME_ATTRIBUTE, type ThemeId } from "../shared/themes";

export interface ThemeAttributeTarget {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
}

export function applyTheme(target: ThemeAttributeTarget, themeId: ThemeId): void {
  target.setAttribute(THEME_ATTRIBUTE, themeId);
}

export function clearTheme(target: ThemeAttributeTarget): void {
  target.removeAttribute(THEME_ATTRIBUTE);
}
