import {
  normalizeSettings,
  type ExtensionSettings,
  type SettingsChangeListener,
  type SettingsStore,
} from "../../shared/settings";
import type { AppUpdates, UpdateCheckResult } from "../../shared/app-updates";

export interface WebViewMessageEvent {
  data: unknown;
}

export interface WebViewMessagePort {
  postMessage(message: string): void;
  addEventListener(type: "message", listener: (event: WebViewMessageEvent) => void): void;
  removeEventListener(type: "message", listener: (event: WebViewMessageEvent) => void): void;
}

export function closeWebViewSettings(bridge: WebViewMessagePort): void {
  bridge.postMessage("close-settings");
}

interface BridgeResponse {
  id: string;
  ok: boolean;
  settings?: unknown;
  version?: unknown;
  updateStatus?: unknown;
  error?: string;
}

let appRequestSequence = 0;

function requestAppUpdateValue(
  bridge: WebViewMessagePort,
  type: "get-app-info" | "check-for-updates",
  requestTimeoutMs: number,
): Promise<BridgeResponse> {
  appRequestSequence += 1;
  const id = `app-updates-${String(appRequestSequence)}`;

  return new Promise((resolve, reject) => {
    const handleMessage = (event: WebViewMessageEvent): void => {
      const response = parseResponse(event.data);
      if (response?.id !== id) return;

      window.clearTimeout(timeoutId);
      bridge.removeEventListener("message", handleMessage);
      if (response.ok) {
        resolve(response);
      } else {
        reject(new Error(response.error ?? "The mobile app update request failed."));
      }
    };
    const timeoutId = window.setTimeout(() => {
      bridge.removeEventListener("message", handleMessage);
      reject(new Error("The mobile app update request timed out."));
    }, requestTimeoutMs);

    bridge.addEventListener("message", handleMessage);
    try {
      bridge.postMessage(JSON.stringify({ id, type }));
    } catch (error) {
      window.clearTimeout(timeoutId);
      bridge.removeEventListener("message", handleMessage);
      reject(error instanceof Error ? error : new Error("The mobile settings bridge failed."));
    }
  });
}

export function createWebViewAppUpdates(
  bridge: WebViewMessagePort,
  requestTimeoutMs = 12_000,
): AppUpdates {
  return {
    async getCurrentVersion() {
      const response = await requestAppUpdateValue(bridge, "get-app-info", requestTimeoutMs);
      if (typeof response.version !== "string" || response.version.length === 0) {
        throw new Error("The installed app version is unavailable.");
      }
      return response.version;
    },

    async checkForUpdates() {
      const response = await requestAppUpdateValue(bridge, "check-for-updates", requestTimeoutMs);
      const status = response.updateStatus;
      if (status !== "update-available" && status !== "up-to-date" && status !== "unavailable") {
        throw new Error("The mobile app update response is invalid.");
      }
      return status satisfies UpdateCheckResult;
    },
  };
}

interface PendingRequest {
  resolve: (settings: ExtensionSettings) => void;
  reject: (error: Error) => void;
  timeoutId: number;
}

function parseResponse(value: unknown): BridgeResponse | undefined {
  if (typeof value !== "string") return undefined;

  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null) return undefined;
    const candidate = parsed as Partial<BridgeResponse>;
    if (typeof candidate.id !== "string" || typeof candidate.ok !== "boolean") return undefined;
    return candidate as BridgeResponse;
  } catch {
    return undefined;
  }
}

export function createWebViewSettingsStore(
  bridge: WebViewMessagePort,
  requestTimeoutMs = 5_000,
): SettingsStore {
  let requestSequence = 0;
  const pending = new Map<string, PendingRequest>();
  const listeners = new Set<SettingsChangeListener>();

  const handleMessage = (event: WebViewMessageEvent): void => {
    const response = parseResponse(event.data);
    if (response === undefined) return;

    const request = pending.get(response.id);
    if (request === undefined) return;
    pending.delete(response.id);
    window.clearTimeout(request.timeoutId);

    if (!response.ok) {
      request.reject(new Error(response.error ?? "The mobile settings request failed."));
      return;
    }

    request.resolve(normalizeSettings(response.settings));
  };

  bridge.addEventListener("message", handleMessage);

  const request = (
    type: "get-settings" | "set-settings",
    settings?: ExtensionSettings,
  ): Promise<ExtensionSettings> => {
    requestSequence += 1;
    const id = `settings-${String(requestSequence)}`;

    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error("The mobile settings request timed out."));
      }, requestTimeoutMs);

      pending.set(id, { resolve, reject, timeoutId });

      try {
        bridge.postMessage(JSON.stringify({ id, type, settings }));
      } catch (error) {
        window.clearTimeout(timeoutId);
        pending.delete(id);
        reject(error instanceof Error ? error : new Error("The mobile settings bridge failed."));
      }
    });
  };

  return {
    get() {
      return request("get-settings");
    },

    async set(settings) {
      const saved = await request("set-settings", normalizeSettings(settings));
      listeners.forEach((listener) => {
        listener(saved);
      });
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
