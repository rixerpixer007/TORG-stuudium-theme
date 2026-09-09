import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const ASSET_DIRECTORY = path.join(PROJECT_ROOT, "apps/android/app/src/main/assets/mobile");
const REQUIRED_FILES = [
  "asset-manifest.json",
  "config.json",
  "injection/bootstrap.js",
  "injection/critical.css",
  "injection/settings-menu.css",
  "injection/theme.css",
  "settings/index.html",
];

function isExactHttpsOrigin(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.origin === value &&
      url.username === "" &&
      url.password === "" &&
      url.port === ""
    );
  } catch {
    return false;
  }
}

function listFiles(directory, root = directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listFiles(absolutePath, root);
      return [path.relative(root, absolutePath).split(path.sep).join("/")];
    })
    .sort((left, right) => left.localeCompare(right, "en"));
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

if (!fs.existsSync(ASSET_DIRECTORY)) {
  throw new Error("Android WebView assets are missing; run npm run build:mobile:web.");
}

const files = listFiles(ASSET_DIRECTORY);
for (const requiredFile of REQUIRED_FILES) {
  if (!files.includes(requiredFile)) throw new Error(`Missing Android asset: ${requiredFile}`);
}

const forbiddenFiles = files.filter(
  (file) =>
    file.endsWith(".map") ||
    file.endsWith(".ts") ||
    file.endsWith(".tsx") ||
    file.includes("options-startup"),
);
if (forbiddenFiles.length > 0) {
  throw new Error(`Development-only Android assets found: ${forbiddenFiles.join(", ")}`);
}

const configuration = JSON.parse(
  fs.readFileSync(path.join(ASSET_DIRECTORY, "config.json"), "utf8"),
);
if (
  !Array.isArray(configuration.supportedOrigins) ||
  configuration.supportedOrigins.length === 0 ||
  configuration.supportedOrigins.some((origin) => !isExactHttpsOrigin(origin))
) {
  throw new Error("Mobile origin configuration must contain exact HTTPS origins only.");
}

const settingsHtml = fs.readFileSync(path.join(ASSET_DIRECTORY, "settings/index.html"), "utf8");
if (/localhost|options-startup|chrome-extension:|<script[^>]+https?:\/\//i.test(settingsHtml)) {
  throw new Error("The bundled mobile settings page contains a development or remote script URL.");
}

const bootstrap = fs.readFileSync(path.join(ASSET_DIRECTORY, "injection/bootstrap.js"), "utf8");
if (/\b(?:chrome|browser)\.(?:storage|runtime|tabs)\b/.test(bootstrap)) {
  throw new Error("The mobile bootstrap contains a WebExtension API dependency.");
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(ASSET_DIRECTORY, "asset-manifest.json"), "utf8"),
);
if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.files)) {
  throw new Error("The Android asset manifest is malformed.");
}

const expectedManifestPaths = files.filter((file) => file !== "asset-manifest.json");
const manifestPaths = manifest.files.map((entry) => entry.path).sort();
if (JSON.stringify(manifestPaths) !== JSON.stringify(expectedManifestPaths)) {
  throw new Error("The Android asset manifest does not list exactly the bundled asset files.");
}

for (const entry of manifest.files) {
  if (
    typeof entry.path !== "string" ||
    !expectedManifestPaths.includes(entry.path) ||
    typeof entry.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(entry.sha256)
  ) {
    throw new Error("The Android asset manifest is malformed.");
  }
  const actualHash = sha256(path.join(ASSET_DIRECTORY, entry.path));
  if (actualHash !== entry.sha256) {
    throw new Error(`Android asset hash mismatch: ${entry.path}`);
  }
}

console.log(
  `Android WebView asset validation passed: ${files.length} bundled files, exact HTTPS origins only.`,
);
