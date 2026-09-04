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
    vi.stubGlobal("HTMLElement", window.HTMLElement);
    vi.stubGlobal("MutationObserver", window.MutationObserver);

    document.body.classList.add("lang_et");
    document.body.innerHTML = `
      <nav class="st-nav-item-expandable">
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
    document
      .getElementById(BUTTON_ID)
      ?.dispatchEvent(new window.MouseEvent("click") as unknown as MouseEvent);
    await window.happyDOM.waitUntilComplete();

    expect(openSettings).toHaveBeenCalledOnce();

    feature.cleanup();
  });
});
