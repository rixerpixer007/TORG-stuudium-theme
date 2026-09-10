import { applyTheme } from "../features/theme-selection";

export default defineUnlistedScript(() => {
  document.documentElement.setAttribute("data-sid-enhancement", "enabled");
  applyTheme(document.documentElement, "obsidian-red");
});
