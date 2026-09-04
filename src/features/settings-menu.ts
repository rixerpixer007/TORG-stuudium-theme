import type { EnhancementFeature } from "../shared/lifecycle";

const BUTTON_ID = "sid-extension-settings-menu-item";

export interface SettingsMenuDependencies {
  document: Document;
  openSettings: () => Promise<boolean>;
}

function findMainMenu(document: Document): HTMLElement | null {
  const panels = document.querySelectorAll<HTMLElement>(
    ".st-nav-item-expandable > .st-nav-item-expandable-content",
  );

  return (
    [...panels].find((panel) => {
      const directLinks = [...panel.children].filter(
        (child): child is HTMLAnchorElement => child instanceof HTMLAnchorElement,
      );
      return (
        directLinks.some((link) => link.dataset.name === "groups") &&
        directLinks.some((link) => link.getAttribute("href") === "/q")
      );
    }) ?? null
  );
}

function createButton(document: Document, openSettings: () => Promise<boolean>): HTMLButtonElement {
  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.className = "st-nav-item sid-extension-settings-menu-item";
  button.type = "button";
  button.style.display = "none";
  button.dataset.sidExtensionOwned = "true";

  const graphic = document.createElement("span");
  graphic.className = "st-nav-item-graphic";

  const icon = document.createElement("span");
  icon.className = "sid-extension-settings-menu-icon";
  icon.setAttribute("aria-hidden", "true");
  graphic.append(icon);

  const label = document.createElement("span");
  label.className = "st-nav-item-label";
  const estonian = document.body.classList.contains("lang_et");
  label.textContent = estonian ? "Teema seaded" : "Theme settings";

  button.append(graphic, label);
  const handleClick = async (): Promise<void> => {
    try {
      const opened = await openSettings();
      if (!opened) button.remove();
    } catch (error) {
      console.error("Unable to open extension settings", error);
    }
  };
  button.addEventListener("click", () => {
    void handleClick();
  });

  return button;
}

export function createSettingsMenuFeature({
  document,
  openSettings,
}: SettingsMenuDependencies): EnhancementFeature {
  let observer: MutationObserver | undefined;

  const mount = (): void => {
    const menu = findMainMenu(document);
    if (menu === null) return;

    const existing = document.getElementById(BUTTON_ID);
    if (existing !== null) return;

    const button = createButton(document, () => openSettings());
    const abiLink = [...menu.children].find(
      (child) =>
        child instanceof HTMLAnchorElement &&
        new URL(child.href, document.location.href).pathname.startsWith("/abi"),
    );
    const applicationsLink = [...menu.children].find(
      (child) => child instanceof HTMLAnchorElement && child.getAttribute("href") === "/avaldused",
    );

    if (abiLink instanceof HTMLElement) {
      abiLink.insertAdjacentElement("afterend", button);
    } else if (applicationsLink instanceof HTMLElement) {
      applicationsLink.insertAdjacentElement("beforebegin", button);
    } else {
      menu.append(button);
    }
  };

  const cleanup = (): void => {
    observer?.disconnect();
    observer = undefined;
    document.getElementById(BUTTON_ID)?.remove();
  };

  return {
    activate() {
      cleanup();
      mount();
      observer = new MutationObserver(mount);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    },

    cleanup,

    navigate() {
      mount();
    },
  };
}
