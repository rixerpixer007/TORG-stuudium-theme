interface MobileDeveloperControls {
  hidePasskeyLoginControls: boolean;
}

export const MOBILE_DEVELOPER_CONTROLS: Readonly<MobileDeveloperControls> = Object.freeze({
  hidePasskeyLoginControls: true,
});

export const HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE = "data-sid-hide-passkey-login-controls";

type AttributeTarget = Pick<Element, "removeAttribute" | "setAttribute">;

export function applyMobileDeveloperControls(target: AttributeTarget): void {
  if (MOBILE_DEVELOPER_CONTROLS.hidePasskeyLoginControls) {
    target.setAttribute(HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE, "");
    return;
  }

  target.removeAttribute(HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE);
}

export function clearMobileDeveloperControls(target: AttributeTarget): void {
  target.removeAttribute(HIDE_PASSKEY_LOGIN_CONTROLS_ATTRIBUTE);
}
