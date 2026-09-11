export type UpdateCheckResult = "update-available" | "up-to-date" | "unavailable";

export interface AppUpdates {
  getCurrentVersion(): Promise<string>;
  checkForUpdates(): Promise<UpdateCheckResult>;
}
