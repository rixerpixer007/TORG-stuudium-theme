(() => {
  const root = document.documentElement;
  const cacheKey = root.dataset.sidThemeCacheKey;

  if (cacheKey === undefined) return;

  try {
    const cachedThemeId = window.localStorage.getItem(cacheKey);
    if (cachedThemeId !== null) {
      root.setAttribute("data-sid-theme", cachedThemeId);
    }
  } catch {
    // The default palette remains a safe first-paint fallback if storage is unavailable.
  }
})();
