import { Window } from "happy-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createSettingsMenuFeature } from "../src/features/settings-menu";
import { detectStuudiumRoute } from "../src/shared/routes";

const BUTTON_ID = "sid-extension-settings-menu-item";
const context = { route: detectStuudiumRoute("https://torg.ope.ee/s/520") };

describe("settings menu feature", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window({ url: "https://torg.ope.ee/s/520" });
    document = window.document as unknown as Document;
    vi.stubGlobal("HTMLAnchorElement", window.HTMLAnchorElement);
    vi.stubGlobal("HTMLButtonElement", window.HTMLButtonElement);
    vi.stubGlobal("Element", window.Element);
    vi.stubGlobal("HTMLElement", window.HTMLElement);
    vi.stubGlobal("MutationObserver", window.MutationObserver);

    document.body.classList.add("lang_et");
    document.body.innerHTML = `
      <nav class="st-nav-item-expandable">
        <span class="st-nav-item st-nav-item-only-graphic">Menu</span>
        <div class="st-nav-item-expandable-content">
          <a class="st-nav-item" data-name="groups" href="/groups">Klassid</a>
          <a class="st-nav-item" href="/q">Küsimustikud</a>
          <a class="st-nav-item" href="/avaldused">Avaldused</a>
        </div>
      </nav>
    `;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.close();
  });

  it("mounts one localized button directly after Avaldused", () => {
    const feature = createSettingsMenuFeature({
      document,
      openSettings: vi.fn(() => Promise.resolve(true)),
    });

    feature.activate(context);

    const menu = document.querySelector(".st-nav-item-expandable-content");
    const button = document.getElementById(BUTTON_ID);

    expect(button).toBeInstanceOf(window.HTMLButtonElement);
    if (button === null) throw new Error("Settings button did not mount");
    expect(button.textContent).toBe("Teema seaded");
    expect(menu?.lastElementChild).toBe(button);
    expect(button.previousElementSibling?.getAttribute("href")).toBe("/avaldused");
    expect(document.querySelectorAll(`#${BUTTON_ID}`)).toHaveLength(1);

    feature.cleanup();
  });

  it("mounts in application menus that use absolute navigation links", () => {
    document.body.classList.remove("lang_et");
    document.documentElement.dataset.suhtlusLanguage = "et";
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
      link.href = new URL(link.getAttribute("href") ?? "", document.baseURI).href;
    });
    const feature = createSettingsMenuFeature({
      document,
      openSettings: vi.fn(() => Promise.resolve(true)),
    });

    feature.activate(context);

    const button = document.getElementById(BUTTON_ID);
    expect(button).toBeInstanceOf(window.HTMLButtonElement);
    expect(button?.textContent).toBe("Teema seaded");
    expect(button?.previousElementSibling?.getAttribute("href")).toBe(
      "https://torg.ope.ee/avaldused",
    );

    feature.cleanup();
  });

  it("remains idempotent and restores its position after navigation", () => {
    const feature = createSettingsMenuFeature({
      document,
      openSettings: vi.fn(() => Promise.resolve(true)),
    });

    feature.activate(context);
    feature.activate(context);

    const button = document.getElementById(BUTTON_ID);
    expect(button).not.toBeNull();
    if (button === null) throw new Error("Settings button did not mount");
    document.querySelector(".st-nav-item-expandable-content")?.prepend(button);
    feature.navigate(context);

    expect(document.querySelectorAll(`#${BUTTON_ID}`)).toHaveLength(1);
    const previousItem = button.previousElementSibling;
    expect(previousItem).not.toBeNull();
    if (previousItem === null) throw new Error("Settings button was not repositioned");
    expect(previousItem.getAttribute("href")).toBe("/avaldused");

    feature.cleanup();
    expect(document.getElementById(BUTTON_ID)).toBeNull();
  });

  it("opens extension settings from the owned button", async () => {
    const openSettings = vi.fn(() => Promise.resolve(true));
    const feature = createSettingsMenuFeature({ document, openSettings });

    feature.activate(context);
    const button = document.getElementById(BUTTON_ID);
    const menu = document.querySelector(".st-nav-item-expandable");
    menu?.classList.add("st-nav-item-expanded");
    button?.dispatchEvent(new window.MouseEvent("click") as unknown as MouseEvent);

    expect(menu?.hasAttribute("data-sid-settings-menu-dismissed")).toBe(true);
    expect(menu?.classList.contains("st-nav-item-expanded")).toBe(false);

    await window.happyDOM.waitUntilComplete();

    expect(openSettings).toHaveBeenCalledOnce();

    document
      .querySelector(".st-nav-item-only-graphic")
      ?.dispatchEvent(new window.Event("pointerover", { bubbles: true }) as unknown as Event);
    expect(menu?.hasAttribute("data-sid-settings-menu-dismissed")).toBe(true);

    document.body.dispatchEvent(
      new window.Event("pointerover", { bubbles: true }) as unknown as Event,
    );
    expect(menu?.hasAttribute("data-sid-settings-menu-dismissed")).toBe(false);

    feature.cleanup();
  });

  it("allows an explicitly pressed menu trigger to reopen a dismissed menu", () => {
    const feature = createSettingsMenuFeature({
      document,
      openSettings: vi.fn(() => Promise.resolve(true)),
    });

    feature.activate(context);
    const button = document.getElementById(BUTTON_ID);
    const menu = document.querySelector(".st-nav-item-expandable");
    button?.dispatchEvent(new window.MouseEvent("click") as unknown as MouseEvent);

    document
      .querySelector(".st-nav-item-only-graphic")
      ?.dispatchEvent(new window.Event("pointerdown", { bubbles: true }) as unknown as Event);

    expect(menu?.hasAttribute("data-sid-settings-menu-dismissed")).toBe(false);

    feature.cleanup();
  });

  it("restores the menu when opening settings fails", async () => {
    const feature = createSettingsMenuFeature({
      document,
      openSettings: vi.fn(() => Promise.resolve(false)),
    });

    feature.activate(context);
    document
      .getElementById(BUTTON_ID)
      ?.dispatchEvent(new window.MouseEvent("click") as unknown as MouseEvent);
    await window.happyDOM.waitUntilComplete();

    expect(
      document
        .querySelector(".st-nav-item-expandable")
        ?.hasAttribute("data-sid-settings-menu-dismissed"),
    ).toBe(false);

    feature.cleanup();
  });
});
