import {
  normalizeSettings,
  type ExtensionSettings,
  type SettingsChangeListener,
  type SettingsStore,
} from "../../shared/settings";

export interface WebViewMessageEvent {
  data: unknown;
}

export interface WebViewMessagePort {
  postMessage(message: string): void;
  addEventListener(type: "message", listener: (event: WebViewMessageEvent) => void): void;
  removeEventListener(type: "message", listener: (event: WebViewMessageEvent) => void): void;
}

interface BridgeResponse {
  id: string;
  ok: boolean;
  settings?: unknown;
  error?: string;
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
