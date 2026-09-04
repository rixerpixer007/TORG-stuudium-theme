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

  const iconWrapper = document.createElement("span");
  iconWrapper.className = "sn-navicon-new";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "sid-extension-settings-menu-icon");
  icon.setAttribute("width", "32");
  icon.setAttribute("height", "32");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");

  const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  iconPath.setAttribute(
    "d",
    "M19.14 12.94a7.6 7.6 0 0 0 .05-.94 7.6 7.6 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.4 7.4 0 0 0-1.63-.95L14.38 2.8a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.51c-.59.24-1.13.56-1.64.95L5.15 5.3a.5.5 0 0 0-.61.22L2.62 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.6 7.6 0 0 0-.05.94c0 .32.02.63.05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.5.39 1.05.71 1.64.95l.36 2.51a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.51a7.4 7.4 0 0 0 1.63-.95l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z",
  );
  iconPath.setAttribute("fill", "currentColor");
  icon.append(iconPath);
  iconWrapper.append(icon);
  graphic.append(iconWrapper);

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
    const button =
      existing instanceof HTMLButtonElement
        ? existing
        : createButton(document, () => openSettings());
    const applicationsLink = [...menu.children].find(
      (child) => child instanceof HTMLAnchorElement && child.getAttribute("href") === "/avaldused",
    );

    if (applicationsLink instanceof HTMLElement && applicationsLink.nextElementSibling !== button) {
      applicationsLink.insertAdjacentElement("afterend", button);
    } else if (!(applicationsLink instanceof HTMLElement) && menu.lastElementChild !== button) {
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
