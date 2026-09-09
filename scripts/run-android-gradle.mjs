import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const ANDROID_ROOT = path.join(PROJECT_ROOT, "apps/android");

function firstExistingDirectory(candidates) {
  return candidates.find(
    (candidate) => candidate && fs.statSync(candidate, { throwIfNoEntry: false })?.isDirectory(),
  );
}

const javaHome = firstExistingDirectory([
  process.env.JAVA_HOME,
  "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
  path.join(os.homedir(), "Applications/Android Studio.app/Contents/jbr/Contents/Home"),
]);

if (javaHome === undefined) {
  throw new Error(
    "Android Studio's Java runtime was not found. Install Android Studio or set JAVA_HOME.",
  );
}

const androidSdk = firstExistingDirectory([
  process.env.ANDROID_SDK_ROOT,
  process.env.ANDROID_HOME,
  path.join(os.homedir(), "Library/Android/sdk"),
  path.join(os.homedir(), "Android/Sdk"),
]);

if (androidSdk === undefined) {
  throw new Error(
    "The Android SDK was not found. Complete Android Studio's setup wizard or set ANDROID_SDK_ROOT.",
  );
}

const wrapper = path.join(ANDROID_ROOT, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const result = spawnSync(wrapper, process.argv.slice(2), {
  cwd: ANDROID_ROOT,
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    ANDROID_SDK_ROOT: androidSdk,
  },
  stdio: "inherit",
});

if (result.error !== undefined) throw result.error;
process.exitCode = result.status ?? 1;
