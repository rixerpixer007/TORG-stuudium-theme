import fs from "node:fs";
import path from "node:path";

import postcss from "postcss";
import { describe, expect, it } from "vitest";

import {
  HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE,
  MOBILE_DEVELOPER_CONTROLS,
  applyMobileDeveloperControls,
  clearMobileDeveloperControls,
} from "../src/mobile/developer-controls";

describe("mobile platform styles", () => {
  const projectRoot = path.resolve(import.meta.dirname, "..");
  const css = fs.readFileSync(path.join(projectRoot, "src/mobile/platform.css"), "utf8");
  const settingsEntry = fs.readFileSync(
    path.join(projectRoot, "src/mobile/entrypoints/settings.ts"),
    "utf8",
  );
  const parsed = postcss.parse(css);

  it("disables only the inherited native tap highlight", () => {
    const rootRule = parsed.nodes.find(
      (node): node is postcss.Rule => node.type === "rule" && node.selector === "html",
    );
    const tapHighlight = rootRule?.nodes.find(
      (node): node is postcss.Declaration =>
        node.type === "decl" && node.prop === "-webkit-tap-highlight-color",
    );

    expect(tapHighlight?.value).toBe("transparent");
    expect(css).not.toMatch(/outline|focus/);
  });

  it("includes the platform styles in the standalone mobile settings page", () => {
    expect(settingsEntry).toContain('import "../platform.css";');
  });

  it("hides the known passkey login controls when the internal control is enabled", () => {
    const passkeyRule = parsed.nodes.find(
      (node): node is postcss.Rule =>
        node.type === "rule" &&
        node.selector.includes(`[${HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE}]`),
    );
    const display = passkeyRule?.nodes.find(
      (node): node is postcss.Declaration => node.type === "decl" && node.prop === "display",
    );

    expect(MOBILE_DEVELOPER_CONTROLS.hidePasskeyLoginControls).toBe(true);
    expect(passkeyRule?.selector).toContain('[data-login-method="webauthn"]');
    expect(passkeyRule?.selector).toContain('[data-login-method="passkey-via-remote-device"]');
    expect(passkeyRule?.selector).toContain('[data-action="webauthn-auth"]');
    expect(passkeyRule?.selector).toContain(".custom-style-passkey");
    expect(passkeyRule?.selector).toContain(".login-form-idauth-separate-container.show_on_mobile");
    expect(display?.value).toBe("none");
    expect(display?.important).toBe(true);
  });

  it("applies and clears the internal passkey visibility marker", () => {
    const attributes = new Map<string, string>();
    const target = {
      setAttribute(name: string, value: string) {
        attributes.set(name, value);
      },
      removeAttribute(name: string) {
        attributes.delete(name);
      },
    };

    applyMobileDeveloperControls(target);
    expect(attributes.has(HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE)).toBe(true);

    clearMobileDeveloperControls(target);
    expect(attributes.has(HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE)).toBe(false);
  });
});
